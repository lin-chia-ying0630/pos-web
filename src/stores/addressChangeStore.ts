import { defineStore } from 'pinia'
import { findPostalCodeArea, saveAddressChange, type PolicyAddress } from '../api/posChange'
import { addressChangeSchema, firstSchemaMessage, isPhysicalAddressType } from '../schemas/changeCaseSchemas'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

type AddressChangePayload = {
  addressTypeCode: string
  postalCode: string
  addressText: string
}

const emptyAddressForm = (): AddressChangePayload => ({
  addressTypeCode: '01',
  postalCode: '',
  addressText: ''
})

export const useAddressChangeStore = defineStore('addressChange', {
  state: () => ({
    selectedAddressType: '01',
    addressDialogOpen: false,
    dialogMessage: '',
    postalLookupError: false,
    previousPostalCode: '',
    latestPostalLookupKey: '',
    addressForm: emptyAddressForm()
  }),
  getters: {
    availableAddresses: () => usePolicyStore().availableAddresses
  },
  actions: {
    addressTypeCodeLabel(addressTypeCode: string) {
      return usePolicyStore().addressTypeCodeLabel(addressTypeCode)
    },
    isPhysicalAddressType(addressTypeCode: string) {
      return isPhysicalAddressType(addressTypeCode)
    },
    isContactAddressType(addressTypeCode: string) {
      return !isPhysicalAddressType(addressTypeCode)
    },
    addressDisplay(address: PolicyAddress) {
      return usePolicyStore().addressDisplay(address)
    },
    openAddressDialog() {
      const address =
        this.availableAddresses.find((item) => item.addressTypeCode === this.selectedAddressType) ??
        this.availableAddresses[0]
      this.dialogMessage = ''
      if (address) this.selectAddress(address)
      this.addressDialogOpen = true
    },
    closeAddressDialog() {
      this.addressDialogOpen = false
    },
    selectAddress(address: PolicyAddress) {
      this.selectedAddressType = address.addressTypeCode
      this.addressForm = {
        addressTypeCode: address.addressTypeCode,
        postalCode: usePolicyStore().postalCode(address),
        addressText: address.addressText
      }
      this.previousPostalCode = this.addressForm.postalCode
      this.dialogMessage = ''
      this.postalLookupError = false
    },
    setPostalCode(value: string) {
      if (this.isContactAddressType(this.addressForm.addressTypeCode)) return
      const normalizedPostalCode = value.replace(/\D/g, '').slice(0, 6)
      this.addressForm.postalCode = normalizedPostalCode
      this.clearAddressWhenPostalCodeChanged(normalizedPostalCode)
      return this.lookupWhenPostalCodeReady()
    },
    clearAddressWhenPostalCodeChanged(postalCode: string) {
      if (postalCode === this.previousPostalCode) return
      this.previousPostalCode = postalCode
      this.addressForm.addressText = ''
      this.dialogMessage = ''
      this.postalLookupError = false
    },
    async lookupWhenPostalCodeReady() {
      if (this.isContactAddressType(this.addressForm.addressTypeCode)) return
      if (![3, 6].includes(this.addressForm.postalCode.length)) {
        this.postalLookupError = false
        return
      }
      await this.lookupPostalCodePrefix(this.addressForm.postalCode)
    },
    async lookupPostalCodePrefix(postalCode: string) {
      try {
        this.postalLookupError = false
        this.latestPostalLookupKey = postalCode
        const area = await findPostalCodeArea(postalCode)
        if (this.latestPostalLookupKey !== postalCode) return
        this.addressForm.addressText = area.addressPrefix
        this.dialogMessage = `已帶入 ${area.addressPrefix}，請重新輸入後續地址`
      } catch (error) {
        const fallback = this.resolvePostalPrefixFromPolicyAddress(postalCode.slice(0, 3))
        if (fallback) {
          this.addressForm.addressText = fallback
          this.postalLookupError = false
          this.dialogMessage = `已帶入 ${fallback}，請重新輸入後續地址`
          return
        }
        if (this.latestPostalLookupKey !== postalCode) return
        this.postalLookupError = true
        this.dialogMessage = error instanceof Error ? error.message : '郵遞區號查詢失敗'
      }
    },
    resolvePostalPrefixFromPolicyAddress(zipCode3: string) {
      const matchedAddress = this.availableAddresses.find((address) =>
        usePolicyStore().postalCode(address).startsWith(zipCode3)
      )
      const match = matchedAddress?.addressText?.match(/^(.+?[縣市].+?[區鄉鎮市])/) ?? null
      return match?.[1] ?? ''
    },
    saveResultMessage(label: string, changedFieldCount: number) {
      return changedFieldCount === 0
        ? `${label}資料未異動，未建立變更資料`
        : `${label}已儲存，異動欄位 ${changedFieldCount} 筆`
    },
    async saveAddressForm() {
      const policyStore = usePolicyStore()
      const changeCaseStore = useChangeCaseStore()
      const workflow = useWorkflowStore()
      const validation = addressChangeSchema.safeParse(this.addressForm)
      if (!validation.success) {
        this.postalLookupError = validation.error.issues.some((issue) => issue.path.includes('postalCode'))
        this.dialogMessage = firstSchemaMessage(validation)
        return null
      }
      if (!policyStore.policyDetail || !changeCaseStore.changeCase) return null

      try {
        const physicalAddress = this.isPhysicalAddressType(validation.data.addressTypeCode)
        const result = await workflow.run(() =>
          saveAddressChange({
            policyNo: policyStore.policyDetail!.master.policyNo,
            policySeq: policyStore.policyDetail!.master.policySeq,
            changeCaseNo: changeCaseStore.changeCase!.changeCaseNo,
            addressTypeCode: validation.data.addressTypeCode,
            postalCode: physicalAddress ? validation.data.postalCode : '',
            addressText: physicalAddress ? validation.data.addressText : ''
          })
        )
        const message = this.saveResultMessage(
          this.addressTypeCodeLabel(validation.data.addressTypeCode),
          result.changedFieldCount
        )
        workflow.setMessage(message)
        this.dialogMessage = message
        this.addressDialogOpen = false
        return result
      } catch {
        this.dialogMessage = workflow.message
        return null
      }
    }
  }
})
