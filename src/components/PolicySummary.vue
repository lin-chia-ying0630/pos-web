<template>
  <section v-if="store.policyDetail" class="detail-grid">
    <article class="panel">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主檔</h2>
      </div>
      <dl class="data-grid">
        <div>
          <dt>保單號碼</dt>
          <dd>{{ store.policyDetail.master.policyNo }}</dd>
        </div>
        <div>
          <dt>序號</dt>
          <dd>{{ store.policyDetail.master.policySeq }}</dd>
        </div>
        <div>
          <dt>總保費</dt>
          <dd>{{ formatNumber(store.policyDetail.master.premium, 4) }}</dd>
        </div>
      </dl>
    </article>

    <article class="panel">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>通訊地址</h2>
      </div>
      <dl class="data-grid address-grid">
        <div>
          <dt>郵遞區號</dt>
          <dd>{{ store.communicationZip }}</dd>
        </div>
        <div>
          <dt>地址型態</dt>
          <dd>01 {{ store.addressTypeLabel('01') }}</dd>
        </div>
        <div class="wide">
          <dt>地址</dt>
          <dd>{{ store.policyDetail.communicationAddress?.fullWidthAddress || '-' }}</dd>
        </div>
        <div class="wide">
          <dt>email / 電話 / 手機</dt>
          <dd>{{ store.policyDetail.communicationAddress?.halfWidthAddress || '-' }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<script setup lang="ts">
import { FileText, MapPinned } from '@lucide/vue'
import { usePosChangeStore } from '../stores/posChangeStore'
import { formatNumber } from '../utils/format'

const store = usePosChangeStore()
</script>
