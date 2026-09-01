export type User = { id: number; name: string; email: string }

export type Offer = {
  id: number
  company: string
  role: string
  city: string
  jurisdiction: string
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
  relocation_cost_cents: number
  commute_cost_per_office_day_cents: number
  office_days_per_week: string
  working_weeks_per_year: number
  deduction_overrides_cents: Record<string, Record<string, number>>
  created_at: string
  updated_at: string
}

export type ProjectionYear = {
  year: number
  gross_cash_cents: number
  equity_cents: number
  taxable_income_cents: number
  income_tax_cents: number
  federal_tax_cents: number
  provincial_tax_cents: number
  cpp_qpp_cents: number
  ei_qpip_cents: number
  spendable_after_deductions_cents: number
  rent_cents: number
  commute_cents: number
  relocation_cents: number
  location_costs_cents: number
  disposable_cash_cents: number
  benefits_cents: number
  total_package_cents: number
}

export type OfferProjection = {
  offer: Offer
  years: ProjectionYear[]
  totals: Omit<ProjectionYear, 'year'>
}

export type Comparison = {
  tax_data_version: string
  disclaimer: string
  source_urls: string[]
  offers: OfferProjection[]
  winner_offer_id: number
  four_year_disposable_difference_cents: number
}
