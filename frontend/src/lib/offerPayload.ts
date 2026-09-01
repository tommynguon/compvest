import type { OfferFormValues } from '../components/OfferForm'
import { dollarsToCents } from './money'

export function toOfferPayload(values: OfferFormValues) {
  const overrides: Record<string, Record<string, number>> = {}
  for (let index = 1; index <= 4; index += 1) {
    const incomeTax = values[`tax_override_${index}` as keyof OfferFormValues] as number | undefined
    const payroll = values[`payroll_override_${index}` as keyof OfferFormValues] as number | undefined
    const period: Record<string, number> = {}
    if (incomeTax !== undefined && !Number.isNaN(incomeTax)) period.income_tax_cents = dollarsToCents(incomeTax)
    if (payroll !== undefined && !Number.isNaN(payroll)) period.payroll_deductions_cents = dollarsToCents(payroll)
    if (Object.keys(period).length > 0) overrides[String(index)] = period
  }

  return {
    company: values.company, role: values.role, city: values.city, country_code: values.country_code,
    currency_code: values.country_code === 'US' ? 'USD' : 'CAD', jurisdiction: values.jurisdiction,
    employment_type: values.employment_type, pay_basis: values.pay_basis, work_mode: values.work_mode,
    notes: values.notes, salary_cents: dollarsToCents(values.salary), hourly_rate_cents: dollarsToCents(values.hourly_rate),
    hours_per_week: values.hours_per_week, term_weeks: values.term_weeks,
    annual_bonus_cents: dollarsToCents(values.annual_bonus), signing_bonus_cents: dollarsToCents(values.signing_bonus),
    retirement_match_cents: dollarsToCents(values.retirement_match),
    taxable_benefits_cents: dollarsToCents(values.taxable_benefits),
    non_taxable_benefits_cents: dollarsToCents(values.non_taxable_benefits),
    equity_vesting_cents: [values.equity_1, values.equity_2, values.equity_3, values.equity_4].map(dollarsToCents),
    monthly_rent_cents: dollarsToCents(values.monthly_rent),
    monthly_other_living_costs_cents: dollarsToCents(values.monthly_other_living_costs),
    relocation_cost_cents: dollarsToCents(values.relocation_cost),
    commute_cost_per_office_day_cents: dollarsToCents(values.commute_cost),
    office_days_per_week: values.office_days, working_weeks_per_year: values.working_weeks,
    deduction_overrides_cents: overrides,
  }
}
