import { http, HttpResponse } from 'msw'
import { mockChangeCaseDetail, mockChangeCases, mockPolicyDetail } from '../stories/mockData'

// MSW handlers 同時供 Vitest 與 Storybook 使用，讓前端可在無後端時驗證畫面狀態。
export const handlers = [
  http.get('/api/field-labels', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      messageCode: 'SUCCESS',
      errorMessage: '',
      data: {
        policyNo: '保單號碼',
        policySeq: '保單序號',
        fieldName: '欄位',
        contentBefore: '異動前',
        contentAfter: '異動後'
      }
    })
  }),
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      message: '執行成功',
      messageCode: '',
      errorMessage: '',
      data: {
        userId: 'local-development',
        roles: ['MAKER', 'REVIEWER'],
        functionCodes: [
          'MPS00001',
          'MPS00002',
          'MPS00003',
          'MPM00001',
          'MPM00002',
          'MPM00003',
          'MPM00004',
          'MPM00005',
          'MPM00006',
          'MCM00001',
          'MCM00002',
          'MUS00001'
        ],
        securityEnabled: false
      }
    })
  }),
  http.post('/api/change-cases', async ({ request }) => {
    const body = (await request.json()) as { policyNo: string; policySeq: number; changeItemCodes: string[] }
    return HttpResponse.json({
      success: true,
      message: '執行成功',
      messageCode: '',
      errorMessage: '',
      data: {
        policyNo: body.policyNo,
        policySeq: body.policySeq,
        changeCaseNo: 'C1150710003',
        acceptanceStatus: 'P',
        changeItemCodes: body.changeItemCodes
      }
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq/change-items/:changeItemCode/eligibility', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      messageCode: 'SUCCESS',
      errorMessage: '',
      data: {
        policyNo: String(params.policyNo),
        policySeq: Number(params.policySeq),
        changeItemCode: String(params.changeItemCode),
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
      messageCode: 'SUCCESS',
      errorMessage: '',
      data: mockChangeCases
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq/change-cases/:changeCaseNo', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      messageCode: 'SUCCESS',
      errorMessage: '',
      data: mockChangeCaseDetail
    })
  }),
  http.get('/api/policies/:policyNo/:policySeq', () => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      messageCode: 'SUCCESS',
      errorMessage: '',
      data: mockPolicyDetail
    })
  }),
  http.get('/api/postal-codes/:postalCode', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: '查詢成功',
      messageCode: 'SUCCESS',
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
