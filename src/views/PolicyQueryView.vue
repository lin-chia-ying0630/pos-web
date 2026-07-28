<template>
  <section class="work-view">
    <PolicySearchPanel title="查詢保單主檔" /><StatusMessage />
    <PolicyEntitySummary entity="master" title="保單主檔資訊" />
  </section>
</template>
<script setup lang="ts">
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import StatusMessage from '../components/StatusMessage.vue'
import PolicyEntitySummary from '../components/PolicyEntitySummary.vue'
</script>
