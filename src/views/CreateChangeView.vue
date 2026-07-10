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
import AddressChangeDialog from '../components/AddressChangeDialog.vue'
import AmountChangeDialog from '../components/AmountChangeDialog.vue'
import ChangeItemActions from '../components/ChangeItemActions.vue'
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import PolicySummary from '../components/PolicySummary.vue'
import StatusMessage from '../components/StatusMessage.vue'
</script>
