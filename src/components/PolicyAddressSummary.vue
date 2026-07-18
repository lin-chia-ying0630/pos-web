<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>保單地址資訊</h2>
      </div>
      <div class="query-columns query-columns-head"><strong>欄位名稱</strong><strong>內容</strong></div>
      <dl class="data-grid address-grid">
        <template v-for="address in policyStore.policyDetail.addressList" :key="address.addressType">
          <div class="wide query-field">
            <dt>地址類型</dt>
            <dd>{{ policyStore.addressTypeLabel(address.addressType) }}</dd>
          </div>
          <div class="wide query-field numeric-field">
            <dt>郵遞區號</dt>
            <dd>{{ `${address.zipCode3 ?? ''}${address.zipCode2 ?? ''}` || '-' }}</dd>
          </div>
          <div class="wide query-field">
            <dt>地址</dt>
            <dd>{{ address.fullWidthAddress || '-' }}</dd>
          </div>
          <div class="wide query-field">
            <dt>email／電話／手機</dt>
            <dd>{{ address.halfWidthAddress || '-' }}</dd>
          </div>
        </template>
      </dl>
    </article>
  </section>
</template>
<script setup lang="ts">
import { MapPinned } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
