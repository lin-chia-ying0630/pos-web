import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangeItemActions from './ChangeItemActions.vue'
import { usePosChangeStore } from '../stores/posChangeStore'
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
      const store = usePosChangeStore()
      store.$patch({ policyDetail: mockPolicyDetail, selectedChangeItem: '001', changeCase: null })
      return {}
    },
    template: '<ChangeItemActions />'
  })
}

export const AddressCaseCreated: Story = {
  render: () => ({
    components: { ChangeItemActions },
    setup() {
      const store = usePosChangeStore()
      store.$patch({
        policyDetail: mockPolicyDetail,
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
