export function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

export function isPendingStatus(acceptanceStatus: string) {
  return acceptanceStatus.toUpperCase() === 'P'
}
