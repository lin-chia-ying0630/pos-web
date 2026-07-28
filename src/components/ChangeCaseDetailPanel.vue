<template>
  <DialogShell
    :title="viewMode === 'fields' ? '異動欄位' : '異動檔案'"
    :subtitle="detail.changeCase.changeCaseNo"
    dialog-class="change-detail-dialog"
    @close="$emit('close')"
  >
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
        <ReviewFieldComparisonTable :fields="snapshotComparisonFields(file)" :show-key="false" />
      </div>
    </div>
    <p v-else-if="viewMode === 'files'" class="empty-text">此案件沒有異動檔案</p>
  </DialogShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PolicyChangeCaseDetail, PolicyChangeFile } from '../api/posChange'
import ReviewFieldComparisonTable, { type ReviewComparisonField } from './ReviewFieldComparisonTable.vue'
import DialogShell from './DialogShell.vue'

const props = defineProps<{
  detail: PolicyChangeCaseDetail
  viewMode: 'fields' | 'files'
}>()
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

function snapshotComparisonFields(file: PolicyChangeFile): ReviewComparisonField[] {
  return file.snapshotFields.map((field) => ({
    id: `${file.id}-${field.jsonKey}`,
    label: field.chineseName || field.jsonKey,
    fieldKey: field.jsonKey,
    before: field.contentBefore,
    after: field.contentAfter
  }))
}
</script>
