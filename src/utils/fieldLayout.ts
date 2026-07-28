import type { UiFieldDefinition } from '../api/posChange'

export type FieldWidthToken = 'field-width-compact' | 'field-width-normal' | 'field-width-wide'

// 版面判斷集中於前端共用層；API 只描述資料容量，SCSS 決定每個 token 的實際寬度。
export function fieldWidthToken(field: {
  type?: UiFieldDefinition['type']
  maxLength?: UiFieldDefinition['maxLength']
  precision?: UiFieldDefinition['precision']
}): FieldWidthToken {
  if (field.type === 'datetime') return 'field-width-wide'
  if (field.type === 'number') return (field.precision ?? 0) <= 10 ? 'field-width-compact' : 'field-width-normal'
  const length = field.maxLength ?? 0
  if (length <= 10) return 'field-width-compact'
  if (length <= 64) return 'field-width-normal'
  return 'field-width-wide'
}
