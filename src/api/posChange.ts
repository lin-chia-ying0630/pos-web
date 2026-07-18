import { request } from './httpClient'

export type PolicyMaster = {
  policyNo: string
  policySeq: number
  premium: number
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type PolicyAddress = {
  policyNo: string
  policySeq: number
  addressType: string
  zipCode3: string | null
  zipCode2: string | null
  fullWidthAddress: string | null
  halfWidthAddress: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
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
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type CodeDescription = {
  codeGroup?: string
  codeField?: string
  codeBefore: string
  codeAfter?: string
  codeDescription: string
}

export function findAllCodes() {
  return request<CodeDescription[]>({ url: '/user-authorizations/codes', method: 'GET' })
}

export type PolicyDetail = {
  master: PolicyMaster
  communicationAddress: PolicyAddress | null
  addressList: PolicyAddress[]
  rideList: PolicyRide[]
  addressTypes: CodeDescription[]
  acceptanceStatuses: CodeDescription[]
  changeItems: CodeDescription[]
  screenPermissions: CodeDescription[]
}

export type ChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  changeItems: string[]
}

export type ChangeCaseEligibility = {
  policyNo: string
  policySeq: number
  changeItem: string
  eligible: boolean
  latestChangeCaseNo: string | null
  latestAcceptanceStatus: string | null
  message: string
}

export type PolicyChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  acceptanceStatusDescription: string | null
  changeItems: string | null
  changeItemDescriptions: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type PolicyChangeField = {
  id: number
  policyNo: string
  policySeq: number
  changeCaseNo: string
  changeItem: string
  changeField: string
  chineseName: string
  changeKey: string | null
  contentBefore: string | null
  contentAfter: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type PolicyChangeFile = {
  id: number
  policyNo: string
  policySeq: number
  changeCaseNo: string
  changeItem: string
  changeFile: string
  changeKey: string | null
  contentBefore: string | null
  contentAfter: string | null
  snapshotFields: PolicyChangeSnapshotField[]
  createdAt: string | null
  updatedAt: string | null
}

export type PolicyChangeSnapshotField = {
  jsonKey: string
  chineseName: string
  contentBefore: string | null
  contentAfter: string | null
}

export type PolicyChangeCaseDetail = {
  changeCase: PolicyChangeCase
  changeFields: PolicyChangeField[]
  changeFiles: PolicyChangeFile[]
}

export type PostalCodeArea = {
  postalCode: string
  zipCode3: string
  city: string
  district: string
  addressPrefix: string
  halfWidthAddressPrefix: string
}

export type CurrentUser = {
  username: string
  roles: string[]
  securityEnabled: boolean
}

export function findCurrentUser() {
  // 畫面對應：登入頁驗證帳號與取得經辦／覆核角色。
  return request<CurrentUser>({
    method: 'GET',
    url: '/api/auth/me'
  })
}

export function findUserAuthorizationPermissions() {
  // 畫面對應：使用者授權頁顯示四個支線與 user/admin 角色對照。
  return request<CodeDescription[]>({
    method: 'GET',
    url: '/api/user-authorizations'
  })
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

export function createChangeCase(policyNo: string, policySeq: number, changeItems: string[]) {
  // 畫面對應：新增保全變更頁「產生案號」按鈕，只取得案號，實際有異動時才存保全受理資料。
  return request<ChangeCase>({
    method: 'POST',
    url: '/api/change-cases',
    data: { policyNo, policySeq, changeItems }
  })
}

export function checkChangeCaseEligibility(policyNo: string, policySeq: number, changeItem: string) {
  // 畫面對應：產生案號前確認同一保單、序號與變更項目的最近案件不是 P-受理中。
  return request<ChangeCaseEligibility>({
    method: 'GET',
    url: `/api/policies/${encodeURIComponent(policyNo)}/${policySeq}/change-items/${encodeURIComponent(changeItem)}/eligibility`
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
  insuredAmount: number
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

export function findChangeCaseDetail(policyNo: string, policySeq: number, changeCaseNo: string) {
  // 畫面對應：查詢與覆核頁展開案件，顯示每一筆異動前後值。
  return request<PolicyChangeCaseDetail>({
    method: 'GET',
    url: `/api/policies/${encodeURIComponent(policyNo)}/${policySeq}/change-cases/${encodeURIComponent(changeCaseNo)}`
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
