<template>
  <DialogShell
    :title="title"
    title-id="policy-maintenance-title"
    dialog-class="code-maintenance-dialog"
    @close="emit('close')"
  >
    <form id="policy-maintenance-form" class="code-dialog-form" @submit.prevent="emit('submit')">
      <div class="code-dialog-grid">
        <!-- 所有 CRUD 模式共用欄位 schema；欄位中文名稱由 CHT-code 動態解析。 -->
        <label v-for="field in fields" :key="field.key" :class="[{ wide: field.wide }, fieldWidthToken(field)]">
          <span>{{ chtLabel(field.key) }}</span>
          <select v-if="field.options" v-model="model[field.key]" :disabled="!isEditable(field)">
            <option value=""></option>
            <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
          </select>
          <input
            v-else
            v-model="model[field.key]"
            :type="field.type || 'text'"
            :step="field.step ?? undefined"
            :min="field.min ?? undefined"
            :readonly="!isEditable(field)"
            :required="field.required"
            :maxlength="field.maxLength ?? undefined"
            @input="validateNumericInput($event, field)"
          />
          <!-- 說明由 /api/policy-ui-metadata 轉送 main.code_definition.code_description。 -->
          <small v-if="field.description" class="field-description">{{ field.description }}</small>
        </label>
      </div>
    </form>
    <template #footer>
      <template v-if="mode !== 'delete'">
        <button class="secondary-button" type="button" @click="emit('close')">取消</button>
        <button class="primary-button" type="submit" form="policy-maintenance-form">
          {{ mode === 'create' ? '儲存新增' : '儲存修改' }}
        </button>
      </template>
      <button v-else class="primary-button" type="submit" form="policy-maintenance-form">確認刪除</button>
    </template>
  </DialogShell>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import { fieldWidthToken } from '../utils/fieldLayout'
import DialogShell from './DialogShell.vue'
export type MaintenanceField = {
  key: string
  label?: string
  type?: string
  step?: string | null
  min?: string | null
  required?: boolean
  wide?: boolean
  identity?: boolean
  createOnly?: boolean
  createEditable?: boolean
  options?: string[] | null
  maxLength?: number | null
  precision?: number | null
  scale?: number | null
  description?: string | null
}
const props = defineProps<{ title: string; mode: 'create' | 'edit' | 'delete'; fields: MaintenanceField[] }>()
const model = defineModel<Record<string, string | number | null>>({ required: true })
const emit = defineEmits<{ close: []; submit: [] }>()
const { label: chtLabel, load } = useChtFieldNames()
onMounted(load)
function isEditable(field: MaintenanceField) {
  // 刪除全部唯讀；修改鎖定識別鍵；新增只開放 createOnly 未明確關閉的欄位。
  if (props.mode === 'delete') return false
  if (props.mode === 'edit') return !field.identity && (field.createEditable ?? true)
  return field.createEditable ?? field.createOnly !== false
}

function validateNumericInput(event: Event, field: MaintenanceField) {
  const input = event.currentTarget as HTMLInputElement
  input.setCustomValidity('')
  if (field.type !== 'number' || field.precision == null || field.scale == null || input.value === '') return
  const normalized = input.value.replace(/^[+-]/, '')
  const [integerPart = '', fractionPart = ''] = normalized.split('.')
  if (integerPart.length > field.precision - field.scale || fractionPart.length > field.scale) {
    input.setCustomValidity(field.description || '數字位數超過欄位設定')
  }
}
</script>
