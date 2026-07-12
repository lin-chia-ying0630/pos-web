<template>
  <section class="login-view">
    <form class="login-form" @submit.prevent="login">
      <div>
        <p class="eyebrow">POS Security</p>
        <h2>登入保全變更作業</h2>
        <p class="login-hint">請使用經辦或覆核帳號登入，系統會依角色顯示可執行功能。</p>
      </div>
      <label>
        <span>帳號</span>
        <input v-model.trim="form.username" autocomplete="username" required />
      </label>
      <label>
        <span>密碼</span>
        <input v-model="form.password" autocomplete="current-password" required type="password" />
      </label>
      <StatusMessage />
      <button class="primary-button" :disabled="workflow.loading" type="submit">
        <LogIn :size="18" />
        <span>登入</span>
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { LogIn } from '@lucide/vue'
import { useRouter } from 'vue-router'
import StatusMessage from '../components/StatusMessage.vue'
import { useAuthStore } from '../stores/authStore'
import { useWorkflowStore } from '../stores/workflowStore'

const authStore = useAuthStore()
const workflow = useWorkflowStore()
const router = useRouter()
const form = reactive({ username: '', password: '' })

async function login() {
  try {
    const user = await authStore.login(form.username, form.password)
    const target = user.roles.includes('MAKER')
      ? '/change/create'
      : user.roles.includes('REVIEWER')
        ? '/change/review'
        : '/change/query'
    await router.push(target)
  } catch {
    // workflowStore 已顯示後端回傳的登入錯誤，保留表單讓使用者修正。
  }
}
</script>
