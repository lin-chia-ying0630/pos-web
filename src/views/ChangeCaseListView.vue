<template>
  <section class="work-view">
    <StatusMessage />
    <ChangeCaseListPanel :approve-mode="approveMode" />
  </section>
</template>

<script setup lang="ts">
import ChangeCaseListPanel from '../components/ChangeCaseListPanel.vue'
import StatusMessage from '../components/StatusMessage.vue'

defineProps<{
  approveMode: boolean
}>()
</script>
