import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AddressChangeDialog from './AddressChangeDialog.vue'
import { usePosChangeStore } from '../stores/posChangeStore'
import { mockPolicyDetail } from '../stories/mockData'

const meta = {
  title: 'Components/AddressChangeDialog',
  component: AddressChangeDialog
} satisfies Meta<typeof AddressChangeDialog>

export default meta
type Story = StoryObj<typeof meta>

function openDialog(addressType: string, dialogMessage = '') {
  const store = usePosChangeStore()
  store.$patch({
    policyDetail: mockPolicyDetail,
    changeCase: {
      policyNo: 'P000000001',
      policySeq: 1,
      changeCaseNo: 'C1150712001',
      acceptanceStatus: 'P',
      changeItem: '001'
    },
    selectedAddressType: addressType,
    addressDialogOpen: true,
    dialogMessage
  })
  const address =
    store.availableAddresses.find((item) => item.addressType === addressType) ?? store.availableAddresses[0]
  if (address) store.selectAddress(address)
  if (dialogMessage) store.dialogMessage = dialogMessage
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
      const store = usePosChangeStore()
      store.$patch({ postalLookupError: true })
      return {}
    },
    template: '<AddressChangeDialog />'
  })
}
