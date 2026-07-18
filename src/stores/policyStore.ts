import { defineStore } from 'pinia'
import { findPolicyDetail, type PolicyAddress, type PolicyDetail } from '../api/posChange'
import { changeCaseQuerySchema, firstSchemaMessage, isPhysicalAddressType } from '../schemas/changeCaseSchemas'
import { useChangeCaseStore } from './changeCaseStore'
import { useWorkflowStore } from './workflowStore'

export const usePolicyStore = defineStore('policy', {
  state: () => ({
    policyDetail: null as PolicyDetail | null,
    lastPolicyNo: 'P000000001',
    lastPolicySeq: 1,
    createQuery: {
      policyNo: 'P000000001',
      policySeq: 1
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
    }
  },
  actions: {
    isPhysicalAddressType(addressType: string) {
      return isPhysicalAddressType(addressType)
    },
    isContactAddressType(addressType: string) {
      return !isPhysicalAddressType(addressType)
    },
    normalizeZipCode2(zipCode2: string | null) {
      return zipCode2 ? zipCode2.padStart(3, '0') : ''
    },
    addressDisplay(address: PolicyAddress) {
      const zip = `${address.zipCode3 ?? ''}${this.normalizeZipCode2(address.zipCode2)}`
      const content = isPhysicalAddressType(address.addressType)
        ? address.fullWidthAddress || '-'
        : address.halfWidthAddress || '-'
      return zip ? `${zip} ${content}` : content
    },
    async fetchPolicy(policyNo: string, policySeq: number) {
      this.policyDetail = await findPolicyDetail(policyNo, policySeq)
      this.lastPolicyNo = policyNo
      this.lastPolicySeq = policySeq
      this.createQuery.policyNo = policyNo
      this.createQuery.policySeq = policySeq
      return this.policyDetail
    },
    async loadPolicy(policyNo: string, policySeq: number) {
      const workflow = useWorkflowStore()
      const changeCaseStore = useChangeCaseStore()
      await workflow.run(async () => {
        await this.fetchPolicy(policyNo, policySeq)
        changeCaseStore.resetDraft()
        workflow.setMessage('查詢完成')
      })
    },
    async loadPolicyFromCreateQuery() {
      const workflow = useWorkflowStore()
      const validation = changeCaseQuerySchema.safeParse(this.createQuery)
      if (!validation.success) {
        workflow.setError(firstSchemaMessage(validation))
        return
      }
      await this.loadPolicy(validation.data.policyNo, validation.data.policySeq)
    }
  }
})
