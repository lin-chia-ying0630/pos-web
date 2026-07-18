<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主附約資訊</h2>
      </div>
      <div class="query-columns query-columns-head">
        <strong>欄位名稱</strong><strong>Key</strong><strong>內容</strong>
      </div>
      <dl class="data-grid">
        <div v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder" class="wide query-field">
          <dt>{{ ride.rideOrder }}／{{ ride.productCode }}</dt>
          <span>ride_{{ ride.rideOrder }}</span>
          <dd>保額 {{ ride.insuredAmount }}／保費 {{ ride.premium }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
