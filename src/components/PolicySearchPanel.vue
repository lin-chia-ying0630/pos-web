<template>
  <section class="query-panel">
    <label>
      <span>保單號碼</span>
      <input v-model.trim="store.createQuery.policyNo" maxlength="10" placeholder="P000000001" />
    </label>
    <label>
      <span>序號</span>
      <input v-model.number="store.createQuery.policySeq" type="number" min="0" max="999" />
    </label>
    <button class="primary-button" :disabled="store.loading" @click="store.loadPolicyFromCreateQuery">
      <Search :size="18" />
      <span>查詢</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { Search } from '@lucide/vue'
import { usePosChangeStore } from '../stores/posChangeStore'

const store = usePosChangeStore()
</script>
