<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table policy-ride-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主附約資訊</h2>
      </div>
      <div v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder" class="ride-record">
        <h3>主附約 {{ ride.rideOrder }}</h3>
        <dl class="data-grid">
          <div class="query-field">
            <dt>附約型態</dt>
            <dd>{{ ride.rideType }}</dd>
          </div>
          <div class="query-field">
            <dt>商品代碼</dt>
            <dd>{{ ride.productCode }}</dd>
          </div>
          <div class="query-field numeric-field">
            <dt>附約序號</dt>
            <dd>{{ ride.rideOrder }}</dd>
          </div>
          <div class="query-field numeric-field">
            <dt>保單年期</dt>
            <dd>{{ ride.policyYears }}</dd>
          </div>
          <div class="query-field numeric-field">
            <dt>保額</dt>
            <dd>{{ ride.insuredAmount }}</dd>
          </div>
          <div class="query-field numeric-field">
            <dt>保費</dt>
            <dd>{{ ride.premium }}</dd>
          </div>
        </dl>
      </div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
