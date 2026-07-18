<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>保單地址資訊</h2>
      </div>
      <div class="query-columns query-columns-head">
        <strong>欄位名稱</strong><strong>Key</strong><strong>內容</strong>
      </div>
      <dl class="data-grid address-grid">
        <div
          v-for="address in policyStore.policyDetail.addressList"
          :key="address.addressType"
          class="wide query-field"
        >
          <dt>{{ policyStore.addressTypeLabel(address.addressType) }}</dt>
          <span>address_{{ address.addressType }}</span>
          <dd>{{ policyStore.addressDisplay(address) }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>
<script setup lang="ts">
import { MapPinned } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
