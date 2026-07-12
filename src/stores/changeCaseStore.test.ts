import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockPolicyDetail } from '../stories/mockData'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'

describe('changeCaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    usePolicyStore().$patch({ policyDetail: mockPolicyDetail })
  })

  it('loads case list and review detail', async () => {
    const store = useChangeCaseStore()

    await store.loadChangeCases('P000000001')
    await store.toggleDetail(store.changeCases[0]!)

    expect(store.changeCases).toHaveLength(2)
    expect(store.reviewDetail?.changeFields[0]?.changeField).toBe('full_width_address')
    expect(store.selectedDetailCaseNo).toBe('C1150710001')
  })
})
