import { describe, expect, it } from 'vitest'

import { fieldWidthToken } from './fieldLayout'

describe('fieldWidthToken', () => {
  it('將短代碼與小型數字配置為 compact', () => {
    expect(fieldWidthToken({ type: 'text', maxLength: 8 })).toBe('field-width-compact')
    expect(fieldWidthToken({ type: 'number', precision: 10 })).toBe('field-width-compact')
  })

  it('將一般文字與大型數字配置為 normal', () => {
    expect(fieldWidthToken({ type: 'text', maxLength: 64 })).toBe('field-width-normal')
    expect(fieldWidthToken({ type: 'number', precision: 18 })).toBe('field-width-normal')
  })

  it('將日期時間與長文字配置為 wide', () => {
    expect(fieldWidthToken({ type: 'datetime' })).toBe('field-width-wide')
    expect(fieldWidthToken({ type: 'text', maxLength: 300 })).toBe('field-width-wide')
  })
})
