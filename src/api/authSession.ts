// Basic credential 只保留在分頁執行期記憶體；重新整理即登出。
// 禁止寫入 localStorage/sessionStorage，避免 XSS 發生時擴大長效憑證外洩範圍。
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
