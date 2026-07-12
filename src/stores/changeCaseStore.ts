import { defineStore } from 'pinia'
import {
  createChangeCase,
  findChangeCaseDetail,
  findChangeCases,
  updateChangeCaseStatus,
  type ChangeCase,
  type PolicyChangeCase,
  type PolicyChangeCaseDetail
} from '../api/posChange'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

export const useChangeCaseStore = defineStore('changeCase', {
  state: () => ({
    changeCase: null as ChangeCase | null,
    selectedChangeItem: '',
    changeCases: [] as PolicyChangeCase[],
    reviewSearched: false,
    selectedDetailCaseNo: '',
    reviewDetail: null as PolicyChangeCaseDetail | null
  }),
  actions: {
    resetDraft() {
      this.changeCase = null
      this.selectedChangeItem = ''
    },
    async createSelectedCase() {
      const policyStore = usePolicyStore()
      const workflow = useWorkflowStore()
      if (!policyStore.policyDetail || !this.selectedChangeItem) return null
      const { policyNo, policySeq } = policyStore.policyDetail.master
      return workflow.run(async () => {
        this.changeCase = await createChangeCase(policyNo, policySeq, this.selectedChangeItem)
        workflow.setMessage(`已建立變更案號 ${this.changeCase.changeCaseNo}`)
        return this.changeCase
      })
    },
    async loadChangeCases(policyNo: string) {
      const workflow = useWorkflowStore()
      await workflow.run(async () => {
        this.changeCases = await findChangeCases(policyNo)
        this.reviewSearched = true
        this.selectedDetailCaseNo = ''
        this.reviewDetail = null
        workflow.setMessage(`查詢完成，共 ${this.changeCases.length} 筆保全受理資料`)
      })
    },
    async toggleDetail(caseItem: PolicyChangeCase) {
      if (this.selectedDetailCaseNo === caseItem.changeCaseNo) {
        this.selectedDetailCaseNo = ''
        this.reviewDetail = null
        return
      }
      const workflow = useWorkflowStore()
      await workflow.run(async () => {
        this.reviewDetail = await findChangeCaseDetail(caseItem.policyNo, caseItem.policySeq, caseItem.changeCaseNo)
        this.selectedDetailCaseNo = caseItem.changeCaseNo
        workflow.setMessage(`已載入 ${caseItem.changeCaseNo} 異動明細`)
      })
    },
    async updateStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
      const workflow = useWorkflowStore()
      const policyStore = usePolicyStore()
      await workflow.run(async () => {
        await updateChangeCaseStatus({
          policyNo: caseItem.policyNo,
          policySeq: caseItem.policySeq,
          changeCaseNo: caseItem.changeCaseNo,
          acceptanceStatus
        })
        this.changeCases = await findChangeCases(caseItem.policyNo)
        this.selectedDetailCaseNo = ''
        this.reviewDetail = null
        if (
          acceptanceStatus === 'S' &&
          policyStore.policyDetail?.master.policyNo === caseItem.policyNo &&
          policyStore.policyDetail.master.policySeq === caseItem.policySeq
        ) {
          await policyStore.fetchPolicy(caseItem.policyNo, caseItem.policySeq)
        }
        workflow.setMessage(`${caseItem.changeCaseNo} 已${acceptanceStatus === 'S' ? '完成並套用異動' : '取消'}`)
      })
    }
  }
})
