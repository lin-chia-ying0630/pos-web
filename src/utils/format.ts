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
