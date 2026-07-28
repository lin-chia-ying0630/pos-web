<template>
  <div class="dialog-backdrop" @click.self="emit('close')">
    <section class="dialog" :class="dialogClass" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <header class="dialog-header">
        <div>
          <h2 :id="titleId">{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <button class="icon-button" type="button" title="關閉" aria-label="關閉" @click="emit('close')">
          <X :size="18" />
        </button>
      </header>
      <!-- 所有彈窗只讓內容區捲動，標題與操作按鈕固定在可視範圍。 -->
      <div class="dialog-body"><slot /></div>
      <footer v-if="$slots.footer" class="dialog-actions"><slot name="footer" /></footer>
    </section>
  </div>
</template>
<script setup lang="ts">
import { X } from '@lucide/vue'
withDefaults(defineProps<{ title: string; subtitle?: string; titleId?: string; dialogClass?: string }>(), {
  subtitle: '',
  titleId: 'shared-dialog-title',
  dialogClass: ''
})
const emit = defineEmits<{ close: [] }>()
</script>
