<template>
  <section class="review-panel">
    <div class="panel-title">
      <FileText :size="18" />
      <h2>{{ approveMode ? '保全變更覆核' : '保全變更查詢' }}</h2>
    </div>
    <div class="review-query">
      <label>
        <span>保單號碼</span>
        <input v-model.trim="reviewQuery.policyNo" maxlength="10" placeholder="P000000001" />
      </label>
      <button class="primary-button" :disabled="workflow.loading || !reviewQuery.policyNo" @click="loadChangeCases">
        <Search :size="18" />
        <span>查詢受理資料</span>
      </button>
    </div>

    <div v-if="changeCaseStore.changeCases.length > 0" class="case-table">
      <div class="case-table-head">
        <span>案號</span>
        <span>序號</span>
        <span>變更項目</span>
        <span>狀態</span>
        <span>異動明細</span>
      </div>
      <template v-for="caseItem in changeCaseStore.changeCases" :key="caseItem.changeCaseNo">
        <div class="case-table-row">
          <strong>{{ caseItem.changeCaseNo }}</strong>
          <span>{{ caseItem.policySeq }}</span>
          <span>{{ caseItem.changeItemDescriptions || caseItem.changeItems || '-' }}</span>
          <span>{{ statusDisplay(caseItem) }}</span>
          <div class="case-actions">
            <button
              class="icon-button"
              type="button"
              title="查看異動明細"
              @click="changeCaseStore.toggleDetail(caseItem)"
            >
              <ChevronUp v-if="changeCaseStore.selectedDetailCaseNo === caseItem.changeCaseNo" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>
        <ChangeCaseDetailPanel
          v-if="changeCaseStore.selectedDetailCaseNo === caseItem.changeCaseNo && changeCaseStore.reviewDetail"
          :detail="changeCaseStore.reviewDetail"
          :approve-mode="approveMode"
          :pending="isPendingStatus(caseItem.acceptanceStatus)"
          :loading="workflow.loading"
          @cancel="confirmStatus(caseItem, 'C')"
          @complete="confirmStatus(caseItem, 'S')"
        />
      </template>
    </div>
    <p v-else-if="changeCaseStore.reviewSearched" class="empty-text">查無保全受理資料</p>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ChevronUp, Eye, FileText, Search } from '@lucide/vue'
import type { PolicyChangeCase } from '../api/posChange'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { isPendingStatus } from '../utils/format'
import ChangeCaseDetailPanel from './ChangeCaseDetailPanel.vue'

defineProps<{
  approveMode: boolean
}>()

const changeCaseStore = useChangeCaseStore()
const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
const reviewQuery = reactive({
  policyNo: policyStore.lastPolicyNo
})

function loadChangeCases() {
  return changeCaseStore.loadChangeCases(reviewQuery.policyNo)
}

function confirmStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
  const action = acceptanceStatus === 'S' ? '完成並套用以上異動' : '取消案件且不套用異動'
  if (!window.confirm(`確定要將 ${caseItem.changeCaseNo} ${action}？`)) return
  return changeCaseStore.updateStatus(caseItem, acceptanceStatus)
}

function statusDisplay(caseItem: PolicyChangeCase) {
  return caseItem.acceptanceStatusDescription
    ? `${caseItem.acceptanceStatus} - ${caseItem.acceptanceStatusDescription}`
    : caseItem.acceptanceStatus
}
</script>
