import { http, HttpResponse } from 'msw'
import { mockChangeCaseDetail, mockChangeCases, mockPolicyDetail } from '../stories/mockData'

// MSW handlers 同時供 Vitest 與 Storybook 使用，讓前端可在無後端時驗證畫面狀態。
export const handlers = [
  http.get('/api/policies/:policyNo/change-cases', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      massageCode: 'SUCCESS',
      errorMessage: '',
      data: mockChangeCases
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq/change-cases/:changeCaseNo', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      massageCode: 'SUCCESS',
      errorMessage: '',
      data: mockChangeCaseDetail
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      massageCode: 'SUCCESS',
      errorMessage: '',
      data: mockPolicyDetail
    })
  }),
  http.get('/api/postal-codes/:postalCode', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      massageCode: 'SUCCESS',
      errorMessage: '',
      data: {
        postalCode: String(params.postalCode),
        zipCode3: String(params.postalCode).slice(0, 3),
        city: '臺北市',
        district: '中山區',
        addressPrefix: '臺北市中山區',
        halfWidthAddressPrefix: 'Zhongshan Dist., Taipei City'
      }
    })
  })
]
