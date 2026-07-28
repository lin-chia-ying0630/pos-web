<template>
  <div
    class="change-detail-table review-field-comparison-table"
    :class="{ compact: mode === 'before-after', 'without-key': !showKey }"
  >
    <div
      class="change-detail-row change-detail-head"
      :class="{ compact: mode === 'before-after', 'without-key': !showKey }"
    >
      <template v-if="mode === 'full'">
        <span>{{ chtLabel('fieldName') }}</span>
        <span v-if="showKey">Key</span>
      </template>
      <span>{{ chtLabel('contentBefore') }}</span>
      <span>{{ chtLabel('contentAfter') }}</span>
    </div>
    <div
      v-for="field in fields"
      :key="field.id"
      class="change-detail-row"
      :class="{ compact: mode === 'before-after', 'without-key': !showKey }"
    >
      <template v-if="mode === 'full'">
        <span class="snapshot-field-name">
          <strong>{{ field.label }}</strong>
          <small>{{ field.fieldKey }}</small>
        </span>
        <span v-if="showKey">{{ field.recordKey || '-' }}</span>
        <span>{{ displayValue(field.before) }}</span>
        <strong>{{ displayValue(field.after) }}</strong>
      </template>
      <template v-else>
        <span class="review-comparison-value">
          <small>{{ field.label }}（{{ field.fieldKey }}）</small>
          <strong>{{ displayValue(field.before) }}</strong>
        </span>
        <span class="review-comparison-value">
          <small>{{ field.label }}（{{ field.fieldKey }}）</small>
          <strong>{{ displayValue(field.after) }}</strong>
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import { formatDisplayValue } from '../utils/format'

export type ReviewComparisonField = {
  id: string | number
  label: string
  fieldKey: string
  recordKey?: string | null
  before: unknown
  after: unknown
}

withDefaults(defineProps<{ fields: ReviewComparisonField[]; mode?: 'full' | 'before-after'; showKey?: boolean }>(), {
  mode: 'full',
  showKey: true
})
const { label: chtLabel, load } = useChtFieldNames()
onMounted(load)

function displayValue(value: unknown) {
  return formatDisplayValue(value, { emptyText: '空白' })
}
</script>
