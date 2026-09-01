import { describe, expect, it } from 'vitest'
import type { OfferFormValues } from '../components/OfferForm'
import { toOfferPayload } from './offerPayload'

const values: OfferFormValues = {
  company: 'Northstar', role: 'Developer', city: 'Toronto', jurisdiction: 'ON', work_mode: 'hybrid', notes: '',
  salary: 100000, annual_bonus: 5000, signing_bonus: 2500, retirement_match: 4000,
  taxable_benefits: 1000, non_taxable_benefits: 500, equity_1: 10000, equity_2: 12000,
  equity_3: 14000, equity_4: 16000, monthly_rent: 2000, relocation_cost: 3000,
  commute_cost: 15, office_days: 2, working_weeks: 48, tax_override_1: 23450,
}

describe('offer payload', () => {
  it('converts every monetary input to integer cents', () => {
    const payload = toOfferPayload(values)

    expect(payload.salary_cents).toBe(10_000_000)
    expect(payload.equity_vesting_cents).toEqual([1_000_000, 1_200_000, 1_400_000, 1_600_000])
    expect(payload.deduction_overrides_cents['1'].income_tax_cents).toBe(2_345_000)
  })
})
