class Offer < ApplicationRecord
  JURISDICTIONS = %w[AB BC MB NB NL NS NT NU ON PE QC SK YT].freeze
  US_JURISDICTIONS = %w[AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC].freeze
  COUNTRIES = %w[CA US].freeze
  CURRENCIES = %w[CAD USD].freeze
  EMPLOYMENT_TYPES = %w[full_time internship].freeze
  PAY_BASES = %w[annual hourly].freeze
  WORK_MODES = %w[remote hybrid onsite].freeze
  MONEY_FIELDS = %i[
    salary_cents annual_bonus_cents signing_bonus_cents retirement_match_cents
    taxable_benefits_cents non_taxable_benefits_cents monthly_rent_cents
    monthly_other_living_costs_cents hourly_rate_cents
    relocation_cost_cents commute_cost_per_office_day_cents
  ].freeze

  validates :company, :role, :city, presence: true, length: { maximum: 120 }
  validates :country_code, inclusion: { in: COUNTRIES }
  validates :currency_code, inclusion: { in: CURRENCIES }
  validates :employment_type, inclusion: { in: EMPLOYMENT_TYPES }
  validates :pay_basis, inclusion: { in: PAY_BASES }
  validates :jurisdiction, inclusion: { in: ->(offer) { offer.country_code == "US" ? US_JURISDICTIONS : JURISDICTIONS } }
  validate :currency_matches_country
  validates :work_mode, inclusion: { in: WORK_MODES }
  validates :hours_per_week, numericality: { greater_than: 0, less_than_or_equal_to: 80 }
  validates :term_weeks, numericality: { only_integer: true, in: 1..52 }
  validates :office_days_per_week, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 7 }
  validates :working_weeks_per_year, numericality: { only_integer: true, in: 1..52 }
  validates(*MONEY_FIELDS, numericality: { only_integer: true, greater_than_or_equal_to: 0 })
  validate :four_equity_years

  before_validation :normalize_equity_vesting

  private

  def currency_matches_country
    expected = country_code == "US" ? "USD" : "CAD"
    errors.add(:currency_code, "must match the offer country") unless currency_code == expected
  end

  def normalize_equity_vesting
    values = Array(equity_vesting_cents).first(4).map { |value| [ value.to_i, 0 ].max }
    self.equity_vesting_cents = values.fill(0, values.length...4)
  end

  def four_equity_years
    return if equity_vesting_cents.is_a?(Array) && equity_vesting_cents.length == 4

    errors.add(:equity_vesting_cents, "must include exactly four annual values")
  end
end
