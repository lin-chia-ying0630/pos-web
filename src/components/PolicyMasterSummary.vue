<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主檔資訊</h2>
      </div>
      <dl class="data-grid">
        <div>
          <dt>保單號碼</dt>
          <dd>{{ policyStore.policyDetail.master.policyNo }}</dd>
        </div>
        <div>
          <dt>序號</dt>
          <dd>{{ policyStore.policyDetail.master.policySeq }}</dd>
        </div>
        <div>
          <dt>總保費</dt>
          <dd>{{ formatNumber(policyStore.policyDetail.master.premium, 4) }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
import { formatNumber } from '../utils/format'
const policyStore = usePolicyStore()
</script>
