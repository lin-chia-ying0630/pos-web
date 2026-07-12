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
              :key="address.addressType"
              class="address-row"
              :class="{ selected: addressStore.selectedAddressType === address.addressType }"
              type="button"
              @click="addressStore.selectAddress(address)"
            >
              <span class="address-check">
                {{ addressStore.selectedAddressType === address.addressType ? 'V' : '' }}
              </span>
              <span>
                <strong>{{ address.addressType }} {{ addressStore.addressTypeLabel(address.addressType) }}</strong>
                <small>{{ addressStore.addressDisplay(address) }}</small>
              </span>
            </button>
          </div>
        </section>

        <div class="form-grid">
          <label>
            <span>地址型態</span>
            <input
              :value="`${addressStore.addressForm.addressType} ${addressStore.addressTypeLabel(addressStore.addressForm.addressType)}`"
              readonly
            />
          </label>
          <label>
            <span>郵遞區號前 3 碼</span>
            <input
              :value="addressStore.addressForm.zipCode3"
              :class="{ invalid: addressStore.postalLookupError }"
              autocomplete="off"
              :disabled="addressStore.isContactAddressType(addressStore.addressForm.addressType)"
              inputmode="numeric"
              maxlength="3"
              name="pos-zip-code3"
              placeholder="100"
              @input="handleZipCode3Input"
            />
          </label>
          <label>
            <span>郵遞區號後 3 碼</span>
            <input
              ref="zipCode2Input"
              :value="addressStore.addressForm.zipCode2"
              :class="{ invalid: addressStore.postalLookupError }"
              autocomplete="off"
              :disabled="addressStore.isContactAddressType(addressStore.addressForm.addressType)"
              inputmode="numeric"
              maxlength="3"
              name="pos-zip-code2"
              placeholder="可空白"
              @input="handleZipCode2Input"
            />
          </label>
          <label class="wide">
            <span>地址</span>
            <input
              ref="fullWidthAddressInput"
              v-model.trim="addressStore.addressForm.fullWidthAddress"
              autocomplete="off"
              :disabled="addressStore.isContactAddressType(addressStore.addressForm.addressType)"
              maxlength="255"
              placeholder="輸入前 3 碼後帶入縣市區，再補完整地址"
            />
          </label>
          <label class="wide">
            <span>email / 電話 / 手機</span>
            <input
              v-model.trim="addressStore.addressForm.halfWidthAddress"
              autocomplete="off"
              :disabled="addressStore.isPhysicalAddressType(addressStore.addressForm.addressType)"
              maxlength="255"
              placeholder="輸入 email / 電話 / 手機"
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
import { nextTick, ref } from 'vue'
import { Save, X } from '@lucide/vue'
import { useAddressChangeStore } from '../stores/addressChangeStore'
import { useWorkflowStore } from '../stores/workflowStore'

const addressStore = useAddressChangeStore()
const workflow = useWorkflowStore()
const zipCode2Input = ref<HTMLInputElement | null>(null)
const fullWidthAddressInput = ref<HTMLInputElement | null>(null)

async function handleZipCode3Input(event: Event) {
  const input = event.target as HTMLInputElement
  const normalizedZipCode3 = input.value.replace(/\D/g, '').slice(0, 3)
  input.value = normalizedZipCode3
  await addressStore.setZipCode3(normalizedZipCode3)
  if (normalizedZipCode3.length === 3) {
    await nextTick()
    zipCode2Input.value?.focus()
  }
}

async function handleZipCode2Input(event: Event) {
  const input = event.target as HTMLInputElement
  const normalizedZipCode2 = input.value.replace(/\D/g, '').slice(0, 3)
  input.value = normalizedZipCode2
  await addressStore.setZipCode2(normalizedZipCode2)
  if (normalizedZipCode2.length === 3) {
    await nextTick()
    fullWidthAddressInput.value?.focus()
  }
}
</script>
