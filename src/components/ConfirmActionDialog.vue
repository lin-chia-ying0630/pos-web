<template>
  <DialogShell
    :title="title"
    :subtitle="subtitle"
    title-id="confirm-action-title"
    dialog-class="confirm-action-dialog"
    @close="emit('cancel')"
  >
    <div class="confirm-action-body">
      <p v-if="description" class="confirm-action-description">{{ description }}</p>
      <slot />
    </div>
    <template #footer>
      <button class="secondary-button" type="button" @click="emit('cancel')">{{ cancelLabel }}</button>
      <button class="primary-button" :class="confirmClass" type="button" :disabled="disabled" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </template>
  </DialogShell>
</template>

<script setup lang="ts">
import DialogShell from './DialogShell.vue'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmClass?: string
    disabled?: boolean
  }>(),
  {
    subtitle: '',
    description: '',
    confirmLabel: '確認',
    cancelLabel: '取消',
    confirmClass: '',
    disabled: false
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
