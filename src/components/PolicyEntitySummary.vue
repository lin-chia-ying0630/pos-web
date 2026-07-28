<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table query-record-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>{{ title }}</h2>
      </div>
      <ScrollableRecordTable :columns="columns" :rows="rows">
        <template #cell-actions="{ row }">
          <button
            type="button"
            :disabled="(!authStore.hasRole('MAKER') && !authStore.hasRole('ADMIN')) || !isCompleted(row)"
            @click="emit('edit', fromRow(row))"
          >
            修改
          </button>
          <button
            type="button"
            :disabled="(!authStore.hasRole('MAKER') && !authStore.hasRole('ADMIN')) || !isCompleted(row)"
            @click="emit('delete', fromRow(row))"
          >
            刪除
          </button>
        </template>
      </ScrollableRecordTable>
    </article>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { FileText } from '@lucide/vue'
import ScrollableRecordTable, {
  type ScrollableRecordColumn,
  type ScrollableRecordRow
} from './ScrollableRecordTable.vue'
import { useAuthStore } from '../stores/authStore'
import { usePolicyStore } from '../stores/policyStore'
import { isPolicyServiceHiddenField, usePolicyUiFields } from '../composables/usePolicyUiFields'
import type { PolicyEntity } from '../composables/usePolicyMaintenance'
import { formatDateTime, formatNumber } from '../utils/format'
import type { UiFieldDefinition } from '../api/posChange'
import { fieldWidthToken } from '../utils/fieldLayout'

const props = withDefaults(
  defineProps<{ entity: 'master' | 'address' | 'ride'; title: string; maintenance?: boolean }>(),
  { maintenance: false }
)
const emit = defineEmits<{
  edit: [value: PolicyEntity]
  delete: [value: PolicyEntity]
}>()
const policyStore = usePolicyStore(),
  authStore = useAuthStore(),
  fields = usePolicyUiFields(props.entity)
const entities = computed<PolicyEntity[]>(() =>
  props.entity === 'master'
    ? policyStore.policyDetail?.master
      ? [policyStore.policyDetail.master]
      : []
    : props.entity === 'address'
      ? (policyStore.policyDetail?.addressList ?? [])
      : (policyStore.policyDetail?.rideList ?? [])
)
// metadata API 尚未回傳時，先使用保單查詢 API 實際資料的 key，避免畫面只剩操作欄。
const displayFields = computed<UiFieldDefinition[]>(() => {
  if (fields.value.length) return fields.value
  const first = entities.value[0] as unknown as Record<string, unknown> | undefined
  if (!first) return []
  return Object.entries(first)
    .filter(([key]) => !isPolicyServiceHiddenField(key))
    .map(([key, value]) => ({
      key,
      type: key.endsWith('At') ? 'datetime' : typeof value === 'number' ? 'number' : 'text',
      required: false,
      identity: false,
      createEditable: false,
      wide: typeof value === 'string' && value.length > 64,
      maxLength: typeof value === 'string' ? Math.max(value.length, 1) : null,
      precision: typeof value === 'number' ? String(Math.abs(value)).replace('.', '').length : null,
      scale: typeof value === 'number' && String(value).includes('.') ? String(value).split('.')[1].length : null
    }))
})
const columns = computed<ScrollableRecordColumn[]>(() => {
  const result: ScrollableRecordColumn[] = displayFields.value
    .filter((field) => !isPolicyServiceHiddenField(field.key))
    .map((field) => ({
      key: field.key,
      label: field.key,
      numeric: field.type === 'number',
      widthToken: field.wide ? 'field-width-wide' : fieldWidthToken(field)
    }))
  if (props.maintenance) {
    result.push({
      key: 'actions',
      label: 'actions',
      className: 'code-actions',
      slot: 'actions',
      widthToken: 'field-width-wide'
    })
  }
  return result
})
const rows = computed<ScrollableRecordRow[]>(() =>
  entities.value.map((entity, index) => ({
    key: `${entity.policyNo}-${entity.policySeq}-${index}`,
    data: entity,
    values: [
      ...displayFields.value
        .filter((field) => !isPolicyServiceHiddenField(field.key))
        .map((field) => display(entity, field.key, field.type, field.scale)),
      ...(props.maintenance ? [''] : [])
    ]
  }))
)
function display(entity: PolicyEntity, key: string, type: string, scale?: number | null) {
  const value = (entity as unknown as Record<string, unknown>)[key]
  if (value == null || value === '') return '-'
  if (key === 'reviewStatus') return value === 'S' ? '完成' : '正在處理中'
  if (type === 'datetime') return formatDateTime(String(value))
  if (type === 'number') return formatNumber(Number(value), scale ?? 0)
  if (props.entity === 'address' && key === 'addressTypeCode') return policyStore.addressTypeCodeLabel(String(value))
  return String(value)
}
function isCompleted(row: ScrollableRecordRow) {
  return (fromRow(row) as unknown as { reviewStatus?: string }).reviewStatus === 'S'
}
function fromRow(row: ScrollableRecordRow) {
  return row.data as PolicyEntity
}
</script>
