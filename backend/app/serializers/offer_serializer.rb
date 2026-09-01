class OfferSerializer
  FIELDS = %i[
    id company role city jurisdiction work_mode notes salary_cents annual_bonus_cents
    signing_bonus_cents retirement_match_cents taxable_benefits_cents
    non_taxable_benefits_cents equity_vesting_cents monthly_rent_cents
    relocation_cost_cents commute_cost_per_office_day_cents office_days_per_week
    working_weeks_per_year deduction_overrides_cents created_at updated_at
  ].freeze

  def self.render(offer)
    offer.as_json(only: FIELDS)
  end
end
