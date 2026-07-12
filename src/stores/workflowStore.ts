import { defineStore } from 'pinia'

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    pendingTasks: 0,
    hasError: false,
    message: ''
  }),
  getters: {
    loading: (state) => state.pendingTasks > 0
  },
  actions: {
    clearMessage() {
      this.hasError = false
      this.message = ''
    },
    setMessage(message: string) {
      this.hasError = false
      this.message = message
    },
    setError(message: string) {
      this.hasError = true
      this.message = message
    },
    async run<T>(task: () => Promise<T>, options: { clearMessage?: boolean } = {}): Promise<T> {
      this.pendingTasks += 1
      if (options.clearMessage !== false) this.clearMessage()
      try {
        return await task()
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '作業失敗')
        throw error
      } finally {
        this.pendingTasks = Math.max(0, this.pendingTasks - 1)
      }
    }
  }
})
