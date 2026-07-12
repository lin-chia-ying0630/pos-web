import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { getAuthorizationHeader } from './authSession'

export type ResponseBodyDto<T> = {
  success: boolean
  message: string
  massageCode: string
  errorMessage: string
  data: T
}

export const httpClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})

httpClient.interceptors.request.use((config) => {
  const authorization = getAuthorizationHeader()
  if (authorization) config.headers.set('Authorization', authorization)
  return config
})

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<ResponseBodyDto<T> | T>(config)
    const body = response.data
    // 後端標準回覆使用 ResponseBodyDto<T>，前端頁面只需要 data。
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data
    }
    return body as T
  } catch (error) {
    if (error instanceof AxiosError) {
      const body = error.response?.data as Partial<ResponseBodyDto<unknown>> | undefined
      throw new Error(body?.errorMessage || body?.message || resolveAxiosErrorMessage(error))
    }
    throw error
  }
}

// 將常見連線錯誤轉成畫面可直接顯示的中文訊息。
function resolveAxiosErrorMessage(error: AxiosError) {
  if (error.code === 'ECONNABORTED') {
    return '連線逾時，請確認後端服務是否正常'
  }
  if (!error.response) {
    return '後端未啟動或網路連線失敗'
  }
  if (error.response.status === 403) {
    return '目前帳號沒有執行此作業的權限'
  }
  if (error.response.status === 401) {
    return '帳號密碼錯誤或登入已失效'
  }
  if (error.response.status >= 500) {
    return '後端服務發生錯誤'
  }
  return error.response.statusText || error.message
}
