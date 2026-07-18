<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主附約資訊</h2>
      </div>
      <dl class="data-grid">
        <div v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder" class="wide">
          <dt>{{ ride.rideOrder }}／{{ ride.productCode }}</dt>
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
