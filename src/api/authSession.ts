let authorizationHeader = ''

export function setBasicCredentials(username: string, password: string) {
  authorizationHeader = `Basic ${window.btoa(`${username}:${password}`)}`
}

export function clearBasicCredentials() {
  authorizationHeader = ''
}

export function getAuthorizationHeader() {
  return authorizationHeader
}
