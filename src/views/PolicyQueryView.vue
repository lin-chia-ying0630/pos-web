<template>
  <section class="work-view">
    <PolicySearchPanel />
    <StatusMessage />
    <PolicySummary />
  </section>
</template>

<script setup lang="ts">
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import PolicySummary from '../components/PolicySummary.vue'
import StatusMessage from '../components/StatusMessage.vue'
</script>
