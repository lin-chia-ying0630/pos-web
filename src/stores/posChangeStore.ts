import { defineStore } from 'pinia'
import {
  createChangeCase,
  findChangeCases,
  findPolicyDetail,
  saveAddressChange,
  saveMainAmountChange,
  saveRiderAmountChange,
  updateChangeCaseStatus,
  type ChangeCase,
  type PolicyChangeCase,
  type PolicyDetail
} from '../api/posChange'

type AddressChangePayload = {
  addressType: string
  zipCode3: string
  zipCode2: string
  fullWidthAddress: string
  halfWidthAddress: string
}

export const usePosChangeStore = defineStore('posChange', {
  state: () => ({
    loading: false,
    hasError: false,
    message: '',
    policyDetail: null as PolicyDetail | null,
    changeCase: null as ChangeCase | null,
    changeCases: [] as PolicyChangeCase[],
    reviewSearched: false,
    lastPolicyNo: 'P000000001',
    lastPolicySeq: 1
  }),
  getters: {
    communicationZip(state) {
      const address = state.policyDetail?.communicationAddress
      if (!address) return '-'
      const zipCode3 = address.zipCode3 ?? ''
      const zipCode2 = address.zipCode2 ? address.zipCode2.padStart(3, '0') : ''
      return `${zipCode3}${zipCode2}` || '-'
    },
    availableAddresses(state) {
      const addresses = state.policyDetail?.addressList ?? []
      if (addresses.length > 0) return addresses
      return state.policyDetail?.communicationAddress ? [state.policyDetail.communicationAddress] : []
    },
    addressTypeLabel(state) {
      return (addressType: string) => {
        const code = state.policyDetail?.addressTypes?.find((item) => item.codeBefore === addressType)
        return code?.codeDescription ?? addressType
      }
    }
  },
  actions: {
    async run(task: () => Promise<void>) {
      this.loading = true
      this.hasError = false
      this.message = ''
      try {
        await task()
      } catch (error) {
        this.hasError = true
        this.message = error instanceof Error ? error.message : '作業失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
    async loadPolicy(policyNo: string, policySeq: number) {
      await this.run(async () => {
        this.policyDetail = await findPolicyDetail(policyNo, policySeq)
        this.lastPolicyNo = policyNo
        this.lastPolicySeq = policySeq
        this.changeCase = null
        this.message = '查詢完成'
      })
    },
    async createCase(changeItem: string) {
      if (!this.policyDetail) return null
      const { policyNo, policySeq } = this.policyDetail.master
      await this.run(async () => {
        this.changeCase = await createChangeCase(policyNo, policySeq, changeItem)
        this.message = `已建立變更案號 ${this.changeCase.changeCaseNo}`
      })
      return this.changeCase
    },
    async saveAddress(payload: AddressChangePayload) {
      if (!this.policyDetail || !this.changeCase) return null
      const result = await saveAddressChange({
        policyNo: this.policyDetail.master.policyNo,
        policySeq: this.policyDetail.master.policySeq,
        changeCaseNo: this.changeCase.changeCaseNo,
        addressType: payload.addressType,
        zipCode3: payload.zipCode3,
        zipCode2: payload.zipCode2,
        fullWidthAddress: payload.fullWidthAddress,
        halfWidthAddress: payload.halfWidthAddress
      })
      this.message = `地址變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
      return result
    },
    async saveMainAmount(masterInsuredAmount: number) {
      if (!this.policyDetail || !this.changeCase) return null
      const result = await saveMainAmountChange({
        policyNo: this.policyDetail.master.policyNo,
        policySeq: this.policyDetail.master.policySeq,
        changeCaseNo: this.changeCase.changeCaseNo,
        masterInsuredAmount
      })
      this.message = `主約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
      return result
    },
    async saveRiderAmounts(rides: Array<{ rideOrder: string; insuredAmount: number }>) {
      if (!this.policyDetail || !this.changeCase) return null
      const result = await saveRiderAmountChange({
        policyNo: this.policyDetail.master.policyNo,
        policySeq: this.policyDetail.master.policySeq,
        changeCaseNo: this.changeCase.changeCaseNo,
        rides
      })
      this.message = `附約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
      return result
    },
    async loadChangeCases(policyNo: string) {
      await this.run(async () => {
        this.changeCases = await findChangeCases(policyNo)
        this.reviewSearched = true
        this.lastPolicyNo = policyNo
        this.message = `查詢完成，共 ${this.changeCases.length} 筆保全受理資料`
      })
    },
    async updateStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
      await this.run(async () => {
        await updateChangeCaseStatus({
          policyNo: caseItem.policyNo,
          policySeq: caseItem.policySeq,
          changeCaseNo: caseItem.changeCaseNo,
          acceptanceStatus
        })
        this.message = `${caseItem.changeCaseNo} 已更新狀態`
        await this.loadChangeCases(caseItem.policyNo)
        if (acceptanceStatus === 'S' && this.policyDetail?.master.policyNo === caseItem.policyNo && this.policyDetail.master.policySeq === caseItem.policySeq) {
          await this.loadPolicy(caseItem.policyNo, caseItem.policySeq)
        }
      })
    }
  }
})
