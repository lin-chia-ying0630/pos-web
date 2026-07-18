import { createRouter, createWebHistory } from 'vue-router'
import type { Pinia } from 'pinia'
import CreateChangeView from '../views/CreateChangeView.vue'
import LoginView from '../views/LoginView.vue'
import QueryChangeView from '../views/QueryChangeView.vue'
import ReviewChangeView from '../views/ReviewChangeView.vue'
import UserAuthorizationView from '../views/UserAuthorizationView.vue'
import { useAuthStore } from '../stores/authStore'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/change/create' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/change/create', name: 'change-create', component: CreateChangeView, meta: { role: 'MAKER' } },
    { path: '/change/query', name: 'change-query', component: QueryChangeView },
    { path: '/change/review', name: 'change-review', component: ReviewChangeView, meta: { role: 'REVIEWER' } },
    { path: '/user/authorization', name: 'user-authorization', component: UserAuthorizationView }
  ]
})

export function installAuthGuard(pinia: Pinia) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia)
    await authStore.initialize()
    if (!authStore.securityRequired) {
      return to.name === 'login' ? '/change/create' : true
    }
    if (to.name === 'login') {
      return authStore.authenticated ? '/change/create' : true
    }
    if (!authStore.authenticated) return '/login'
    const role = to.meta.role as 'MAKER' | 'REVIEWER' | undefined
    if (role && !authStore.hasRole(role)) return '/change/query'
    return true
  })
}
