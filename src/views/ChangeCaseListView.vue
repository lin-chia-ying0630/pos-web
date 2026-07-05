<template>
  <section class="work-view">
    <p v-if="store.message" class="message" :class="{ error: store.hasError }">{{ store.message }}</p>
    <section class="review-panel">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>{{ approveMode ? '保全變更覆核' : '保全變更查詢' }}</h2>
      </div>
      <div class="review-query">
        <label>
          <span>保單號碼</span>
          <input v-model.trim="reviewQuery.policyNo" maxlength="10" placeholder="P000000001" />
        </label>
        <button class="primary-button" :disabled="store.loading || !reviewQuery.policyNo" @click="loadChangeCases">
          <Search :size="18" />
          <span>查詢受理資料</span>
        </button>
      </div>

      <div v-if="store.changeCases.length > 0" class="case-table">
        <div class="case-table-head">
          <span>案號</span>
          <span>序號</span>
          <span>變更項目</span>
          <span>狀態</span>
          <span v-if="approveMode">覆核</span>
        </div>
        <div v-for="caseItem in store.changeCases" :key="caseItem.changeCaseNo" class="case-table-row">
          <strong>{{ caseItem.changeCaseNo }}</strong>
          <span>{{ caseItem.policySeq }}</span>
          <span>{{ caseItem.changeItemDescriptions || caseItem.changeItems || '-' }}</span>
          <span>{{ statusDisplay(caseItem) }}</span>
          <div v-if="approveMode" class="case-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="store.loading || !isPendingStatus(caseItem.acceptanceStatus)"
              @click="updateStatus(caseItem, 'C')"
            >
              <X :size="18" />
              <span>取消</span>
            </button>
            <button
              class="primary-button"
              type="button"
              :disabled="store.loading || !isPendingStatus(caseItem.acceptanceStatus)"
              @click="updateStatus(caseItem, 'S')"
            >
              <Save :size="18" />
              <span>完成</span>
            </button>
          </div>
        </div>
      </div>
      <p v-else-if="store.reviewSearched" class="empty-text">查無保全受理資料</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { FileText, Save, Search, X } from '@lucide/vue'
import type { PolicyChangeCase } from '../api/posChange'
import { usePosChangeStore } from '../stores/posChangeStore'
import { isPendingStatus } from '../utils/format'

defineProps<{
  approveMode: boolean
}>()

const store = usePosChangeStore()
const reviewQuery = reactive({
  policyNo: store.lastPolicyNo
})

function loadChangeCases() {
  return store.loadChangeCases(reviewQuery.policyNo)
}

function updateStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
  return store.updateStatus(caseItem, acceptanceStatus)
}

function statusDisplay(caseItem: PolicyChangeCase) {
  return caseItem.acceptanceStatusDescription
    ? `${caseItem.acceptanceStatus} - ${caseItem.acceptanceStatusDescription}`
    : caseItem.acceptanceStatus
}
</script>
