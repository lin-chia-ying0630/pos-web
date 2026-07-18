import type { PolicyChangeCase, PolicyChangeCaseDetail, PolicyDetail } from '../api/posChange'

export const mockPolicyDetail: PolicyDetail = {
  master: {
    policyNo: 'P000000001',
    policySeq: 1,
    premium: 12345.6789
  },
  communicationAddress: {
    policyNo: 'P000000001',
    policySeq: 1,
    addressType: '01',
    zipCode3: '100',
    zipCode2: '001',
    fullWidthAddress: '臺北市中正區重慶南路一段 100 號',
    halfWidthAddress: 'Zhongzheng Dist., Taipei City'
  },
  addressList: [
    {
      policyNo: 'P000000001',
      policySeq: 1,
      addressType: '01',
      zipCode3: '100',
      zipCode2: '001',
      fullWidthAddress: '臺北市中正區重慶南路一段 100 號',
      halfWidthAddress: 'Zhongzheng Dist., Taipei City'
    },
    {
      policyNo: 'P000000001',
      policySeq: 1,
      addressType: '02',
      zipCode3: '104',
      zipCode2: null,
      fullWidthAddress: '臺北市中山區南京東路二段 10 號',
      halfWidthAddress: 'Zhongshan Dist., Taipei City'
    }
  ],
  rideList: [
    {
      policyNo: 'P000000001',
      policySeq: 1,
      rideType: '1',
      rideOrder: '000',
      productCode: 'LIFE',
      policyYears: 20,
      insuredAmount: 1000000,
      premium: 10000
    },
    {
      policyNo: 'P000000001',
      policySeq: 1,
      rideType: '2',
      rideOrder: '001',
      productCode: 'ACC',
      policyYears: 10,
      insuredAmount: 300000,
      premium: 2345.6789
    }
  ],
  addressTypes: [
    { codeBefore: '01', codeDescription: '通訊地址' },
    { codeBefore: '02', codeDescription: '戶籍地址' },
    { codeBefore: '31', codeDescription: 'email' }
  ],
  acceptanceStatuses: [
    { codeBefore: 'P', codeDescription: '受理中' },
    { codeBefore: 'S', codeDescription: '完成' },
    { codeBefore: 'C', codeDescription: '取消' }
  ],
  changeItems: [
    { codeBefore: '001', codeDescription: '地址變更' },
    { codeBefore: '002', codeDescription: '主約保額變更' },
    { codeBefore: '003', codeDescription: '附約保額變更' }
  ],
  screenPermissions: [
    { codeBefore: 'CREATE', codeAfter: 'MAKER', codeDescription: '新增' },
    { codeBefore: 'UPDATE', codeAfter: 'MAKER', codeDescription: '修改' },
    { codeBefore: 'DELETE', codeAfter: 'MAKER', codeDescription: '刪除' },
    { codeBefore: 'REVIEW', codeAfter: 'REVIEWER', codeDescription: '覆核' }
  ]
}

export const mockChangeCases: PolicyChangeCase[] = [
  {
    policyNo: 'P000000001',
    policySeq: 1,
    changeCaseNo: 'C1150710001',
    acceptanceStatus: 'P',
    acceptanceStatusDescription: '受理中',
    changeItems: '001,002',
    changeItemDescriptions: '地址變更,主約保額變更'
  },
  {
    policyNo: 'P000000001',
    policySeq: 1,
    changeCaseNo: 'C1150710002',
    acceptanceStatus: 'S',
    acceptanceStatusDescription: '完成',
    changeItems: '003',
    changeItemDescriptions: '附約保額變更'
  }
]

export const mockChangeCaseDetail: PolicyChangeCaseDetail = {
  changeCase: mockChangeCases[0]!,
  changeFields: [
    {
      id: 1,
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150710001',
      changeItem: '001',
      changeField: 'full_width_address',
      chineseName: '中文地址',
      changeKey: '01',
      contentBefore: '臺北市中正區重慶南路一段 100 號',
      contentAfter: '臺北市中正區重慶南路一段 200 號',
      createdAt: null,
      updatedAt: null
    }
  ],
  changeFiles: []
}
