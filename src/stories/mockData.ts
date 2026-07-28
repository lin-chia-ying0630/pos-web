import type { PolicyChangeCase, PolicyChangeCaseDetail, PolicyDetail } from '../api/posChange'

export const mockPolicyDetail: PolicyDetail = {
  emailList: [],
  phoneList: [],
  master: {
    policyNo: 'P000000001',
    policySeq: 1,
    premiumAmount: 12345.6789,
    currencyCode: 'TWD'
  },
  communicationAddress: {
    addressId: '019f0000-0000-7000-8000-000000000001',
    policyNo: 'P000000001',
    policySeq: 1,
    addressTypeCode: '01',
    postalCode: '100001',
    addressText: '臺北市中正區重慶南路一段 100 號',
    countryCode: 'TW',
    primaryFlag: 'Y'
  },
  addressList: [
    {
      addressId: '019f0000-0000-7000-8000-000000000001',
      policyNo: 'P000000001',
      policySeq: 1,
      addressTypeCode: '01',
      postalCode: '100001',
      addressText: '臺北市中正區重慶南路一段 100 號',
      countryCode: 'TW',
      primaryFlag: 'Y'
    },
    {
      addressId: '019f0000-0000-7000-8000-000000000002',
      policyNo: 'P000000001',
      policySeq: 1,
      addressTypeCode: '02',
      postalCode: '104',
      addressText: '臺北市中山區南京東路二段 10 號',
      countryCode: 'TW',
      primaryFlag: 'N'
    }
  ],
  rideList: [
    {
      policyNo: 'P000000001',
      policySeq: 1,
      coverageItemType: 'BASE',
      coverageItemSeq: '000',
      productCode: 'LIFE',
      productVersion: '1',
      coverageTermYears: 20,
      insuredAmount: 1000000,
      premiumAmount: 10000,
      currencyCode: 'TWD'
    },
    {
      policyNo: 'P000000001',
      policySeq: 1,
      coverageItemType: 'RIDER',
      coverageItemSeq: '001',
      productCode: 'ACC',
      productVersion: '1',
      coverageTermYears: 10,
      insuredAmount: 300000,
      premiumAmount: 2345.6789,
      currencyCode: 'TWD'
    }
  ],
  addressTypeCodes: [
    { codeBefore: '01', codeDescription: '通訊地址' },
    { codeBefore: '02', codeDescription: '戶籍地址' },
    { codeBefore: '31', codeDescription: 'email' }
  ],
  acceptanceStatuses: [
    { codeBefore: 'P', codeDescription: '受理中' },
    { codeBefore: 'S', codeDescription: '完成' },
    { codeBefore: 'C', codeDescription: '取消' }
  ],
  changeItemCodes: [
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
    changeItemCodes: '001,002',
    changeItemCodeDescriptions: '地址變更,主約保額變更'
  },
  {
    policyNo: 'P000000001',
    policySeq: 1,
    changeCaseNo: 'C1150710002',
    acceptanceStatus: 'S',
    acceptanceStatusDescription: '完成',
    changeItemCodes: '003',
    changeItemCodeDescriptions: '附約保額變更'
  }
]

export const mockChangeCaseDetail: PolicyChangeCaseDetail = {
  changeCase: mockChangeCases[0]!,
  changedFieldNames: [
    {
      id: 1,
      changeFieldId: '019f0000-0000-7000-8000-000000000101',
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150710001',
      changeItemCode: '001',
      changedFieldName: 'full_width_address',
      chineseName: '中文地址',
      changedRecordKey: '01',
      contentBefore: '臺北市中正區重慶南路一段 100 號',
      contentAfter: '臺北市中正區重慶南路一段 200 號',
      createdAt: null,
      updatedAt: null
    }
  ],
  changedRecordTypes: []
}
