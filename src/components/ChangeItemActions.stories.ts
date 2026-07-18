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
      changeCaseStore.$patch({ selectedChangeItems: ['001', '002'], changeCase: null })
      return {}
    },
    template: '<ChangeItemActions />'
  })
}

export const MultipleChangeCaseCreated: Story = {
  render: () => ({
    components: { ChangeItemActions },
    setup() {
      const policyStore = usePolicyStore()
      const changeCaseStore = useChangeCaseStore()
      policyStore.$patch({ policyDetail: mockPolicyDetail })
      changeCaseStore.$patch({
        selectedChangeItems: ['001', '002'],
        changeCase: {
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo: 'C1150710001',
          acceptanceStatus: 'P',
          changeItems: ['001', '002']
        }
      })
      return {}
    },
    template: '<ChangeItemActions />'
  })
}
