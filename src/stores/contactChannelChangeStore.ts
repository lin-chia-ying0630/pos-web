import { defineStore } from 'pinia'
import { saveContactChannelChange } from '../api/posChange'
import { useChangeCaseStore } from './changeCaseStore'
import { usePolicyStore } from './policyStore'
import { useWorkflowStore } from './workflowStore'

export type ContactChannel = 'email' | 'telephone' | 'mobile'

const labels: Record<ContactChannel, string> = {
  email: '電子郵件',
  telephone: '市內電話',
  mobile: '行動電話'
}

export const useContactChannelChangeStore = defineStore('contactChannelChange', {
  state: () => ({
    open: false,
    channel: 'email' as ContactChannel,
    contactId: '',
    value: '',
    message: ''
  }),
  getters: {
    label: (state) => labels[state.channel],
    isCreate: (state) => !state.contactId
  },
  actions: {
    openDialog(channel: ContactChannel) {
      const detail = usePolicyStore().policyDetail
      this.channel = channel
      if (channel === 'email') {
        const item = detail?.emailList?.[0]
        this.contactId = item?.emailId ?? ''
        this.value = item?.emailAddress ?? ''
      } else {
        const phoneType = channel === 'telephone' ? '11' : '12'
        const item = detail?.phoneList?.find((phone) => phone.phoneTypeCode === phoneType)
        this.contactId = item?.phoneId ?? ''
        this.value = item?.phoneNumber ?? ''
      }
      this.message = this.contactId ? '' : `目前沒有${labels[channel]}資料，請輸入以新增`
      useWorkflowStore().clearMessage()
      this.open = true
    },
    close() {
      this.open = false
    },
    async save() {
      const policy = usePolicyStore().policyDetail?.master
      const changeCase = useChangeCaseStore().changeCase
      const workflow = useWorkflowStore()
      if (!policy || !changeCase) return null
      const value = this.value.trim()
      if (!value) {
        this.message = `${this.label}不可空白`
        return null
      }
      try {
        const result = await workflow.run(() =>
          saveContactChannelChange({
            policyNo: policy.policyNo,
            policySeq: policy.policySeq,
            changeCaseNo: changeCase.changeCaseNo,
            channel: this.channel,
            contactId: this.contactId,
            value
          })
        )
        workflow.setMessage(`${this.label}已儲存，異動欄位 ${result.changedFieldCount} 筆`)
        this.open = false
        return result
      } catch {
        this.message = workflow.message
        return null
      }
    }
  }
})
