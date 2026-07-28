<template>
  <section class="work-view">
    <PolicySearchPanel />
    <StatusMessage />
    <PolicySummary />
    <ChangeItemActions />
    <AddressChangeDialog />
    <AmountChangeDialog />
    <ContactChannelChangeDialog />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AddressChangeDialog from '../components/AddressChangeDialog.vue'
import AmountChangeDialog from '../components/AmountChangeDialog.vue'
import ChangeItemActions from '../components/ChangeItemActions.vue'
import ContactChannelChangeDialog from '../components/ContactChannelChangeDialog.vue'
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import PolicySummary from '../components/PolicySummary.vue'
import StatusMessage from '../components/StatusMessage.vue'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'

const policyStore = usePolicyStore()
const workflow = useWorkflowStore()

onMounted(() => {
  // 後端重啟或重新進入畫面時，不保留上一次請求留下的錯誤訊息。
  workflow.clearMessage()
  if (!policyStore.policyDetail) {
    void policyStore.loadPolicyFromCreateQuery()
  }
})
</script>
