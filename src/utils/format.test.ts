import { describe, expect, it } from 'vitest'
import { formatNumber, isPendingStatus } from './format'

describe('format utilities', () => {
  it('formats numbers with fixed digits', () => {
    expect(formatNumber(12345.6789, 2)).toBe('12,345.68')
  })

  it('checks pending status without case sensitivity', () => {
    expect(isPendingStatus('P')).toBe(true)
    expect(isPendingStatus('p')).toBe(true)
    expect(isPendingStatus('S')).toBe(false)
  })
})
