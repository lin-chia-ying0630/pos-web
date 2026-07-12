<template>
  <section v-if="store.policyDetail" class="action-panel">
    <label>
      <span>變更項目</span>
      <select v-model="store.selectedChangeItem">
        <option value="" disabled>請選擇</option>
        <option v-for="item in store.policyDetail.changeItems" :key="item.codeBefore" :value="item.codeBefore">
          {{ item.codeBefore }} - {{ item.codeDescription }}
        </option>
      </select>
    </label>
    <button
      class="primary-button"
      :disabled="!store.selectedChangeItem || store.loading"
      @click="store.createSelectedCase"
    >
      <Plus :size="18" />
      <span>產生案號</span>
    </button>
    <button
      v-if="store.changeCase?.changeItem === '001'"
      class="secondary-button"
      type="button"
      @click="store.openAddressDialog"
    >
      <PencilLine :size="18" />
      <span>地址變更</span>
    </button>
    <button
      v-if="store.changeCase?.changeItem === '002'"
      class="secondary-button"
      type="button"
      @click="store.openAmountDialog('main')"
    >
      <PencilLine :size="18" />
      <span>主約保額變更</span>
    </button>
    <button
      v-if="store.changeCase?.changeItem === '003'"
      class="secondary-button"
      type="button"
      @click="store.openAmountDialog('rider')"
    >
      <PencilLine :size="18" />
      <span>附約保額變更</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { PencilLine, Plus } from '@lucide/vue'
import { usePosChangeStore } from '../stores/posChangeStore'

const store = usePosChangeStore()
</script>
