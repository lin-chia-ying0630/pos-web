<template>
  <main class="app-shell">
    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">保單服務系統</p>
          <h1>保單服務作業</h1>
        </div>
        <div v-if="changeCaseStore.changeCase && route.name !== 'login'" class="case-badge">
          <span>案號</span>
          <strong>{{ changeCaseStore.changeCase.changeCaseNo }}</strong>
        </div>
      </header>

      <div class="work-layout" :class="{ 'login-layout': route.name === 'login' }">
        <aside v-if="route.name !== 'login'" class="side-menu">
          <div class="account-summary" data-testid="account-summary">
            <UserRound :size="20" />
            <span>
              <strong>{{ authStore.displayName }}</strong>
              <small>{{ authStore.roleDescription }}</small>
            </span>
          </div>
          <p v-if="navigationState === 'loading'" class="side-menu-state" role="status">正在載入功能選單…</p>
          <p v-else-if="navigationState === 'error'" class="side-menu-state error" role="alert">
            功能選單載入失敗，請重新登入
          </p>
          <!-- 導覽項目由 Router meta 產生，避免頁面、權限與選單維護成兩份。 -->
          <template v-for="group in navigationState === 'ready' ? authorizedNavigation : []" :key="group.key">
            <RouterLink v-if="group.standalone" class="side-menu-item" :to="group.items[0].path">
              <component :is="navigationIcons[group.icon]" :size="18" />
              <span>{{ group.label }}</span>
            </RouterLink>
            <details v-else class="side-menu-group" :open="group.active">
              <summary class="side-menu-group-title" :class="{ active: group.active }">
                <component :is="navigationIcons[group.icon]" :size="18" />
                <span>{{ group.label }}</span>
              </summary>
              <nav :aria-label="`${group.label}功能`">
                <RouterLink
                  v-for="item in group.items"
                  :key="item.path"
                  class="side-menu-item side-menu-subitem"
                  :to="item.path"
                >
                  <small v-if="item.functionCode" class="side-menu-function-code">{{ item.functionCode }}</small>
                  <span>{{ item.label }}</span>
                </RouterLink>
              </nav>
            </details>
          </template>
          <button
            v-if="authStore.securityRequired && authStore.authenticated"
            class="side-menu-item"
            type="button"
            @click="logout"
          >
            <LogOut :size="18" />
            <span>登出</span>
          </button>
        </aside>

        <section class="work-content">
          <div v-if="currentFunctionCode" class="function-code-badge">
            <span>功能代碼：</span>
            <strong>{{ currentFunctionCode }}</strong>
          </div>
          <RouterView />
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ClipboardCheck, LogOut, ShieldCheck, TableProperties, UserCog, UserRound, Wrench } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { findFunctionCodes, findNavigationLabels, type CodeDescription } from './api/posChange'
import { isRouteAuthorized, navigationGroups } from './router'
import { useAuthStore } from './stores/authStore'
import { useChangeCaseStore } from './stores/changeCaseStore'

const changeCaseStore = useChangeCaseStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const functionCodes = ref<CodeDescription[]>([])
const navigationLabels = ref<CodeDescription[]>([])
const navigationState = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const navigationIcons = {
  wrench: Wrench,
  shield: ShieldCheck,
  table: TableProperties,
  review: ClipboardCheck,
  user: UserCog
}
// 功能代碼由後端 main-screen/function_code 優先提供；路由只保存 API 無法使用時的核准備援值。
function resolveFunctionCode(functionKey?: string, configuredCode?: string) {
  if (!functionKey) return configuredCode ?? ''
  const databaseCode = functionCodes.value.find((code) => code.codeAfter === functionKey)?.codeBefore
  return databaseCode && /^M(PS|PM|CM|US)\d{5}$/.test(databaseCode) ? databaseCode : (configuredCode ?? '')
}

const currentFunctionCode = computed(() => {
  return resolveFunctionCode(
    route.meta.functionKey as string | undefined,
    route.meta.functionCode as string | undefined
  )
})

// 子選單只提供路徑，功能識別與備援代碼一律沿用集中管理的路由設定。
function resolveMenuFunctionCode(path: string) {
  const resolvedRoute = router.resolve(path)
  return resolveFunctionCode(
    resolvedRoute.meta.functionKey as string | undefined,
    resolvedRoute.meta.functionCode as string | undefined
  )
}

function resolveNavigationLabel(key: string) {
  // ready 狀態仍缺少資料代表後端種子不完整；不要把技術 key 顯示給使用者。
  return navigationLabels.value.find((code) => code.codeBefore === key)?.codeDescription ?? ''
}

const authorizedNavigation = computed(() =>
  navigationGroups
    .map((group) => {
      const items = router
        .getRoutes()
        .filter((item) => item.meta.menuGroup === group.key && isRouteAuthorized(authStore, item))
        .sort((left, right) => (left.meta.menuOrder ?? 0) - (right.meta.menuOrder ?? 0))
        .map((item) => ({
          path: item.path,
          label: resolveNavigationLabel(`route.${String(item.name ?? item.path)}`),
          functionCode: resolveMenuFunctionCode(item.path)
        }))
      return {
        ...group,
        label: resolveNavigationLabel(`group.${group.key}`),
        items,
        active: items.some((item) => item.path === route.path)
      }
    })
    .filter((group) => group.items.length)
)

watch(
  () => authStore.authenticated,
  async (authenticated) => {
    if (!authenticated) {
      navigationState.value = 'idle'
      return
    }
    navigationState.value = 'loading'
    const [functionCodeResult, navigationLabelResult] = await Promise.allSettled([
      functionCodes.value.length ? Promise.resolve(functionCodes.value) : findFunctionCodes(),
      navigationLabels.value.length ? Promise.resolve(navigationLabels.value) : findNavigationLabels()
    ])
    functionCodes.value = functionCodeResult.status === 'fulfilled' ? functionCodeResult.value : []
    navigationLabels.value = navigationLabelResult.status === 'fulfilled' ? navigationLabelResult.value : []
    navigationState.value =
      functionCodeResult.status === 'fulfilled' &&
      navigationLabelResult.status === 'fulfilled' &&
      navigationLabels.value.length > 0
        ? 'ready'
        : 'error'
  },
  { immediate: true }
)

function logout() {
  authStore.logout()
  return router.push('/login')
}
</script>
