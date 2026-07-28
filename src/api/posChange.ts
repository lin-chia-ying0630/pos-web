import { request } from './httpClient'

export type PolicyMaster = {
  policyContractId?: string | null
  policyNo: string
  policySeq: number
  premiumAmount: number
  currencyCode: string
  policyStatus?: string | null
  contractDate?: string | null
  effectiveDate?: string | null
  maturityDate?: string | null
  premiumPaymentTermYears?: number | null
  coverageTermYears?: number | null
  coverageTermType?: string | null
  paymentFrequencyCode?: string | null
  productCode?: string | null
  productVersion?: string | null
  productName?: string | null
  basePlanProductCode?: string | null
  applicationNo?: string | null
  customerCode?: string | null
  insuranceAgentCode?: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  activeFlag?: string | null
  reviewStatus?: string | null
  recordVersion?: number | null
}

export type PolicyMasterMaintenanceRequest = PolicyMaster & {
  originalPolicyNo?: string
  originalPolicySeq?: number
}

export type UiFieldDefinition = {
  key: string
  type: string
  required: boolean
  identity: boolean
  createEditable: boolean
  wide: boolean
  maxLength?: number | null
  precision?: number | null
  scale?: number | null
  step?: string | null
  min?: string | null
  options?: string[] | null
  description?: string | null
}

export function findPolicyUiFields(entity: 'master' | 'address' | 'ride') {
  return request<UiFieldDefinition[]>({ url: `/api/policy-ui-metadata/${entity}`, method: 'GET' })
}

export type PolicyAddress = {
  addressId: string
  policyNo: string
  policySeq: number
  addressTypeCode: string
  postalCode: string
  addressText: string
  countryCode: string
  primaryFlag: string
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  activeFlag?: string | null
  reviewStatus?: string | null
  recordVersion?: number | null
}

export type PolicyRide = {
  coverageId?: string | null
  policyNo: string
  policySeq: number
  coverageItemType: string
  coverageItemSeq: string
  productCode: string
  productVersion: string
  coverageTermYears: number
  insuredAmount: number
  premiumAmount: number
  currencyCode: string
  productName?: string | null
  basePlanProductCode?: string | null
  paymentFrequencyCode?: string | null
  premiumPaymentTermYears?: number | null
  coverageTermType?: string | null
  effectiveDate?: string | null
  expiryDate?: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  activeFlag?: string | null
  reviewStatus?: string | null
  recordVersion?: number | null
}

export type CodeDescription = {
  codeGroup?: string
  codeField?: string
  codeBefore: string
  codeAfter?: string
  codeDescription: string
  activeFlag?: string
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewStatus?: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  recordVersion?: number | null
  originalCodeGroup?: string
  originalCodeField?: string
  originalCodeBefore?: string
}

export type ChangeReview = {
  id: number
  operation: string
  workflowMode?: 'LEGACY' | 'STAGED' | 'DIRECT'
  sourceType: string
  sourceRecordType: string
  sourceRecordId?: number | null
  functionCode: string
  key1?: string | null
  uniqueKey: string
  reviewKey: string
  policyNo?: string | null
  policySeq?: number | null
  changeCaseNo?: string | null
  contentBefore?: string | null
  contentAfter?: string | null
  reviewRemark?: string | null
  reviewStatus: string
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type ChangeReviewAudit = {
  auditId: number
  eventId: string
  reviewId: number
  reviewKey: string
  functionCode: string
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'RESUBMIT' | 'WITHDRAW' | 'DIRECT_APPLY'
  statusBefore?: string | null
  statusAfter: string
  operatorId: string
  reviewRemark?: string | null
  contentBefore?: string | null
  contentAfter?: string | null
  requestId?: string | null
  traceId?: string | null
  occurredAt: string
  createdAt: string
}

export type ChangeReviewPage = {
  items: ChangeReview[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export function findChangeReviews(functionCode?: string, key1?: string, reviewStatus?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page) })
  if (functionCode) params.set('functionCode', functionCode)
  if (key1) params.set('key1', key1)
  if (reviewStatus) params.set('reviewStatus', reviewStatus)
  return request<ChangeReviewPage>({ url: `/api/change-reviews?${params.toString()}`, method: 'GET' })
}

export function findChangeReviewAudits(reviewKey: string) {
  return request<ChangeReviewAudit[]>({
    url: `/api/change-reviews/${encodeURIComponent(reviewKey)}/audits`,
    method: 'GET'
  })
}

export function decideChangeReview(reviewKey: string, status: 'S' | 'C', reviewRemark?: string) {
  return request<string>({
    url: `/api/change-reviews/${encodeURIComponent(reviewKey)}/decision`,
    method: 'PATCH',
    data: { status, reviewRemark }
  })
}

export function findAllCodes() {
  return request<CodeDescription[]>({ url: '/api/user-authorizations/codes', method: 'GET' })
}

export function findFunctionCodes() {
  return request<CodeDescription[]>({ url: '/api/function-codes', method: 'GET' })
}

export function findNavigationLabels() {
  return request<CodeDescription[]>({ url: '/api/navigation-labels', method: 'GET' })
}

export function findFieldLabels() {
  return request<Record<string, string>>({ url: '/api/field-labels', method: 'GET' })
}

export function createCode(code: Omit<CodeDescription, 'codeAfter'> & { codeAfter?: string }) {
  return request<CodeDescription>({ url: '/api/user-authorizations/codes', method: 'POST', data: code })
}
export function updateCode(code: CodeDescription) {
  return request<CodeDescription>({ url: '/api/user-authorizations/codes', method: 'PUT', data: code })
}
export function deleteCode(code: CodeDescription) {
  return request<void>({
    url: `/api/user-authorizations/codes/${code.codeGroup}/${code.codeField}/${code.codeBefore}`,
    method: 'DELETE'
  })
}
export function createPolicyMaster(master: PolicyMasterMaintenanceRequest) {
  return request<PolicyMaster>({ url: '/api/policy-masters', method: 'POST', data: master })
}

export function updatePolicyMaster(master: PolicyMasterMaintenanceRequest) {
  return request<PolicyMaster>({ url: '/api/policy-masters', method: 'PUT', data: master })
}

export function deletePolicyMaster(policyNo: string, policySeq: number) {
  return request<void>({
    url: `/api/policy-masters/${encodeURIComponent(policyNo)}/${policySeq}`,
    method: 'DELETE'
  })
}

export function createPolicyAddress(value: PolicyAddress) {
  return request<PolicyAddress>({ url: '/api/policy-details/addresses', method: 'POST', data: value })
}
export function updatePolicyAddress(value: PolicyAddress) {
  return request<PolicyAddress>({ url: '/api/policy-details/addresses', method: 'PUT', data: value })
}
export function deletePolicyAddress(value: PolicyAddress) {
  return request<void>({
    url: `/api/policy-details/addresses/${encodeURIComponent(value.policyNo)}/${value.policySeq}/${encodeURIComponent(value.addressTypeCode)}`,
    method: 'DELETE'
  })
}
export function createPolicyRide(value: PolicyRide) {
  return request<PolicyRide>({ url: '/api/policy-details/rides', method: 'POST', data: value })
}
export function updatePolicyRide(value: PolicyRide) {
  return request<PolicyRide>({ url: '/api/policy-details/rides', method: 'PUT', data: value })
}
export function deletePolicyRide(value: PolicyRide) {
  return request<void>({
    url: `/api/policy-details/rides/${encodeURIComponent(value.policyNo)}/${value.policySeq}/${encodeURIComponent(value.coverageItemSeq)}`,
    method: 'DELETE'
  })
}

export type PolicyDetail = {
  master: PolicyMaster
  communicationAddress: PolicyAddress | null
  addressList: PolicyAddress[]
  emailList: PolicyEmail[]
  phoneList: PolicyPhone[]
  rideList: PolicyRide[]
  addressTypeCodes: CodeDescription[]
  acceptanceStatuses: CodeDescription[]
  changeItemCodes: CodeDescription[]
  screenPermissions: CodeDescription[]
}

export type PolicyEmail = {
  emailId: string
  emailTypeCode: string
  emailAddress: string
  primaryFlag: string
}

export type PolicyPhone = {
  phoneId: string
  phoneTypeCode: string
  phoneNumber: string
  primaryFlag: string
}

export type ChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  changeItemCodes: string[]
}

export type ChangeCaseEligibility = {
  policyNo: string
  policySeq: number
  changeItemCode: string
  eligible: boolean
  latestChangeCaseNo: string | null
  latestAcceptanceStatus: string | null
  message: string
}

export type PolicyChangeCase = {
  changeCaseId?: string | null
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  acceptanceStatusDescription: string | null
  changeItemCodes: string | null
  changeItemCodeDescriptions: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type PolicyChangeField = {
  id: number
  changeFieldId: string
  policyNo: string
  policySeq: number
  changeCaseNo: string
  changeItemCode: string
  changedFieldName: string
  chineseName: string
  changedRecordKey: string | null
  contentBefore: string | null
  contentAfter: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type PolicyChangeFile = {
  id: number
  changeSnapshotId: string
  policyNo: string
  policySeq: number
  changeCaseNo: string
  changeItemCode: string
  changedRecordType: string
  changedRecordKey: string | null
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
  changedFieldNames: PolicyChangeField[]
  changedRecordTypes: PolicyChangeFile[]
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
  userId: string
  roles: string[]
  functionCodes: string[]
  securityEnabled: boolean
}

export function findCurrentUser() {
  // 畫面對應：登入頁驗證 userId，並取得該使用者所有角色，不假設只有單一角色。
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

export type UserRoleAuthorization = {
  userId: string
  enabled: boolean
  roles: string[]
  reviewStatus: string
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
}

export type UserRoleAuthorizationRequest = {
  userId: string
  roles: string[]
}

export type UserAccountCreateRequest = UserRoleAuthorizationRequest & {
  password: string
  enabled: boolean
}

export function findUserRoleAuthorizations() {
  // USER 與 ADMIN 共用查詢；回傳每個 userId 的完整角色集合。
  return request<UserRoleAuthorization[]>({ method: 'GET', url: '/api/user-authorizations/users' })
}

export function createUserAccount(value: UserAccountCreateRequest) {
  return request<UserRoleAuthorization>({ method: 'POST', url: '/api/user-authorizations/users', data: value })
}

export function updateUserAccount(value: UserRoleAuthorizationRequest & { enabled: boolean }) {
  return request<UserRoleAuthorization>({ method: 'PUT', url: '/api/user-authorizations/users', data: value })
}

export function resetUserPassword(userId: string, password: string) {
  return request<void>({
    method: 'PATCH',
    url: `/api/user-authorizations/users/${encodeURIComponent(userId)}/password`,
    data: { password }
  })
}

export function addUserRoles(value: UserRoleAuthorizationRequest) {
  // ADMIN 新增角色後立即生效，後端同步建立 S 狀態稽核軌跡。
  return request<UserRoleAuthorization>({ method: 'POST', url: '/api/user-authorizations/users/roles', data: value })
}

export function replaceUserRoles(value: UserRoleAuthorizationRequest) {
  // ADMIN 修改完整角色集合；USER 即使繞過畫面也會被後端拒絕。
  return request<UserRoleAuthorization>({ method: 'PUT', url: '/api/user-authorizations/users/roles', data: value })
}

export type UserScreenAuthorization = {
  // 後端以 userId 直接掛載功能畫面，不由單一角色推算。
  userId: string
  functionCodes: string[]
  reviewStatus: string
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
}

export function findUserScreenAuthorizations() {
  return request<UserScreenAuthorization[]>({ method: 'GET', url: '/api/user-authorizations/users/screens' })
}

export function replaceUserScreens(value: { userId: string; functionCodes: string[] }) {
  return request<UserScreenAuthorization>({ method: 'PUT', url: '/api/user-authorizations/users/screens', data: value })
}

export function findPolicyDetail(policyNo: string, policySeq: number) {
  // 畫面對應：申請保全變更頁查詢保單，顯示保單主檔、通訊地址、地址清單與主附約資料。
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

export function createChangeCase(policyNo: string, policySeq: number, changeItemCodes: string[]) {
  // 畫面對應：申請保全變更頁「產生案號」按鈕，只取得案號，實際有異動時才存保全受理資料。
  return request<ChangeCase>({
    method: 'POST',
    url: '/api/change-cases',
    data: { policyNo, policySeq, changeItemCodes }
  })
}

export function checkChangeCaseEligibility(policyNo: string, policySeq: number, changeItemCode: string) {
  // 畫面對應：產生案號前確認同一保單、序號與變更項目的最近案件不是 P-受理中。
  return request<ChangeCaseEligibility>({
    method: 'GET',
    url: `/api/policies/${encodeURIComponent(policyNo)}/${policySeq}/change-items/${encodeURIComponent(changeItemCode)}/eligibility`
  })
}

export function saveAddressChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  addressTypeCode: string
  postalCode: string
  addressText: string
}) {
  // 畫面對應：001 地址變更 Dialog 儲存。
  const { changeCaseNo, ...address } = payload
  return request<{ changedFieldCount: number }>({
    method: 'POST',
    url: `/api/change-cases/${encodeURIComponent(changeCaseNo)}/address-change`,
    data: address
  })
}

export function saveContactChannelChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  channel: 'email' | 'telephone' | 'mobile'
  contactId?: string
  value: string
}) {
  const { changeCaseNo, channel, ...requestBody } = payload
  return request<{ changedFieldCount: number }>({
    method: 'POST',
    url: `/api/change-cases/${encodeURIComponent(changeCaseNo)}/contact-channels/${channel}`,
    data: requestBody
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
  rides: Array<{ coverageItemSeq: string; insuredAmount: number }>
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
