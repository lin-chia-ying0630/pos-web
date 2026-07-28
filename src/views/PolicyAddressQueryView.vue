<template>
  <section class="work-view">
    <PolicySearchPanel title="查詢保單地址" /><StatusMessage />
    <PolicyEntitySummary entity="address" title="保單地址資訊" />
  </section>
</template>
<script setup lang="ts">
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import StatusMessage from '../components/StatusMessage.vue'
import PolicyEntitySummary from '../components/PolicyEntitySummary.vue'
</script>
