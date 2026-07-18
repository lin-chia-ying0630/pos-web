const STORAGE_KEY = 'pos-change.authorization'
let authorizationHeader = sessionStorage.getItem(STORAGE_KEY) ?? ''

export function setBasicCredentials(username: string, password: string) {
  authorizationHeader = `Basic ${window.btoa(`${username}:${password}`)}`
  sessionStorage.setItem(STORAGE_KEY, authorizationHeader)
}

export function clearBasicCredentials() {
  authorizationHeader = ''
  sessionStorage.removeItem(STORAGE_KEY)
}

export function getAuthorizationHeader() {
  return authorizationHeader
}
