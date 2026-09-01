class Offer < ApplicationRecord
  JURISDICTIONS = %w[AB BC MB NB NL NS NT NU ON PE QC SK YT].freeze
  WORK_MODES = %w[remote hybrid onsite].freeze
  MONEY_FIELDS = %i[
    salary_cents annual_bonus_cents signing_bonus_cents retirement_match_cents
    taxable_benefits_cents non_taxable_benefits_cents monthly_rent_cents
    relocation_cost_cents commute_cost_per_office_day_cents
  ].freeze

  belongs_to :user

  validates :company, :role, :city, presence: true, length: { maximum: 120 }
  validates :jurisdiction, inclusion: { in: JURISDICTIONS }
  validates :work_mode, inclusion: { in: WORK_MODES }
  validates :office_days_per_week, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 7 }
  validates :working_weeks_per_year, numericality: { only_integer: true, in: 1..52 }
  validates(*MONEY_FIELDS, numericality: { only_integer: true, greater_than_or_equal_to: 0 })
  validate :four_equity_years

  before_validation :normalize_equity_vesting

  private

  def normalize_equity_vesting
    values = Array(equity_vesting_cents).first(4).map { |value| [ value.to_i, 0 ].max }
    self.equity_vesting_cents = values.fill(0, values.length...4)
  end

  def four_equity_years
    return if equity_vesting_cents.is_a?(Array) && equity_vesting_cents.length == 4

    errors.add(:equity_vesting_cents, "must include exactly four annual values")
  end
end
