<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table query-record-table ride-query-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主附約資訊</h2>
      </div>
      <div class="query-record-head">
        <strong>附約序號</strong><strong>附約型態</strong><strong>商品代碼</strong><strong>保單年期</strong
        ><strong>保額</strong><strong>保費</strong><strong>新增人員</strong><strong>新增時間</strong
        ><strong>異動人員</strong><strong>異動時間</strong><strong>覆核人員</strong><strong>覆核時間</strong>
      </div>
      <div v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder" class="query-record-row">
        <span class="numeric-field">{{ ride.rideOrder }}</span
        ><span>{{ ride.rideType }}</span
        ><span>{{ ride.productCode }}</span
        ><span class="numeric-field">{{ ride.policyYears }}</span
        ><span class="numeric-field">{{ ride.insuredAmount }}</span
        ><span class="numeric-field">{{ ride.premium }}</span
        ><span>{{ ride.createdBy || '-' }}</span
        ><span>{{ ride.createdAt || '-' }}</span
        ><span>{{ ride.updatedBy || '-' }}</span
        ><span>{{ ride.updatedAt || '-' }}</span
        ><span>{{ ride.reviewedBy || '-' }}</span
        ><span>{{ ride.reviewedAt || '-' }}</span>
      </div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
