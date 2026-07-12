import { defineStore } from 'pinia'
import { findPostalCodeArea, saveAddressChange, type PolicyAddress } from '../api/posChange'
import { addressChangeSchema, firstSchemaMessage, isPhysicalAddressType } from '../schemas/changeCaseSchemas'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

type AddressChangePayload = {
  addressType: string
  zipCode3: string
  zipCode2: string
  fullWidthAddress: string
  halfWidthAddress: string
}

const emptyAddressForm = (): AddressChangePayload => ({
  addressType: '01',
  zipCode3: '',
  zipCode2: '',
  fullWidthAddress: '',
  halfWidthAddress: ''
})

export const useAddressChangeStore = defineStore('addressChange', {
  state: () => ({
    selectedAddressType: '01',
    addressDialogOpen: false,
    dialogMessage: '',
    postalLookupError: false,
    previousZipCode3: '',
    latestPostalLookupKey: '',
    addressForm: emptyAddressForm()
  }),
  getters: {
    availableAddresses: () => usePolicyStore().availableAddresses
  },
  actions: {
    addressTypeLabel(addressType: string) {
      return usePolicyStore().addressTypeLabel(addressType)
    },
    isPhysicalAddressType(addressType: string) {
      return isPhysicalAddressType(addressType)
    },
    isContactAddressType(addressType: string) {
      return !isPhysicalAddressType(addressType)
    },
    addressDisplay(address: PolicyAddress) {
      return usePolicyStore().addressDisplay(address)
    },
    openAddressDialog() {
      const address =
        this.availableAddresses.find((item) => item.addressType === this.selectedAddressType) ??
        this.availableAddresses[0]
      this.dialogMessage = ''
      if (address) this.selectAddress(address)
      this.addressDialogOpen = true
    },
    closeAddressDialog() {
      this.addressDialogOpen = false
    },
    selectAddress(address: PolicyAddress) {
      const physicalAddress = this.isPhysicalAddressType(address.addressType)
      this.selectedAddressType = address.addressType
      this.addressForm = {
        addressType: address.addressType,
        zipCode3: physicalAddress ? (address.zipCode3 ?? '') : '',
        zipCode2: physicalAddress ? usePolicyStore().normalizeZipCode2(address.zipCode2) : '',
        fullWidthAddress: physicalAddress ? (address.fullWidthAddress ?? '') : '',
        halfWidthAddress: physicalAddress ? '' : address.fullWidthAddress || address.halfWidthAddress || ''
      }
      this.previousZipCode3 = this.addressForm.zipCode3
      this.dialogMessage = ''
      this.postalLookupError = false
    },
    setZipCode3(value: string) {
      if (this.isContactAddressType(this.addressForm.addressType)) return
      const normalizedZipCode3 = value.replace(/\D/g, '').slice(0, 3)
      this.addressForm.zipCode3 = normalizedZipCode3
      this.clearAddressWhenZipCode3Changed(normalizedZipCode3)
      return this.lookupWhenPostalCodeReady()
    },
    setZipCode2(value: string) {
      if (this.isContactAddressType(this.addressForm.addressType)) return
      this.addressForm.zipCode2 = value.replace(/\D/g, '').slice(0, 3)
      return this.lookupWhenPostalCodeReady()
    },
    clearAddressWhenZipCode3Changed(zipCode3: string) {
      if (zipCode3 === this.previousZipCode3) return
      this.previousZipCode3 = zipCode3
      this.addressForm.zipCode2 = ''
      this.addressForm.fullWidthAddress = ''
      this.dialogMessage = ''
      this.postalLookupError = false
    },
    async lookupWhenPostalCodeReady() {
      if (this.isContactAddressType(this.addressForm.addressType)) return
      if (
        this.addressForm.zipCode3.length < 3 ||
        (this.addressForm.zipCode2.length > 0 && this.addressForm.zipCode2.length < 3)
      ) {
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
        this.dialogMessage = `已帶入 ${area.addressPrefix}，請重新輸入後續地址`
      } catch (error) {
        const fallback = this.resolvePostalPrefixFromPolicyAddress(postalCode.slice(0, 3))
        if (fallback) {
          this.addressForm.fullWidthAddress = fallback
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
      const matchedAddress = this.availableAddresses.find((address) => address.zipCode3 === zipCode3)
      const match = matchedAddress?.fullWidthAddress?.match(/^(.+?[縣市].+?[區鄉鎮市])/) ?? null
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
        this.postalLookupError = validation.error.issues.some(
          (issue) => issue.path.includes('zipCode3') || issue.path.includes('zipCode2')
        )
        this.dialogMessage = firstSchemaMessage(validation)
        return null
      }
      if (!policyStore.policyDetail || !changeCaseStore.changeCase) return null

      try {
        const physicalAddress = this.isPhysicalAddressType(validation.data.addressType)
        const result = await workflow.run(() =>
          saveAddressChange({
            policyNo: policyStore.policyDetail!.master.policyNo,
            policySeq: policyStore.policyDetail!.master.policySeq,
            changeCaseNo: changeCaseStore.changeCase!.changeCaseNo,
            addressType: validation.data.addressType,
            zipCode3: physicalAddress ? validation.data.zipCode3 : '',
            zipCode2: physicalAddress ? validation.data.zipCode2 : '',
            fullWidthAddress: physicalAddress ? validation.data.fullWidthAddress : '',
            halfWidthAddress: validation.data.halfWidthAddress
          })
        )
        const message = this.saveResultMessage(
          this.addressTypeLabel(validation.data.addressType),
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
