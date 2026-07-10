import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangeCaseListPanel from './ChangeCaseListPanel.vue'
import { usePosChangeStore } from '../stores/posChangeStore'
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
      const store = usePosChangeStore()
      store.$patch({ changeCases: mockChangeCases, reviewSearched: true, lastPolicyNo: 'P000000001' })
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
      const store = usePosChangeStore()
      store.$patch({ changeCases: mockChangeCases, reviewSearched: true, lastPolicyNo: 'P000000001' })
      return { args }
    },
    template: '<ChangeCaseListPanel v-bind="args" />'
  })
}
