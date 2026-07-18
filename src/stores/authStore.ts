import { defineStore } from 'pinia'
import { clearBasicCredentials, setBasicCredentials } from '../api/authSession'
import { isApiError } from '../api/httpClient'
import { findCurrentUser, type CurrentUser } from '../api/posChange'
import { useWorkflowStore } from './workflowStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    securityRequired: true,
    currentUser: null as CurrentUser | null
  }),
  getters: {
    authenticated: (state) => state.initialized && (!state.securityRequired || state.currentUser !== null),
    displayName: (state) => {
      if (!state.initialized) return '確認權限中'
      return state.securityRequired ? (state.currentUser?.username ?? '尚未登入') : '本機開發模式'
    },
    roleDescription: (state) => {
      if (!state.initialized) return '請稍候'
      if (!state.securityRequired) return '經辦與覆核'
      const labels = state.currentUser?.roles.map((role) =>
        role === 'MAKER' ? '經辦' : role === 'REVIEWER' ? '覆核' : role
      )
      return labels?.join('、') || '尚未取得權限'
    }
  },
  actions: {
    hasRole(role: 'MAKER' | 'REVIEWER' | 'USER' | 'ADMIN') {
      if (!this.initialized) return false
      return !this.securityRequired || (this.currentUser?.roles.includes(role) ?? false)
    },
    async initialize() {
      if (this.initialized) return this.currentUser
      try {
        this.currentUser = await findCurrentUser()
        this.securityRequired = this.currentUser.securityEnabled
      } catch (error) {
        this.currentUser = null
        this.securityRequired = true
        if (!isApiError(error) || (error.status !== 401 && error.status !== 403)) {
          useWorkflowStore().setError(error instanceof Error ? error.message : '無法確認登入狀態')
        }
      } finally {
        this.initialized = true
      }
      return this.currentUser
    },
    async login(username: string, password: string) {
      const workflow = useWorkflowStore()
      clearBasicCredentials()
      setBasicCredentials(username, password)
      try {
        this.currentUser = await workflow.run(() => findCurrentUser())
        this.securityRequired = this.currentUser.securityEnabled
        this.initialized = true
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
      this.securityRequired = true
      this.initialized = true
      useWorkflowStore().clearMessage()
    }
  }
})
