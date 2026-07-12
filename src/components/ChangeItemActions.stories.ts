import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangeItemActions from './ChangeItemActions.vue'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/ChangeItemActions',
  component: ChangeItemActions
} satisfies Meta<typeof ChangeItemActions>

export default meta
type Story = StoryObj<typeof meta>

export const NoCase: Story = {
  render: () => ({
    components: { ChangeItemActions },
    setup() {
      const policyStore = usePolicyStore()
      const changeCaseStore = useChangeCaseStore()
      policyStore.$patch({ policyDetail: mockPolicyDetail })
      changeCaseStore.$patch({ selectedChangeItem: '001', changeCase: null })
      return {}
    },
    template: '<ChangeItemActions />'
  })
}

export const AddressCaseCreated: Story = {
  render: () => ({
    components: { ChangeItemActions },
    setup() {
      const policyStore = usePolicyStore()
      const changeCaseStore = useChangeCaseStore()
      policyStore.$patch({ policyDetail: mockPolicyDetail })
      changeCaseStore.$patch({
        selectedChangeItem: '001',
        changeCase: {
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo: 'C1150710001',
          acceptanceStatus: 'P',
          changeItem: '001'
        }
      })
      return {}
    },
    template: '<ChangeItemActions />'
  })
}
