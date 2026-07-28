<template>
  <section class="panel authorization-panel">
    <div class="panel-title">
      <UserCog :size="18" />
      <h2>使用者授權</h2>
      <div v-if="canMaintain" class="authorization-actions">
        <button class="primary-button" type="button" @click="openCreate">新增使用者</button>
        <button class="primary-button" type="button" @click="openScreenAssignment">設定畫面授權</button>
      </div>
    </div>

    <p v-if="canView" class="authorization-hint">
      {{
        canMaintain
          ? 'Admin 可新增或修改角色，儲存後立即生效並建立 S 狀態稽核軌跡。'
          : 'USER 權限為唯讀，只能查看使用者角色。'
      }}
    </p>

    <ScrollableRecordTable v-if="canView" :columns="authorizationColumns" :rows="authorizationRows">
      <!-- API 回傳的每個 key 都由同一個動態 cell renderer 展開，不逐欄手寫表頭與 slot。 -->
      <template #cell="{ row, column, index }">
        <strong v-if="column.key === 'userId'">{{ authorizationUser(row).userId }}</strong>
        <template v-else-if="column.key === 'enabled'">
          {{ authorizationUser(row).enabled ? '啟用' : '停用' }}
        </template>
        <span v-else-if="column.key === 'roles'" class="role-badge-list">
          <small v-for="role in authorizationUser(row).roles" :key="role" class="role-badge">
            {{ roleLabel(role) }}
          </small>
          <small v-if="!authorizationUser(row).roles.length">尚未授權</small>
        </span>
        <span v-else-if="column.key === 'functionCodes'" class="screen-authorization-summary">
          <small>{{ authorizationScreenSummary(authorizationUser(row).userId) }}</small>
          <button
            v-if="screenCodes(authorizationUser(row).userId).length"
            class="icon-button"
            type="button"
            :aria-label="`檢視 ${authorizationUser(row).userId} 的畫面授權`"
            @click="openScreenPreview(authorizationUser(row).userId)"
          >
            <Eye :size="18" />
          </button>
        </span>
        <time v-else-if="isDateTimeKey(column.key)">{{ formatDateTime(String(row.values[index] ?? '')) }}</time>
        <strong
          v-else-if="column.key === 'reviewStatus'"
          :class="authorizationUser(row).reviewStatus === 'S' ? 'status-complete' : 'status-processing'"
        >
          {{ authorizationUser(row).reviewStatus === 'S' ? '完成' : '正在處理中' }}
        </strong>
        <span v-else-if="column.key === 'operation'" class="authorization-actions">
          <button
            class="primary-button compact-button"
            type="button"
            :disabled="!canMaintain || authorizationUser(row).reviewStatus !== 'S'"
            @click="openEdit(authorizationUser(row))"
          >
            修改
          </button>
          <button
            class="secondary-button compact-button"
            type="button"
            :disabled="!canMaintain"
            @click="openPasswordReset(authorizationUser(row).userId)"
          >
            重設密碼
          </button>
        </span>
        <template v-else>{{ row.values[index] ?? '-' }}</template>
      </template>
    </ScrollableRecordTable>

    <StatusMessage />

    <DialogShell
      v-if="dialogOpen"
      :title="dialogMode === 'create' ? '新增使用者' : '修改使用者'"
      subtitle="儲存後立即生效，不需覆核"
      dialog-class="authorization-dialog"
      @close="closeDialog"
    >
      <form class="authorization-form" @submit.prevent="save">
        <label>
          <span>{{ chtLabel('userId') }}</span>
          <input v-model.trim="formUserId" :readonly="dialogMode === 'edit'" maxlength="128" required />
        </label>
        <label v-if="dialogMode === 'create'">
          <span>{{ chtLabel('initialPassword') }}</span>
          <input
            v-model="formPassword"
            type="password"
            minlength="12"
            maxlength="128"
            autocomplete="new-password"
            required
          />
          <small>長度須為 12 至 128 個字元，且不可與使用者 ID 相同。</small>
        </label>
        <label class="authorization-enabled-option">
          <input v-model="formEnabled" type="checkbox" />
          <span>{{ chtLabel('enabled') }}</span>
        </label>
        <fieldset>
          <legend>角色（可複選）</legend>
          <label v-for="role in availableRoles" :key="role.value" class="role-option">
            <input v-model="formRoles" type="checkbox" :value="role.value" />
            <span>{{ role.label }}</span>
            <small>{{ role.value }}</small>
          </label>
        </fieldset>
      </form>
      <template #footer>
        <button class="secondary-button" type="button" @click="closeDialog">取消</button>
        <button
          class="primary-button"
          type="button"
          :disabled="
            saving || !formUserId || !formRoles.length || (dialogMode === 'create' && formPassword.length < 12)
          "
          @click="save"
        >
          {{ saving ? '儲存中' : '儲存' }}
        </button>
      </template>
    </DialogShell>

    <DialogShell
      v-if="passwordDialogOpen"
      title="重設密碼"
      :subtitle="passwordUserId"
      dialog-class="authorization-dialog"
      @close="closePasswordDialog"
    >
      <div class="authorization-form">
        <label>
          <span>{{ chtLabel('newPassword') }}</span>
          <input
            v-model="resetPasswordValue"
            type="password"
            minlength="12"
            maxlength="128"
            autocomplete="new-password"
            required
          />
          <small>長度須為 12 至 128 個字元，且不可與使用者 ID 相同。</small>
        </label>
        <label>
          <span>{{ chtLabel('passwordConfirmation') }}</span>
          <input
            v-model="resetPasswordConfirm"
            type="password"
            minlength="12"
            maxlength="128"
            autocomplete="new-password"
            required
          />
        </label>
      </div>
      <template #footer>
        <button class="secondary-button" type="button" @click="closePasswordDialog">取消</button>
        <button
          class="primary-button"
          type="button"
          :disabled="saving || resetPasswordValue.length < 12 || resetPasswordValue !== resetPasswordConfirm"
          @click="savePasswordReset"
        >
          確認重設
        </button>
      </template>
    </DialogShell>

    <DialogShell
      v-if="screenDialogOpen"
      title="畫面授權"
      subtitle="先選擇使用者 ID，再複選可使用的功能畫面"
      dialog-class="authorization-dialog"
      @close="screenDialogOpen = false"
    >
      <div class="authorization-form">
        <label>
          <span>{{ chtLabel('userId') }}</span>
          <select v-model="screenUserId" required @change="loadSelectedUserScreens">
            <option value="" disabled>請選擇使用者 ID</option>
            <option v-for="user in users" :key="user.userId" :value="user.userId">{{ user.userId }}</option>
          </select>
        </label>
        <fieldset>
          <legend>功能畫面（可複選）</legend>
          <label v-for="screen in availableScreens" :key="screen.code" class="role-option">
            <input v-model="formFunctionCodes" type="checkbox" :value="screen.code" />
            <span>{{ screen.name }}</span
            ><small>{{ screen.code }}</small>
          </label>
        </fieldset>
      </div>
      <template #footer>
        <button class="secondary-button" type="button" @click="screenDialogOpen = false">取消</button>
        <button class="primary-button" type="button" :disabled="saving || !screenUserId" @click="saveScreens">
          儲存畫面授權
        </button>
      </template>
    </DialogShell>

    <DialogShell
      v-if="screenPreviewOpen"
      title="畫面授權明細"
      :subtitle="screenPreviewUserId"
      dialog-class="authorization-dialog"
      @close="screenPreviewOpen = false"
    >
      <dl class="authorization-audit-summary">
        <div>
          <dt>{{ chtLabel('createdBy') }}</dt>
          <dd>{{ screenAuthorization(screenPreviewUserId)?.createdBy || '-' }}</dd>
        </div>
        <div>
          <dt>{{ chtLabel('createdAt') }}</dt>
          <dd>{{ formatDateTime(screenAuthorization(screenPreviewUserId)?.createdAt) }}</dd>
        </div>
        <div>
          <dt>{{ chtLabel('updatedBy') }}</dt>
          <dd>{{ screenAuthorization(screenPreviewUserId)?.updatedBy || '-' }}</dd>
        </div>
        <div>
          <dt>{{ chtLabel('updatedAt') }}</dt>
          <dd>{{ formatDateTime(screenAuthorization(screenPreviewUserId)?.updatedAt) }}</dd>
        </div>
      </dl>
      <div class="screen-preview-list">
        <span v-for="code in screenCodes(screenPreviewUserId)" :key="code" class="role-badge">
          {{ code }}－{{ screenName(code) }}
        </span>
      </div>
      <template #footer>
        <button class="primary-button" type="button" @click="screenPreviewOpen = false">關閉</button>
      </template>
    </DialogShell>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Eye, UserCog } from '@lucide/vue'
import {
  createUserAccount,
  findFunctionCodes,
  findUserAuthorizationPermissions,
  findUserRoleAuthorizations,
  resetUserPassword,
  updateUserAccount,
  replaceUserScreens,
  findUserScreenAuthorizations,
  type UserRoleAuthorization,
  type UserScreenAuthorization
} from '../api/posChange'
import DialogShell from '../components/DialogShell.vue'
import ScrollableRecordTable, {
  type ScrollableRecordColumn,
  type ScrollableRecordRow
} from '../components/ScrollableRecordTable.vue'
import StatusMessage from '../components/StatusMessage.vue'
import { useAuthStore } from '../stores/authStore'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import { formatDateTime, formatDisplayValue } from '../utils/format'
import { useWorkflowStore } from '../stores/workflowStore'

const authStore = useAuthStore()
const workflow = useWorkflowStore()
const canMaintain = computed(() => authStore.hasRole('ADMIN'))
const canView = computed(() => authStore.hasAnyRole(['ADMIN', 'USER']))
const users = ref<UserRoleAuthorization[]>([])
const screenAuthorizations = ref<UserScreenAuthorization[]>([])
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formUserId = ref('')
const formRoles = ref<string[]>([])
const formPassword = ref('')
const formEnabled = ref(true)
const saving = ref(false)
const screenDialogOpen = ref(false)
const screenPreviewOpen = ref(false)
const screenPreviewUserId = ref('')
const passwordDialogOpen = ref(false)
const passwordUserId = ref('')
const resetPasswordValue = ref('')
const resetPasswordConfirm = ref('')
// 畫面授權直接綁定 userId；角色只控制能否執行管理操作。
const screenUserId = ref('')
const formFunctionCodes = ref<string[]>([])
const { label: chtLabel, load: loadChtLabels } = useChtFieldNames()
// 使用者資料及畫面授權都來自 API；只額外加入純 UI 的操作欄。
const authorizationRecords = computed(() =>
  users.value.map((user) => ({
    ...user,
    functionCodes: screenCodes(user.userId),
    operation: null
  }))
)
const authorizationKeys = computed(() =>
  authorizationRecords.value.length ? Object.keys(authorizationRecords.value[0]) : []
)
const authorizationColumns = computed<ScrollableRecordColumn[]>(() =>
  authorizationKeys.value.map((key) => ({ key, label: key }))
)
const authorizationRows = computed<ScrollableRecordRow[]>(() =>
  authorizationRecords.value.map((record) => ({
    key: record.userId,
    values: authorizationKeys.value.map((key) => displayAuthorizationRawValue(record[key as keyof typeof record])),
    data: record
  }))
)
const availableRoles = ref<Array<{ value: string; label: string }>>([])
// 可選畫面由後端 main-screen/function_code 提供，避免角色或前端常數決定帳號能看到的畫面。
const availableScreens = ref<Array<{ code: string; name: string }>>([])

onMounted(loadUsers)

async function loadUsers() {
  if (!canView.value) {
    workflow.setError('無權限')
    return
  }
  try {
    const [userRows, screenRows, functionCodes, roleCodes] = await Promise.all([
      findUserRoleAuthorizations(),
      findUserScreenAuthorizations(),
      findFunctionCodes(),
      findUserAuthorizationPermissions(),
      loadChtLabels()
    ])
    users.value = userRows
    screenAuthorizations.value = screenRows
    availableScreens.value = functionCodes
      .filter((item) => item.activeFlag !== 'N')
      .map((item) => ({ code: item.codeBefore, name: item.codeDescription || item.codeBefore }))
    availableRoles.value = roleCodes
      .filter((item) => item.activeFlag !== 'N')
      .map((item) => ({ value: item.codeBefore, label: item.codeDescription || item.codeBefore }))
  } catch (error) {
    showError(error, '無法取得使用者角色')
  }
}

function screenCodes(userId: string) {
  return screenAuthorizations.value.find((item) => item.userId === userId)?.functionCodes ?? []
}
function authorizationUser(row: ScrollableRecordRow) {
  return row.data as UserRoleAuthorization
}
function authorizationScreenSummary(userId: string) {
  const count = screenCodes(userId).length
  return count ? `已授權 ${count} 個畫面` : '尚未授權畫面'
}
function isDateTimeKey(key?: string) {
  return key === 'createdAt' || key === 'updatedAt'
}
function displayAuthorizationRawValue(value: unknown): string | number {
  return formatDisplayValue(value)
}
function screenAuthorization(userId: string) {
  return screenAuthorizations.value.find((item) => item.userId === userId)
}
function screenName(code: string) {
  return availableScreens.value.find((screen) => screen.code === code)?.name ?? code
}
function openScreenPreview(userId: string) {
  screenPreviewUserId.value = userId
  screenPreviewOpen.value = true
}
function openScreenAssignment() {
  if (!canMaintain.value) return
  screenUserId.value = ''
  formFunctionCodes.value = []
  screenDialogOpen.value = true
}
function loadSelectedUserScreens() {
  formFunctionCodes.value = screenUserId.value ? [...screenCodes(screenUserId.value)] : []
}
async function saveScreens() {
  // 空清單代表撤銷該 userId 的全部畫面授權，不應因沒有勾選項目而阻止儲存。
  if (!canMaintain.value || saving.value || !screenUserId.value) return
  saving.value = true
  try {
    await replaceUserScreens({ userId: screenUserId.value, functionCodes: formFunctionCodes.value })
    await loadUsers()
    screenDialogOpen.value = false
    workflow.setMessage('畫面授權已儲存，稽核狀態為 S')
  } catch (error) {
    workflow.setError(error instanceof Error ? error.message : '儲存畫面授權失敗')
  } finally {
    saving.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  formUserId.value = ''
  formRoles.value = []
  formPassword.value = ''
  formEnabled.value = true
  dialogOpen.value = true
}

function openEdit(user: UserRoleAuthorization) {
  if (!canMaintain.value || user.reviewStatus !== 'S') return
  dialogMode.value = 'edit'
  formUserId.value = user.userId
  formRoles.value = [...user.roles]
  formPassword.value = ''
  formEnabled.value = user.enabled
  dialogOpen.value = true
}

function openPasswordReset(userId: string) {
  if (!canMaintain.value) return
  passwordUserId.value = userId
  resetPasswordValue.value = ''
  resetPasswordConfirm.value = ''
  passwordDialogOpen.value = true
}

function closePasswordDialog() {
  if (!saving.value) passwordDialogOpen.value = false
}

async function savePasswordReset() {
  if (
    !canMaintain.value ||
    saving.value ||
    resetPasswordValue.value.length < 12 ||
    resetPasswordValue.value !== resetPasswordConfirm.value
  )
    return
  saving.value = true
  try {
    await resetUserPassword(passwordUserId.value, resetPasswordValue.value)
    await loadUsers()
    passwordDialogOpen.value = false
    workflow.setMessage('密碼已重設')
  } catch (error) {
    workflow.setError(error instanceof Error ? error.message : '重設密碼失敗')
  } finally {
    resetPasswordValue.value = ''
    resetPasswordConfirm.value = ''
    saving.value = false
  }
}

function closeDialog() {
  if (!saving.value) dialogOpen.value = false
}

async function save() {
  if (!canMaintain.value || saving.value || !formUserId.value || !formRoles.value.length) return
  saving.value = true
  try {
    const request = { userId: formUserId.value, roles: formRoles.value }
    if (dialogMode.value === 'create') {
      await createUserAccount({ ...request, password: formPassword.value, enabled: formEnabled.value })
    } else await updateUserAccount({ ...request, enabled: formEnabled.value })
    await loadUsers()
    dialogOpen.value = false
    workflow.setMessage(dialogMode.value === 'create' ? '使用者已建立，稽核狀態為 S' : '使用者角色已儲存，稽核狀態為 S')
  } catch (error) {
    showError(error, '儲存使用者角色失敗')
  } finally {
    saving.value = false
  }
}

function roleLabel(role: string) {
  return availableRoles.value.find((item) => item.value === role)?.label ?? role
}

function showError(error: unknown, fallback: string) {
  workflow.setError(error instanceof Error ? error.message : fallback)
}
</script>
