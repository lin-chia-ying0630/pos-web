<template>
  <section class="work-view">
    <section class="query-panel">
      <label>
        <span>保單號碼</span>
        <input v-model.trim="query.policyNo" maxlength="10" placeholder="P000000001" />
      </label>
      <label>
        <span>序號</span>
        <input v-model.number="query.policySeq" type="number" min="0" max="999" />
      </label>
      <button class="primary-button" :disabled="store.loading" @click="loadPolicy">
        <Search :size="18" />
        <span>查詢</span>
      </button>
    </section>

    <p v-if="store.message" class="message" :class="{ error: store.hasError }">{{ store.message }}</p>

    <section v-if="store.policyDetail" class="detail-grid">
      <article class="panel">
        <div class="panel-title">
          <FileText :size="18" />
          <h2>保單主檔</h2>
        </div>
        <dl class="data-grid">
          <div>
            <dt>保單號碼</dt>
            <dd>{{ store.policyDetail.master.policyNo }}</dd>
          </div>
          <div>
            <dt>序號</dt>
            <dd>{{ store.policyDetail.master.policySeq }}</dd>
          </div>
          <div>
            <dt>總保費</dt>
            <dd>{{ formatNumber(store.policyDetail.master.premium, 4) }}</dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <div class="panel-title">
          <MapPinned :size="18" />
          <h2>通訊地址</h2>
        </div>
        <dl class="data-grid address-grid">
          <div>
            <dt>郵遞區號</dt>
            <dd>{{ store.communicationZip }}</dd>
          </div>
          <div>
            <dt>地址型態</dt>
            <dd>01 {{ store.addressTypeLabel('01') }}</dd>
          </div>
          <div class="wide">
            <dt>地址全型</dt>
            <dd>{{ store.policyDetail.communicationAddress?.fullWidthAddress || '-' }}</dd>
          </div>
          <div class="wide">
            <dt>地址半形</dt>
            <dd>{{ store.policyDetail.communicationAddress?.halfWidthAddress || '-' }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section v-if="store.policyDetail" class="action-panel">
      <label>
        <span>變更項目</span>
        <select v-model="selectedChangeItem">
          <option value="" disabled>請選擇</option>
          <option v-for="item in store.policyDetail.changeItems" :key="item.codeBefore" :value="item.codeBefore">
            {{ item.codeBefore }} - {{ item.codeDescription }}
          </option>
        </select>
      </label>
      <button class="primary-button" :disabled="!selectedChangeItem || store.loading" @click="createCase">
        <Plus :size="18" />
        <span>產生案號</span>
      </button>
      <button
        v-if="store.changeCase?.changeItem === '001'"
        class="secondary-button"
        type="button"
        @click="openAddressDialog"
      >
        <PencilLine :size="18" />
        <span>地址變更</span>
      </button>
      <button
        v-if="store.changeCase?.changeItem === '002'"
        class="secondary-button"
        type="button"
        @click="openAmountDialog('main')"
      >
        <PencilLine :size="18" />
        <span>主約保額變更</span>
      </button>
      <button
        v-if="store.changeCase?.changeItem === '003'"
        class="secondary-button"
        type="button"
        @click="openAmountDialog('rider')"
      >
        <PencilLine :size="18" />
        <span>附約保額變更</span>
      </button>
    </section>

    <div v-if="addressDialogOpen" class="dialog-backdrop" @click.self="addressDialogOpen = false">
      <section class="dialog">
        <header class="dialog-header">
          <h2>保單地址</h2>
          <button class="icon-button" type="button" title="關閉" @click="addressDialogOpen = false">
            <X :size="18" />
          </button>
        </header>

        <div class="address-dialog-body">
          <section class="address-list-section">
            <h3>修改前相關資料清單</h3>
            <div class="address-table">
              <button
                v-for="address in store.availableAddresses"
                :key="address.addressType"
                class="address-row"
                :class="{ selected: selectedAddressType === address.addressType }"
                type="button"
                @click="selectAddress(address)"
              >
                <span class="address-check">
                  {{ selectedAddressType === address.addressType ? 'V' : '' }}
                </span>
                <span>
                  <strong>{{ address.addressType }} {{ store.addressTypeLabel(address.addressType) }}</strong>
                  <small>{{ addressDisplay(address) }}</small>
                </span>
              </button>
            </div>
          </section>

          <div class="form-grid">
            <label>
              <span>地址型態</span>
              <input :value="`${addressForm.addressType} ${store.addressTypeLabel(addressForm.addressType)}`" readonly />
            </label>
            <label>
              <span>郵遞區號前 3 碼</span>
              <input
                v-model.trim="addressForm.zipCode3"
                :class="{ invalid: postalLookupError }"
                autocomplete="off"
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
                :key="`zip-code2-${addressForm.zipCode3}`"
                ref="zipCode2Input"
                v-model.trim="addressForm.zipCode2"
                :class="{ invalid: postalLookupError }"
                autocomplete="off"
                inputmode="numeric"
                maxlength="3"
                name="pos-zip-code2"
                placeholder="可空白"
                @input="handleZipCode2Input"
              />
            </label>
            <label class="wide">
              <span>地址全型</span>
              <input ref="fullWidthAddressInput" v-model.trim="addressForm.fullWidthAddress" autocomplete="off" maxlength="255" placeholder="輸入前 3 碼後帶入縣市區，再補完整地址" />
            </label>
            <label class="wide">
              <span>地址半形</span>
              <input v-model.trim="addressForm.halfWidthAddress" autocomplete="off" maxlength="255" placeholder="輸入前 3 碼後帶入英文縣市區，再補完整地址" />
            </label>
          </div>

          <p v-if="dialogMessage" class="dialog-message" :class="{ error: store.hasError }">{{ dialogMessage }}</p>
        </div>

        <footer class="dialog-actions">
          <button class="secondary-button" type="button" @click="addressDialogOpen = false">取消</button>
          <button class="primary-button" type="button" :disabled="store.loading" @click="saveAddress">
            <Save :size="18" />
            <span>儲存</span>
          </button>
        </footer>
      </section>
    </div>

    <div v-if="amountDialogOpen" class="dialog-backdrop" @click.self="amountDialogOpen = false">
      <section class="dialog">
        <header class="dialog-header">
          <h2>{{ amountDialogTitle }}</h2>
          <button class="icon-button" type="button" title="關閉" @click="amountDialogOpen = false">
            <X :size="18" />
          </button>
        </header>

        <div class="address-dialog-body">
          <section class="amount-list-section">
            <h3>{{ amountDialogSubtitle }}</h3>
            <div v-if="amountDialogType === 'main'" class="form-grid">
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
                <input v-model.number="amountForm.masterInsuredAmount" type="number" min="0" step="0.01" />
              </label>
              <label>
                <span>總保費</span>
                <input :value="formatNumber(store.policyDetail?.master.premium ?? 0, 4)" disabled />
              </label>
            </div>

            <div v-else class="amount-table">
              <div v-for="ride in amountForm.rides" :key="ride.rideOrder" class="amount-table-row">
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

          <p v-if="dialogMessage" class="dialog-message" :class="{ error: store.hasError }">{{ dialogMessage }}</p>
        </div>

        <footer class="dialog-actions">
          <button class="secondary-button" type="button" @click="amountDialogOpen = false">取消</button>
          <button class="primary-button" type="button" :disabled="store.loading" @click="saveAmount">
            <Save :size="18" />
            <span>儲存</span>
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { FileText, MapPinned, PencilLine, Plus, Save, Search, X } from '@lucide/vue'
import { findPostalCodeArea, type PolicyAddress } from '../api/posChange'
import { usePosChangeStore } from '../stores/posChangeStore'
import { formatNumber } from '../utils/format'

const store = usePosChangeStore()

const query = reactive({
  policyNo: store.lastPolicyNo,
  policySeq: store.lastPolicySeq
})
const addressForm = reactive({
  addressType: '01',
  zipCode3: '',
  zipCode2: '',
  fullWidthAddress: '',
  halfWidthAddress: ''
})
const amountForm = reactive<{
  masterInsuredAmount: number
  rides: Array<{
    rideOrder: string
    rideType: string
    productCode: string
    policyYears: number
    currentInsuredAmount: number
    insuredAmount: number
    premium: number
  }>
}>({
  masterInsuredAmount: 0,
  rides: []
})

const selectedChangeItem = ref('')
const selectedAddressType = ref('01')
const addressDialogOpen = ref(false)
const amountDialogOpen = ref(false)
const amountDialogType = ref<'main' | 'rider'>('main')
const dialogMessage = ref('')
const postalLookupError = ref(false)
const suppressPostalLookup = ref(false)
const previousZipCode3 = ref('')
const latestPostalLookupKey = ref('')
const zipCode2Input = ref<HTMLInputElement | null>(null)
const fullWidthAddressInput = ref<HTMLInputElement | null>(null)

const amountDialogTitle = computed(() => (amountDialogType.value === 'main' ? '主約保額變更' : '附約保額變更'))
const amountDialogSubtitle = computed(() => (amountDialogType.value === 'main' ? '保單主檔' : '保單附約'))

async function loadPolicy() {
  await store.loadPolicy(query.policyNo, query.policySeq)
  selectedChangeItem.value = ''
  selectedAddressType.value = '01'
}

async function createCase() {
  const changeCase = await store.createCase(selectedChangeItem.value)
  if (changeCase?.changeItem === '001') openAddressDialog()
  if (changeCase?.changeItem === '002') openAmountDialog('main')
  if (changeCase?.changeItem === '003') openAmountDialog('rider')
}

function openAddressDialog() {
  const address = store.availableAddresses.find((item) => item.addressType === selectedAddressType.value)
    ?? store.availableAddresses[0]
  dialogMessage.value = ''
  if (address) selectAddress(address)
  addressDialogOpen.value = true
}

async function saveAddress() {
  try {
    if (addressForm.zipCode3.length !== 3 || (addressForm.zipCode2.length > 0 && addressForm.zipCode2.length !== 3)) {
      postalLookupError.value = true
      dialogMessage.value = '郵遞區號前三碼必填，後三碼可空白；若填寫需為 3 碼'
      return
    }
    const result = await store.saveAddress(addressForm)
    dialogMessage.value = `${store.addressTypeLabel(addressForm.addressType)} 已儲存，異動欄位 ${result?.changedFieldCount ?? 0} 筆`
    addressDialogOpen.value = false
  } catch {
    dialogMessage.value = store.message
  }
}

async function handleZipCode3Input(event: Event) {
  if (suppressPostalLookup.value) return
  const input = event.target as HTMLInputElement
  const normalizedZipCode3 = input.value.replace(/\D/g, '').slice(0, 3)
  input.value = normalizedZipCode3

  addressForm.zipCode3 = normalizedZipCode3
  clearAddressWhenZipCode3Changed(normalizedZipCode3)
  if (normalizedZipCode3.length === 3) {
    await nextTick()
    zipCode2Input.value?.focus()
  }
  await lookupWhenPostalCodeReady()
}

async function handleZipCode2Input(event: Event) {
  if (suppressPostalLookup.value) return
  const input = event.target as HTMLInputElement
  const normalizedZipCode2 = input.value.replace(/\D/g, '').slice(0, 3)
  input.value = normalizedZipCode2
  addressForm.zipCode2 = normalizedZipCode2
  if (normalizedZipCode2.length === 3) {
    await nextTick()
    fullWidthAddressInput.value?.focus()
  }
  await lookupWhenPostalCodeReady()
}

watch(
  () => addressForm.zipCode3,
  async (zipCode3) => {
    if (suppressPostalLookup.value) return
    const normalizedZipCode3 = zipCode3.replace(/\D/g, '').slice(0, 3)
    if (normalizedZipCode3 !== zipCode3) {
      addressForm.zipCode3 = normalizedZipCode3
      return
    }

    clearAddressWhenZipCode3Changed(normalizedZipCode3)
    await lookupWhenPostalCodeReady()
  }
)

watch(
  () => addressForm.zipCode2,
  async (zipCode2) => {
    if (suppressPostalLookup.value) return
    const normalizedZipCode2 = zipCode2.replace(/\D/g, '').slice(0, 3)
    if (normalizedZipCode2 !== zipCode2) {
      addressForm.zipCode2 = normalizedZipCode2
      return
    }
    await lookupWhenPostalCodeReady()
  }
)

function clearAddressWhenZipCode3Changed(zipCode3: string) {
  if (zipCode3 === previousZipCode3.value) return
  previousZipCode3.value = zipCode3
  addressForm.zipCode2 = ''
  addressForm.fullWidthAddress = ''
  addressForm.halfWidthAddress = ''
  dialogMessage.value = ''
  postalLookupError.value = false
}

async function lookupWhenPostalCodeReady() {
  if (addressForm.zipCode3.length < 3 || (addressForm.zipCode2.length > 0 && addressForm.zipCode2.length < 3)) {
    postalLookupError.value = false
    return
  }
  await lookupPostalCodePrefix(`${addressForm.zipCode3}${addressForm.zipCode2}`)
}

async function lookupPostalCodePrefix(postalCode: string) {
  try {
    postalLookupError.value = false
    latestPostalLookupKey.value = postalCode
    const area = await findPostalCodeArea(postalCode)
    if (latestPostalLookupKey.value !== postalCode) return
    addressForm.fullWidthAddress = area.addressPrefix
    addressForm.halfWidthAddress = area.halfWidthAddressPrefix
    dialogMessage.value = `已帶入 ${area.addressPrefix} / ${area.halfWidthAddressPrefix}，請重新輸入後續地址`
  } catch (error) {
    const fallback = resolvePostalPrefixFromPolicyAddress(postalCode.slice(0, 3))
    if (fallback) {
      addressForm.fullWidthAddress = fallback.addressPrefix
      addressForm.halfWidthAddress = fallback.halfWidthAddressPrefix
      postalLookupError.value = false
      dialogMessage.value = `已帶入 ${fallback.addressPrefix} / ${fallback.halfWidthAddressPrefix}，請重新輸入後續地址`
      return
    }
    if (latestPostalLookupKey.value !== postalCode) return
    postalLookupError.value = true
    dialogMessage.value = error instanceof Error ? error.message : '郵遞區號查詢失敗'
  }
}

function resolvePostalPrefixFromPolicyAddress(zipCode3: string) {
  const matchedAddress = store.availableAddresses.find((address) => address.zipCode3 === zipCode3)
  if (!matchedAddress) return null

  const addressPrefix = extractFullWidthPrefix(matchedAddress.fullWidthAddress)
  const halfWidthAddressPrefix = extractHalfWidthPrefix(matchedAddress.halfWidthAddress)
  if (!addressPrefix && !halfWidthAddressPrefix) return null

  return {
    addressPrefix: addressPrefix || '',
    halfWidthAddressPrefix: halfWidthAddressPrefix || ''
  }
}

function extractFullWidthPrefix(address: string | null) {
  const match = address?.match(/^(.+?[縣市].+?[區鄉鎮市])/)
  return match?.[1] ?? ''
}

function extractHalfWidthPrefix(address: string | null) {
  const parts = address?.split(',').map((part) => part.trim()).filter(Boolean) ?? []
  if (parts.length < 2) return ''
  return parts.slice(-2).join(', ')
}

function openAmountDialog(type: 'main' | 'rider') {
  if (!store.policyDetail) return
  amountDialogType.value = type
  amountForm.masterInsuredAmount = store.policyDetail.master.insuredAmount
  amountForm.rides = store.policyDetail.rideList
    .filter((ride) => (type === 'rider' ? ride.rideType !== '1' : true))
    .map((ride) => ({
      rideOrder: ride.rideOrder,
      rideType: ride.rideType,
      productCode: ride.productCode,
      policyYears: ride.policyYears,
      currentInsuredAmount: ride.insuredAmount,
      insuredAmount: ride.insuredAmount,
      premium: ride.premium
    }))
  dialogMessage.value = ''
  amountDialogOpen.value = true
}

async function saveAmount() {
  try {
    if (amountDialogType.value === 'main') {
      const result = await store.saveMainAmount(amountForm.masterInsuredAmount)
      dialogMessage.value = `主約保額變更已儲存，異動欄位 ${result?.changedFieldCount ?? 0} 筆`
      amountDialogOpen.value = false
      return
    }
    const result = await store.saveRiderAmounts(amountForm.rides.map((ride) => ({
      rideOrder: ride.rideOrder,
      insuredAmount: ride.insuredAmount
    })))
    dialogMessage.value = `附約保額變更已儲存，異動欄位 ${result?.changedFieldCount ?? 0} 筆`
    amountDialogOpen.value = false
  } catch {
    dialogMessage.value = store.message
  }
}

function selectAddress(address: PolicyAddress) {
  selectedAddressType.value = address.addressType
  addressForm.addressType = address.addressType
  suppressPostalLookup.value = true
  addressForm.zipCode3 = address.zipCode3 ?? ''
  addressForm.zipCode2 = normalizeZipCode2(address.zipCode2)
  addressForm.fullWidthAddress = address.fullWidthAddress ?? ''
  addressForm.halfWidthAddress = address.halfWidthAddress ?? ''
  previousZipCode3.value = addressForm.zipCode3
  dialogMessage.value = ''
  postalLookupError.value = false
  window.setTimeout(() => {
    suppressPostalLookup.value = false
  }, 0)
}

function addressDisplay(address: PolicyAddress) {
  const zip = `${address.zipCode3 ?? ''}${normalizeZipCode2(address.zipCode2)}`
  const content = address.fullWidthAddress || address.halfWidthAddress || '-'
  return zip ? `${zip} ${content}` : content
}

function normalizeZipCode2(zipCode2: string | null) {
  return zipCode2 ? zipCode2.padStart(3, '0') : ''
}
</script>
