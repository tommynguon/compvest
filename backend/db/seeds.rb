demo = User.find_or_initialize_by(email: "demo@offerlens.ca")
demo.assign_attributes(name: "OfferLens Demo", password: "DemoOffer2026!", password_confirmation: "DemoOffer2026!")
demo.save!

offers = [
  {
    company: "Northstar Labs", role: "Software Developer", city: "Toronto", jurisdiction: "ON", work_mode: "hybrid",
    salary_cents: 10_500_000, annual_bonus_cents: 800_000, signing_bonus_cents: 500_000,
    retirement_match_cents: 420_000, taxable_benefits_cents: 120_000, non_taxable_benefits_cents: 180_000,
    equity_vesting_cents: [ 1_200_000, 1_500_000, 1_800_000, 2_000_000 ], monthly_rent_cents: 230_000,
    relocation_cost_cents: 250_000, commute_cost_per_office_day_cents: 1_800, office_days_per_week: 2, working_weeks_per_year: 48,
    notes: "Downtown office with a two-day hybrid schedule."
  },
  {
    company: "Maple Ledger", role: "Full-Stack Engineer", city: "Montreal", jurisdiction: "QC", work_mode: "remote",
    salary_cents: 9_800_000, annual_bonus_cents: 1_000_000, signing_bonus_cents: 300_000,
    retirement_match_cents: 490_000, taxable_benefits_cents: 100_000, non_taxable_benefits_cents: 220_000,
    equity_vesting_cents: [ 1_600_000, 1_600_000, 1_900_000, 2_200_000 ], monthly_rent_cents: 175_000,
    relocation_cost_cents: 400_000, commute_cost_per_office_day_cents: 0, office_days_per_week: 0, working_weeks_per_year: 48,
    notes: "Remote-first team with quarterly Montreal meetups."
  }
]

offers.each do |attributes|
  offer = demo.offers.find_or_initialize_by(company: attributes[:company])
  offer.update!(attributes)
end

puts "Demo ready: demo@offerlens.ca / DemoOffer2026!"
