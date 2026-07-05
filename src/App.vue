<template>
  <main class="app-shell">
    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">POS Change</p>
          <h1>保全變更作業</h1>
        </div>
        <div v-if="store.changeCase" class="case-badge">
          <span>案號</span>
          <strong>{{ store.changeCase.changeCaseNo }}</strong>
        </div>
      </header>

      <div class="work-layout">
        <aside class="side-menu">
          <RouterLink class="side-menu-item" to="/change/create">
            <Plus :size="18" />
            <span>新增保全變更</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/change/query">
            <Search :size="18" />
            <span>查詢保全變更</span>
          </RouterLink>
          <RouterLink class="side-menu-item" to="/change/review">
            <FileText :size="18" />
            <span>覆核</span>
          </RouterLink>
        </aside>

        <section class="work-content">
          <RouterView />
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { FileText, Plus, Search } from '@lucide/vue'
import { RouterLink, RouterView } from 'vue-router'
import { usePosChangeStore } from './stores/posChangeStore'

const store = usePosChangeStore()
</script>
