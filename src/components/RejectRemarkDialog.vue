<template>
  <DialogShell
    title="取消覆核"
    :subtitle="reviewKey"
    title-id="reject-remark-title"
    dialog-class="confirm-action-dialog"
    @close="emit('cancel')"
  >
    <div class="confirm-action-body">
      <label class="reject-remark-label">
        <span>拒絕說明（必填）</span>
        <textarea
          v-model.trim="remark"
          class="reject-remark-textarea"
          rows="3"
          maxlength="200"
          placeholder="請輸入取消覆核的說明..."
          required
        />
      </label>
    </div>
    <template #footer>
      <button class="secondary-button" type="button" @click="emit('cancel')">取消</button>
      <button class="primary-button danger-button" type="button" :disabled="!remark" @click="emit('confirm', remark)">
        確認取消
      </button>
    </template>
  </DialogShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DialogShell from './DialogShell.vue'

defineProps<{ reviewKey: string }>()

const remark = ref('')

const emit = defineEmits<{
  confirm: [remark: string]
  cancel: []
}>()
</script>
