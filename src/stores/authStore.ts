import { defineStore } from 'pinia'
import { clearBasicCredentials, setBasicCredentials } from '../api/authSession'
import { findCurrentUser, type CurrentUser } from '../api/posChange'
import { useWorkflowStore } from './workflowStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    securityRequired: import.meta.env.VITE_API_SECURITY_ENABLED === 'true',
    currentUser: null as CurrentUser | null
  }),
  getters: {
    authenticated: (state) => !state.securityRequired || state.currentUser !== null
  },
  actions: {
    hasRole(role: 'MAKER' | 'REVIEWER') {
      return !this.securityRequired || (this.currentUser?.roles.includes(role) ?? false)
    },
    async login(username: string, password: string) {
      const workflow = useWorkflowStore()
      clearBasicCredentials()
      setBasicCredentials(username, password)
      try {
        this.currentUser = await workflow.run(() => findCurrentUser())
        workflow.setMessage(`歡迎 ${this.currentUser.username}`)
        return this.currentUser
      } catch (error) {
        clearBasicCredentials()
        this.currentUser = null
        throw error
      }
    },
    logout() {
      clearBasicCredentials()
      this.currentUser = null
      useWorkflowStore().clearMessage()
    }
  }
})
