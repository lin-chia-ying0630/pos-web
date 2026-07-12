import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockPolicyDetail } from '../stories/mockData'
import { useAddressChangeStore } from './addressChangeStore'
import { usePolicyStore } from './policyStore'

describe('addressChangeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    usePolicyStore().$patch({ policyDetail: mockPolicyDetail })
  })

  it('switches physical and contact fields from the selected row', () => {
    const store = useAddressChangeStore()
    const contact = {
      ...mockPolicyDetail.addressList[0]!,
      addressType: '31',
      zipCode3: null,
      zipCode2: null,
      fullWidthAddress: 'policyholder@example.com',
      halfWidthAddress: 'policyholder@example.com'
    }

    store.selectAddress(contact)

    expect(store.addressForm.zipCode3).toBe('')
    expect(store.addressForm.fullWidthAddress).toBe('')
    expect(store.addressForm.halfWidthAddress).toBe('policyholder@example.com')
    expect(store.isContactAddressType('31')).toBe(true)
  })
})
