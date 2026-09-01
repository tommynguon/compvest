offers = [
  {
    company: "Northstar Labs", role: "Software Developer Intern", city: "Toronto",
    country_code: "CA", currency_code: "CAD", jurisdiction: "ON", employment_type: "internship",
    pay_basis: "annual", salary_cents: 8_800_000, hours_per_week: 40, term_weeks: 16, work_mode: "hybrid",
    signing_bonus_cents: 150_000, taxable_benefits_cents: 40_000, equity_vesting_cents: [ 0, 0, 0, 0 ],
    monthly_rent_cents: 190_000, monthly_other_living_costs_cents: 75_000,
    commute_cost_per_office_day_cents: 1_600, office_days_per_week: 2, working_weeks_per_year: 48,
    notes: "Four-month Toronto internship with a two-day hybrid schedule."
  },
  {
    company: "Cascade Financial", role: "Software Engineering Intern", city: "Seattle",
    country_code: "US", currency_code: "USD", jurisdiction: "WA", employment_type: "internship",
    pay_basis: "hourly", hourly_rate_cents: 5_200, hours_per_week: 40, term_weeks: 12, work_mode: "onsite",
    signing_bonus_cents: 200_000, taxable_benefits_cents: 60_000, equity_vesting_cents: [ 0, 0, 0, 0 ],
    monthly_rent_cents: 220_000, monthly_other_living_costs_cents: 95_000,
    relocation_cost_cents: 100_000, commute_cost_per_office_day_cents: 1_200,
    office_days_per_week: 5, working_weeks_per_year: 48,
    notes: "Twelve-week Seattle internship with relocation included."
  }
]

offers.each do |attributes|
  offer = Offer.find_or_initialize_by(company: attributes[:company], role: attributes[:role])
  offer.update!(attributes)
end

puts "CompVest sample offers are ready."
