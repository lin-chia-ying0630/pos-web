import { defineStore } from 'pinia'
import { saveMainAmountChange, saveRiderAmountChange } from '../api/posChange'
import { firstSchemaMessage, mainAmountChangeSchema, riderAmountChangeSchema } from '../schemas/changeCaseSchemas'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

type AmountRideForm = {
  coverageItemSeq: string
  coverageItemType: string
  productCode: string
  coverageTermYears: number
  currentInsuredAmount: number
  insuredAmount: number
  premiumAmount: number
}

// 003 僅能處理附約。除了識別 RIDER，也排除壽險約定的主約序號 000，
// 避免舊資料型態不一致時把主約顯示或送入附約異動 API。
export function isRiderCoverage(ride: Pick<AmountRideForm, 'coverageItemSeq' | 'coverageItemType'>) {
  return ride.coverageItemType.trim().toUpperCase() === 'RIDER' && ride.coverageItemSeq !== '000'
}

export const useAmountChangeStore = defineStore('amountChange', {
  state: () => ({
    amountDialogOpen: false,
    amountDialogType: 'main' as 'main' | 'rider',
    dialogMessage: '',
    amountForm: {
      insuredAmount: 0,
      rides: [] as AmountRideForm[]
    }
  }),
  getters: {
    amountDialogTitle: (state) => (state.amountDialogType === 'main' ? '主約保額變更' : '附約保額變更'),
    amountDialogSubtitle: (state) => (state.amountDialogType === 'main' ? '保單主檔' : '保單附約')
  },
  actions: {
    openAmountDialog(type: 'main' | 'rider') {
      const policyStore = usePolicyStore()
      const workflow = useWorkflowStore()
      if (!policyStore.policyDetail) return
      this.amountDialogType = type
      this.amountForm.rides = policyStore.policyDetail.rideList
        .filter((ride) => (type === 'rider' ? isRiderCoverage(ride) : true))
        .map((ride) => ({
          coverageItemSeq: ride.coverageItemSeq,
          coverageItemType: ride.coverageItemType,
          productCode: ride.productCode,
          coverageTermYears: ride.coverageTermYears,
          currentInsuredAmount: ride.insuredAmount,
          insuredAmount: ride.insuredAmount,
          premiumAmount: ride.premiumAmount
        }))
      const mainRide = this.amountForm.rides.find((ride) => ride.coverageItemSeq === '000')
      this.amountForm.insuredAmount = mainRide?.insuredAmount ?? 0
      // 開啟新的異動視窗時清除上一筆 API 錯誤，避免已修正資料後仍顯示舊訊息。
      workflow.clearMessage()
      this.dialogMessage = ''
      this.amountDialogOpen = true
    },
    closeAmountDialog() {
      this.amountDialogOpen = false
    },
    resultMessage(label: string, changedFieldCount: number) {
      return changedFieldCount === 0
        ? `${label}資料未異動，未建立變更資料`
        : `${label}已儲存，異動欄位 ${changedFieldCount} 筆`
    },
    async saveAmountForm() {
      const policyStore = usePolicyStore()
      const changeCaseStore = useChangeCaseStore()
      const workflow = useWorkflowStore()
      if (!policyStore.policyDetail || !changeCaseStore.changeCase) return null

      try {
        if (this.amountDialogType === 'main') {
          const validation = mainAmountChangeSchema.safeParse({
            insuredAmount: this.amountForm.insuredAmount
          })
          if (!validation.success) {
            this.dialogMessage = firstSchemaMessage(validation)
            return null
          }
          const result = await workflow.run(() =>
            saveMainAmountChange({
              policyNo: policyStore.policyDetail!.master.policyNo,
              policySeq: policyStore.policyDetail!.master.policySeq,
              changeCaseNo: changeCaseStore.changeCase!.changeCaseNo,
              insuredAmount: validation.data.insuredAmount
            })
          )
          const message = this.resultMessage('主約保額變更', result.changedFieldCount)
          workflow.setMessage(message)
          this.dialogMessage = message
          this.amountDialogOpen = false
          return result
        }

        // 送出前再次套用業務邊界，避免 UI state 被外部程式修改後把主約送入 003。
        const validation = riderAmountChangeSchema.safeParse({
          rides: this.amountForm.rides.filter(isRiderCoverage).map((ride) => ({
            coverageItemSeq: ride.coverageItemSeq,
            insuredAmount: ride.insuredAmount
          }))
        })
        if (!validation.success) {
          this.dialogMessage = firstSchemaMessage(validation)
          return null
        }
        const result = await workflow.run(() =>
          saveRiderAmountChange({
            policyNo: policyStore.policyDetail!.master.policyNo,
            policySeq: policyStore.policyDetail!.master.policySeq,
            changeCaseNo: changeCaseStore.changeCase!.changeCaseNo,
            rides: validation.data.rides
          })
        )
        const message = this.resultMessage('附約保額變更', result.changedFieldCount)
        workflow.setMessage(message)
        this.dialogMessage = message
        this.amountDialogOpen = false
        return result
      } catch {
        this.dialogMessage = workflow.message
        return null
      }
    }
  }
})
