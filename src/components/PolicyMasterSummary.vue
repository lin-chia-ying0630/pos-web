<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel query-table query-record-table">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主檔資訊</h2>
      </div>
      <div class="query-record-head">
        <strong>保單號碼</strong><strong>序號</strong><strong>總保費</strong><strong>新增人員</strong
        ><strong>新增時間</strong><strong>異動人員</strong><strong>異動時間</strong><strong>覆核人員</strong
        ><strong>覆核時間</strong>
      </div>
      <div class="query-record-row">
        <span>{{ policyStore.policyDetail.master.policyNo }}</span
        ><span class="numeric-field">{{ policyStore.policyDetail.master.policySeq }}</span
        ><span class="numeric-field">{{ formatNumber(policyStore.policyDetail.master.premium, 4) }}</span>
        <span>{{ policyStore.policyDetail.master.createdBy || '-' }}</span
        ><span>{{ policyStore.policyDetail.master.createdAt || '-' }}</span
        ><span>{{ policyStore.policyDetail.master.updatedBy || '-' }}</span
        ><span>{{ policyStore.policyDetail.master.updatedAt || '-' }}</span
        ><span>{{ policyStore.policyDetail.master.reviewedBy || '-' }}</span
        ><span>{{ policyStore.policyDetail.master.reviewedAt || '-' }}</span>
      </div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
import { formatNumber } from '../utils/format'
const policyStore = usePolicyStore()
</script>
