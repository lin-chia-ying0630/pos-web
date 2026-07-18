<template>
  <section v-if="policyStore.policyDetail" class="action-panel">
    <fieldset class="change-item-picker" :disabled="Boolean(changeCaseStore.changeCase)">
      <legend>變更項目</legend>
      <label v-for="item in policyStore.policyDetail.changeItems" :key="item.codeBefore" class="change-item-option">
        <input v-model="changeCaseStore.selectedChangeItems" type="checkbox" :value="item.codeBefore" />
        <span>{{ item.codeBefore }} - {{ item.codeDescription }}</span>
      </label>
    </fieldset>
    <button
      class="primary-button"
      :disabled="
        changeCaseStore.selectedChangeItems.length === 0 || Boolean(changeCaseStore.changeCase) || workflow.loading
      "
      @click="createSelectedCase"
    >
      <Plus :size="18" />
      <span>產生案號</span>
    </button>
    <button v-if="hasChangeItem('001')" class="secondary-button" type="button" @click="addressStore.openAddressDialog">
      <PencilLine :size="18" />
      <span>地址變更</span>
    </button>
    <button
      v-if="hasChangeItem('002')"
      class="secondary-button"
      type="button"
      @click="amountStore.openAmountDialog('main')"
    >
      <PencilLine :size="18" />
      <span>主約保額變更</span>
    </button>
    <button
      v-if="hasChangeItem('003')"
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
  if (changeCase?.changeItems.length !== 1) return
  if (changeCase.changeItems[0] === '001') addressStore.openAddressDialog()
  if (changeCase.changeItems[0] === '002') amountStore.openAmountDialog('main')
  if (changeCase.changeItems[0] === '003') amountStore.openAmountDialog('rider')
}

function hasChangeItem(changeItem: string) {
  return changeCaseStore.changeCase?.changeItems.includes(changeItem) ?? false
}
</script>
