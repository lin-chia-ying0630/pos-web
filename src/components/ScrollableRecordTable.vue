<template>
  <div class="record-table-scroll">
    <div class="query-record-head shared-record-grid" :style="gridStyle">
      <!-- 表頭只認欄位 key，中文名稱由 CHT-code 提供，未設定時顯示原始英文 key。 -->
      <strong v-for="column in columns" :key="column.key || column.label">{{
        chtLabel(column.key || column.label)
      }}</strong>
    </div>
    <div v-for="row in rows" :key="row.key" class="query-record-row shared-record-grid" :style="gridStyle">
      <span
        v-for="(column, index) in columns"
        :key="column.key || column.label"
        :class="[column.className, { 'numeric-field': column.numeric }]"
      >
        <slot name="cell" :row="row" :column="column" :index="index">
          <slot v-if="column.slot" :name="`cell-${column.slot}`" :row="row" :column="column" :index="index">
            {{ row.values[index] ?? '-' }}
          </slot>
          <template v-else>{{ row.values[index] ?? '-' }}</template>
        </slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import type { FieldWidthToken } from '../utils/fieldLayout'

export type ScrollableRecordColumn = {
  label: string
  key?: string
  numeric?: boolean
  className?: string
  slot?: string
  // 保單欄位由 API metadata 換算；沒有 metadata 的通用資料表才依實際內容估算。
  widthToken?: FieldWidthToken
}

export type ScrollableRecordRow = {
  key: string | number
  values: Array<string | number>
  data?: unknown
}

const props = defineProps<{
  columns: ScrollableRecordColumn[]
  rows: ScrollableRecordRow[]
}>()
const { label: chtLabel, load } = useChtFieldNames()
onMounted(load)

const widthVariable: Record<FieldWidthToken, string> = {
  'field-width-compact': 'var(--field-width-compact)',
  'field-width-normal': 'var(--field-width-normal)',
  'field-width-wide': 'var(--field-width-wide)'
}

function inferredWidthToken(column: ScrollableRecordColumn, index: number): FieldWidthToken {
  if (column.widthToken) return column.widthToken
  if (column.slot === 'actions') return 'field-width-wide'
  const maximumLength = Math.max(
    column.label.length,
    ...props.rows.map((row) => String(row.values[index] ?? '').length)
  )
  if (column.numeric || maximumLength <= 10) return 'field-width-compact'
  return maximumLength <= 32 ? 'field-width-normal' : 'field-width-wide'
}

const gridStyle = computed(() => {
  // 後端只提供型態與容量；前端 utility 換成語意 token，實際像素統一由 SCSS design token 控制。
  const widths = props.columns.map((column, index) => widthVariable[inferredWidthToken(column, index)])
  const tracks = widths.map((width) => `minmax(${width}, 1fr)`)
  const tableMinimumWidth = `calc(${widths.join(' + ')} + ${Math.max(props.columns.length - 1, 0) * 12 + 28}px)`
  return {
    gridTemplateColumns: tracks.join(' '),
    minWidth: `max(100%, ${tableMinimumWidth})`,
    width: '100%'
  }
})
</script>
