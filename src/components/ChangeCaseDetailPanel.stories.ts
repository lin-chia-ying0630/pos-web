import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { mockChangeCaseDetail } from '../stories/mockData'
import ChangeCaseDetailPanel from './ChangeCaseDetailPanel.vue'

const meta = {
  title: 'Components/ChangeCaseDetailPanel',
  component: ChangeCaseDetailPanel,
  args: {
    detail: mockChangeCaseDetail,
    viewMode: 'fields',
    onClose: fn()
  }
} satisfies Meta<typeof ChangeCaseDetailPanel>

export default meta
type Story = StoryObj<typeof meta>

export const PendingReview: Story = {}

export const QueryOnly: Story = {
  args: {}
}

export const FileSnapshot: Story = {
  args: {
    viewMode: 'files'
  }
}
