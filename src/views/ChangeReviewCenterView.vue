<template>
  <section class="panel review-panel">
    <div class="panel-title">
      <FileText :size="18" />
      <h2>覆核中心</h2>
    </div>
    <div class="review-query review-center-query">
      <label
        ><span>{{ chtLabel('functionCode') }}</span
        ><select v-model="functionCode">
          <option value="">全部功能</option>
          <option v-for="item in functionCodes" :key="item.codeBefore" :value="item.codeBefore">
            {{ item.codeBefore }} - {{ item.codeDescription }}
          </option>
        </select></label
      >
      <label>
        <span>{{ chtLabel('reviewStatus') }}</span>
        <select v-model="reviewStatus">
          <option value="">全部狀態</option>
          <option v-for="status in reviewStatuses" :key="status" :value="status">
            {{ statusLabel(status) }}
          </option>
        </select>
      </label>
      <label class="review-key1-field">
        <span>{{ chtLabel('key1') }}</span>
        <input v-model.trim="key1" :placeholder="key1Placeholder" />
      </label>
      <button class="primary-button" type="button" @click="searchReviews(1)"><Search :size="18" />查詢覆核資料</button>
    </div>
    <div v-if="reviews.length" class="case-table review-center-table">
      <div class="case-table-head" :style="reviewGridStyle">
        <span v-for="key in reviewColumnKeys" :key="key">{{ chtLabel(key) }}</span>
      </div>
      <template v-for="review in reviews" :key="review.reviewKey">
        <div class="case-table-row" :style="reviewGridStyle">
          <span v-for="key in reviewColumnKeys" :key="key">
            <button
              v-if="key === 'reviewDetail'"
              class="icon-button"
              type="button"
              title="查看資料詳細內容"
              @click="openDetail(review)"
            >
              <Eye :size="18" />
            </button>
            <template v-else-if="key === 'reviewStatus'">
              {{ statusLabel(review.reviewStatus) }}
              <small v-if="review.reviewRemark">{{ review.reviewRemark }}</small>
            </template>
            <span v-else-if="key === 'operation'" class="review-actions">
              <button type="button" @click="togglePreview(review)">
                {{ selectedReviewKey === review.reviewKey ? '收合' : '預覽' }}
              </button>
              <template v-if="review.reviewStatus === 'P'">
                <button type="button" @click="decide(review, 'S')">確認</button>
                <button type="button" @click="decide(review, 'C')">取消</button>
              </template>
            </span>
            <template v-else>{{ displayReviewValue(review, key) }}</template>
          </span>
        </div>
        <section v-if="selectedReviewKey === review.reviewKey" class="review-audit-preview">
          <h3>覆核稽核歷程</h3>
          <p v-if="auditLoading">歷程載入中…</p>
          <div v-else-if="selectedAudits.length" class="review-audit-list">
            <article v-for="audit in selectedAudits" :key="audit.eventId" class="review-audit-event">
              <div class="review-audit-heading">
                <strong>{{ actionLabel(audit.action) }}</strong>
                <span>{{ audit.statusBefore || '尚未送出' }} → {{ audit.statusAfter }}</span>
                <time>{{ formatDateTime(audit.occurredAt) }}</time>
              </div>
              <dl>
                <div>
                  <dt>操作人員</dt>
                  <dd>{{ audit.operatorId }}</dd>
                </div>
                <div v-if="audit.requestId">
                  <dt>Request ID</dt>
                  <dd>{{ audit.requestId }}</dd>
                </div>
                <div v-if="audit.traceId">
                  <dt>Trace ID</dt>
                  <dd>{{ audit.traceId }}</dd>
                </div>
              </dl>
            </article>
          </div>
          <p v-else>目前尚無稽核歷程</p>
        </section>
      </template>
    </div>
    <p v-else-if="searched" class="empty-text">目前尚無符合條件的覆核資料</p>
    <PaginationBar
      :page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      aria-label="覆核資料分頁"
      @change="changePage"
    />
    <div class="review-rules">
      <h3>覆核規則</h3>
      <p><strong>P - 受理中：</strong>可覆核</p>
      <p><strong>S - 完成、C - 取消：</strong>只能檢視，不可再次覆核</p>
      <p>查詢代碼留白時代表不限制資料；代碼對照表異動同樣集中於此畫面。</p>
    </div>

    <DialogShell
      v-if="detailReview"
      title="資料詳細內容"
      :subtitle="operationLabel(detailReview.operation)"
      title-id="review-detail-title"
      dialog-class="review-detail-dialog"
      @close="closeDetail"
    >
      <div class="review-detail-body">
        <h3>異動前後</h3>
        <ReviewFieldComparisonTable v-if="detailFields.length" :fields="comparisonFields" :show-key="false" />
        <p v-else class="empty-text">此筆歷史資料未保存異動前後快照</p>
      </div>
      <template #footer>
        <button class="secondary-button" type="button" @click="closeDetail">關閉</button>
      </template>
    </DialogShell>
    <RejectRemarkDialog
      v-if="pendingRejectReview"
      :review-key="pendingRejectReview.reviewKey"
      @confirm="confirmReject"
      @cancel="cancelReject"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Eye, FileText, Search } from '@lucide/vue'
import {
  decideChangeReview,
  findFunctionCodes,
  findChangeReviewAudits,
  findChangeReviews,
  type ChangeReview,
  type ChangeReviewAudit,
  type CodeDescription
} from '../api/posChange'
import PaginationBar from '../components/PaginationBar.vue'
import DialogShell from '../components/DialogShell.vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import ReviewFieldComparisonTable, { type ReviewComparisonField } from '../components/ReviewFieldComparisonTable.vue'
import { flattenReviewContent, hasDetailValue, parseReviewContent } from '../utils/reviewDetail'
import { formatDateTime } from '../utils/format'
import RejectRemarkDialog from '../components/RejectRemarkDialog.vue'

const codes = ref<CodeDescription[]>([])
const route = useRoute()
const functionCode = ref('')
const reviewStatus = ref('')
const key1 = ref('')
const searched = ref(false)
const reviews = ref<ChangeReview[]>([])
const selectedReviewKey = ref<string | null>(null)
const selectedAudits = ref<ChangeReviewAudit[]>([])
const auditLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const detailReview = ref<ChangeReview | null>(null)
const detailAudit = ref<ChangeReviewAudit | null>(null)
const pendingRejectReview = ref<ChangeReview | null>(null)
const { label: chtLabel, load: loadChtLabels } = useChtFieldNames()
// 快照內容改以眼睛開啟明細，其餘 API 欄位逐 key 展開；operation 是唯一的純 UI 欄位。
const reviewColumnKeys = computed(() => {
  const first = reviews.value[0]
  if (!first) return []
  return [
    ...Object.keys(first).filter((key) => key !== 'contentBefore' && key !== 'contentAfter'),
    'reviewDetail',
    'operation'
  ]
})
const reviewGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${reviewColumnKeys.value.length}, minmax(150px, 1fr))`,
  minWidth: `${reviewColumnKeys.value.length * 150}px`
}))
const functionCodes = computed(() => codes.value.filter((item) => item.codeBefore.startsWith('M')))
const reviewStatuses = ['P', 'S', 'C']
// Key1 依功能資料來源對應第一個主要 Key；MCM00001 對應 code_definition.code_group。
const key1Placeholder = computed(() => (functionCode.value === 'MCM00001' ? 'code_group' : '可留白，輸入主要 Key'))
const detailFields = computed(() => {
  if (!detailReview.value) return []
  // 舊資料若覆核主檔缺少快照，改由同一 reviewKey 的稽核軌跡回補顯示。
  const beforeContent = detailReview.value.contentBefore ?? detailAudit.value?.contentBefore
  const afterContent = detailReview.value.contentAfter ?? detailAudit.value?.contentAfter
  const before = flattenReviewContent(parseReviewContent(beforeContent))
  const after = flattenReviewContent(parseReviewContent(afterContent))
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
  return keys
    .map((key) => ({
      key,
      label: chtLabel(detailLabelKey(key)),
      before: before[key],
      after: after[key]
    }))
    .filter((field) => hasDetailValue(field.before) || hasDetailValue(field.after))
})
const comparisonFields = computed<ReviewComparisonField[]>(() =>
  detailFields.value.map((field) => ({
    id: field.key,
    label: field.label,
    fieldKey: field.key,
    before: field.before,
    after: field.after
  }))
)
function detailLabelKey(key: string) {
  const parts = key.split('.')
  const leaf = parts[parts.length - 1] || key
  return leaf.split('[')[0] || leaf
}

function displayReviewValue(review: ChangeReview, key: string) {
  const value = (review as unknown as Record<string, unknown>)[key]
  if (value == null || value === '') return '-'
  if (key.endsWith('At')) return formatDateTime(String(value))
  if (Array.isArray(value)) return value.join('、') || '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

onMounted(async () => {
  functionCode.value = typeof route.query.functionCode === 'string' ? route.query.functionCode : ''
  reviewStatus.value = typeof route.query.reviewStatus === 'string' ? route.query.reviewStatus : ''
  key1.value = typeof route.query.key1 === 'string' ? route.query.key1 : ''
  await Promise.all([loadChtLabels(), findFunctionCodes().then((items) => (codes.value = items))])
  await searchReviews(1)
})
async function searchReviews(page = 1) {
  const result = await findChangeReviews(functionCode.value, key1.value, reviewStatus.value, page)
  reviews.value = result.items
  currentPage.value = result.page
  totalPages.value = result.totalPages
  totalItems.value = result.totalItems
  selectedReviewKey.value = null
  selectedAudits.value = []
  searched.value = true
}
async function decide(review: ChangeReview, status: 'S' | 'C') {
  if (status === 'C') {
    pendingRejectReview.value = review
    return
  }
  await submitDecision(review, 'S', undefined)
}

async function submitDecision(review: ChangeReview, status: 'S' | 'C', reviewRemark: string | undefined) {
  await decideChangeReview(review.reviewKey, status, reviewRemark)
  pendingRejectReview.value = null
  await searchReviews(currentPage.value)
}

async function confirmReject(remark: string) {
  if (!pendingRejectReview.value) return
  await submitDecision(pendingRejectReview.value, 'C', remark)
}

function cancelReject() {
  pendingRejectReview.value = null
}

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  await searchReviews(page)
}

async function togglePreview(review: ChangeReview) {
  if (selectedReviewKey.value === review.reviewKey) {
    selectedReviewKey.value = null
    selectedAudits.value = []
    return
  }
  selectedReviewKey.value = review.reviewKey
  selectedAudits.value = []
  auditLoading.value = true
  try {
    selectedAudits.value = await findChangeReviewAudits(review.reviewKey)
  } finally {
    auditLoading.value = false
  }
}

async function openDetail(review: ChangeReview) {
  detailReview.value = review
  detailAudit.value = null
  if (review.contentBefore == null || review.contentAfter == null) {
    const audits = await findChangeReviewAudits(review.reviewKey)
    detailAudit.value =
      [...audits].reverse().find((audit) => audit.contentBefore != null || audit.contentAfter != null) ?? null
  }
}

function closeDetail() {
  detailReview.value = null
  detailAudit.value = null
}

function operationLabel(operation: string) {
  return operation === 'CREATE' ? '新增' : operation === 'UPDATE' ? '修改' : operation === 'DELETE' ? '刪除' : operation
}

function statusLabel(status: string) {
  return status === 'P' ? 'P - 受理中' : status === 'S' ? 'S - 已確認' : 'C - 已取消'
}

function actionLabel(action: ChangeReviewAudit['action']) {
  const labels: Record<ChangeReviewAudit['action'], string> = {
    SUBMIT: '送出覆核',
    APPROVE: '確認覆核',
    REJECT: '取消覆核',
    RESUBMIT: '重新送出',
    WITHDRAW: '撤回覆核',
    DIRECT_APPLY: '管理員直接完成'
  }
  return labels[action]
}
</script>
