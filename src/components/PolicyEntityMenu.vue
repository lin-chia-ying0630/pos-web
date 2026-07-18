<template>
  <section v-if="policyStore.policyDetail" class="entity-menu" aria-label="保單資料實體清單">
    <h2>保單資料</h2>
    <details open>
      <summary>1. 保單主檔</summary>
      <dl>
        <div><dt>保單號碼</dt><dd>{{ master.policyNo }}</dd></div>
        <div><dt>序號</dt><dd>{{ master.policySeq }}</dd></div>
        <div><dt>總保費</dt><dd>{{ master.premium }}</dd></div>
      </dl>
    </details>
    <details open>
      <summary>2. 保單地址（{{ policyStore.policyDetail.addressList.length }}）</summary>
      <ul>
        <li v-for="address in policyStore.policyDetail.addressList" :key="address.addressType">
          <strong>{{ address.addressType }}</strong><span>{{ policyStore.addressDisplay(address) }}</span>
        </li>
      </ul>
    </details>
    <details open>
      <summary>3. 保單附約（{{ policyStore.policyDetail.rideList.length }}）</summary>
      <ul>
        <li v-for="ride in policyStore.policyDetail.rideList" :key="ride.rideOrder">
          <strong>{{ ride.rideOrder }}</strong><span>{{ ride.productCode }}／保額 {{ ride.insuredAmount }}／保費 {{ ride.premium }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePolicyStore } from '../stores/policyStore'

const policyStore = usePolicyStore()
const master = computed(() => policyStore.policyDetail?.master ?? { policyNo: '-', policySeq: '-', premium: '-' })
</script>
