<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>保單地址資訊</h2>
      </div>
      <div v-for="address in policyStore.policyDetail.addressList" :key="address.addressType" class="address-record">
        <h3>地址 {{ address.addressType }}／{{ policyStore.addressTypeLabel(address.addressType) }}</h3>
        <dl class="data-grid">
          <div class="query-field">
            <dt>地址類型</dt>
            <dd>{{ policyStore.addressTypeLabel(address.addressType) }}</dd>
          </div>
          <div class="query-field">
            <dt>郵遞區號</dt>
            <dd>{{ `${address.zipCode3 ?? ''}${address.zipCode2 ?? ''}` || '-' }}</dd>
          </div>
          <div class="query-field">
            <dt>地址</dt>
            <dd>{{ address.fullWidthAddress || '-' }}</dd>
          </div>
          <div class="query-field">
            <dt>email／電話／手機</dt>
            <dd>{{ address.halfWidthAddress || '-' }}</dd>
          </div>
        </dl>
        <AuditSummary :record="address" />
      </div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { MapPinned } from '@lucide/vue'
import AuditSummary from './AuditSummary.vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
