<template>
  <div class="record-audit">
    <span>新增：{{ display(record.createdBy) }}／{{ format(record.createdAt) }}</span>
    <span>異動：{{ display(record.updatedBy) }}／{{ format(record.updatedAt) }}</span>
    <span>覆核：{{ display(record.reviewedBy) }}／{{ format(record.reviewedAt) }}</span>
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
