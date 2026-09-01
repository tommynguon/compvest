import { expect, test } from '@playwright/test'

test('opens directly to the local personal offer list', async ({ page }) => {
  await page.route('**/api/v1/offers', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ offers: [] }),
  }))

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'My offers' })).toBeVisible()
  await expect(page.getByText('Personal tool · stored locally')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add an offer' }).first()).toBeVisible()
  await expect(page.getByText(/sign in|register/i)).toHaveCount(0)
})

test('switches the offer form from Canada to the United States', async ({ page }) => {
  await page.goto('/offers/new')

  await page.getByLabel('Country').selectOption('US')
  await expect(page.getByLabel('State or DC')).toBeVisible()
  await expect(page.getByText('Keep each offer in its native currency: USD.')).toBeVisible()
  await page.getByLabel('Employment type').selectOption('internship')
  await page.getByLabel('Pay basis').selectOption('hourly')
  await expect(page.getByLabel('Hourly rate (USD)')).toBeVisible()
  await expect(page.getByLabel('Term length (weeks)')).toBeVisible()
})
