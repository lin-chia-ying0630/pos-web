import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AmountChangeDialog from './AmountChangeDialog.vue'
import { usePosChangeStore } from '../stores/posChangeStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/AmountChangeDialog',
  component: AmountChangeDialog
} satisfies Meta<typeof AmountChangeDialog>

export default meta
type Story = StoryObj<typeof meta>

function openAmountDialog(type: 'main' | 'rider') {
  const store = usePosChangeStore()
  store.$patch({
    policyDetail: mockPolicyDetail,
    changeCase: {
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150712002',
      acceptanceStatus: 'P',
      changeItem: type === 'main' ? '002' : '003'
    }
  })
  store.openAmountDialog(type)
}

export const MainAmount: Story = {
  render: () => ({
    components: { AmountChangeDialog },
    setup() {
      openAmountDialog('main')
      return {}
    },
    template: '<AmountChangeDialog />'
  })
}

export const RiderAmount: Story = {
  render: () => ({
    components: { AmountChangeDialog },
    setup() {
      openAmountDialog('rider')
      return {}
    },
    template: '<AmountChangeDialog />'
  })
}
