<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主檔資訊</h2>
      </div>
      <div class="query-columns query-columns-head"><strong>欄位名稱</strong><strong>內容</strong></div>
      <dl class="data-grid">
        <div class="query-field">
          <dt>保單號碼</dt>
          <dd>{{ policyStore.policyDetail.master.policyNo }}</dd>
        </div>
        <div class="query-field numeric-field">
          <dt>序號</dt>
          <dd>{{ policyStore.policyDetail.master.policySeq }}</dd>
        </div>
        <div class="query-field numeric-field">
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
