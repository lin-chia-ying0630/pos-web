import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router'
import type { Pinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useWorkflowStore } from '../stores/workflowStore'

export type AppRole = 'MAKER' | 'REVIEWER' | 'USER' | 'ADMIN'
export type NavigationGroupKey = 'change' | 'policy' | 'code' | 'review' | 'authorization'

declare module 'vue-router' {
  interface RouteMeta {
    role?: AppRole
    roles?: AppRole[]
    functionKey?: string
    functionCode?: string
    menuGroup?: NavigationGroupKey
    menuOrder?: number
  }
}

export const navigationGroups: Array<{
  key: NavigationGroupKey
  icon: 'wrench' | 'shield' | 'table' | 'review' | 'user'
  standalone?: boolean
  order: number
}> = [
  { key: 'change', icon: 'wrench', order: 10 },
  { key: 'policy', icon: 'shield', order: 20 },
  { key: 'code', icon: 'table', order: 30 },
  { key: 'review', icon: 'review', order: 40 },
  { key: 'authorization', icon: 'user', standalone: true, order: 50 }
]

// 頁面、權限、功能代碼與側邊選單名稱集中在 Router；App 不再另外維護一份畫面清單。
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/change/create' },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/change/create',
    name: 'change-create',
    component: () => import('../views/CreateChangeView.vue'),
    meta: {
      role: 'MAKER',
      functionKey: 'CREATE',
      functionCode: 'MPS00001',
      menuGroup: 'change',
      menuOrder: 10
    }
  },
  {
    path: '/change/query',
    name: 'change-query',
    component: () => import('../views/QueryChangeView.vue'),
    meta: {
      functionKey: 'QUERY_CHANGE',
      functionCode: 'MPS00002',
      menuGroup: 'change',
      menuOrder: 20
    }
  },
  {
    path: '/policy/query',
    name: 'policy-query',
    component: () => import('../views/PolicyQueryView.vue'),
    meta: {
      functionKey: 'QUERY_MASTER',
      functionCode: 'MPM00001',
      menuGroup: 'policy',
      menuOrder: 10
    }
  },
  {
    path: '/policy/address',
    name: 'policy-address-query',
    component: () => import('../views/PolicyAddressQueryView.vue'),
    meta: {
      functionKey: 'QUERY_ADDRESS',
      functionCode: 'MPM00002',
      menuGroup: 'policy',
      menuOrder: 20
    }
  },
  {
    path: '/policy/rides',
    name: 'policy-ride-query',
    component: () => import('../views/PolicyRideQueryView.vue'),
    meta: {
      functionKey: 'QUERY_RIDE',
      functionCode: 'MPM00003',
      menuGroup: 'policy',
      menuOrder: 30
    }
  },
  {
    path: '/policy/maintenance/master',
    name: 'policy-master-maintenance',
    component: () => import('../views/PolicyMaintenanceView.vue'),
    props: { entity: 'master' },
    meta: {
      roles: ['MAKER', 'ADMIN'],
      functionKey: 'MAINTAIN_MASTER',
      functionCode: 'MPM00004',
      menuGroup: 'policy',
      menuOrder: 40
    }
  },
  {
    path: '/policy/maintenance/address',
    name: 'policy-address-maintenance',
    component: () => import('../views/PolicyMaintenanceView.vue'),
    props: { entity: 'address' },
    meta: {
      roles: ['MAKER', 'ADMIN'],
      functionKey: 'MAINTAIN_ADDRESS',
      functionCode: 'MPM00005',
      menuGroup: 'policy',
      menuOrder: 50
    }
  },
  {
    path: '/policy/maintenance/rides',
    name: 'policy-ride-maintenance',
    component: () => import('../views/PolicyMaintenanceView.vue'),
    props: { entity: 'ride' },
    meta: {
      roles: ['MAKER', 'ADMIN'],
      functionKey: 'MAINTAIN_RIDE',
      functionCode: 'MPM00006',
      menuGroup: 'policy',
      menuOrder: 60
    }
  },
  {
    path: '/codes',
    name: 'code-query',
    component: () => import('../views/CodeQueryView.vue'),
    props: { maintenance: false },
    meta: {
      roles: ['MAKER', 'REVIEWER'],
      functionKey: 'CODE_TABLE',
      functionCode: 'MCM00001',
      menuGroup: 'code',
      menuOrder: 10
    }
  },
  {
    path: '/codes/maintenance',
    name: 'code-maintenance',
    component: () => import('../views/CodeQueryView.vue'),
    props: { maintenance: true },
    meta: {
      roles: ['MAKER', 'ADMIN'],
      functionKey: 'CODE_MAINTENANCE',
      functionCode: 'MCM00002',
      menuGroup: 'code',
      menuOrder: 20
    }
  },
  {
    path: '/change/reviews',
    name: 'change-review-center',
    component: () => import('../views/ChangeReviewCenterView.vue'),
    meta: {
      role: 'REVIEWER',
      functionKey: 'REVIEW',
      functionCode: 'MPS00003',
      menuGroup: 'review',
      menuOrder: 10
    }
  },
  {
    path: '/change/review',
    name: 'change-review',
    component: () => import('../views/ReviewChangeView.vue'),
    meta: {
      role: 'REVIEWER',
      functionKey: 'REVIEW',
      functionCode: 'MPS00003',
      menuGroup: 'review',
      menuOrder: 20
    }
  },
  {
    path: '/user/authorization',
    name: 'user-authorization',
    component: () => import('../views/UserAuthorizationView.vue'),
    meta: {
      roles: ['USER', 'ADMIN'],
      functionKey: 'USER_AUTHORIZATION',
      functionCode: 'MUS00001',
      menuGroup: 'authorization',
      menuOrder: 10
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export function isRouteAuthorized(
  authStore: ReturnType<typeof useAuthStore>,
  route: Pick<RouteLocationNormalized, 'meta'>
) {
  const { role, roles, functionCode } = route.meta
  return (
    (!role || authStore.hasRole(role)) &&
    (!roles || authStore.hasAnyRole(roles)) &&
    (!functionCode || authStore.hasFunction(functionCode))
  )
}

export function firstAuthorizedPath(authStore: ReturnType<typeof useAuthStore>) {
  const groupOrder = new Map(navigationGroups.map((group) => [group.key, group.order]))
  return (
    router
      .getRoutes()
      .filter((route) => route.meta.menuGroup)
      .sort((left, right) => {
        const leftGroupOrder = groupOrder.get(left.meta.menuGroup!) ?? 0
        const rightGroupOrder = groupOrder.get(right.meta.menuGroup!) ?? 0
        return leftGroupOrder - rightGroupOrder || (left.meta.menuOrder ?? 0) - (right.meta.menuOrder ?? 0)
      })
      .find((route) => isRouteAuthorized(authStore, route))?.path ?? '/login'
  )
}

export function installAuthGuard(pinia: Pinia) {
  router.beforeEach(async (to) => {
    // 訊息屬於產生它的作業頁；切換路由時集中清除，避免上一頁的成功或錯誤訊息殘留。
    useWorkflowStore(pinia).clearMessage()
    const authStore = useAuthStore(pinia)
    await authStore.initialize()
    if (!authStore.securityRequired) return to.name === 'login' ? firstAuthorizedPath(authStore) : true
    if (to.name === 'login') return authStore.authenticated ? firstAuthorizedPath(authStore) : true
    if (!authStore.authenticated) return { path: '/login', query: { redirect: to.fullPath } }
    return isRouteAuthorized(authStore, to) ? true : firstAuthorizedPath(authStore)
  })
}
