<template>
  <section class="panel query-record-table code-query">
    <div class="panel-title">
      <FileText :size="18" />
      <h2>{{ maintenance ? '異動代碼對照' : '查詢代碼對照' }}</h2>
      <button
        v-if="maintenance && (authStore.hasRole('MAKER') || authStore.hasRole('ADMIN'))"
        class="primary-button code-add-button"
        type="button"
        @click="openCodeDialog(null, 'create')"
      >
        新增代碼
      </button>
    </div>
    <div class="code-query-filters">
      <label
        >代碼群組
        <select v-model="selectedGroup" @change="resetPage">
          <option value="">全部</option>
          <option v-for="group in groupOptions" :key="group" :value="group">{{ group }}</option>
        </select>
      </label>
      <output class="code-group-description">{{
        isChtCode ? '欄位中文說明' : selectedGroupDescription || '請選擇代碼群組'
      }}</output>
    </div>
    <ScrollableRecordTable :columns="codeColumns" :rows="codeRows">
      <template #cell="{ row, column, index }">
        <button
          v-if="column.key === 'actions' && maintenance"
          type="button"
          :disabled="
            (!authStore.hasRole('MAKER') && !authStore.hasRole('ADMIN')) || codeFromRow(row).reviewStatus !== 'S'
          "
          @click="openCodeDialog(codeFromRow(row), 'edit')"
        >
          修改
        </button>
        <template v-else>{{ row.values[index] ?? '-' }}</template>
      </template>
    </ScrollableRecordTable>
    <p v-if="loaded && !visibleCodes.length" class="empty-text">查無代碼對照資料</p>
    <PaginationBar
      :page="currentPage"
      :total-pages="totalPages"
      :total-items="visibleCodes.length"
      aria-label="代碼資料分頁"
      @change="currentPage = $event"
    />
    <DialogShell
      v-if="maintenance && dialogMode"
      :title="dialogMode === 'create' ? '新增代碼' : '修改代碼'"
      title-id="code-dialog-title"
      dialog-class="code-maintenance-dialog"
      @close="closeCodeDialog"
    >
      <form id="code-maintenance-form" class="code-dialog-form" @submit.prevent="submitCodeDialog">
        <div class="code-dialog-grid">
          <!-- 編輯欄位取自代碼 API 的實際 key，中文名稱交由 CHT-code 轉換。 -->
          <label v-for="key in dialogFieldKeys" :key="key" :class="{ wide: key === 'codeDescription' }">
            <span>{{ chtLabel(key) }}</span>
            <select
              v-if="key === 'activeFlag'"
              :value="dialogFieldValue(key)"
              :disabled="dialogMode !== 'edit'"
              @change="updateDialogField(key, $event)"
            >
              <option value=""></option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
            <input
              v-else
              :value="dialogFieldValue(key)"
              :readonly="isDialogReadonly(key)"
              :required="isDialogRequired(key)"
              @input="updateDialogField(key, $event)"
            />
          </label>
        </div>
      </form>
      <template #footer>
        <button class="secondary-button" type="button" @click="closeCodeDialog">取消</button>
        <button class="primary-button" type="submit" form="code-maintenance-form">
          {{ dialogMode === 'create' ? '儲存新增' : '儲存修改' }}
        </button>
      </template>
    </DialogShell>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { FileText } from '@lucide/vue'
import { createCode, findAllCodes, updateCode, type CodeDescription } from '../api/posChange'
import ScrollableRecordTable, {
  type ScrollableRecordColumn,
  type ScrollableRecordRow
} from '../components/ScrollableRecordTable.vue'
import { useAuthStore } from '../stores/authStore'
import { formatDateTime } from '../utils/format'
import PaginationBar from '../components/PaginationBar.vue'
import DialogShell from '../components/DialogShell.vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
const codes = ref<CodeDescription[]>([])
const loaded = ref(false)
const selectedGroup = ref('')
const currentPage = ref(1)
const props = defineProps<{ maintenance: boolean }>()
const dialogMode = ref<'create' | 'edit' | null>(null)
const selectedCode = ref<CodeDescription | null>(null)
const authStore = useAuthStore()
const { label: chtLabel, load: loadChtLabels } = useChtFieldNames()
const dialogForm = reactive({
  codeGroup: '',
  codeField: '',
  codeBefore: '',
  codeAfter: '',
  codeDescription: '',
  activeFlag: '',
  reviewStatus: '',
  createdBy: '',
  createdAt: '',
  updatedBy: '',
  updatedAt: '',
  reviewedBy: '',
  reviewedAt: ''
})
const dialogFieldKeys = computed(() => {
  const source = selectedCode.value ?? codes.value[0]
  return source ? Object.keys(source) : []
})
const mainCodes = computed(() => codes.value.filter((code) => code.codeGroup === 'main-code'))
const groupOptions = computed(() => {
  const indexedGroups = mainCodes.value.map((code) => code.codeField).filter(Boolean)
  if (indexedGroups.length) return [...new Set(indexedGroups)]
  return [...new Set(codes.value.map((code) => code.codeGroup).filter((group) => group && group !== 'main-code'))]
})
const selectedGroupDescription = computed(() => {
  const index = mainCodes.value.find((code) => code.codeField === selectedGroup.value)
  return index?.codeDescription ?? ''
})
const visibleCodes = computed(() => {
  if (!selectedGroup.value) return codes.value
  return codes.value.filter((code) => code.codeGroup === selectedGroup.value)
})
const isChtCode = computed(() => selectedGroup.value === 'CHT-code')
const totalPages = computed(() => Math.ceil(visibleCodes.value.length / 20))
const pagedCodes = computed(() => {
  const start = (currentPage.value - 1) * 20
  return visibleCodes.value.slice(start, start + 20)
})
// 表格欄位完全依代碼 API 實際 key 展開；actions 是唯一的純 UI 欄位。
const codeKeys = computed(() => {
  const first = pagedCodes.value[0] ?? codes.value[0]
  return first ? Object.keys(first) : []
})
const codeColumns = computed<ScrollableRecordColumn[]>(() => [
  ...codeKeys.value.map((key) => ({ key, label: key })),
  ...(props.maintenance ? [{ key: 'actions', label: 'actions', className: 'code-actions' }] : [])
])
const codeRows = computed<ScrollableRecordRow[]>(() =>
  pagedCodes.value.map((code) => ({
    key: `${code.codeGroup || '-'}-${code.codeField || '-'}-${code.codeBefore || '-'}`,
    data: code,
    values: [...codeKeys.value.map((key) => displayCodeValue(code, key)), ...(props.maintenance ? [''] : [])]
  }))
)
function displayCodeValue(code: CodeDescription, key: string) {
  const value = (code as unknown as Record<string, unknown>)[key]
  if (value == null || value === '') return '-'
  if (key === 'reviewStatus') return value === 'S' ? '完成' : '正在處理中'
  if (key.endsWith('At')) return formatDateTime(String(value))
  return String(value)
}
function codeFromRow(row: ScrollableRecordRow) {
  return row.data as CodeDescription
}
function resetPage() {
  currentPage.value = 1
}
function openCodeDialog(code: CodeDescription | null, mode: 'create' | 'edit') {
  selectedCode.value = code
  dialogMode.value = mode
  Object.assign(dialogForm, {
    codeGroup: code?.codeGroup || '',
    codeField: code?.codeField || '',
    codeBefore: code?.codeBefore || '',
    codeAfter: code?.codeAfter || '',
    codeDescription: code?.codeDescription || '',
    activeFlag: code?.activeFlag || '',
    reviewStatus: code?.reviewStatus || '',
    createdBy: code?.createdBy || '',
    createdAt: code?.createdAt || '',
    updatedBy: code?.updatedBy || '',
    updatedAt: code?.updatedAt || '',
    reviewedBy: code?.reviewedBy || '',
    reviewedAt: code?.reviewedAt || ''
  })
}
function closeCodeDialog() {
  dialogMode.value = null
  selectedCode.value = null
}
function dialogFieldValue(key: string) {
  return String((dialogForm as unknown as Record<string, unknown>)[key] ?? '')
}
function updateDialogField(key: string, event: Event) {
  ;(dialogForm as unknown as Record<string, unknown>)[key] = (event.target as HTMLInputElement).value.trim()
}
function isDialogReadonly(key: string) {
  return dialogMode.value === 'edit' && (key === 'codeGroup' || key === 'codeField')
}
function isDialogRequired(key: string) {
  return ['codeGroup', 'codeField', 'codeBefore', 'codeDescription'].includes(key)
}
async function submitCodeDialog() {
  const code = selectedCode.value
  if (!dialogMode.value) return
  if (dialogMode.value === 'create') {
    const created = await createCode(dialogForm)
    closeCodeDialog()
    codes.value.push(created)
    return
  }
  if (!code) return
  const updated = await updateCode({
    ...code,
    ...dialogForm,
    createdAt: dialogForm.createdAt || null,
    updatedAt: dialogForm.updatedAt || null,
    reviewedAt: dialogForm.reviewedAt || null,
    originalCodeGroup: code.codeGroup,
    originalCodeField: code.codeField,
    originalCodeBefore: code.codeBefore
  })
  closeCodeDialog()
  const index = codes.value.indexOf(code)
  if (index >= 0) codes.value[index] = updated
}
onMounted(async () => {
  await Promise.all([loadChtLabels(), findAllCodes().then((items) => (codes.value = items))])
  loaded.value = true
})
</script>
