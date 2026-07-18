import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { PolicyChangeCaseDetail } from '../api/posChange'
import ChangeCaseDetailPanel from './ChangeCaseDetailPanel.vue'

describe('ChangeCaseDetailPanel', () => {
  it('displays the complete 002 main ride snapshot without a duplicate field row', () => {
    const detail: PolicyChangeCaseDetail = {
      changeCase: {
        policyNo: 'P000000001',
        policySeq: 1,
        changeCaseNo: 'C1150718008',
        acceptanceStatus: 'P',
        acceptanceStatusDescription: '受理中',
        changeItems: '002',
        changeItemDescriptions: '主約保額變更'
      },
      changeFields: [
        {
          id: 1,
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo: 'C1150718008',
          changeItem: '002',
          changeField: 'main_policy_ride.000.insured_amount',
          chineseName: '保額',
          changeKey: '000',
          contentBefore: '1000000',
          contentAfter: '1200000',
          createdAt: null,
          updatedAt: null
        }
      ],
      changeFiles: [
        {
          id: 10,
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo: 'C1150718008',
          changeItem: '002',
          changeFile: 'main_policy_ride',
          changeKey: '000',
          contentBefore: null,
          contentAfter: null,
          snapshotFields: [
            { jsonKey: 'policyNo', chineseName: '保單號碼', contentBefore: 'P000000001', contentAfter: 'P000000001' },
            { jsonKey: 'policySeq', chineseName: '保單序號', contentBefore: '1', contentAfter: '1' },
            { jsonKey: 'rideType', chineseName: '主附約類型', contentBefore: '1', contentAfter: '1' },
            { jsonKey: 'rideOrder', chineseName: '主附約序號', contentBefore: '000', contentAfter: '000' },
            { jsonKey: 'productCode', chineseName: '險種代碼', contentBefore: 'LIFE', contentAfter: 'LIFE' },
            { jsonKey: 'policyYears', chineseName: '年期', contentBefore: '20', contentAfter: '20' },
            { jsonKey: 'insuredAmount', chineseName: '保額', contentBefore: '1000000', contentAfter: '1200000' },
            { jsonKey: 'premium', chineseName: '保費', contentBefore: '12345.6789', contentAfter: '12345.6789' }
          ],
          createdAt: null,
          updatedAt: null
        }
      ]
    }

    const wrapper = mount(ChangeCaseDetailPanel, {
      props: { detail, viewMode: 'files' }
    })

    expect(wrapper.findAll('.change-detail-row:not(.change-detail-head)')).toHaveLength(0)
    expect(wrapper.findAll('.snapshot-field-row:not(.snapshot-field-head)')).toHaveLength(8)
    expect(wrapper.text()).toContain('002 main_policy_ride')
    expect(wrapper.text()).toContain('險種代碼')
    expect(wrapper.text()).toContain('年期')
    expect(wrapper.text()).toContain('保額')
    expect(wrapper.text()).toContain('保費')
    expect(wrapper.text()).toContain('1000000')
    expect(wrapper.text()).toContain('1200000')
    expect(wrapper.text()).not.toContain('main_policy_ride.000.insured_amount')
  })
})
