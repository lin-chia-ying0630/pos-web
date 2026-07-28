<template>
  <div class="record-table-scroll">
    <div class="query-record-head shared-record-grid" :style="gridStyle">
      <!-- 表頭只認欄位 key，中文名稱由 CHT-code 提供，未設定時顯示原始英文 key。 -->
      <strong v-for="column in columns" :key="column.key || column.label">{{
        chtLabel(column.key || column.label)
      }}</strong>
    </div>
    <template v-for="row in rows" :key="row.key">
      <div class="query-record-row shared-record-grid" :style="gridStyle">
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
      <slot name="after-row" :row="row" />
    </template>
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

function visualLength(value: unknown) {
  // 中文與全形字元約佔兩個英數字寬度；用實際 API 內容估算，避免日期、人名與按鈕互相重疊。
  return [...String(value ?? '')].reduce((length, character) => length + (/[\u2e80-\uffff]/.test(character) ? 2 : 1), 0)
}

function measuredColumn(column: ScrollableRecordColumn, index: number) {
  if (column.widthToken) {
    return { minimum: widthVariable[column.widthToken], weight: column.widthToken === 'field-width-wide' ? 3 : 1 }
  }
  const contentLength = Math.max(
    visualLength(column.label),
    ...props.rows.map((row) => visualLength(row.values[index] ?? ''))
  )
  const operationColumn = column.key === 'operation' || column.slot === 'actions'
  const minimumPixels = operationColumn ? 260 : Math.min(440, Math.max(120, contentLength * 9 + 40))
  return { minimum: `${minimumPixels}px`, weight: Math.max(1, Math.min(4, contentLength / 12)) }
}

const gridStyle = computed(() => {
  // 欄寬依表頭與整頁 API 資料的最長顯示內容統一計算；資料超出視窗時由共用容器提供橫向拉軸。
  const measurements = props.columns.map(measuredColumn)
  const tracks = measurements.map(({ minimum, weight }) => `minmax(${minimum}, ${weight}fr)`)
  const widths = measurements.map(({ minimum }) => minimum)
  const tableMinimumWidth = `calc(${widths.join(' + ')} + ${Math.max(props.columns.length - 1, 0) * 12 + 28}px)`
  return {
    gridTemplateColumns: tracks.join(' '),
    minWidth: `max(100%, ${tableMinimumWidth})`,
    width: '100%'
  }
})
</script>
