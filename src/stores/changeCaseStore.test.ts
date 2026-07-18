import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/node'
import { mockPolicyDetail } from '../stories/mockData'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

describe('changeCaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    usePolicyStore().$patch({ policyDetail: mockPolicyDetail })
  })

  it('loads case list and review detail', async () => {
    const store = useChangeCaseStore()

    await store.loadChangeCases('P000000001')
    await store.loadDetail(store.changeCases[0]!)

    expect(store.changeCases).toHaveLength(2)
    expect(store.reviewDetail?.changeFields[0]?.changeField).toBe('full_width_address')
    expect(store.selectedDetailCaseNo).toBe('C1150710001')
  })

  it('creates one case number for multiple selected change items', async () => {
    const store = useChangeCaseStore()
    store.selectedChangeItems = ['001', '002']

    await store.createSelectedCase()

    expect(store.changeCase?.changeCaseNo).toBe('C1150710003')
    expect(store.changeCase?.changeItems).toEqual(['001', '002'])
  })

  it('does not create a case when the latest same item is pending', async () => {
    server.use(
      http.get('/api/policies/:policyNo/:policySeq/change-items/:changeItem/eligibility', ({ params }) =>
        HttpResponse.json({
          success: true,
          message: '查詢成功',
          massageCode: 'SUCCESS',
          errorMessage: '',
          data: {
            policyNo: String(params.policyNo),
            policySeq: Number(params.policySeq),
            changeItem: String(params.changeItem),
            eligible: false,
            latestChangeCaseNo: 'C1150718001',
            latestAcceptanceStatus: 'P',
            message: '此保單正在受理中，無法申請'
          }
        })
      )
    )
    const store = useChangeCaseStore()
    store.selectedChangeItems = ['001']

    await expect(store.createSelectedCase()).rejects.toThrow('此保單正在受理中，無法申請')

    expect(store.changeCase).toBeNull()
    expect(useWorkflowStore().message).toBe('此保單正在受理中，無法申請')
  })
})
