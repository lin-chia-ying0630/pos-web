import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AddressChangeDialog from './AddressChangeDialog.vue'
import { useAddressChangeStore } from '../stores/addressChangeStore'
import { useChangeCaseStore } from '../stores/changeCaseStore'
import { usePolicyStore } from '../stores/policyStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/AddressChangeDialog',
  component: AddressChangeDialog
} satisfies Meta<typeof AddressChangeDialog>

export default meta
type Story = StoryObj<typeof meta>

function openDialog(addressType: string, dialogMessage = '') {
  const policyStore = usePolicyStore()
  const changeCaseStore = useChangeCaseStore()
  const addressStore = useAddressChangeStore()
  policyStore.$patch({ policyDetail: mockPolicyDetail })
  changeCaseStore.$patch({
    changeCase: {
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150712001',
      acceptanceStatus: 'P',
      changeItems: ['001']
    }
  })
  addressStore.$patch({
    selectedAddressType: addressType,
    addressDialogOpen: true,
    dialogMessage
  })
  const address =
    addressStore.availableAddresses.find((item) => item.addressType === addressType) ??
    addressStore.availableAddresses[0]
  if (address) addressStore.selectAddress(address)
  if (dialogMessage) addressStore.dialogMessage = dialogMessage
}

export const CommunicationAddress: Story = {
  render: () => ({
    components: { AddressChangeDialog },
    setup() {
      openDialog('01')
      return {}
    },
    template: '<AddressChangeDialog />'
  })
}

export const EmailAddress: Story = {
  render: () => ({
    components: { AddressChangeDialog },
    setup() {
      openDialog('31')
      return {}
    },
    template: '<AddressChangeDialog />'
  })
}

export const PostalCodeError: Story = {
  render: () => ({
    components: { AddressChangeDialog },
    setup() {
      openDialog('01', '郵遞區號前三碼必填，且需為 3 碼')
      const store = useAddressChangeStore()
      store.$patch({ postalLookupError: true })
      return {}
    },
    template: '<AddressChangeDialog />'
  })
}
