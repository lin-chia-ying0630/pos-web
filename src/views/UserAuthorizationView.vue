<template>
  <section class="work-view">
    <PolicySearchPanel />
    <div class="section-heading">
      <div>
        <p class="eyebrow">USER AUTHORIZATION</p>
        <h2>使用者授權</h2>
      </div>
    </div>
    <div class="data-table" aria-label="使用者授權支線清單">
      <div class="data-row data-header"><strong>支線</strong><strong>功能</strong><strong>授權角色</strong></div>
      <div v-for="permission in permissions" :key="permission.codeBefore" class="data-row">
        <strong>{{ permission.codeBefore }}</strong>
        <span>{{ permission.codeDescription }}</span>
        <span>{{ permission.codeAfter }}</span>
      </div>
    </div>
    <StatusMessage v-if="message" :message="message" tone="error" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { findUserAuthorizationPermissions, type CodeDescription } from '../api/posChange'
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import StatusMessage from '../components/StatusMessage.vue'

const permissions = ref<CodeDescription[]>([])
const message = ref('')

onMounted(async () => {
  try {
    permissions.value = await findUserAuthorizationPermissions()
  } catch (error) {
    message.value = error instanceof Error ? error.message : '無法取得使用者授權資料'
  }
})
</script>
