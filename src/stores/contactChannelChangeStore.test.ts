import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockPolicyDetail } from '../stories/mockData'
import { useContactChannelChangeStore } from './contactChannelChangeStore'
import { usePolicyStore } from './policyStore'

describe('contactChannelChangeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    usePolicyStore().$patch({ policyDetail: mockPolicyDetail })
  })

  it('沒有既有市內電話時開啟空白新增模式', () => {
    const store = useContactChannelChangeStore()

    store.openDialog('telephone')

    expect(store.open).toBe(true)
    expect(store.isCreate).toBe(true)
    expect(store.contactId).toBe('')
    expect(store.value).toBe('')
    expect(store.message).toContain('請輸入以新增')
  })
})
