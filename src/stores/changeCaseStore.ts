import { defineStore } from 'pinia'
import {
  createChangeCase,
  checkChangeCaseEligibility,
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
    selectedChangeItems: [] as string[],
    changeCases: [] as PolicyChangeCase[],
    reviewSearched: false,
    selectedDetailCaseNo: '',
    reviewDetail: null as PolicyChangeCaseDetail | null
  }),
  actions: {
    resetDraft() {
      this.changeCase = null
      this.selectedChangeItems = []
    },
    async createSelectedCase() {
      const policyStore = usePolicyStore()
      const workflow = useWorkflowStore()
      if (!policyStore.policyDetail || this.selectedChangeItems.length === 0) return null
      const { policyNo, policySeq } = policyStore.policyDetail.master
      return workflow.run(async () => {
        const eligibilityList = await Promise.all(
          this.selectedChangeItems.map((changeItem) => checkChangeCaseEligibility(policyNo, policySeq, changeItem))
        )
        const blocked = eligibilityList.find((eligibility) => !eligibility.eligible)
        if (blocked) throw new Error(blocked.message || '此保單正在受理中，無法申請')
        this.changeCase = await createChangeCase(policyNo, policySeq, this.selectedChangeItems)
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
    async loadDetail(caseItem: PolicyChangeCase) {
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
