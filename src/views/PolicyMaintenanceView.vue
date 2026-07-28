<template>
  <section class="work-view">
    <PolicySearchPanel
      title="異動保單服務"
      :add-label="`新增${entityName}`"
      :show-add="canMaintain"
      @add="openCreate"
    />
    <StatusMessage />

    <PolicyEntitySummary
      :entity="entity"
      :title="`${entityName}資訊`"
      maintenance
      @edit="openEntity($event, 'edit')"
      @delete="openEntity($event, 'delete')"
    />

    <PolicyMaintenanceDialog
      v-if="entity === 'master' && masterMaintenance.mode.value"
      v-model="masterMaintenance.form"
      :mode="masterMaintenance.mode.value"
      :title="masterMaintenance.title.value"
      :fields="masterMaintenance.fields.value"
      @close="masterMaintenance.close"
      @submit="masterMaintenance.submit"
    />
    <PolicyMaintenanceDialog
      v-if="entity === 'address' && addressMaintenance.mode.value"
      v-model="addressMaintenance.form"
      :mode="addressMaintenance.mode.value"
      :title="addressMaintenance.title.value"
      :fields="addressMaintenance.fields.value"
      @close="addressMaintenance.close"
      @submit="addressMaintenance.submit"
    />
    <PolicyMaintenanceDialog
      v-if="entity === 'ride' && rideMaintenance.mode.value"
      v-model="rideMaintenance.form"
      :mode="rideMaintenance.mode.value"
      :title="rideMaintenance.title.value"
      :fields="rideMaintenance.fields.value"
      @close="rideMaintenance.close"
      @submit="rideMaintenance.submit"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  createPolicyAddress,
  createPolicyMaster,
  createPolicyRide,
  deletePolicyAddress,
  deletePolicyMaster,
  deletePolicyRide,
  updatePolicyAddress,
  updatePolicyMaster,
  updatePolicyRide,
  type PolicyAddress,
  type PolicyMaster,
  type PolicyRide
} from '../api/posChange'
import PolicyEntitySummary from '../components/PolicyEntitySummary.vue'
import PolicyMaintenanceDialog from '../components/PolicyMaintenanceDialog.vue'
import PolicySearchPanel from '../components/PolicySearchPanel.vue'
import StatusMessage from '../components/StatusMessage.vue'
import { usePolicyMaintenance, type PolicyEntity } from '../composables/usePolicyMaintenance'
import { useAuthStore } from '../stores/authStore'

type EntityType = 'master' | 'address' | 'ride'
type MaintenanceMode = 'edit' | 'delete'

const props = defineProps<{ entity: EntityType }>()
const authStore = useAuthStore()
const canMaintain = computed(() => authStore.hasRole('MAKER') || authStore.hasRole('ADMIN'))
const entityOptions: Array<{ value: EntityType; label: string }> = [
  { value: 'master', label: '保單主檔' },
  { value: 'address', label: '保單地址' },
  { value: 'ride', label: '保單主附約' }
]
const entityName = computed(() => entityOptions.find((option) => option.value === props.entity)?.label ?? '')

const masterMaintenance = usePolicyMaintenance<PolicyMaster>({
  entity: 'master',
  entityName: '保單主檔',
  functionCode: 'MPM00004',
  create: createPolicyMaster,
  update: (value, original) =>
    updatePolicyMaster({ ...value, originalPolicyNo: original?.policyNo, originalPolicySeq: original?.policySeq }),
  remove: (value) => deletePolicyMaster(value.policyNo, value.policySeq)
})
const addressMaintenance = usePolicyMaintenance<PolicyAddress>({
  entity: 'address',
  entityName: '保單地址',
  functionCode: 'MPM00005',
  create: createPolicyAddress,
  update: (value) => updatePolicyAddress(value),
  remove: deletePolicyAddress
})
const rideMaintenance = usePolicyMaintenance<PolicyRide>({
  entity: 'ride',
  entityName: '保單主附約',
  functionCode: 'MPM00006',
  create: createPolicyRide,
  update: (value) => updatePolicyRide(value),
  remove: deletePolicyRide
})

function openCreate() {
  if (props.entity === 'master') masterMaintenance.open(null, 'create')
  else if (props.entity === 'address') addressMaintenance.open(null, 'create')
  else rideMaintenance.open(null, 'create')
}

function openEntity(value: PolicyEntity, mode: MaintenanceMode) {
  if (props.entity === 'master') masterMaintenance.open(value as PolicyMaster, mode)
  else if (props.entity === 'address') addressMaintenance.open(value as PolicyAddress, mode)
  else rideMaintenance.open(value as PolicyRide, mode)
}
</script>
