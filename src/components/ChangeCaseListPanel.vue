<template>
  <section class="review-panel">
    <div class="panel-title">
      <FileText :size="18" />
      <h2>{{ approveMode ? '保全變更覆核' : '保全變更查詢' }}</h2>
    </div>
    <div class="review-query">
      <label>
        <span>{{ chtLabel('policyNo') }}</span>
        <input v-model.trim="reviewQuery.policyNo" :maxlength="POLICY_NO_MAX_LENGTH" placeholder="P000000001" />
      </label>
      <button class="primary-button" :disabled="workflow.loading || !reviewQuery.policyNo" @click="loadChangeCases">
        <Search :size="18" />
        <span>查詢受理資料</span>
      </button>
    </div>

    <ScrollableRecordTable
      v-if="changeCaseStore.changeCases.length > 0"
      :columns="changeCaseColumns"
      :rows="changeCaseRows"
    >
      <template #cell="{ row, column, index }">
        <div
          v-if="isActionColumn(column.key ?? column.label)"
          :class="column.key === 'operation' ? 'case-actions' : 'query-view-action'"
        >
          <button
            v-for="action in actionsFor(column.key ?? column.label, changeCaseFromRow(row))"
            :key="action.key"
            class="icon-button"
            :class="actionClass(action, changeCaseFromRow(row))"
            type="button"
            :disabled="actionDisabled(action, changeCaseFromRow(row))"
            :title="actionTitle(action, changeCaseFromRow(row))"
            :aria-label="action.label"
            @click="runAction(action, changeCaseFromRow(row))"
          >
            <component :is="action.icon" :size="18" />
          </button>
        </div>
        <template v-else>{{ row.values[index] ?? '-' }}</template>
      </template>
    </ScrollableRecordTable>
    <p v-else-if="changeCaseStore.reviewSearched" class="empty-text">查無保全受理資料</p>
    <PaginationBar
      :page="currentPage"
      :total-pages="totalPages"
      :total-items="changeCaseStore.changeCases.length"
      :page-size="PAGE_SIZE"
      aria-label="保全受理資料分頁"
      @change="changePage"
    />

    <ChangeCaseDetailPanel
      v-if="detailMode && selectedCase && changeCaseStore.reviewDetail"
      :detail="changeCaseStore.reviewDetail"
      :view-mode="detailMode"
      @close="closeDetail"
    />
    <ConfirmActionDialog
      v-if="pendingConfirm"
      :title="pendingConfirm.status === 'S' ? '確認完成' : '確認取消'"
      :subtitle="pendingConfirm.caseItem.changeCaseNo"
      :description="
        pendingConfirm.status === 'S'
          ? '確定要完成此案件並套用所有異動？此操作不可還原。'
          : '確定要取消此案件？此操作不可還原。'
      "
      :confirm-label="pendingConfirm.status === 'S' ? '確認完成' : '確認取消'"
      :confirm-class="pendingConfirm.status === 'C' ? 'danger-button' : ''"
      @confirm="executeConfirm"
      @cancel="cancelConfirm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Check, Eye, FileText, Search, X } from '@lucide/vue'
import type { PolicyChangeCase } from '../api/posChange'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { isPendingStatus, formatDateTime } from '../utils/format'
import { POLICY_NO_MAX_LENGTH } from '../domain/domainConstraints'
import ChangeCaseDetailPanel from './ChangeCaseDetailPanel.vue'
import PaginationBar from './PaginationBar.vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import ScrollableRecordTable, {
  type ScrollableRecordColumn,
  type ScrollableRecordRow
} from './ScrollableRecordTable.vue'
import type { Component } from 'vue'

const { approveMode } = defineProps<{
  approveMode: boolean
}>()

const changeCaseStore = useChangeCaseStore()
const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
const { label: chtLabel, load: loadChtLabels } = useChtFieldNames()
const reviewQuery = reactive({
  policyNo: policyStore.lastPolicyNo
})
const detailMode = ref<'fields' | 'files' | null>(null)
const selectedCase = ref<PolicyChangeCase | null>(null)
const viewedFields = ref(new Set<string>())
const viewedFiles = ref(new Set<string>())
const pendingConfirm = ref<{ caseItem: PolicyChangeCase; status: 'S' | 'C' } | null>(null)
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(changeCaseStore.changeCases.length / PAGE_SIZE)))
const pagedChangeCases = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return changeCaseStore.changeCases.slice(start, start + PAGE_SIZE)
})
// 欄位直接依受理資料 API 的 key 展開；檢視／覆核按鈕是純 UI 欄位，另外附加。
const changeCaseColumnKeys = computed(() => {
  const first = pagedChangeCases.value[0] ?? changeCaseStore.changeCases[0]
  return first ? Object.keys(first).filter((key) => key !== 'changedFieldNames' && key !== 'changedRecordTypes') : []
})
const changeCaseDisplayKeys = computed(() => [
  ...changeCaseColumnKeys.value,
  ...(approveMode ? ['operation'] : ['changedFieldNames', 'changedRecordTypes'])
])
const changeCaseColumns = computed<ScrollableRecordColumn[]>(() =>
  changeCaseDisplayKeys.value.map((key) => ({ key, label: key }))
)
const changeCaseRows = computed<ScrollableRecordRow[]>(() =>
  pagedChangeCases.value.map((caseItem) => ({
    key: caseItem.changeCaseNo,
    values: changeCaseDisplayKeys.value.map((key) =>
      key === 'operation' || key === 'changedFieldNames' || key === 'changedRecordTypes'
        ? ''
        : displayChangeCaseValue(caseItem, key)
    ),
    data: caseItem
  }))
)

type CaseAction = {
  key: 'fields' | 'files' | 'cancel' | 'approve'
  columns: string[]
  label: string
  icon: Component
  detailMode?: 'fields' | 'files'
  status?: 'C' | 'S'
  className?: string
  pendingOnly?: boolean
}

// 特殊欄位也以設定陣列搭配 v-for 產生；新增操作只需增加一筆設定，不再擴寫模板判斷。
const caseActions: CaseAction[] = [
  {
    key: 'fields',
    columns: ['changedFieldNames', 'operation'],
    label: '查看異動欄位',
    icon: Eye,
    detailMode: 'fields'
  },
  {
    key: 'files',
    columns: ['changedRecordTypes', 'operation'],
    label: '查看異動檔案',
    icon: Eye,
    detailMode: 'files'
  },
  {
    key: 'cancel',
    columns: ['operation'],
    label: '取消案件',
    icon: X,
    status: 'C',
    className: 'danger-action',
    pendingOnly: true
  },
  {
    key: 'approve',
    columns: ['operation'],
    label: '確認完成',
    icon: Check,
    status: 'S',
    className: 'confirm-action',
    pendingOnly: true
  }
]
onMounted(loadChtLabels)

function loadChangeCases() {
  currentPage.value = 1
  viewedFields.value = new Set()
  viewedFiles.value = new Set()
  return changeCaseStore.loadChangeCases(reviewQuery.policyNo)
}

function changePage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  closeDetail()
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

function confirmStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
  if (!reviewReady(caseItem.changeCaseNo)) return
  pendingConfirm.value = { caseItem, status: acceptanceStatus }
}

async function executeConfirm() {
  if (!pendingConfirm.value) return
  const { caseItem, status } = pendingConfirm.value
  pendingConfirm.value = null
  await changeCaseStore.updateStatus(caseItem, status)
}

function cancelConfirm() {
  pendingConfirm.value = null
}

function statusDisplay(caseItem: PolicyChangeCase) {
  return caseItem.acceptanceStatusDescription
    ? `${caseItem.acceptanceStatus} - ${caseItem.acceptanceStatusDescription}`
    : caseItem.acceptanceStatus
}

function displayChangeCaseValue(caseItem: PolicyChangeCase, key: string) {
  const value = (caseItem as unknown as Record<string, unknown>)[key]
  if (key === 'acceptanceStatus') return statusDisplay(caseItem)
  if (key.endsWith('At')) return formatDateTime(value == null ? null : String(value))
  if (value == null || value === '') return '-'
  if (Array.isArray(value)) return value.join('、') || '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
function changeCaseFromRow(row: ScrollableRecordRow) {
  return row.data as PolicyChangeCase
}

function isActionColumn(columnKey: string) {
  return caseActions.some((action) => action.columns.includes(columnKey))
}

function actionsFor(columnKey: string, caseItem: PolicyChangeCase) {
  return caseActions.filter(
    (action) =>
      action.columns.includes(columnKey) && (!action.pendingOnly || isPendingStatus(caseItem.acceptanceStatus))
  )
}

function actionClass(action: CaseAction, caseItem: PolicyChangeCase) {
  const viewed =
    (action.key === 'fields' && viewedFields.value.has(caseItem.changeCaseNo)) ||
    (action.key === 'files' && viewedFiles.value.has(caseItem.changeCaseNo))
  return [action.className, { viewed }]
}

function actionDisabled(action: CaseAction, caseItem: PolicyChangeCase) {
  return Boolean(action.status && (workflow.loading || !reviewReady(caseItem.changeCaseNo)))
}

function actionTitle(action: CaseAction, caseItem: PolicyChangeCase) {
  if (action.status && !reviewReady(caseItem.changeCaseNo)) return '請先查看異動欄位與異動檔案'
  return action.label
}

function runAction(action: CaseAction, caseItem: PolicyChangeCase) {
  if (action.detailMode) return openDetail(caseItem, action.detailMode)
  if (action.status) confirmStatus(caseItem, action.status)
}
</script>
