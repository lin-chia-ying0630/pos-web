import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PolicyAddress, PolicyMaster, PolicyRide } from '../api/posChange'
import { usePolicyStore } from '../stores/policyStore'
import { usePolicyUiFields } from './usePolicyUiFields'

export type PolicyEntity = PolicyMaster | PolicyAddress | PolicyRide
type FormRecord = Record<string, string | number | null>
type MaintenanceMode = 'create' | 'edit' | 'delete'
type MaintenanceConfig<T extends PolicyEntity> = {
  entity: 'master' | 'address' | 'ride'
  entityName: string
  functionCode: string
  create: (value: T) => Promise<T>
  update: (value: T, original: T | null) => Promise<T>
  remove: (value: T) => Promise<void>
}

/** 異動保單服務共用 Dialog mode、API metadata form、CRUD 刷新與送審後導頁。 */
export function usePolicyMaintenance<T extends PolicyEntity>(config: MaintenanceConfig<T>) {
  const policyStore = usePolicyStore(),
    router = useRouter(),
    fields = usePolicyUiFields(config.entity)
  const mode = ref<MaintenanceMode | null>(null),
    selected = ref<T | null>(null)
  const form = reactive<FormRecord>({})
  const title = computed(
    () => `${mode.value === 'create' ? '新增' : mode.value === 'edit' ? '修改' : '刪除'}${config.entityName}`
  )
  function open(value: T | null, nextMode: MaintenanceMode) {
    selected.value = value
    mode.value = nextMode
    for (const key of Object.keys(form)) delete form[key]
    for (const field of fields.value) form[field.key] = (value as unknown as FormRecord | null)?.[field.key] ?? ''
  }
  function close() {
    mode.value = null
    selected.value = null
  }
  async function submit() {
    if (!mode.value) return
    const submittedMode = mode.value
    const value = Object.fromEntries(
      Object.entries(form).map(([key, content]) => [key, key.endsWith('At') && content === '' ? null : content])
    ) as unknown as T
    let result: T | null = null
    if (submittedMode === 'create') result = await config.create(value)
    else if (submittedMode === 'edit') result = await config.update(value, selected.value)
    else await config.remove(value)
    close()
    // Maker 回傳的是 STAGED 提案，不可當成正式資料；導向覆核中心查看處理狀態。
    if (result?.reviewStatus === 'P') {
      await router.push({
        path: '/change/reviews',
        query: { functionCode: config.functionCode, key1: result.policyNo }
      })
      return
    }
    if (submittedMode === 'delete' && config.entity === 'master') policyStore.policyDetail = null
    else await policyStore.fetchPolicy(value.policyNo, Number(value.policySeq))
  }
  return { fields, mode, form, title, open, close, submit }
}
