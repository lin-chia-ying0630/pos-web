import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PolicySummary from './PolicySummary.vue'
import { usePosChangeStore } from '../stores/posChangeStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/PolicySummary',
  component: PolicySummary
} satisfies Meta<typeof PolicySummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { PolicySummary },
    setup() {
      const store = usePosChangeStore()
      store.$patch({ policyDetail: mockPolicyDetail })
      return {}
    },
    template: '<PolicySummary />'
  })
}
