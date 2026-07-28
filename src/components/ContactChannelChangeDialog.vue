<template>
  <DialogShell v-if="store.open" :title="`${store.label}變更`" @close="store.close">
    <div class="form-grid">
      <label class="wide">
        <span>{{ store.label }}</span>
        <input
          v-model.trim="store.value"
          :type="store.channel === 'email' ? 'email' : 'tel'"
          :maxlength="store.channel === 'email' ? 254 : 24"
          autocomplete="off"
        />
      </label>
    </div>
    <p v-if="store.message" class="dialog-message" :class="{ error: !store.isCreate || workflow.hasError }">
      {{ store.message }}
    </p>
    <template #footer>
      <button class="secondary-button" type="button" @click="store.close">取消</button>
      <button class="primary-button" type="button" :disabled="workflow.loading" @click="store.save">
        <Save :size="18" />
        <span>儲存</span>
      </button>
    </template>
  </DialogShell>
</template>

<script setup lang="ts">
import { Save } from '@lucide/vue'
import DialogShell from './DialogShell.vue'
import { useContactChannelChangeStore } from '../stores/contactChannelChangeStore'
import { useWorkflowStore } from '../stores/workflowStore'

const store = useContactChannelChangeStore()
const workflow = useWorkflowStore()
</script>
