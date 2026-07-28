import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { clearBasicCredentials } from '../api/authSession'
import { server } from '../mocks/node'
import { useAuthStore } from './authStore'

function responseBody(data: unknown) {
  return {
    success: true,
    message: '執行成功',
    messageCode: '',
    errorMessage: '',
    data
  }
}

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearBasicCredentials()
  })

  it('loads local development roles from the backend at runtime', async () => {
    const store = useAuthStore()

    await store.initialize()

    expect(store.initialized).toBe(true)
    expect(store.securityRequired).toBe(false)
    expect(store.displayName).toBe('本機開發模式')
    expect(store.hasRole('MAKER')).toBe(true)
    expect(store.hasRole('REVIEWER')).toBe(true)
  })

  it('detects secured backend and logs in with the returned role', async () => {
    server.use(
      http.get('/api/auth/me', ({ request }) => {
        if (request.headers.get('Authorization') === `Basic ${window.btoa('reviewer:reviewer-secret')}`) {
          return HttpResponse.json(responseBody({ userId: 'reviewer', roles: ['REVIEWER'], securityEnabled: true }))
        }
        return HttpResponse.json(
          {
            success: false,
            message: '',
            messageCode: '',
            errorMessage: '尚未登入或帳號密碼錯誤',
            data: null
          },
          { status: 401 }
        )
      })
    )
    const store = useAuthStore()

    await store.initialize()
    expect(store.securityRequired).toBe(true)
    expect(store.authenticated).toBe(false)

    await store.login('reviewer', 'reviewer-secret')
    expect(store.authenticated).toBe(true)
    expect(store.displayName).toBe('reviewer')
    expect(store.roleDescription).toBe('覆核')
    expect(store.hasRole('MAKER')).toBe(false)
    expect(store.hasRole('REVIEWER')).toBe(true)
  })

  it('combines more than two roles for the same user', async () => {
    server.use(
      http.get('/api/auth/me', () =>
        HttpResponse.json(
          responseBody({
            userId: 'multi-role-user',
            roles: ['MAKER', 'REVIEWER', 'ADMIN'],
            securityEnabled: true
          })
        )
      )
    )
    const store = useAuthStore()

    await store.initialize()

    expect(store.roleDescription).toBe('經辦、覆核、授權覆核')
    expect(store.hasRole('MAKER')).toBe(true)
    expect(store.hasRole('REVIEWER')).toBe(true)
    expect(store.hasRole('ADMIN')).toBe(true)
    expect(store.hasAnyRole(['USER', 'ADMIN'])).toBe(true)
  })
})
