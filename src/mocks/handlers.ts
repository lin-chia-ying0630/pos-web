import { http, HttpResponse } from 'msw'
import { mockChangeCaseDetail, mockChangeCases, mockPolicyDetail } from '../stories/mockData'

// MSW handlers 同時供 Vitest 與 Storybook 使用，讓前端可在無後端時驗證畫面狀態。
export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      message: '執行成功',
      massageCode: '',
      errorMessage: '',
      data: {
        username: 'local-development',
        roles: ['MAKER', 'REVIEWER'],
        securityEnabled: false
      }
    })
  }),
  http.post('/api/change-cases', async ({ request }) => {
    const body = (await request.json()) as { policyNo: string; policySeq: number; changeItems: string[] }
    return HttpResponse.json({
      success: true,
      message: '執行成功',
      massageCode: '',
      errorMessage: '',
      data: {
        policyNo: body.policyNo,
        policySeq: body.policySeq,
        changeCaseNo: 'C1150710003',
        acceptanceStatus: 'P',
        changeItems: body.changeItems
      }
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq/change-items/:changeItem/eligibility', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      massageCode: 'SUCCESS',
      errorMessage: '',
      data: {
        policyNo: String(params.policyNo),
        policySeq: Number(params.policySeq),
        changeItem: String(params.changeItem),
        eligible: true,
        latestChangeCaseNo: null,
        latestAcceptanceStatus: null,
        message: ''
      }
    })
  }),
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
