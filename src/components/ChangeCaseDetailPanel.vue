<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <section class="dialog change-detail-dialog">
      <header class="dialog-header">
        <div>
          <h2>{{ viewMode === 'fields' ? '異動欄位' : '異動檔案' }}</h2>
          <span>{{ detail.changeCase.changeCaseNo }}</span>
        </div>
        <button class="icon-button" type="button" title="關閉" aria-label="關閉" @click="$emit('close')">
          <X :size="18" />
        </button>
      </header>

      <div class="dialog-body">
        <div class="change-detail-heading">
          <span>{{ detail.changeCase.changeItemCodeDescriptions || detail.changeCase.changeItemCodes }}</span>
        </div>

        <div v-if="viewMode === 'fields' && changedFieldNameGroups.length" class="change-field-groups">
          <section v-for="group in changedFieldNameGroups" :key="group.changeItemCode" class="change-field-group">
            <h4>變更項目 {{ group.changeItemCode }}</h4>
            <ReviewFieldComparisonTable :fields="group.displayFields" />
          </section>
        </div>
        <p v-else-if="viewMode === 'fields'" class="empty-text">此案件沒有異動欄位</p>

        <div v-if="viewMode === 'files' && detail.changedRecordTypes.length" class="snapshot-list">
          <div v-for="file in detail.changedRecordTypes" :key="file.id" class="snapshot-item">
            <div class="snapshot-title">
              <strong>{{ file.changeItemCode }} {{ file.changedRecordType }}</strong>
              <span>Key: {{ file.changedRecordKey || '-' }}</span>
            </div>
            <div class="snapshot-field-table">
              <div class="snapshot-field-row snapshot-field-head">
                <span>{{ chtLabel('fieldName') }}</span>
                <span>{{ chtLabel('contentBefore') }}</span>
                <span>{{ chtLabel('contentAfter') }}</span>
              </div>
              <div v-for="field in file.snapshotFields" :key="field.jsonKey" class="snapshot-field-row">
                <span class="snapshot-field-name">
                  <strong>{{ field.chineseName }}</strong>
                  <small>{{ field.jsonKey }}</small>
                </span>
                <span>{{ displayValue(field.contentBefore) }}</span>
                <strong>{{ displayValue(field.contentAfter) }}</strong>
              </div>
            </div>
          </div>
        </div>
        <p v-else-if="viewMode === 'files'" class="empty-text">此案件沒有異動檔案</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { X } from '@lucide/vue'
import type { PolicyChangeCaseDetail } from '../api/posChange'
import ReviewFieldComparisonTable, { type ReviewComparisonField } from './ReviewFieldComparisonTable.vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'

const props = defineProps<{
  detail: PolicyChangeCaseDetail
  viewMode: 'fields' | 'files'
}>()
const { label: chtLabel, load } = useChtFieldNames()
onMounted(load)

const changedFieldNameGroups = computed(() => {
  const groups = new Map<string, PolicyChangeCaseDetail['changedFieldNames']>()
  props.detail.changedFieldNames.forEach((field) => {
    const fields = groups.get(field.changeItemCode) ?? []
    fields.push(field)
    groups.set(field.changeItemCode, fields)
  })
  return Array.from(groups, ([changeItemCode, fields]) => {
    if (changeItemCode === '002') {
      const representative = fields[0]
      return {
        changeItemCode,
        displayFields: representative
          ? [
              {
                id: representative.id,
                label: '主約保額',
                fieldKey: representative.changedFieldName,
                recordKey: '-',
                before: representative.contentBefore,
                after: representative.contentAfter
              }
            ]
          : []
      }
    }
    return {
      changeItemCode,
      displayFields: fields.map<ReviewComparisonField>((field) => ({
        id: field.id,
        label: field.chineseName || field.changedFieldName,
        fieldKey: field.changedFieldName,
        recordKey: field.changedRecordKey || '-',
        before: field.contentBefore,
        after: field.contentAfter
      }))
    }
  })
})

defineEmits<{
  close: []
}>()

function displayValue(value: string | null) {
  return value == null || value === '' ? '空白' : value
}
</script>
