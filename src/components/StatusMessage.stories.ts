import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatusMessage from './StatusMessage.vue'
import { useWorkflowStore } from '../stores/workflowStore'

const meta = {
  title: 'Components/StatusMessage',
  component: StatusMessage
} satisfies Meta<typeof StatusMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  render: () => ({
    components: { StatusMessage },
    setup() {
      const store = useWorkflowStore()
      store.$patch({ message: '查詢完成', hasError: false })
      return {}
    },
    template: '<StatusMessage />'
  })
}

export const Error: Story = {
  render: () => ({
    components: { StatusMessage },
    setup() {
      const store = useWorkflowStore()
      store.$patch({ message: '查無保單資料', hasError: true })
      return {}
    },
    template: '<StatusMessage />'
  })
}
