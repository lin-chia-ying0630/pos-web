import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AmountChangeDialog from './AmountChangeDialog.vue'
import { useAmountChangeStore } from '../stores/amountChangeStore'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/AmountChangeDialog',
  component: AmountChangeDialog
} satisfies Meta<typeof AmountChangeDialog>

export default meta
type Story = StoryObj<typeof meta>

function openAmountDialog(type: 'main' | 'rider') {
  const policyStore = usePolicyStore()
  const changeCaseStore = useChangeCaseStore()
  const amountStore = useAmountChangeStore()
  policyStore.$patch({ policyDetail: mockPolicyDetail })
  changeCaseStore.$patch({
    changeCase: {
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150712002',
      acceptanceStatus: 'P',
      changeItems: [type === 'main' ? '002' : '003']
    }
  })
  amountStore.openAmountDialog(type)
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
