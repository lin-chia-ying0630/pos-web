<template>
  <main class="app-shell">
    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">POS Change</p>
          <h1>保全變更作業</h1>
        </div>
        <div v-if="changeCase" class="case-badge">
          <span>案號</span>
          <strong>{{ changeCase.changeCaseNo }}</strong>
        </div>
      </header>

      <div class="work-layout">
        <aside class="side-menu">
          <button
            class="side-menu-item"
            :class="{ active: activeView === 'create' }"
            type="button"
            @click="activeView = 'create'"
          >
            <Plus :size="18" />
            <span>新增保全變更</span>
          </button>
          <button
            class="side-menu-item"
            :class="{ active: activeView === 'query' }"
            type="button"
            @click="activeView = 'query'"
          >
            <Search :size="18" />
            <span>查詢保全變更</span>
          </button>
          <button
            class="side-menu-item"
            :class="{ active: activeView === 'approve' }"
            type="button"
            @click="activeView = 'approve'"
          >
            <FileText :size="18" />
            <span>覆核</span>
          </button>
        </aside>

        <section class="work-content">
          <section v-if="activeView === 'create'" class="work-view">
            <section class="query-panel">
              <label>
                <span>保單號碼</span>
                <input v-model.trim="query.policyNo" maxlength="10" placeholder="P000000001" />
              </label>
              <label>
                <span>序號</span>
                <input v-model.number="query.policySeq" type="number" min="0" max="999" />
              </label>
              <button class="primary-button" :disabled="loading" @click="loadPolicy">
                <Search :size="18" />
                <span>查詢</span>
              </button>
            </section>

            <p v-if="message" class="message" :class="{ error: hasError }">{{ message }}</p>

            <section v-if="policyDetail" class="detail-grid">
              <article class="panel">
                <div class="panel-title">
                  <FileText :size="18" />
                  <h2>保單主檔</h2>
                </div>
                <dl class="data-grid">
                  <div>
                    <dt>保單號碼</dt>
                    <dd>{{ policyDetail.master.policyNo }}</dd>
                  </div>
                  <div>
                    <dt>序號</dt>
                    <dd>{{ policyDetail.master.policySeq }}</dd>
                  </div>
                  <div>
                    <dt>主約險種</dt>
                    <dd>{{ policyDetail.master.mainProductCode }}</dd>
                  </div>
                  <div>
                    <dt>主約年期</dt>
                    <dd>{{ policyDetail.master.mainPolicyYears }}</dd>
                  </div>
                  <div>
                    <dt>保額</dt>
                    <dd>{{ formatNumber(policyDetail.master.insuredAmount, 2) }}</dd>
                  </div>
                  <div>
                    <dt>保費</dt>
                    <dd>{{ formatNumber(policyDetail.master.premium, 4) }}</dd>
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
                    <dd>{{ communicationZip }}</dd>
                  </div>
                  <div>
                    <dt>地址型態</dt>
                    <dd>01 通訊地址</dd>
                  </div>
                  <div class="wide">
                    <dt>地址全型</dt>
                    <dd>{{ policyDetail.communicationAddress?.fullWidthAddress || '-' }}</dd>
                  </div>
                  <div class="wide">
                    <dt>地址半形</dt>
                    <dd>{{ policyDetail.communicationAddress?.halfWidthAddress || '-' }}</dd>
                  </div>
                </dl>
              </article>
            </section>

            <section v-if="policyDetail" class="action-panel">
              <label>
                <span>變更項目</span>
                <select v-model="selectedChangeItem">
                  <option value="" disabled>請選擇</option>
                  <option v-for="item in policyDetail.changeItems" :key="item.codeBefore" :value="item.codeBefore">
                    {{ item.codeBefore }} - {{ item.codeDescription }}
                  </option>
                </select>
              </label>
              <button class="primary-button" :disabled="!selectedChangeItem || loading" @click="createCase">
                <Plus :size="18" />
                <span>產生案號</span>
              </button>
              <button
                v-if="changeCase?.changeItem === '001'"
                class="secondary-button"
                type="button"
                @click="openAddressDialog"
              >
                <PencilLine :size="18" />
                <span>地址變更</span>
              </button>
              <button
                v-if="changeCase?.changeItem === '002'"
                class="secondary-button"
                type="button"
                @click="openAmountDialog('main')"
              >
                <PencilLine :size="18" />
                <span>主約保額變更</span>
              </button>
              <button
                v-if="changeCase?.changeItem === '003'"
                class="secondary-button"
                type="button"
                @click="openAmountDialog('rider')"
              >
                <PencilLine :size="18" />
                <span>附約保額變更</span>
              </button>
            </section>
          </section>

          <section v-else class="work-view">
            <p v-if="message" class="message" :class="{ error: hasError }">{{ message }}</p>
            <section class="review-panel">
              <div class="panel-title">
                <FileText :size="18" />
                <h2>{{ activeView === 'approve' ? '保全變更覆核' : '保全變更查詢' }}</h2>
              </div>
              <div class="review-query">
                <label>
                  <span>保單號碼</span>
                  <input v-model.trim="reviewQuery.policyNo" maxlength="10" placeholder="P000000001" />
                </label>
                <button class="primary-button" :disabled="loading || !reviewQuery.policyNo" @click="loadChangeCases">
                  <Search :size="18" />
                  <span>查詢受理資料</span>
                </button>
              </div>

              <div v-if="changeCases.length > 0" class="case-table">
                <div class="case-table-head">
                  <span>案號</span>
                  <span>序號</span>
                  <span>變更項目</span>
                  <span>狀態</span>
                  <span v-if="activeView === 'approve'">覆核</span>
                </div>
                <div v-for="caseItem in changeCases" :key="caseItem.changeCaseNo" class="case-table-row">
                  <strong>{{ caseItem.changeCaseNo }}</strong>
                  <span>{{ caseItem.policySeq }}</span>
                  <span>{{ caseItem.changeItemDescriptions || caseItem.changeItems || '-' }}</span>
                  <span>{{ statusLabel(caseItem.acceptanceStatus) }}</span>
                  <div v-if="activeView === 'approve'" class="case-actions">
                    <button
                      class="secondary-button"
                      type="button"
                      :disabled="loading || !isPendingStatus(caseItem.acceptanceStatus)"
                      @click="updateChangeCaseStatus(caseItem, 'C')"
                    >
                      <X :size="18" />
                      <span>取消</span>
                    </button>
                    <button
                      class="primary-button"
                      type="button"
                      :disabled="loading || !isPendingStatus(caseItem.acceptanceStatus)"
                      @click="updateChangeCaseStatus(caseItem, 'S')"
                    >
                      <Save :size="18" />
                      <span>完成</span>
                    </button>
                  </div>
                </div>
              </div>
              <p v-else-if="reviewSearched" class="empty-text">查無保全受理資料</p>
            </section>
          </section>
        </section>
      </div>
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
                v-for="address in availableAddresses"
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
                  <strong>{{ address.addressType }} {{ addressTypeLabel(address.addressType) }}</strong>
                  <small>{{ addressDisplay(address) }}</small>
                </span>
              </button>
            </div>
          </section>

          <div class="form-grid">
            <label>
              <span>地址型態</span>
              <input :value="`${addressForm.addressType} ${addressTypeLabel(addressForm.addressType)}`" readonly />
            </label>
            <label>
              <span>郵遞區號 3</span>
              <input v-model.trim="addressForm.zipCode3" maxlength="3" />
            </label>
            <label>
              <span>郵遞區號 2</span>
              <input v-model.trim="addressForm.zipCode2" maxlength="2" />
            </label>
            <label class="wide">
              <span>地址全型</span>
              <input v-model.trim="addressForm.fullWidthAddress" maxlength="255" />
            </label>
            <label class="wide">
              <span>地址半形</span>
              <input v-model.trim="addressForm.halfWidthAddress" maxlength="255" />
            </label>
          </div>

          <p v-if="dialogMessage" class="dialog-message" :class="{ error: hasError }">{{ dialogMessage }}</p>
        </div>

        <footer class="dialog-actions">
          <button class="secondary-button" type="button" @click="addressDialogOpen = false">取消</button>
          <button class="primary-button" type="button" :disabled="loading" @click="saveAddressChange">
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
                <input :value="policyDetail?.master.policyNo ?? '-'" disabled />
              </label>
              <label>
                <span>序號</span>
                <input :value="policyDetail?.master.policySeq ?? '-'" disabled />
              </label>
              <label>
                <span>主約險種</span>
                <input :value="policyDetail?.master.mainProductCode ?? '-'" disabled />
              </label>
              <label>
                <span>主約年期</span>
                <input :value="policyDetail?.master.mainPolicyYears ?? '-'" disabled />
              </label>
              <label>
                <span>目前保額</span>
                <input :value="formatNumber(policyDetail?.master.insuredAmount ?? 0, 2)" disabled />
              </label>
              <label>
                <span>變更後保額</span>
                <input v-model.number="amountForm.masterInsuredAmount" type="number" min="0" step="0.01" />
              </label>
              <label>
                <span>保費</span>
                <input :value="formatNumber(policyDetail?.master.premium ?? 0, 4)" disabled />
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
                    <span>保費</span>
                    <input :value="formatNumber(ride.premium, 4)" disabled />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <p v-if="dialogMessage" class="dialog-message" :class="{ error: hasError }">{{ dialogMessage }}</p>
        </div>

        <footer class="dialog-actions">
          <button class="secondary-button" type="button" @click="amountDialogOpen = false">取消</button>
          <button class="primary-button" type="button" :disabled="loading" @click="saveAmountChange">
            <Save :size="18" />
            <span>儲存</span>
          </button>
        </footer>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { FileText, MapPinned, PencilLine, Plus, Save, Search, X } from '@lucide/vue'

type PolicyMaster = {
  policyNo: string
  policySeq: number
  mainProductCode: string
  mainPolicyYears: number
  insuredAmount: number
  premium: number
}

type PolicyAddress = {
  policyNo: string
  policySeq: number
  addressType: string
  zipCode3: string | null
  zipCode2: string | null
  fullWidthAddress: string | null
  halfWidthAddress: string | null
}

type PolicyRide = {
  policyNo: string
  policySeq: number
  rideType: string
  rideOrder: string
  productCode: string
  policyYears: number
  insuredAmount: number
  premium: number
}

type CodeDescription = {
  codeBefore: string
  codeDescription: string
}

type PolicyDetail = {
  master: PolicyMaster
  communicationAddress: PolicyAddress | null
  addressList: PolicyAddress[]
  rideList: PolicyRide[]
  changeItems: CodeDescription[]
}

type ChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  changeItem: string
}

type PolicyChangeCase = {
  policyNo: string
  policySeq: number
  changeCaseNo: string
  acceptanceStatus: string
  changeItems: string | null
  changeItemDescriptions: string | null
}

type ResponseBodyDto<T> = {
  success: boolean
  message: string
  massageCode: string
  errorMessage: string
  data: T
}

const query = reactive({
  policyNo: 'P000000001',
  policySeq: 1
})

const reviewQuery = reactive({
  policyNo: 'P000000001'
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

const loading = ref(false)
const hasError = ref(false)
const message = ref('')
const activeView = ref<'create' | 'query' | 'approve'>('create')
const policyDetail = ref<PolicyDetail | null>(null)
const selectedChangeItem = ref('')
const changeCase = ref<ChangeCase | null>(null)
const addressDialogOpen = ref(false)
const amountDialogOpen = ref(false)
const amountDialogType = ref<'main' | 'rider'>('main')
const selectedAddressType = ref('01')
const dialogMessage = ref('')
const changeCases = ref<PolicyChangeCase[]>([])
const reviewSearched = ref(false)

const addressTypeNames: Record<string, string> = {
  '01': '通訊地址',
  '02': '戶籍地址',
  '11': '通訊電話',
  '12': '戶籍電話',
  '31': 'email'
}

const statusNames: Record<string, string> = {
  P: 'P - 受理中',
  C: 'C - 取消',
  S: 'S - 完成'
}

const communicationZip = computed(() => {
  const address = policyDetail.value?.communicationAddress
  if (!address) return '-'
  return `${address.zipCode3 ?? ''}${address.zipCode2 ?? ''}` || '-'
})

const amountDialogTitle = computed(() => (amountDialogType.value === 'main' ? '主約保額變更' : '附約保額變更'))
const amountDialogSubtitle = computed(() => (amountDialogType.value === 'main' ? '保單主檔' : '保單附約'))

const availableAddresses = computed(() => {
  const addresses = policyDetail.value?.addressList ?? []
  if (addresses.length > 0) return addresses
  return policyDetail.value?.communicationAddress ? [policyDetail.value.communicationAddress] : []
})

async function loadPolicy() {
  await run(async () => {
    const data = await request<PolicyDetail>(`/api/policies/${encodeURIComponent(query.policyNo)}/${query.policySeq}`)
    policyDetail.value = data
    reviewQuery.policyNo = query.policyNo
    selectedChangeItem.value = ''
    selectedAddressType.value = '01'
    changeCase.value = null
    message.value = '查詢完成'
  })
}

async function loadChangeCases() {
  await run(async () => {
    const data = await request<PolicyChangeCase[]>(`/api/policies/${encodeURIComponent(reviewQuery.policyNo)}/change-cases`)
    changeCases.value = data
    reviewSearched.value = true
    message.value = `查詢完成，共 ${data.length} 筆保全受理資料`
  })
}

async function updateChangeCaseStatus(caseItem: PolicyChangeCase, acceptanceStatus: 'C' | 'S') {
  await run(async () => {
    await request(`/api/change-cases/${encodeURIComponent(caseItem.changeCaseNo)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        policyNo: caseItem.policyNo,
        policySeq: caseItem.policySeq,
        acceptanceStatus
      })
    })
    message.value = `${caseItem.changeCaseNo} 已更新為 ${statusLabel(acceptanceStatus)}`
    await loadChangeCases()
    if (acceptanceStatus === 'S' && policyDetail.value?.master.policyNo === caseItem.policyNo && policyDetail.value.master.policySeq === caseItem.policySeq) {
      await loadPolicy()
    }
  })
}

async function createCase() {
  await run(async () => {
    const data = await request<ChangeCase>('/api/change-cases', {
      method: 'POST',
      body: JSON.stringify({
        policyNo: query.policyNo,
        policySeq: query.policySeq,
        changeItem: selectedChangeItem.value
      })
    })
    changeCase.value = data
    message.value = `已建立變更案號 ${data.changeCaseNo}`
    if (data.changeItem === '001') {
      openAddressDialog()
    }
    if (data.changeItem === '002') {
      openAmountDialog('main')
    }
    if (data.changeItem === '003') {
      openAmountDialog('rider')
    }
  })
}

function openAddressDialog() {
  const address = availableAddresses.value.find((item) => item.addressType === selectedAddressType.value)
    ?? availableAddresses.value[0]
  dialogMessage.value = ''
  if (address) {
    selectAddress(address)
  }
  addressDialogOpen.value = true
}

async function saveAddressChange() {
  if (!changeCase.value) return
  await run(async () => {
    const result = await request<{ changedFieldCount: number }>('/api/change-cases/address-change', {
      method: 'POST',
      body: JSON.stringify({
        policyNo: query.policyNo,
        policySeq: query.policySeq,
        changeCaseNo: changeCase.value?.changeCaseNo,
        ...addressForm
      })
    })
    dialogMessage.value = `${addressTypeLabel(addressForm.addressType)} 已儲存，異動欄位 ${result.changedFieldCount} 筆`
    message.value = `地址變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
  })
}

function openAmountDialog(type: 'main' | 'rider') {
  if (!policyDetail.value) return
  amountDialogType.value = type
  amountForm.masterInsuredAmount = policyDetail.value.master.insuredAmount
  amountForm.rides = (policyDetail.value.rideList ?? [])
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

async function saveAmountChange() {
  if (!changeCase.value) return
  await run(async () => {
    if (amountDialogType.value === 'main') {
      const result = await request<{ changedFieldCount: number }>('/api/change-cases/main-amount-change', {
        method: 'POST',
        body: JSON.stringify({
          policyNo: query.policyNo,
          policySeq: query.policySeq,
          changeCaseNo: changeCase.value?.changeCaseNo,
          masterInsuredAmount: amountForm.masterInsuredAmount
        })
      })
      dialogMessage.value = `主約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
      message.value = `主約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
      return
    }

    const result = await request<{ changedFieldCount: number }>('/api/change-cases/rider-amount-change', {
      method: 'POST',
      body: JSON.stringify({
        policyNo: query.policyNo,
        policySeq: query.policySeq,
        changeCaseNo: changeCase.value?.changeCaseNo,
        rides: amountForm.rides.map((ride) => ({
          rideOrder: ride.rideOrder,
          insuredAmount: ride.insuredAmount
        }))
      })
    })
    dialogMessage.value = `附約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
    message.value = `附約保額變更已儲存，異動欄位 ${result.changedFieldCount} 筆`
  })
}

function selectAddress(address: PolicyAddress) {
  selectedAddressType.value = address.addressType
  addressForm.addressType = address.addressType
  addressForm.zipCode3 = address.zipCode3 ?? ''
  addressForm.zipCode2 = address.zipCode2 ?? ''
  addressForm.fullWidthAddress = address.fullWidthAddress ?? ''
  addressForm.halfWidthAddress = address.halfWidthAddress ?? ''
  dialogMessage.value = ''
}

function addressTypeLabel(addressType: string) {
  return addressTypeNames[addressType] ?? '其他'
}

function addressDisplay(address: PolicyAddress) {
  const zip = `${address.zipCode3 ?? ''}${address.zipCode2 ?? ''}`
  const content = address.fullWidthAddress || address.halfWidthAddress || '-'
  return zip ? `${zip} ${content}` : content
}

function statusLabel(acceptanceStatus: string) {
  return statusNames[acceptanceStatus.toUpperCase()] ?? acceptanceStatus
}

function isPendingStatus(acceptanceStatus: string) {
  return acceptanceStatus.toUpperCase() === 'P'
}

async function run(task: () => Promise<void>) {
  loading.value = true
  hasError.value = false
  message.value = ''
  try {
    await task()
  } catch (error) {
    hasError.value = true
    message.value = error instanceof Error ? error.message : '作業失敗'
    if (addressDialogOpen.value) {
      dialogMessage.value = message.value
    }
    if (amountDialogOpen.value) {
      dialogMessage.value = message.value
    }
  } finally {
    loading.value = false
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  })
  const body = (await response.json().catch(() => null)) as ResponseBodyDto<T> | null
  if (!response.ok) {
    throw new Error(body?.errorMessage || body?.message || response.statusText)
  }
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data
  }
  return body as T
}

function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}
</script>
