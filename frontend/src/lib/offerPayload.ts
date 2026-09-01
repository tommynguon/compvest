import type { OfferFormValues } from '../components/OfferForm'
import { dollarsToCents } from './money'

export function toOfferPayload(values: OfferFormValues) {
  const overrides: Record<string, Record<string, number>> = {}
  ;[values.tax_override_1, values.tax_override_2, values.tax_override_3, values.tax_override_4].forEach((value, index) => {
    if (value !== undefined && !Number.isNaN(value)) overrides[String(index + 1)] = { income_tax_cents: dollarsToCents(value) }
  })

  return {
    company: values.company, role: values.role, city: values.city, jurisdiction: values.jurisdiction,
    work_mode: values.work_mode, notes: values.notes,
    salary_cents: dollarsToCents(values.salary), annual_bonus_cents: dollarsToCents(values.annual_bonus),
    signing_bonus_cents: dollarsToCents(values.signing_bonus), retirement_match_cents: dollarsToCents(values.retirement_match),
    taxable_benefits_cents: dollarsToCents(values.taxable_benefits), non_taxable_benefits_cents: dollarsToCents(values.non_taxable_benefits),
    equity_vesting_cents: [values.equity_1, values.equity_2, values.equity_3, values.equity_4].map(dollarsToCents),
    monthly_rent_cents: dollarsToCents(values.monthly_rent), relocation_cost_cents: dollarsToCents(values.relocation_cost),
    commute_cost_per_office_day_cents: dollarsToCents(values.commute_cost), office_days_per_week: values.office_days,
    working_weeks_per_year: values.working_weeks, deduction_overrides_cents: overrides,
  }
}
