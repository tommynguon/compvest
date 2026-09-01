export type CountryCode = 'CA' | 'US'
export type CurrencyCode = 'CAD' | 'USD'
export type EmploymentType = 'full_time' | 'internship'
export type PayBasis = 'annual' | 'hourly'

export type Offer = {
  id: number
  company: string
  role: string
  city: string
  country_code: CountryCode
  currency_code: CurrencyCode
  jurisdiction: string
  employment_type: EmploymentType
  pay_basis: PayBasis
  hourly_rate_cents: number
  hours_per_week: string
  term_weeks: number
  work_mode: 'remote' | 'hybrid' | 'onsite'
  notes: string | null
  salary_cents: number
  annual_bonus_cents: number
  signing_bonus_cents: number
  retirement_match_cents: number
  taxable_benefits_cents: number
  non_taxable_benefits_cents: number
  equity_vesting_cents: number[]
  monthly_rent_cents: number
  monthly_other_living_costs_cents: number
  relocation_cost_cents: number
  commute_cost_per_office_day_cents: number
  office_days_per_week: string
  working_weeks_per_year: number
  deduction_overrides_cents: Record<string, Record<string, number>>
  created_at: string
  updated_at: string
}

export type ProjectionPeriod = {
  period_number: number
  label: string
  duration_weeks: number
  gross_cash_cents: number
  equity_cents: number
  taxable_income_cents: number
  income_tax_cents: number
  federal_tax_cents: number
  regional_tax_cents: number
  payroll_deductions_cents: number
  cpp_qpp_cents: number
  ei_qpip_cents: number
  social_security_cents: number
  medicare_cents: number
  spendable_after_deductions_cents: number
  rent_cents: number
  commute_cents: number
  relocation_cents: number
  other_living_costs_cents: number
  location_costs_cents: number
  estimated_savings_cents: number
  benefits_cents: number
  total_package_cents: number
}

export type OfferProjection = {
  offer: Offer
  native_currency: CurrencyCode
  display_currency: CurrencyCode
  periods: ProjectionPeriod[]
  totals: Omit<ProjectionPeriod, 'period_number' | 'label' | 'duration_weeks'>
  comparison_weeks: number
  weekly_savings_cents: number
}

export type Comparison = {
  tax_data_version: string
  display_currency: CurrencyCode
  usd_to_cad_rate: string
  exchange_rate_date: string
  comparison_basis: 'weekly_savings' | 'four_year_savings'
  disclaimer: string
  source_urls: string[]
  offers: OfferProjection[]
  winner_offer_id: number
  savings_difference_cents: number
}
