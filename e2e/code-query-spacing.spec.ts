import { expect, test, type Page, type Route } from '@playwright/test'

function envelope<T>(data: T) {
  return {
    success: true,
    message: '執行成功',
    messageCode: '',
    errorMessage: '',
    data
  }
}

async function json(route: Route, data: unknown) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(envelope(data)) })
}

async function mockCodeQueryApi(page: Page) {
  const codes = [
    {
      codeGroup: 'CHT-code',
      codeField: 'changedRecordKey',
      codeBefore: 'changedRecordKey',
      codeAfter: null,
      codeDescription: '變更資料業務鍵',
      activeFlag: 'Y',
      reviewStatus: 'S'
    }
  ]

  await page.route('http://127.0.0.1:5173/api/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/auth/me') {
      return json(route, {
        userId: 'local-development',
        roles: ['MAKER', 'REVIEWER'],
        functionCodes: ['MCM00001'],
        securityEnabled: false
      })
    }
    if (url.pathname === '/api/function-codes') {
      return json(route, [
        {
          codeGroup: 'main-screen',
          codeField: 'CODE_TABLE',
          codeBefore: 'MCM00001',
          codeAfter: null,
          codeDescription: '代碼對照表',
          activeFlag: 'Y',
          reviewStatus: 'S'
        }
      ])
    }
    if (url.pathname === '/api/user-authorizations/codes') return json(route, codes)
    await route.abort()
  })
}

test('long code keys keep visible spacing between adjacent columns', async ({ page }) => {
  await mockCodeQueryApi(page)
  await page.goto('/codes')

  const row = page.locator('.query-record-row').filter({ hasText: 'changedRecordKey' })
  await expect(row).toHaveCount(1)

  const layout = await row.evaluate((element) => {
    const cells = Array.from(element.children) as HTMLElement[]
    const codeField = cells[1]
    const codeBefore = cells[2]
    const textRange = document.createRange()
    textRange.selectNodeContents(codeField)
    return {
      codeFieldTextRight: textRange.getBoundingClientRect().right,
      codeBeforeLeft: codeBefore.getBoundingClientRect().left
    }
  })

  expect(layout.codeBeforeLeft - layout.codeFieldTextRight).toBeGreaterThanOrEqual(12)
})
