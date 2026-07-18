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

      <div class="change-detail-heading">
        <span>{{ detail.changeCase.changeItemDescriptions || detail.changeCase.changeItems }}</span>
      </div>

      <div v-if="viewMode === 'fields' && changeFieldGroups.length" class="change-field-groups">
        <section v-for="group in changeFieldGroups" :key="group.changeItem" class="change-field-group">
          <h4>變更項目 {{ group.changeItem }}</h4>
          <div class="change-detail-table">
            <div class="change-detail-row change-detail-head">
              <span>欄位</span>
              <span>Key</span>
              <span>異動前</span>
              <span>異動後</span>
            </div>
            <div v-for="field in group.displayFields" :key="field.id" class="change-detail-row">
              <span class="snapshot-field-name">
                <strong>{{ field.displayName }}</strong>
                <small>{{ field.changeField }}</small>
              </span>
              <span>{{ field.displayKey }}</span>
              <span>{{ displayValue(field.contentBefore) }}</span>
              <strong>{{ displayValue(field.contentAfter) }}</strong>
            </div>
          </div>
        </section>
      </div>
      <p v-else-if="viewMode === 'fields'" class="empty-text">此案件沒有異動欄位</p>

      <div v-if="viewMode === 'files' && detail.changeFiles.length" class="snapshot-list">
        <div v-for="file in detail.changeFiles" :key="file.id" class="snapshot-item">
          <div class="snapshot-title">
            <strong>{{ file.changeItem }} {{ file.changeFile }}</strong>
            <span>Key: {{ file.changeKey || '-' }}</span>
          </div>
          <div class="snapshot-field-table">
            <div class="snapshot-field-row snapshot-field-head">
              <span>中文名稱</span>
              <span>異動前</span>
              <span>異動後</span>
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from '@lucide/vue'
import type { PolicyChangeCaseDetail } from '../api/posChange'

const props = defineProps<{
  detail: PolicyChangeCaseDetail
  viewMode: 'fields' | 'files'
}>()

const changeFieldGroups = computed(() => {
  const groups = new Map<string, PolicyChangeCaseDetail['changeFields']>()
  props.detail.changeFields.forEach((field) => {
    const fields = groups.get(field.changeItem) ?? []
    fields.push(field)
    groups.set(field.changeItem, fields)
  })
  return Array.from(groups, ([changeItem, fields]) => {
    if (changeItem === '002') {
      const representative = fields[0]
      return {
        changeItem,
        displayFields: representative ? [{ ...representative, displayName: '主約保額', displayKey: '-' }] : []
      }
    }
    return {
      changeItem,
      displayFields: fields.map((field) => ({
        ...field,
        displayName: field.chineseName || field.changeField,
        displayKey: field.changeKey || '-'
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
