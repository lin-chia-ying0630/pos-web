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
      return address.postalCode || '-'
    },
    availableAddresses(state) {
      const addresses = state.policyDetail?.addressList ?? []
      if (addresses.length > 0) return addresses
      return state.policyDetail?.communicationAddress ? [state.policyDetail.communicationAddress] : []
    },
    addressTypeCodeLabel(state) {
      return (addressTypeCode: string) => {
        const code = state.policyDetail?.addressTypeCodes?.find((item) => item.codeBefore === addressTypeCode)
        return code?.codeDescription ?? addressTypeCode
      }
    }
  },
  actions: {
    isPhysicalAddressType(addressTypeCode: string) {
      return isPhysicalAddressType(addressTypeCode)
    },
    isContactAddressType(addressTypeCode: string) {
      return !isPhysicalAddressType(addressTypeCode)
    },
    // 地址、Email、電話已分表，地址畫面只處理正式 postalCode。
    postalCode(address: PolicyAddress) {
      return address.postalCode
    },
    addressDisplay(address: PolicyAddress) {
      const zip = this.postalCode(address)
      const content = address.addressText || '-'
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
