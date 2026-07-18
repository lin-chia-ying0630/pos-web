<template>
  <section class="work-view">
    <PolicySearchPanel />
    <div class="section-heading">
      <div>
        <p class="eyebrow">USER AUTHORIZATION</p>
        <h2>使用者授權</h2>
      </div>
    </div>
    <div class="authorization-layout">
      <nav class="authorization-list" aria-label="使用者授權支線清單">
        <button
          v-for="permission in permissions"
          :key="permission.codeBefore"
          type="button"
          :class="{ active: selected?.codeBefore === permission.codeBefore }"
          @click="selected = permission"
        >
          <strong>{{ permission.codeBefore }}</strong>
          <span>{{ permission.codeDescription }}</span>
        </button>
      </nav>
      <section v-if="selected" class="authorization-content" aria-live="polite">
        <p class="eyebrow">{{ selected.codeBefore }}</p>
        <h3>{{ selected.codeDescription }}</h3>
        <dl>
          <div>
            <dt>授權角色</dt>
            <dd>{{ selected.codeAfter }}</dd>
          </div>
          <div>
            <dt>資料表</dt>
            <dd>main.user / authorities</dd>
          </div>
        </dl>
      </section>
      <section v-else class="authorization-content empty-state">請從左側清單選擇授權支線</section>
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
const selected = ref<CodeDescription | null>(null)
const message = ref('')

onMounted(async () => {
  try {
    permissions.value = await findUserAuthorizationPermissions()
    selected.value = permissions.value[0] ?? null
  } catch (error) {
    message.value = error instanceof Error ? error.message : '無法取得使用者授權資料'
  }
})
</script>
