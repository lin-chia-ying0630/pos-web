import { defineStore } from 'pinia'
import { saveMainAmountChange, saveRiderAmountChange } from '../api/posChange'
import { firstSchemaMessage, mainAmountChangeSchema, riderAmountChangeSchema } from '../schemas/changeCaseSchemas'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

type AmountRideForm = {
  rideOrder: string
  rideType: string
  productCode: string
  policyYears: number
  currentInsuredAmount: number
  insuredAmount: number
  premium: number
}

export const useAmountChangeStore = defineStore('amountChange', {
  state: () => ({
    amountDialogOpen: false,
    amountDialogType: 'main' as 'main' | 'rider',
    dialogMessage: '',
    amountForm: {
      masterInsuredAmount: 0,
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
      if (!policyStore.policyDetail) return
      this.amountDialogType = type
      this.amountForm.masterInsuredAmount = policyStore.policyDetail.master.insuredAmount
      this.amountForm.rides = policyStore.policyDetail.rideList
        .filter((ride) => (type === 'rider' ? ride.rideType !== '1' : true))
        .map((ride) => ({
          rideOrder: ride.rideOrder,
          rideType: ride.rideType,
          productCode: ride.productCode,
          policyYears: ride.policyYears,
          currentInsuredAmount: ride.insuredAmount,
          insuredAmount: ride.insuredAmount,
          premium: ride.premium
        }))
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
            masterInsuredAmount: this.amountForm.masterInsuredAmount
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
              masterInsuredAmount: validation.data.masterInsuredAmount
            })
          )
          const message = this.resultMessage('主約保額變更', result.changedFieldCount)
          workflow.setMessage(message)
          this.dialogMessage = message
          this.amountDialogOpen = false
          return result
        }

        const validation = riderAmountChangeSchema.safeParse({
          rides: this.amountForm.rides.map((ride) => ({
            rideOrder: ride.rideOrder,
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
