import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

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

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<ResponseBodyDto<T> | T>(config)
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data
    }
    return body as T
  } catch (error) {
    if (error instanceof AxiosError) {
      const body = error.response?.data as Partial<ResponseBodyDto<unknown>> | undefined
      throw new Error(body?.errorMessage || body?.message || error.response?.statusText || error.message)
    }
    throw error
  }
}
