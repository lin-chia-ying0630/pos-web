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
      addressType: '01',
      zipCode3: '104',
      zipCode2: '001',
      fullWidthAddress: '臺北市中山區南京東路二段 1 號',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(true)
  })

  it('accepts physical address with blank zipCode2', () => {
    const result = addressChangeSchema.safeParse({
      addressType: '02',
      zipCode3: '104',
      zipCode2: '',
      fullWidthAddress: '臺北市中山區南京東路二段 1 號',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(true)
  })

  it('requires contact value for non physical address type', () => {
    const result = addressChangeSchema.safeParse({
      addressType: '31',
      zipCode3: '',
      zipCode2: '',
      fullWidthAddress: '',
      halfWidthAddress: ''
    })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('email / 電話 / 手機不可空白')
  })

  it('requires query policyNo and positive policySeq', () => {
    const result = changeCaseQuerySchema.safeParse({ policyNo: '', policySeq: 0 })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('保單號碼不可空白')
  })

  it('requires nonnegative main amount', () => {
    const result = mainAmountChangeSchema.safeParse({ masterInsuredAmount: -1 })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('主約保額不可小於 0')
  })

  it('requires rider order before saving rider amount', () => {
    const result = riderAmountChangeSchema.safeParse({ rides: [{ rideOrder: '', insuredAmount: 1000 }] })

    expect(result.success).toBe(false)
    expect(firstSchemaMessage(result)).toBe('附約序號不可空白')
  })
})
