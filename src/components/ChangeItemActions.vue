<template>
  <section v-if="policyStore.policyDetail" class="action-panel">
    <label>
      <span>變更項目</span>
      <select v-model="changeCaseStore.selectedChangeItem">
        <option value="" disabled>請選擇</option>
        <option v-for="item in policyStore.policyDetail.changeItems" :key="item.codeBefore" :value="item.codeBefore">
          {{ item.codeBefore }} - {{ item.codeDescription }}
        </option>
      </select>
    </label>
    <button
      class="primary-button"
      :disabled="!changeCaseStore.selectedChangeItem || workflow.loading"
      @click="createSelectedCase"
    >
      <Plus :size="18" />
      <span>產生案號</span>
    </button>
    <button
      v-if="changeCaseStore.changeCase?.changeItem === '001'"
      class="secondary-button"
      type="button"
      @click="addressStore.openAddressDialog"
    >
      <PencilLine :size="18" />
      <span>地址變更</span>
    </button>
    <button
      v-if="changeCaseStore.changeCase?.changeItem === '002'"
      class="secondary-button"
      type="button"
      @click="amountStore.openAmountDialog('main')"
    >
      <PencilLine :size="18" />
      <span>主約保額變更</span>
    </button>
    <button
      v-if="changeCaseStore.changeCase?.changeItem === '003'"
      class="secondary-button"
      type="button"
      @click="amountStore.openAmountDialog('rider')"
    >
      <PencilLine :size="18" />
      <span>附約保額變更</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { PencilLine, Plus } from '@lucide/vue'
import { useAddressChangeStore } from '../stores/addressChangeStore'
import { useAmountChangeStore } from '../stores/amountChangeStore'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'

const policyStore = usePolicyStore()
const changeCaseStore = useChangeCaseStore()
const addressStore = useAddressChangeStore()
const amountStore = useAmountChangeStore()
const workflow = useWorkflowStore()

async function createSelectedCase() {
  const changeCase = await changeCaseStore.createSelectedCase()
  if (changeCase?.changeItem === '001') addressStore.openAddressDialog()
  if (changeCase?.changeItem === '002') amountStore.openAmountDialog('main')
  if (changeCase?.changeItem === '003') amountStore.openAmountDialog('rider')
}
</script>
