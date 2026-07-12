<template>
  <section class="query-panel">
    <label>
      <span>保單號碼</span>
      <input v-model.trim="policyStore.createQuery.policyNo" maxlength="10" placeholder="P000000001" />
    </label>
    <label>
      <span>序號</span>
      <input v-model.number="policyStore.createQuery.policySeq" type="number" min="1" max="999" />
    </label>
    <button class="primary-button" :disabled="workflow.loading" @click="policyStore.loadPolicyFromCreateQuery">
      <Search :size="18" />
      <span>查詢</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { Search } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'

const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
</script>
