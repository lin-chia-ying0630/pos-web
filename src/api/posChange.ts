import { request } from './httpClient'

export type PolicyMaster = {
  policyNo: string
  policySeq: number
  mainProductCode: string
  mainPolicyYears: number
  insuredAmount: number
  premium: number
}

export type PolicyAddress = {
  policyNo: string
  policySeq: number
  addressType: string
  zipCode3: string | null
  zipCode2: string | null
  fullWidthAddress: string | null
  halfWidthAddress: string | null
}

export type PolicyRide = {
  policyNo: string
  policySeq: number
  rideType: string
  rideOrder: string
  productCode: string
  policyYears: number
  insuredAmount: number
  premium: number
}

export type CodeDescription = {
  codeBefore: string
  codeDescription: string
}

export type PolicyDetail = {
  master: PolicyMaster
  communicationAddress: PolicyAddress | null
  addressList: PolicyAddress[]
  rideList: PolicyRide[]
  addressTypes: CodeDescription[]
  acceptanceStatuses: CodeDescription[]
  changeItems: CodeDescription[]
}

export type ChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  changeItem: string
}

export type PolicyChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  acceptanceStatusDescription: string | null
  changeItems: string | null
  changeItemDescriptions: string | null
}

export type PostalCodeArea = {
  postalCode: string
  zipCode3: string
  city: string
  district: string
  addressPrefix: string
  halfWidthAddressPrefix: string
}

export function findPolicyDetail(policyNo: string, policySeq: number) {
  // 畫面對應：新增保全變更頁查詢保單，顯示保單主檔、通訊地址、地址清單與主附約資料。
  return request<PolicyDetail>({
    method: 'GET',
    url: `/api/policies/${encodeURIComponent(policyNo)}/${policySeq}`
  })
}

export function findPostalCodeArea(postalCode: string, timeoutMs = 2000) {
  // 畫面對應：地址變更 Dialog 的 3+3 郵遞區號查詢，帶入地址前綴。
  return request<PostalCodeArea>({
    method: 'GET',
    url: `/api/postal-codes/${encodeURIComponent(postalCode)}`,
    timeout: timeoutMs
  })
}

export function createChangeCase(policyNo: string, policySeq: number, changeItem: string) {
  // 畫面對應：新增保全變更頁「產生案號」按鈕，只取得案號，實際有異動時才存保全受理資料。
  return request<ChangeCase>({
    method: 'POST',
    url: '/api/change-cases',
    data: { policyNo, policySeq, changeItem }
  })
}

export function saveAddressChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  addressType: string
  zipCode3: string | null
  zipCode2: string | null
  fullWidthAddress: string | null
  halfWidthAddress: string
}) {
  // 畫面對應：001 地址變更 Dialog 儲存。
  const { changeCaseNo, ...address } = payload
  return request<{ changedFieldCount: number }>({
    method: 'POST',
    url: `/api/change-cases/${encodeURIComponent(changeCaseNo)}/address-change`,
    data: address
  })
}

export function saveMainAmountChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  masterInsuredAmount: number
}) {
  // 畫面對應：002 主約保額變更 Dialog 儲存。
  const { changeCaseNo, ...requestBody } = payload
  return request<{ changedFieldCount: number }>({
    method: 'POST',
    url: `/api/change-cases/${encodeURIComponent(changeCaseNo)}/main-amount-change`,
    data: requestBody
  })
}

export function saveRiderAmountChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  rides: Array<{ rideOrder: string; insuredAmount: number }>
}) {
  // 畫面對應：003 附約保額變更 Dialog 儲存。
  const { policyNo, policySeq, changeCaseNo, rides } = payload
  return request<{ changedFieldCount: number }>({
    method: 'POST',
    url: `/api/change-cases/${encodeURIComponent(changeCaseNo)}/policies/${encodeURIComponent(policyNo)}/${policySeq}/rider-amount-change`,
    data: { rides }
  })
}

export function findChangeCases(policyNo: string) {
  // 畫面對應：查詢保全變更頁與覆核頁的清單查詢。
  return request<PolicyChangeCase[]>({
    method: 'GET',
    url: `/api/policies/${encodeURIComponent(policyNo)}/change-cases`
  })
}

export function updateChangeCaseStatus(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: 'C' | 'S'
}) {
  // 畫面對應：覆核頁將 P-受理中案件改為 S-完成或 C-取消。
  return request({
    method: 'PATCH',
    url: `/api/change-cases/${encodeURIComponent(payload.changeCaseNo)}/status`,
    data: {
      policyNo: payload.policyNo,
      policySeq: payload.policySeq,
      acceptanceStatus: payload.acceptanceStatus
    }
  })
}
