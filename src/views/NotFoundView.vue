<template>
  <section class="panel not-found-view">
    <p class="eyebrow">404</p>
    <h2>找不到此頁面</h2>
    <p>網址可能已變更，請回到您有權限使用的功能。</p>
    <RouterLink class="primary-button" :to="homePath">返回功能首頁</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { firstAuthorizedPath } from '../router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const homePath = computed(() => firstAuthorizedPath(authStore))
</script>
