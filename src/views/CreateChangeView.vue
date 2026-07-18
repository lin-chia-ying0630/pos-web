<template>
  <section class="work-view">
    <PolicySearchPanel />
    <StatusMessage />
    <PolicySummary />
    <ChangeItemActions />
    <AddressChangeDialog />
    <AmountChangeDialog />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AddressChangeDialog from '../components/AddressChangeDialog.vue'
import AmountChangeDialog from '../components/AmountChangeDialog.vue'
import ChangeItemActions from '../components/ChangeItemActions.vue'
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import PolicySummary from '../components/PolicySummary.vue'
import StatusMessage from '../components/StatusMessage.vue'
import { usePolicyStore } from '../stores/policyStore'

const policyStore = usePolicyStore()

onMounted(() => {
  if (!policyStore.policyDetail) {
    void policyStore.loadPolicyFromCreateQuery()
  }
})
</script>
