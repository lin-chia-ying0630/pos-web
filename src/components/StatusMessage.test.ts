import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StatusMessage from './StatusMessage.vue'
import { useWorkflowStore } from '../stores/workflowStore'

describe('StatusMessage', () => {
  it('renders success message from store', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWorkflowStore()
    store.$patch({ message: '查詢完成', hasError: false })

    const wrapper = mount(StatusMessage, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('查詢完成')
    expect(wrapper.classes()).not.toContain('error')
  })

  it('renders error class when store has error', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useWorkflowStore()
    store.$patch({ message: '查詢失敗', hasError: true })

    const wrapper = mount(StatusMessage, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('查詢失敗')
    expect(wrapper.classes()).toContain('error')
  })
})
