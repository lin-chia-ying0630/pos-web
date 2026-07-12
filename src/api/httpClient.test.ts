import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { request } from './httpClient'
import { server } from '../mocks/node'
import type { PolicyDetail } from './posChange'

describe('httpClient', () => {
  it('unwraps ResponseBodyDto data', async () => {
    const policy = await request<PolicyDetail>({
      method: 'GET',
      url: '/api/policies/P000000001/1'
    })

    expect(policy.master.policyNo).toBe('P000000001')
  })

  it('uses friendly 403 error message', async () => {
    server.use(
      http.get('/api/forbidden', () => {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden' })
      })
    )

    await expect(request({ method: 'GET', url: '/api/forbidden' })).rejects.toThrow('目前帳號沒有執行此作業的權限')
  })
})
