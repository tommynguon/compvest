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

test('updates the saved rate from the Bank of Canada and keeps manual overrides', async ({ page }) => {
  await page.route('**/api/v1/offers', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ offers: [{
      id: 1,
      company: 'Northstar',
      role: 'Developer Intern',
      city: 'Toronto',
      jurisdiction: 'ON',
      country_code: 'CA',
      currency_code: 'CAD',
      employment_type: 'internship',
      pay_basis: 'hourly',
      hourly_rate_cents: 4000,
      hours_per_week: '40.0',
      term_weeks: 16,
      work_mode: 'hybrid',
      salary_cents: 0,
      annual_bonus_cents: 0,
      signing_bonus_cents: 0,
      retirement_match_cents: 0,
      taxable_benefits_cents: 0,
      non_taxable_benefits_cents: 0,
      equity_vesting_cents: [0, 0, 0, 0],
    }] }),
  }))
  await page.route('**/api/v1/reference/exchange_rate', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ exchange_rate: {
      base_currency: 'USD',
      quote_currency: 'CAD',
      usd_to_cad_rate: '1.3762',
      observed_at: '2026-08-31',
      source_name: 'Bank of Canada Valet API',
      source_url: 'https://www.bankofcanada.ca/valet/docs/',
    } }),
  }))

  await page.goto('/')
  await page.getByRole('button', { name: 'Use latest' }).click()

  await expect(page.getByLabel('USD to CAD exchange rate')).toHaveValue('1.3762')
  await expect(page.getByText('Bank of Canada · 2026-08-31')).toBeVisible()

  await page.getByLabel('USD to CAD exchange rate').fill('1.4')
  await expect(page.getByText('Manual override · saved locally')).toBeVisible()
})
