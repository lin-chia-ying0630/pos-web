import { defineStore } from 'pinia'
import {
  createChangeCase,
  findChangeCases,
  findPolicyDetail,
  findPostalCodeArea,
  saveAddressChange,
  saveMainAmountChange,
  saveRiderAmountChange,
  updateChangeCaseStatus,
  type ChangeCase,
  type PolicyAddress,
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

type AmountRideForm = {
  rideOrder: string
  rideType: string
  productCode: string
  policyYears: number
  currentInsuredAmount: number
  insuredAmount: number
  premium: number
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
    lastPolicySeq: 1,
    createQuery: {
      policyNo: 'P000000001',
      policySeq: 1
    },
    selectedChangeItem: '',
    selectedAddressType: '01',
    addressDialogOpen: false,
    amountDialogOpen: false,
    amountDialogType: 'main' as 'main' | 'rider',
    dialogMessage: '',
    postalLookupError: false,
    suppressPostalLookup: false,
    previousZipCode3: '',
    latestPostalLookupKey: '',
    addressForm: {
      addressType: '01',
      zipCode3: '',
      zipCode2: '',
      fullWidthAddress: '',
      halfWidthAddress: ''
    } as AddressChangePayload,
    amountForm: {
      masterInsuredAmount: 0,
      rides: [] as AmountRideForm[]
    }
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
    },
    amountDialogTitle(state) {
      return state.amountDialogType === 'main' ? '主約保額變更' : '附約保額變更'
    },
    amountDialogSubtitle(state) {
      return state.amountDialogType === 'main' ? '保單主檔' : '保單附約'
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
        this.createQuery.policyNo = policyNo
        this.createQuery.policySeq = policySeq
        this.changeCase = null
        this.selectedChangeItem = ''
        this.selectedAddressType = '01'
        this.message = '查詢完成'
      })
    },
    async loadPolicyFromCreateQuery() {
      await this.loadPolicy(this.createQuery.policyNo, this.createQuery.policySeq)
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
    async createSelectedCase() {
      const changeCase = await this.createCase(this.selectedChangeItem)
      if (changeCase?.changeItem === '001') this.openAddressDialog()
      if (changeCase?.changeItem === '002') this.openAmountDialog('main')
      if (changeCase?.changeItem === '003') this.openAmountDialog('rider')
      return changeCase
    },
    openAddressDialog() {
      const address = this.availableAddresses.find((item) => item.addressType === this.selectedAddressType)
        ?? this.availableAddresses[0]
      this.dialogMessage = ''
      if (address) this.selectAddress(address)
      this.addressDialogOpen = true
    },
    closeAddressDialog() {
      this.addressDialogOpen = false
    },
    selectAddress(address: PolicyAddress) {
      this.selectedAddressType = address.addressType
      this.addressForm.addressType = address.addressType
      this.suppressPostalLookup = true
      this.addressForm.zipCode3 = address.zipCode3 ?? ''
      this.addressForm.zipCode2 = this.normalizeZipCode2(address.zipCode2)
      this.addressForm.fullWidthAddress = address.fullWidthAddress ?? ''
      this.addressForm.halfWidthAddress = address.halfWidthAddress ?? ''
      this.previousZipCode3 = this.addressForm.zipCode3
      this.dialogMessage = ''
      this.postalLookupError = false
      window.setTimeout(() => {
        this.suppressPostalLookup = false
      }, 0)
    },
    setZipCode3(value: string) {
      if (this.suppressPostalLookup) return
      const normalizedZipCode3 = value.replace(/\D/g, '').slice(0, 3)
      this.addressForm.zipCode3 = normalizedZipCode3
      this.clearAddressWhenZipCode3Changed(normalizedZipCode3)
      return this.lookupWhenPostalCodeReady()
    },
    setZipCode2(value: string) {
      if (this.suppressPostalLookup) return
      const normalizedZipCode2 = value.replace(/\D/g, '').slice(0, 3)
      this.addressForm.zipCode2 = normalizedZipCode2
      return this.lookupWhenPostalCodeReady()
    },
    clearAddressWhenZipCode3Changed(zipCode3: string) {
      if (zipCode3 === this.previousZipCode3) return
      this.previousZipCode3 = zipCode3
      this.addressForm.zipCode2 = ''
      this.addressForm.fullWidthAddress = ''
      this.addressForm.halfWidthAddress = ''
      this.dialogMessage = ''
      this.postalLookupError = false
    },
    async lookupWhenPostalCodeReady() {
      if (this.addressForm.zipCode3.length < 3 || (this.addressForm.zipCode2.length > 0 && this.addressForm.zipCode2.length < 3)) {
        this.postalLookupError = false
        return
      }
      await this.lookupPostalCodePrefix(`${this.addressForm.zipCode3}${this.addressForm.zipCode2}`)
    },
    async lookupPostalCodePrefix(postalCode: string) {
      try {
        this.postalLookupError = false
        this.latestPostalLookupKey = postalCode
        const area = await findPostalCodeArea(postalCode)
        if (this.latestPostalLookupKey !== postalCode) return
        this.addressForm.fullWidthAddress = area.addressPrefix
        this.addressForm.halfWidthAddress = area.halfWidthAddressPrefix
        this.dialogMessage = `已帶入 ${area.addressPrefix} / ${area.halfWidthAddressPrefix}，請重新輸入後續地址`
      } catch (error) {
        const fallback = this.resolvePostalPrefixFromPolicyAddress(postalCode.slice(0, 3))
        if (fallback) {
          this.addressForm.fullWidthAddress = fallback.addressPrefix
          this.addressForm.halfWidthAddress = fallback.halfWidthAddressPrefix
          this.postalLookupError = false
          this.dialogMessage = `已帶入 ${fallback.addressPrefix} / ${fallback.halfWidthAddressPrefix}，請重新輸入後續地址`
          return
        }
        if (this.latestPostalLookupKey !== postalCode) return
        this.postalLookupError = true
        this.dialogMessage = error instanceof Error ? error.message : '郵遞區號查詢失敗'
      }
    },
    resolvePostalPrefixFromPolicyAddress(zipCode3: string) {
      const matchedAddress = this.availableAddresses.find((address) => address.zipCode3 === zipCode3)
      if (!matchedAddress) return null

      const addressPrefix = this.extractFullWidthPrefix(matchedAddress.fullWidthAddress)
      const halfWidthAddressPrefix = this.extractHalfWidthPrefix(matchedAddress.halfWidthAddress)
      if (!addressPrefix && !halfWidthAddressPrefix) return null

      return {
        addressPrefix: addressPrefix || '',
        halfWidthAddressPrefix: halfWidthAddressPrefix || ''
      }
    },
    extractFullWidthPrefix(address: string | null) {
      const match = address?.match(/^(.+?[縣市].+?[區鄉鎮市])/)
      return match?.[1] ?? ''
    },
    extractHalfWidthPrefix(address: string | null) {
      const parts = address?.split(',').map((part) => part.trim()).filter(Boolean) ?? []
      if (parts.length < 2) return ''
      return parts.slice(-2).join(', ')
    },
    normalizeZipCode2(zipCode2: string | null) {
      return zipCode2 ? zipCode2.padStart(3, '0') : ''
    },
    addressDisplay(address: PolicyAddress) {
      const zip = `${address.zipCode3 ?? ''}${this.normalizeZipCode2(address.zipCode2)}`
      const content = address.fullWidthAddress || address.halfWidthAddress || '-'
      return zip ? `${zip} ${content}` : content
    },
    saveResultMessage(label: string, changedFieldCount: number) {
      if (changedFieldCount === 0) {
        return `${label}資料未異動，未建立變更資料`
      }
      return `${label}已儲存，異動欄位 ${changedFieldCount} 筆`
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
      this.message = this.saveResultMessage('地址變更', result.changedFieldCount)
      return result
    },
    async saveAddressForm() {
      try {
        if (this.addressForm.zipCode3.length !== 3 || (this.addressForm.zipCode2.length > 0 && this.addressForm.zipCode2.length !== 3)) {
          this.postalLookupError = true
          this.dialogMessage = '郵遞區號前三碼必填，後三碼可空白；若填寫需為 3 碼'
          return null
        }
        const result = await this.saveAddress(this.addressForm)
        this.dialogMessage = this.saveResultMessage(this.addressTypeLabel(this.addressForm.addressType), result?.changedFieldCount ?? 0)
        this.addressDialogOpen = false
        return result
      } catch {
        this.dialogMessage = this.message
        return null
      }
    },
    async saveMainAmount(masterInsuredAmount: number) {
      if (!this.policyDetail || !this.changeCase) return null
      const result = await saveMainAmountChange({
        policyNo: this.policyDetail.master.policyNo,
        policySeq: this.policyDetail.master.policySeq,
        changeCaseNo: this.changeCase.changeCaseNo,
        masterInsuredAmount
      })
      this.message = this.saveResultMessage('主約保額變更', result.changedFieldCount)
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
      this.message = this.saveResultMessage('附約保額變更', result.changedFieldCount)
      return result
    },
    openAmountDialog(type: 'main' | 'rider') {
      if (!this.policyDetail) return
      this.amountDialogType = type
      this.amountForm.masterInsuredAmount = this.policyDetail.master.insuredAmount
      this.amountForm.rides = this.policyDetail.rideList
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
    async saveAmountForm() {
      try {
        if (this.amountDialogType === 'main') {
          const result = await this.saveMainAmount(this.amountForm.masterInsuredAmount)
          this.dialogMessage = this.saveResultMessage('主約保額變更', result?.changedFieldCount ?? 0)
          this.amountDialogOpen = false
          return result
        }
        const result = await this.saveRiderAmounts(this.amountForm.rides.map((ride) => ({
          rideOrder: ride.rideOrder,
          insuredAmount: ride.insuredAmount
        })))
        this.dialogMessage = this.saveResultMessage('附約保額變更', result?.changedFieldCount ?? 0)
        this.amountDialogOpen = false
        return result
      } catch {
        this.dialogMessage = this.message
        return null
      }
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
