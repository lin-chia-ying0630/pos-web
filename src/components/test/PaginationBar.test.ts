import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaginationBar from '../PaginationBar.vue'

describe('PaginationBar', () => {
  it('資料頁數很多時仍只顯示單排七個頁碼', () => {
    const wrapper = mount(PaginationBar, { props: { page: 11, totalPages: 22, totalItems: 440 } })
    const pageButtons = wrapper.findAll('button').slice(1, -1)
    expect(pageButtons).toHaveLength(7)
    expect(pageButtons.map((button) => button.text())).toEqual(['8', '9', '10', '11', '12', '13', '14'])
  })
})
