import { describe, expect, it } from 'vitest'
import { isInternalPolicyIdentifier } from './usePolicyUiFields'

describe('isInternalPolicyIdentifier', () => {
  it.each(['policyContractId', 'addressId', 'coverageId'])('隱藏內部 UUID 欄位 %s', (key) => {
    expect(isInternalPolicyIdentifier(key)).toBe(true)
  })

  it.each(['policyNo', 'policySeq', 'addressTypeCode', 'coverageItemSeq'])('保留業務欄位 %s', (key) => {
    expect(isInternalPolicyIdentifier(key)).toBe(false)
  })
})
