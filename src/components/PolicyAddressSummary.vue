<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table query-record-table address-query-table">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>保單地址資訊</h2>
      </div>
      <div class="query-record-head">
        <strong>地址類型</strong><strong>郵遞區號</strong><strong>地址</strong><strong>email／電話／手機</strong
        ><strong>新增人員</strong><strong>新增時間</strong><strong>異動人員</strong><strong>異動時間</strong
        ><strong>覆核人員</strong><strong>覆核時間</strong>
      </div>
      <div v-for="address in policyStore.policyDetail.addressList" :key="address.addressType" class="query-record-row">
        <span>{{ policyStore.addressTypeLabel(address.addressType) }}</span
        ><span>{{ `${address.zipCode3 ?? ''}${address.zipCode2 ?? ''}` || '-' }}</span
        ><span>{{ address.fullWidthAddress || '-' }}</span
        ><span>{{ address.halfWidthAddress || '-' }}</span
        ><span>{{ address.createdBy || '-' }}</span
        ><span>{{ address.createdAt || '-' }}</span
        ><span>{{ address.updatedBy || '-' }}</span
        ><span>{{ address.updatedAt || '-' }}</span
        ><span>{{ address.reviewedBy || '-' }}</span
        ><span>{{ address.reviewedAt || '-' }}</span>
      </div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { MapPinned } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
