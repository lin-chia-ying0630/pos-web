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

  it('loads canonical postal code and address from the selected row', () => {
    const store = useAddressChangeStore()
    store.selectAddress(mockPolicyDetail.addressList[0]!)

    expect(store.addressForm.postalCode).toBe('100001')
    expect(store.addressForm.addressText).toContain('臺北市')
  })
})
