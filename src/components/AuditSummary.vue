<template>
  <div class="record-audit">
    <span><small>新增人員</small>{{ display(record.createdBy) }}</span>
    <span><small>新增時間</small>{{ format(record.createdAt) }}</span>
    <span><small>異動人員</small>{{ display(record.updatedBy) }}</span>
    <span><small>異動時間</small>{{ format(record.updatedAt) }}</span>
    <span><small>覆核人員</small>{{ display(record.reviewedBy) }}</span>
    <span><small>覆核時間</small>{{ format(record.reviewedAt) }}</span>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  record: {
    createdBy?: string | null
    createdAt?: string | null
    updatedBy?: string | null
    updatedAt?: string | null
    reviewedBy?: string | null
    reviewedAt?: string | null
  }
}>()
function display(value?: string | null) {
  return value || '-'
}
function format(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-'
}
</script>
