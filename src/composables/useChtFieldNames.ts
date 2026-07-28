import { ref } from 'vue'
import { findFieldLabels } from '../api/posChange'

const names = ref(new Map<string, string>())
// 同一頁的表格與彈窗共用一次 API 結果，避免每個元件重複查詢代碼表。
let loading: Promise<void> | null = null

export function useChtFieldNames() {
  async function load() {
    if (names.value.size) return
    if (!loading) {
      loading = findFieldLabels().then((labels) => {
        names.value = new Map(Object.entries(labels))
      })
    }
    await loading
  }
  function label(key: string) {
    return names.value.get(key) || key
  }
  return { names, label, load }
}
