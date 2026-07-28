<template>
  <section v-if="policyStore.policyDetail" class="action-panel">
    <fieldset class="change-item-picker" :disabled="Boolean(changeCaseStore.changeCase)">
      <legend>變更項目</legend>
      <label v-for="item in policyStore.policyDetail.changeItemCodes" :key="item.codeBefore" class="change-item-option">
        <input
          v-model="changeCaseStore.selectedChangeItems"
          type="checkbox"
          :value="item.codeBefore"
          @change="workflow.clearMessage"
        />
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
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '001')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="addressStore.openAddressDialog"
    >
      <PencilLine :size="18" />
      <span>地址變更</span>
    </button>
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '002')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="amountStore.openAmountDialog('main')"
    >
      <PencilLine :size="18" />
      <span>主約保額變更</span>
    </button>
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '003')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="amountStore.openAmountDialog('rider')"
    >
      <PencilLine :size="18" />
      <span>附約保額變更</span>
    </button>
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '004')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="contactStore.openDialog('email')"
    >
      <PencilLine :size="18" />
      <span>電子郵件變更</span>
    </button>
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '005')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="contactStore.openDialog('telephone')"
    >
      <PencilLine :size="18" />
      <span>市內電話變更</span>
    </button>
    <button
      v-if="policyStore.policyDetail.changeItemCodes.some((i) => i.codeBefore === '006')"
      class="secondary-button"
      type="button"
      :disabled="!changeCaseStore.changeCase || workflow.loading"
      :title="!changeCaseStore.changeCase ? '請先產生案號' : ''"
      @click="contactStore.openDialog('mobile')"
    >
      <PencilLine :size="18" />
      <span>行動電話變更</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { PencilLine, Plus } from '@lucide/vue'
import { useAddressChangeStore } from '../stores/addressChangeStore'
import { useAmountChangeStore } from '../stores/amountChangeStore'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { useContactChannelChangeStore } from '../stores/contactChannelChangeStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'

const policyStore = usePolicyStore()
const changeCaseStore = useChangeCaseStore()
const addressStore = useAddressChangeStore()
const amountStore = useAmountChangeStore()
const workflow = useWorkflowStore()
const contactStore = useContactChannelChangeStore()

async function createSelectedCase() {
  const changeCase = await changeCaseStore.createSelectedCase()
  if (changeCase?.changeItemCodes.length !== 1) return
  if (changeCase.changeItemCodes[0] === '001') addressStore.openAddressDialog()
  if (changeCase.changeItemCodes[0] === '002') amountStore.openAmountDialog('main')
  if (changeCase.changeItemCodes[0] === '003') amountStore.openAmountDialog('rider')
  if (changeCase.changeItemCodes[0] === '004') contactStore.openDialog('email')
  if (changeCase.changeItemCodes[0] === '005') contactStore.openDialog('telephone')
  if (changeCase.changeItemCodes[0] === '006') contactStore.openDialog('mobile')
}
</script>
