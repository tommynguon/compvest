import { expect, test } from '@playwright/test'

test('welcomes users with the complete-offer value proposition', async ({ page }) => {
  await page.goto('/welcome')

  await expect(page.getByRole('heading', { name: /Know which offer/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open my offers' })).toBeVisible()
  await expect(page.getByText('13 provinces & territories')).toBeVisible()
})
