<template>
  <section v-if="policyStore.policyDetail" class="detail-grid">
    <article class="panel">
      <div class="panel-title">
        <FileText :size="18" />
        <h2>保單主檔</h2>
      </div>
      <dl class="data-grid">
        <div v-for="[key, value] in masterFields" :key="key">
          <dt>{{ chtLabel(key) }}</dt>
          <dd>{{ displayValue(key, value) }}</dd>
        </div>
      </dl>
    </article>

    <article class="panel">
      <div class="panel-title">
        <MapPinned :size="18" />
        <h2>通訊地址</h2>
      </div>
      <dl class="data-grid address-grid">
        <div v-for="[key, value] in communicationAddressFields" :key="key" :class="{ wide: key === 'addressText' }">
          <dt>{{ chtLabel(key) }}</dt>
          <dd>{{ displayAddressValue(key, value) }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<script setup lang="ts">
import { FileText, MapPinned } from '@lucide/vue'
import { computed, onMounted } from 'vue'
import { isPolicyServiceHiddenField } from '../composables/usePolicyUiFields'
import { useChtFieldNames } from '../composables/useChtFieldNames'
import { usePolicyStore } from '../stores/policyStore'
import { formatNumber } from '../utils/format'

const policyStore = usePolicyStore()
const { label: chtLabel, load } = useChtFieldNames()
const masterFields = computed(() =>
  Object.entries(policyStore.policyDetail?.master ?? {}).filter(([key]) => !isPolicyServiceHiddenField(key))
)
const communicationAddressFields = computed(() =>
  Object.entries(policyStore.policyDetail?.communicationAddress ?? {}).filter(
    ([key]) => !isPolicyServiceHiddenField(key)
  )
)
onMounted(load)

function displayValue(key: string, value: unknown) {
  if (value == null || value === '') return '-'
  if (typeof value === 'number') return formatNumber(value, key === 'premiumAmount' ? 4 : 0)
  return String(value)
}
function displayAddressValue(key: string, value: unknown) {
  if (value == null || value === '') return '-'
  if (key === 'addressTypeCode') return `${value} ${policyStore.addressTypeCodeLabel(String(value))}`
  return String(value)
}
</script>
