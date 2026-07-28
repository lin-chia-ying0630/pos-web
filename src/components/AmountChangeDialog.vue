<template>
  <DialogShell
    v-if="amountStore.amountDialogOpen"
    :title="amountStore.amountDialogTitle"
    @close="amountStore.closeAmountDialog"
  >
    <div class="address-dialog-body">
      <section class="amount-list-section">
        <h3>{{ amountStore.amountDialogSubtitle }}</h3>
        <div v-if="amountStore.amountDialogType === 'main'" class="form-grid">
          <label>
            <span>{{ chtLabel('policyNo') }}</span>
            <input :value="policyStore.policyDetail?.master.policyNo ?? '-'" disabled />
          </label>
          <label>
            <span>{{ chtLabel('policySeq') }}</span>
            <input :value="policyStore.policyDetail?.master.policySeq ?? '-'" disabled />
          </label>
          <label>
            <span>{{ chtLabel('productCode') }}</span>
            <input :value="mainRide?.productCode ?? '-'" disabled />
          </label>
          <label>
            <span>{{ chtLabel('coverageTermYears') }}</span>
            <input :value="mainRide?.coverageTermYears ?? '-'" disabled />
          </label>
          <label>
            <span>{{ chtLabel('insuredAmount') }}</span>
            <input :value="formatNumber(mainRide?.insuredAmount ?? 0, 2)" disabled />
          </label>
          <label>
            <span>{{ chtLabel('insuredAmount') }}</span>
            <input v-model.number="amountStore.amountForm.insuredAmount" type="number" min="0" step="0.01" />
          </label>
          <label>
            <span>{{ chtLabel('premiumAmount') }}</span>
            <input :value="formatNumber(policyStore.policyDetail?.master.premiumAmount ?? 0, 4)" disabled />
          </label>
        </div>

        <div v-else class="amount-table">
          <div v-for="ride in visibleRiderCoverages" :key="ride.coverageItemSeq" class="amount-table-row">
            <div class="form-grid">
              <label>
                <span>{{ chtLabel('coverageItemSeq') }}</span>
                <input :value="ride.coverageItemSeq" disabled />
              </label>
              <label>
                <span>{{ chtLabel('coverageItemType') }}</span>
                <input :value="ride.coverageItemType" disabled />
              </label>
              <label>
                <span>{{ chtLabel('productCode') }}</span>
                <input :value="ride.productCode" disabled />
              </label>
              <label>
                <span>{{ chtLabel('coverageTermYears') }}</span>
                <input :value="ride.coverageTermYears" disabled />
              </label>
              <label>
                <span>{{ chtLabel('insuredAmount') }}</span>
                <input :value="formatNumber(ride.currentInsuredAmount, 2)" disabled />
              </label>
              <label>
                <span>{{ chtLabel('insuredAmount') }}</span>
                <input v-model.number="ride.insuredAmount" type="number" min="0" step="0.01" />
              </label>
              <label>
                <span>{{ chtLabel('premiumAmount') }}</span>
                <input :value="formatNumber(ride.premiumAmount, 4)" disabled />
              </label>
            </div>
          </div>
        </div>
      </section>

      <p v-if="amountStore.dialogMessage" class="dialog-message" :class="{ error: workflow.hasError }">
        {{ amountStore.dialogMessage }}
      </p>
    </div>
    <template #footer>
      <button class="secondary-button" type="button" @click="amountStore.closeAmountDialog">取消</button>
      <button class="primary-button" type="button" :disabled="workflow.loading" @click="amountStore.saveAmountForm">
        <Save :size="18" />
        <span>儲存</span>
      </button>
    </template>
  </DialogShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Save } from '@lucide/vue'
import { isRiderCoverage, useAmountChangeStore } from '../stores/amountChangeStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { formatNumber } from '../utils/format'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import DialogShell from './DialogShell.vue'

const amountStore = useAmountChangeStore()
const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
const { label: chtLabel, load } = useChtFieldNames()
const mainRide = computed(() => policyStore.policyDetail?.rideList.find((ride) => ride.coverageItemSeq === '000'))
// 渲染層保留相同業務防護，避免熱更新或舊頁面狀態殘留 BASE/000 主約。
const visibleRiderCoverages = computed(() => amountStore.amountForm.rides.filter(isRiderCoverage))
onMounted(load)
</script>
