import { expect, test } from '@playwright/test'

test('opens create change page', async ({ page }) => {
  await page.goto('/change/create')
  await expect(page.getByRole('heading', { name: '保全變更作業' })).toBeVisible()
  await expect(page.getByRole('button', { name: /查詢/ })).toBeVisible()
})
