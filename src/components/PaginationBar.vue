<template>
  <nav v-if="totalPages > 1" class="code-pagination" :aria-label="ariaLabel">
    <button type="button" :disabled="page === 1" @click="emit('change', page - 1)">上一頁</button>
    <button
      v-for="item in visiblePages"
      :key="item"
      type="button"
      :class="{ active: item === page }"
      @click="emit('change', item)"
    >
      {{ item }}
    </button>
    <button type="button" :disabled="page === totalPages" @click="emit('change', page + 1)">下一頁</button>
    <span v-if="totalItems != null" class="pagination-summary">共 {{ totalItems }} 筆，每頁 {{ pageSize }} 筆</span>
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    totalItems?: number | null
    pageSize?: number
    ariaLabel?: string
  }>(),
  { totalItems: null, pageSize: 20, ariaLabel: '資料分頁' }
)
const emit = defineEmits<{ change: [page: number] }>()
const visiblePages = computed(() => {
  const start = Math.max(1, Math.min(props.page - 3, props.totalPages - 6)),
    end = Math.min(props.totalPages, start + 6)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
})
</script>
