import { expect, test, type Page, type Route } from '@playwright/test'
import { mockChangeCaseDetail, mockPolicyDetail } from '../src/stories/mockData'

const changeCaseNo = 'C1150712001'

function envelope<T>(data: T) {
  return {
    success: true,
    message: '執行成功',
    massageCode: '',
    errorMessage: '',
    data
  }
}

async function json(route: Route, data: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(envelope(data)) })
}

async function mockApi(page: Page) {
  let acceptanceStatus = 'P'
  await page.route('http://127.0.0.1:5173/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'GET' && url.pathname === '/api/policies/P000000001/1') {
      return json(route, mockPolicyDetail)
    }
    if (request.method() === 'POST' && url.pathname === '/api/change-cases') {
      return json(
        route,
        {
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo,
          acceptanceStatus: 'P',
          changeItem: '001'
        },
        201
      )
    }
    if (request.method() === 'POST' && url.pathname === `/api/change-cases/${changeCaseNo}/address-change`) {
      return json(route, { changeCaseNo, changeItem: '001', changedFieldCount: 1 })
    }
    if (request.method() === 'GET' && url.pathname === '/api/policies/P000000001/change-cases') {
      return json(route, [
        {
          policyNo: 'P000000001',
          policySeq: 1,
          changeCaseNo,
          acceptanceStatus,
          acceptanceStatusDescription: acceptanceStatus === 'P' ? '受理中' : '完成',
          changeItems: '001',
          changeItemDescriptions: '地址變更'
        }
      ])
    }
    if (request.method() === 'GET' && url.pathname === `/api/policies/P000000001/1/change-cases/${changeCaseNo}`) {
      return json(route, {
        ...mockChangeCaseDetail,
        changeCase: { ...mockChangeCaseDetail.changeCase, changeCaseNo, acceptanceStatus }
      })
    }
    if (request.method() === 'PATCH' && url.pathname === `/api/change-cases/${changeCaseNo}/status`) {
      acceptanceStatus = 'S'
      return json(route, {
        policyNo: 'P000000001',
        policySeq: 1,
        changeCaseNo,
        acceptanceStatus,
        appliedItemCount: 1
      })
    }
    await route.abort()
  })
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('creates an address draft only after a real change', async ({ page }) => {
  await page.goto('/change/create')
  await page.getByRole('button', { name: /查詢/ }).click()
  await expect(page.getByText('查詢完成')).toBeVisible()

  await page.getByLabel('變更項目').selectOption('001')
  await page.getByRole('button', { name: '產生案號' }).click()
  await expect(page.getByRole('heading', { name: '保單地址' })).toBeVisible()

  await page.getByRole('textbox', { name: '地址', exact: true }).fill('臺北市中正區重慶南路一段２號')
  await page.getByRole('button', { name: '儲存' }).click()

  await expect(page.getByText('通訊地址已儲存，異動欄位 1 筆')).toBeVisible()
  await expect(page.getByRole('heading', { name: '保單地址' })).toBeHidden()
})

test('requires review detail before completing a case', async ({ page }) => {
  await page.goto('/change/review')
  await page.getByRole('button', { name: '查詢受理資料' }).click()
  await page.getByRole('button', { name: '查看異動明細' }).click()

  await expect(page.getByText('full_width_address / 01')).toBeVisible()
  await expect(page.getByText('臺北市中正區重慶南路一段 200 號')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '確認完成' }).click()
  await expect(page.getByText(`${changeCaseNo} 已完成並套用異動`)).toBeVisible()
})
