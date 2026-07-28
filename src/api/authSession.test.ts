import { beforeEach, describe, expect, it } from 'vitest'

import { clearBasicCredentials, getAuthorizationHeader, setBasicCredentials } from './authSession'

describe('authSession', () => {
  beforeEach(() => {
    clearBasicCredentials()
    sessionStorage.clear()
  })

  it('憑證只保留在記憶體而不寫入 Web Storage', () => {
    setBasicCredentials('maker', 'temporary-password')

    expect(getAuthorizationHeader()).toBe(`Basic ${window.btoa('maker:temporary-password')}`)
    expect(sessionStorage.length).toBe(0)
  })
})
