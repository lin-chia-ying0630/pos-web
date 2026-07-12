<template>
  <div v-if="store.amountDialogOpen" class="dialog-backdrop" @click.self="store.closeAmountDialog">
    <section class="dialog">
      <header class="dialog-header">
        <h2>{{ store.amountDialogTitle }}</h2>
        <button class="icon-button" type="button" title="關閉" @click="store.closeAmountDialog">
          <X :size="18" />
        </button>
      </header>

      <div class="address-dialog-body">
        <section class="amount-list-section">
          <h3>{{ store.amountDialogSubtitle }}</h3>
          <div v-if="store.amountDialogType === 'main'" class="form-grid">
            <label>
              <span>保單號碼</span>
              <input :value="store.policyDetail?.master.policyNo ?? '-'" disabled />
            </label>
            <label>
              <span>序號</span>
              <input :value="store.policyDetail?.master.policySeq ?? '-'" disabled />
            </label>
            <label>
              <span>主約險種</span>
              <input :value="store.policyDetail?.master.mainProductCode ?? '-'" disabled />
            </label>
            <label>
              <span>主約年期</span>
              <input :value="store.policyDetail?.master.mainPolicyYears ?? '-'" disabled />
            </label>
            <label>
              <span>目前保額</span>
              <input :value="formatNumber(store.policyDetail?.master.insuredAmount ?? 0, 2)" disabled />
            </label>
            <label>
              <span>變更後保額</span>
              <input v-model.number="store.amountForm.masterInsuredAmount" type="number" min="0" step="0.01" />
            </label>
            <label>
              <span>總保費</span>
              <input :value="formatNumber(store.policyDetail?.master.premium ?? 0, 4)" disabled />
            </label>
          </div>

          <div v-else class="amount-table">
            <div v-for="ride in store.amountForm.rides" :key="ride.rideOrder" class="amount-table-row">
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

        <p v-if="store.dialogMessage" class="dialog-message" :class="{ error: store.hasError }">
          {{ store.dialogMessage }}
        </p>
      </div>

      <footer class="dialog-actions">
        <button class="secondary-button" type="button" @click="store.closeAmountDialog">取消</button>
        <button class="primary-button" type="button" :disabled="store.loading" @click="store.saveAmountForm">
          <Save :size="18" />
          <span>儲存</span>
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Save, X } from '@lucide/vue'
import { usePosChangeStore } from '../stores/posChangeStore'
import { formatNumber } from '../utils/format'

const store = usePosChangeStore()
</script>
