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
        <span>檢視</span>
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
              :class="{ viewed: viewedFields.has(caseItem.changeCaseNo) }"
              type="button"
              title="查看異動欄位"
              aria-label="查看異動欄位"
              @click="openDetail(caseItem, 'fields')"
            >
              <Eye :size="18" />
            </button>
            <button
              class="icon-button"
              :class="{ viewed: viewedFiles.has(caseItem.changeCaseNo) }"
              type="button"
              title="查看異動檔案"
              aria-label="查看異動檔案"
              @click="openDetail(caseItem, 'files')"
            >
              <Eye :size="18" />
            </button>
            <template v-if="approveMode && isPendingStatus(caseItem.acceptanceStatus)">
              <button
                class="icon-button danger-action"
                type="button"
                :disabled="workflow.loading || !reviewReady(caseItem.changeCaseNo)"
                :title="reviewReady(caseItem.changeCaseNo) ? '取消案件' : '請先查看異動欄位與異動檔案'"
                aria-label="取消案件"
                @click="confirmStatus(caseItem, 'C')"
              >
                <X :size="18" />
              </button>
              <button
                class="icon-button confirm-action"
                type="button"
                :disabled="workflow.loading || !reviewReady(caseItem.changeCaseNo)"
                :title="reviewReady(caseItem.changeCaseNo) ? '確認完成' : '請先查看異動欄位與異動檔案'"
                aria-label="確認完成"
                @click="confirmStatus(caseItem, 'S')"
              >
                <Check :size="18" />
              </button>
            </template>
          </div>
        </div>
      </template>
    </div>
    <p v-else-if="changeCaseStore.reviewSearched" class="empty-text">查無保全受理資料</p>

    <ChangeCaseDetailPanel
      v-if="detailMode && selectedCase && changeCaseStore.reviewDetail"
      :detail="changeCaseStore.reviewDetail"
      :view-mode="detailMode"
      @close="closeDetail"
    />
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Check, Eye, FileText, Search, X } from '@lucide/vue'
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
const detailMode = ref<'fields' | 'files' | null>(null)
const selectedCase = ref<PolicyChangeCase | null>(null)
const viewedFields = ref(new Set<string>())
const viewedFiles = ref(new Set<string>())

function loadChangeCases() {
  viewedFields.value = new Set()
  viewedFiles.value = new Set()
  return changeCaseStore.loadChangeCases(reviewQuery.policyNo)
}

async function openDetail(caseItem: PolicyChangeCase, mode: 'fields' | 'files') {
  await changeCaseStore.loadDetail(caseItem)
  selectedCase.value = caseItem
  detailMode.value = mode
}

function closeDetail() {
  if (selectedCase.value && detailMode.value === 'fields') {
    viewedFields.value = new Set(viewedFields.value).add(selectedCase.value.changeCaseNo)
  }
  if (selectedCase.value && detailMode.value === 'files') {
    viewedFiles.value = new Set(viewedFiles.value).add(selectedCase.value.changeCaseNo)
  }
  detailMode.value = null
  selectedCase.value = null
}

function reviewReady(changeCaseNo: string) {
  return viewedFields.value.has(changeCaseNo) && viewedFiles.value.has(changeCaseNo)
}

async function confirmStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
  if (!reviewReady(caseItem.changeCaseNo)) return
  const action = acceptanceStatus === 'S' ? '完成並套用以上異動' : '取消案件且不套用異動'
  if (!window.confirm(`確定要將 ${caseItem.changeCaseNo} ${action}？`)) return
  await changeCaseStore.updateStatus(caseItem, acceptanceStatus)
}

function statusDisplay(caseItem: PolicyChangeCase) {
  return caseItem.acceptanceStatusDescription
    ? `${caseItem.acceptanceStatus} - ${caseItem.acceptanceStatusDescription}`
    : caseItem.acceptanceStatus
}
</script>
