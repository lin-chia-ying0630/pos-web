import { describe, expect, it } from 'vitest'
import {
  addressChangeSchema,
  changeCaseQuerySchema,
  firstSchemaMessage,
  mainAmountChangeSchema,
  riderAmountChangeSchema
} from './changeCaseSchemas'

describe('change case schemas', () => {
  it('accepts physical address with 3+3 postal code', () => {
    const result = addressChangeSchema.safeParse({
      addressTypeCode: '01',
      postalCode: '104001',
      addressText: '臺北市中山區南京東路二段 1 號',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(true)
  })

  it('accepts three digit postal code', () => {
    const result = addressChangeSchema.safeParse({
      addressTypeCode: '02',
      postalCode: '104',
      addressText: '臺北市中山區南京東路二段 1 號',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid postal code', () => {
    const result = addressChangeSchema.safeParse({
      addressTypeCode: '01',
      postalCode: '',
      addressText: '',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('郵遞區號必須為 3 或 6 碼數字')
  })

  it('requires query policyNo and positive policySeq', () => {
    const result = changeCaseQuerySchema.safeParse({ policyNo: '', policySeq: 0 })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('保單號碼不可空白')
  })

  it('requires nonnegative main amount', () => {
    const result = mainAmountChangeSchema.safeParse({ insuredAmount: -1 })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('主約保額不可小於 0')
  })

  it('requires rider order before saving rider amount', () => {
    const result = riderAmountChangeSchema.safeParse({ rides: [{ coverageItemSeq: '', insuredAmount: 1000 }] })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('附約序號不可空白')
  })
})
