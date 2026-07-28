<template>
  <section :class="{ 'panel policy-service-panel': title }">
    <!-- 保單服務共用與代碼對照表相同的標題列：名稱靠左，新增按鈕固定靠右。 -->
    <div v-if="title" class="panel-title">
      <FileText :size="18" />
      <h2>{{ title }}</h2>
      <button v-if="showAdd" class="primary-button code-add-button" type="button" @click="emit('add')">
        {{ addLabel }}
      </button>
    </div>
    <div class="query-panel" :class="{ 'policy-query-controls': title }">
      <label>
        <span>{{ chtLabel('policyNo') }}</span>
        <input
          v-model.trim="policyStore.createQuery.policyNo"
          :maxlength="POLICY_NO_MAX_LENGTH"
          placeholder="P000000001"
        />
      </label>
      <label>
        <span>{{ chtLabel('policySeq') }}</span>
        <input v-model.number="policyStore.createQuery.policySeq" type="number" min="1" max="999" />
      </label>
      <button class="primary-button" :disabled="workflow.loading" @click="policyStore.loadPolicyFromCreateQuery">
        <Search :size="18" />
        <span>查詢</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FileText, Search } from '@lucide/vue'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import { onMounted } from 'vue'
import { POLICY_NO_MAX_LENGTH } from '../domain/domainConstraints'

const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
const { label: chtLabel, load } = useChtFieldNames()
onMounted(load)
withDefaults(defineProps<{ title?: string; addLabel?: string; showAdd?: boolean }>(), {
  title: '',
  addLabel: '',
  showAdd: false
})
const emit = defineEmits<{ add: [] }>()
</script>
