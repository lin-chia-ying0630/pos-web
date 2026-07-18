<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主附約資訊</h2>
      </div>
      <div class="query-columns query-columns-head"><strong>欄位名稱</strong><strong>內容</strong></div>
      <dl class="data-grid">
        <template v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder">
          <div class="wide query-field">
            <dt>附約序號</dt>
            <dd>{{ ride.rideOrder }}</dd>
          </div>
          <div class="wide query-field">
            <dt>險種</dt>
            <dd>{{ ride.productCode }}</dd>
          </div>
          <div class="wide query-field">
            <dt>保額</dt>
            <dd>{{ ride.insuredAmount }}</dd>
          </div>
          <div class="wide query-field">
            <dt>保費</dt>
            <dd>{{ ride.premium }}</dd>
          </div>
        </template>
      </dl>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
const policyStore = usePolicyStore()
</script>
