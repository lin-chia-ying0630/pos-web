<template>
  <section class="change-detail-panel">
    <div class="change-detail-heading">
      <div>
        <span>覆核案號</span>
        <strong>{{ detail.changeCase.changeCaseNo }}</strong>
      </div>
      <span>{{ detail.changeCase.changeItemDescriptions || detail.changeCase.changeItems }}</span>
    </div>

    <div v-if="detail.changeFields.length" class="change-detail-table">
      <div class="change-detail-row change-detail-head">
        <span>項目</span>
        <span>欄位 / Key</span>
        <span>異動前</span>
        <span>異動後</span>
      </div>
      <div v-for="field in detail.changeFields" :key="field.id" class="change-detail-row">
        <span>{{ field.changeItem }}</span>
        <span>{{ field.changeField }} / {{ field.changeKey || '-' }}</span>
        <span>{{ displayValue(field.contentBefore) }}</span>
        <strong>{{ displayValue(field.contentAfter) }}</strong>
      </div>
    </div>

    <div v-if="detail.changeFiles.length" class="snapshot-list">
      <div v-for="file in detail.changeFiles" :key="file.id" class="snapshot-item">
        <div class="snapshot-title">
          <strong>{{ file.changeItem }} {{ file.changeFile }}</strong>
          <span>Key: {{ file.changeKey || '-' }}</span>
        </div>
        <div class="snapshot-grid">
          <div>
            <span>異動前</span>
            <pre>{{ formatSnapshot(file.contentBefore) }}</pre>
          </div>
          <div>
            <span>異動後</span>
            <pre>{{ formatSnapshot(file.contentAfter) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="approveMode && pending" class="review-confirm-actions">
      <button class="secondary-button" type="button" :disabled="loading" @click="$emit('cancel')">
        <X :size="18" />
        <span>取消案件</span>
      </button>
      <button class="primary-button" type="button" :disabled="loading" @click="$emit('complete')">
        <Save :size="18" />
        <span>確認完成</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Save, X } from '@lucide/vue'
import type { PolicyChangeCaseDetail } from '../api/posChange'

defineProps<{
  detail: PolicyChangeCaseDetail
  approveMode: boolean
  pending: boolean
  loading: boolean
}>()

defineEmits<{
  cancel: []
  complete: []
}>()

function displayValue(value: string | null) {
  return value == null || value === '' ? '空白' : value
}

function formatSnapshot(value: string | null) {
  if (!value) return '空白'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}
</script>
