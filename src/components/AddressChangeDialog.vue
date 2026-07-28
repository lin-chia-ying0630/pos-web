<template>
  <div v-if="addressStore.addressDialogOpen" class="dialog-backdrop" @click.self="addressStore.closeAddressDialog">
    <section class="dialog">
      <header class="dialog-header">
        <h2>保單地址</h2>
        <button class="icon-button" type="button" title="關閉" @click="addressStore.closeAddressDialog">
          <X :size="18" />
        </button>
      </header>

      <div class="address-dialog-body">
        <section class="address-list-section">
          <h3>修改前相關資料清單</h3>
          <div class="address-table">
            <button
              v-for="address in addressStore.availableAddresses"
              :key="address.addressTypeCode"
              class="address-row"
              :class="{ selected: addressStore.selectedAddressType === address.addressTypeCode }"
              type="button"
              @click="addressStore.selectAddress(address)"
            >
              <span class="address-check">
                {{ addressStore.selectedAddressType === address.addressTypeCode ? 'V' : '' }}
              </span>
              <span>
                <strong
                  >{{ address.addressTypeCode }}
                  {{ addressStore.addressTypeCodeLabel(address.addressTypeCode) }}</strong
                >
                <small>{{ addressStore.addressDisplay(address) }}</small>
              </span>
            </button>
          </div>
        </section>

        <div class="form-grid">
          <label>
            <span>{{ chtLabel('addressTypeCode') }}</span>
            <input
              :value="`${addressStore.addressForm.addressTypeCode} ${addressStore.addressTypeCodeLabel(addressStore.addressForm.addressTypeCode)}`"
              readonly
            />
          </label>
          <label>
            <span>{{ chtLabel('postalCode') }}</span>
            <input
              :value="addressStore.addressForm.postalCode"
              :class="{ invalid: addressStore.postalLookupError }"
              autocomplete="off"
              :disabled="addressStore.isContactAddressType(addressStore.addressForm.addressTypeCode)"
              inputmode="numeric"
              maxlength="6"
              name="postal-code"
              placeholder="3 或 6 碼"
              @input="handlePostalCodeInput"
            />
          </label>
          <label class="wide">
            <span>{{ chtLabel('addressText') }}</span>
            <input
              ref="fullWidthAddressInput"
              v-model.trim="addressStore.addressForm.addressText"
              autocomplete="off"
              :disabled="addressStore.isContactAddressType(addressStore.addressForm.addressTypeCode)"
              maxlength="255"
              placeholder="輸入前 3 碼後帶入縣市區，再補完整地址"
            />
          </label>
        </div>

        <p v-if="addressStore.dialogMessage" class="dialog-message" :class="{ error: workflow.hasError }">
          {{ addressStore.dialogMessage }}
        </p>
      </div>

      <footer class="dialog-actions">
        <button class="secondary-button" type="button" @click="addressStore.closeAddressDialog">取消</button>
        <button class="primary-button" type="button" :disabled="workflow.loading" @click="addressStore.saveAddressForm">
          <Save :size="18" />
          <span>儲存</span>
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Save, X } from '@lucide/vue'
import { useAddressChangeStore } from '../stores/addressChangeStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { useChtFieldNames } from '../composables/useChtFieldNames'

const addressStore = useAddressChangeStore()
const workflow = useWorkflowStore()
const { label: chtLabel, load } = useChtFieldNames()
const fullWidthAddressInput = ref<HTMLInputElement | null>(null)
onMounted(load)

// 郵遞區號在畫面與 API 都使用單一 canonical 欄位；舊欄位由後端相容處理。
async function handlePostalCodeInput(event: Event) {
  const input = event.target as HTMLInputElement
  const normalizedPostalCode = input.value.replace(/\D/g, '').slice(0, 6)
  input.value = normalizedPostalCode
  await addressStore.setPostalCode(normalizedPostalCode)
  if (normalizedPostalCode.length === 3 || normalizedPostalCode.length === 6) {
    await nextTick()
    fullWidthAddressInput.value?.focus()
  }
}
</script>
