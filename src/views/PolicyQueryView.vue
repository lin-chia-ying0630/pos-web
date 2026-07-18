<template>
  <section class="work-view">
    <PolicySearchPanel />
    <StatusMessage />
    <PolicyMasterSummary />
  </section>
</template>

<script setup lang="ts">
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import PolicyMasterSummary from '../components/PolicyMasterSummary.vue'
import StatusMessage from '../components/StatusMessage.vue'
</script>
