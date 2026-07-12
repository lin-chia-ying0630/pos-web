<template>
  <div v-if="amountStore.amountDialogOpen" class="dialog-backdrop" @click.self="amountStore.closeAmountDialog">
    <section class="dialog">
      <header class="dialog-header">
        <h2>{{ amountStore.amountDialogTitle }}</h2>
        <button class="icon-button" type="button" title="關閉" @click="amountStore.closeAmountDialog">
          <X :size="18" />
        </button>
      </header>

      <div class="address-dialog-body">
        <section class="amount-list-section">
          <h3>{{ amountStore.amountDialogSubtitle }}</h3>
          <div v-if="amountStore.amountDialogType === 'main'" class="form-grid">
            <label>
              <span>保單號碼</span>
              <input :value="policyStore.policyDetail?.master.policyNo ?? '-'" disabled />
            </label>
            <label>
              <span>序號</span>
              <input :value="policyStore.policyDetail?.master.policySeq ?? '-'" disabled />
            </label>
            <label>
              <span>主約險種</span>
              <input :value="policyStore.policyDetail?.master.mainProductCode ?? '-'" disabled />
            </label>
            <label>
              <span>主約年期</span>
              <input :value="policyStore.policyDetail?.master.mainPolicyYears ?? '-'" disabled />
            </label>
            <label>
              <span>目前保額</span>
              <input :value="formatNumber(policyStore.policyDetail?.master.insuredAmount ?? 0, 2)" disabled />
            </label>
            <label>
              <span>變更後保額</span>
              <input v-model.number="amountStore.amountForm.masterInsuredAmount" type="number" min="0" step="0.01" />
            </label>
            <label>
              <span>總保費</span>
              <input :value="formatNumber(policyStore.policyDetail?.master.premium ?? 0, 4)" disabled />
            </label>
          </div>

          <div v-else class="amount-table">
            <div v-for="ride in amountStore.amountForm.rides" :key="ride.rideOrder" class="amount-table-row">
              <div class="form-grid">
                <label>
                  <span>附約序號</span>
                  <input :value="ride.rideOrder" disabled />
                </label>
                <label>
                  <span>附約型態</span>
                  <input :value="ride.rideType" disabled />
                </label>
                <label>
                  <span>險種</span>
                  <input :value="ride.productCode" disabled />
                </label>
                <label>
                  <span>年期</span>
                  <input :value="ride.policyYears" disabled />
                </label>
                <label>
                  <span>目前保額</span>
                  <input :value="formatNumber(ride.currentInsuredAmount, 2)" disabled />
                </label>
                <label>
                  <span>變更後保額</span>
                  <input v-model.number="ride.insuredAmount" type="number" min="0" step="0.01" />
                </label>
                <label>
                  <span>附約保費</span>
                  <input :value="formatNumber(ride.premium, 4)" disabled />
                </label>
              </div>
            </div>
          </div>
        </section>

        <p v-if="amountStore.dialogMessage" class="dialog-message" :class="{ error: workflow.hasError }">
          {{ amountStore.dialogMessage }}
        </p>
      </div>

      <footer class="dialog-actions">
        <button class="secondary-button" type="button" @click="amountStore.closeAmountDialog">取消</button>
        <button class="primary-button" type="button" :disabled="workflow.loading" @click="amountStore.saveAmountForm">
          <Save :size="18" />
          <span>儲存</span>
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Save, X } from '@lucide/vue'
import { useAmountChangeStore } from '../stores/amountChangeStore'
import { usePolicyStore } from '../stores/policyStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { formatNumber } from '../utils/format'

const amountStore = useAmountChangeStore()
const policyStore = usePolicyStore()
const workflow = useWorkflowStore()
</script>
