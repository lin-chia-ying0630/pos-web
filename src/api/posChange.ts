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

type ResponseBodyDto<T> = {
  success: boolean
  message: string
  massageCode: string
  errorMessage: string
  data: T
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  })
  const body = (await response.json().catch(() => null)) as ResponseBodyDto<T> | null
  if (!response.ok) {
    throw new Error(body?.errorMessage || body?.message || response.statusText)
  }
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data
  }
  return body as T
}

export function findPolicyDetail(policyNo: string, policySeq: number) {
  // 畫面對應：新增保全變更頁查詢保單，顯示保單主檔、通訊地址、地址清單與主附約資料。
  return request<PolicyDetail>(`/api/policies/${encodeURIComponent(policyNo)}/${policySeq}`)
}

export function findPostalCodeArea(postalCode: string, timeoutMs = 2000) {
  // 畫面對應：地址變更 Dialog 的 3+3 郵遞區號查詢，帶入全型/半形地址前綴。
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  return request<PostalCodeArea>(`/api/postal-codes/${encodeURIComponent(postalCode)}`, {
    signal: controller.signal
  }).finally(() => window.clearTimeout(timeoutId))
}

export function createChangeCase(policyNo: string, policySeq: number, changeItem: string) {
  // 畫面對應：新增保全變更頁「產生案號」按鈕，只取得案號，實際有異動時才存保全受理資料。
  return request<ChangeCase>('/api/change-cases', {
    method: 'POST',
    body: JSON.stringify({ policyNo, policySeq, changeItem })
  })
}

export function saveAddressChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  addressType: string
  zipCode3: string
  zipCode2: string
  fullWidthAddress: string
  halfWidthAddress: string
}) {
  // 畫面對應：001 地址變更 Dialog 儲存。
  return request<{ changedFieldCount: number }>('/api/change-cases/address-change', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function saveMainAmountChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  masterInsuredAmount: number
}) {
  // 畫面對應：002 主約保額變更 Dialog 儲存。
  return request<{ changedFieldCount: number }>('/api/change-cases/main-amount-change', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function saveRiderAmountChange(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  rides: Array<{ rideOrder: string; insuredAmount: number }>
}) {
  // 畫面對應：003 附約保額變更 Dialog 儲存。
  return request<{ changedFieldCount: number }>('/api/change-cases/rider-amount-change', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function findChangeCases(policyNo: string) {
  // 畫面對應：查詢保全變更頁與覆核頁的清單查詢。
  return request<PolicyChangeCase[]>(`/api/policies/${encodeURIComponent(policyNo)}/change-cases`)
}

export function updateChangeCaseStatus(payload: {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: 'C' | 'S'
}) {
  // 畫面對應：覆核頁將 P-受理中案件改為 S-完成或 C-取消。
  return request(`/api/change-cases/${encodeURIComponent(payload.changeCaseNo)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      policyNo: payload.policyNo,
      policySeq: payload.policySeq,
      acceptanceStatus: payload.acceptanceStatus
    })
  })
}
