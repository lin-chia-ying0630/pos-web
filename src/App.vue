<template>
  <main class="app-shell">
    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">保全變更系統</p>
          <h1>保全變更作業</h1>
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
          <RouterLink v-if="authStore.hasRole('MAKER')" class="side-menu-item" to="/change/create">
            <Plus :size="18" />
            <span>新增保全變更</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/change/query">
            <Search :size="18" />
            <span>查詢保全變更</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/policy/query">
            <Search :size="18" />
            <span>查詢保單主檔</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/policy/address"
            ><Search :size="18" /><span>查詢保單地址</span></RouterLink
          >
          <RouterLink class="side-menu-item" to="/policy/rides"
            ><Search :size="18" /><span>查詢保單主附約</span></RouterLink
          >
          <RouterLink v-if="authStore.hasRole('REVIEWER')" class="side-menu-item" to="/change/review">
            <FileText :size="18" />
            <span>覆核</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/user/authorization">
            <UserRound :size="18" />
            <span>使用者授權</span>
          </RouterLink>
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
          <RouterView />
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { FileText, LogOut, Plus, Search, UserRound } from '@lucide/vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useChangeCaseStore } from './stores/changeCaseStore'

const changeCaseStore = useChangeCaseStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

function logout() {
  authStore.logout()
  return router.push('/login')
}
</script>
