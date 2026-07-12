import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangeCaseListPanel from './ChangeCaseListPanel.vue'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { mockChangeCases } from '../stories/mockData'

const meta = {
  title: 'Components/ChangeCaseListPanel',
  component: ChangeCaseListPanel,
  args: {
    approveMode: false
  }
} satisfies Meta<typeof ChangeCaseListPanel>

export default meta
type Story = StoryObj<typeof meta>

export const QueryMode: Story = {
  render: (args) => ({
    components: { ChangeCaseListPanel },
    setup() {
      const store = useChangeCaseStore()
      const policyStore = usePolicyStore()
      store.$patch({ changeCases: mockChangeCases, reviewSearched: true })
      policyStore.$patch({ lastPolicyNo: 'P000000001' })
      return { args }
    },
    template: '<ChangeCaseListPanel v-bind="args" />'
  })
}

export const ReviewMode: Story = {
  args: {
    approveMode: true
  },
  render: (args) => ({
    components: { ChangeCaseListPanel },
    setup() {
      const store = useChangeCaseStore()
      const policyStore = usePolicyStore()
      store.$patch({ changeCases: mockChangeCases, reviewSearched: true })
      policyStore.$patch({ lastPolicyNo: 'P000000001' })
      return { args }
    },
    template: '<ChangeCaseListPanel v-bind="args" />'
  })
}
