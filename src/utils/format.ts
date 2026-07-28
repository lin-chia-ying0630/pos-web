export function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(value))
}

export function isPendingStatus(acceptanceStatus: string) {
  return acceptanceStatus.toUpperCase() === 'P'
}

export function formatDisplayValue(
  value: unknown,
  options: { emptyText?: string; arraySeparator?: string } = {}
): string | number {
  const { emptyText = '-', arraySeparator = '、' } = options
  if (value == null || value === '') return emptyText
  if (Array.isArray(value)) return value.length ? value.join(arraySeparator) : emptyText
  if (typeof value === 'object') return JSON.stringify(value)
  return typeof value === 'number' ? value : String(value)
}
