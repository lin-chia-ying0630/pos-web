import { onMounted, ref } from 'vue'
import { findPolicyUiFields, type UiFieldDefinition } from '../api/posChange'

// UUID 僅供後端關聯、併發控制與稽核追蹤，不屬於保單業務畫面的顯示或輸入欄位。
const internalIdentifierKeys = new Set(['policyContractId', 'addressId', 'coverageId'])
const reviewFieldKeys = new Set(['reviewStatus', 'reviewedBy', 'reviewedAt'])

export function isInternalPolicyIdentifier(key: string) {
  return internalIdentifierKeys.has(key)
}

export function isPolicyServiceHiddenField(key: string) {
  return isInternalPolicyIdentifier(key) || reviewFieldKeys.has(key)
}

export function usePolicyUiFields(entity: 'master' | 'address' | 'ride') {
  const fields = ref<UiFieldDefinition[]>([])
  // 英文欄位 key、型態、選項及編輯規則全部以 API metadata 為唯一來源。
  onMounted(async () => {
    try {
      fields.value = (await findPolicyUiFields(entity)).filter((field) => !isPolicyServiceHiddenField(field.key))
    } catch {
      // 查詢摘要會使用保單 API 實際資料 key 顯示；維護功能則等待 metadata API 恢復。
      fields.value = []
    }
  })
  return fields
}
