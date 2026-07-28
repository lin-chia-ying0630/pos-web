import { describe, expect, it } from 'vitest'
import { formatDisplayValue, formatNumber, isPendingStatus } from './format'

describe('format utilities', () => {
  it('formats numbers with fixed digits', () => {
    expect(formatNumber(12345.6789, 2)).toBe('12,345.68')
  })

  it('checks pending status without case sensitivity', () => {
    expect(isPendingStatus('P')).toBe(true)
    expect(isPendingStatus('p')).toBe(true)
    expect(isPendingStatus('S')).toBe(false)
  })

  it('formats shared API display values consistently', () => {
    expect(formatDisplayValue(null)).toBe('-')
    expect(formatDisplayValue([], { emptyText: '空白' })).toBe('空白')
    expect(formatDisplayValue(['A', 'B'])).toBe('A、B')
    expect(formatDisplayValue({ key: 'value' })).toBe('{"key":"value"}')
    expect(formatDisplayValue(12)).toBe(12)
  })
})
