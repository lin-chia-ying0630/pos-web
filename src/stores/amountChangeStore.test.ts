import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockPolicyDetail } from '../stories/mockData'
import { useAmountChangeStore } from './amountChangeStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

describe('amountChangeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    usePolicyStore().$patch({ policyDetail: mockPolicyDetail })
  })

  it('附約保額變更不顯示主約 000 / BASE', () => {
    const store = useAmountChangeStore()

    store.openAmountDialog('rider')

    expect(store.amountForm.rides.map((ride) => ride.coverageItemSeq)).toEqual(['001'])
    expect(store.amountForm.rides.every((ride) => ride.coverageItemType === 'RIDER')).toBe(true)
  })

  it('重新開啟附約異動視窗會清除上一筆錯誤訊息', () => {
    const workflow = useWorkflowStore()
    workflow.setError('003 附約保額變更不可修改主約')

    useAmountChangeStore().openAmountDialog('rider')

    expect(workflow.hasError).toBe(false)
    expect(workflow.message).toBe('')
  })
})
