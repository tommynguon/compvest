require "test_helper"

class ComparisonBuilderTest < ActiveSupport::TestCase
  setup do
    @offer = Offer.create!(
      company: "Northstar", role: "Developer", city: "Toronto", jurisdiction: "ON",
      country_code: "CA", currency_code: "CAD", employment_type: "full_time", pay_basis: "annual",
      salary_cents: 10_000_000, annual_bonus_cents: 500_000, signing_bonus_cents: 250_000,
      equity_vesting_cents: [ 100_000, 200_000, 300_000, 400_000 ],
      monthly_rent_cents: 200_000, monthly_other_living_costs_cents: 60_000,
      relocation_cost_cents: 300_000, commute_cost_per_office_day_cents: 1_000,
      office_days_per_week: 2
    )
    @converter = Money::CurrencyConverter.new(display_currency: "CAD", usd_to_cad_rate: "1.3888")
  end

  test "projects signing and relocation only in year one" do
    periods = Comparison::OfferProjection.new(@offer, converter: @converter).call[:periods]

    assert_equal 10_750_000, periods.first[:gross_cash_cents]
    assert_equal 10_500_000, periods.second[:gross_cash_cents]
    assert_equal 300_000, periods.first[:relocation_cents]
    assert_equal 0, periods.second[:relocation_cents]
    assert_equal 100_000, periods.first[:equity_cents]
    assert_equal 400_000, periods.last[:equity_cents]
  end

  test "uses manual income-tax and payroll overrides" do
    @offer.update!(deduction_overrides_cents: {
      "1" => { "income_tax_cents" => 1_234_500, "payroll_deductions_cents" => 456_700 }
    })

    period = Comparison::OfferProjection.new(@offer, converter: @converter).call[:periods].first

    assert_equal 1_234_500, period[:income_tax_cents]
    assert_equal 456_700, period[:payroll_deductions_cents]
  end

  test "prorates internship pay and expenses over the exact term" do
    @offer.update!(
      employment_type: "internship", pay_basis: "hourly", hourly_rate_cents: 5_000,
      hours_per_week: 40, term_weeks: 12, signing_bonus_cents: 100_000
    )

    projection = Comparison::OfferProjection.new(@offer, converter: @converter).call

    assert_equal 1, projection[:periods].length
    assert_equal 2_615_385, projection.dig(:periods, 0, :gross_cash_cents)
    assert_equal 12, projection[:comparison_weeks]
    expected_weekly = (BigDecimal(projection.dig(:totals, :estimated_savings_cents).to_s) / 12).round.to_i
    assert_equal expected_weekly, projection[:weekly_savings_cents]
  end

  test "normalizes U.S. dollars and compares unequal internships per week" do
    @offer.update!(employment_type: "internship", term_weeks: 16)
    us_offer = Offer.create!(
      company: "Cascade", role: "Intern", city: "Seattle", country_code: "US", currency_code: "USD",
      jurisdiction: "WA", employment_type: "internship", pay_basis: "hourly", hourly_rate_cents: 5_000,
      hours_per_week: 40, term_weeks: 12, equity_vesting_cents: [ 0, 0, 0, 0 ]
    )

    comparison = Comparison::Builder.new(
      [ @offer, us_offer ], display_currency: "CAD", usd_to_cad_rate: "1.4"
    ).call

    assert_equal "weekly_savings", comparison[:comparison_basis]
    assert_equal "CAD", comparison[:display_currency]
    assert_equal "1.4", comparison[:usd_to_cad_rate]
    assert_equal 3_360_000, comparison.dig(:offers, 1, :periods, 0, :gross_cash_cents)
  end

  test "preserves the exchange rate provenance used by a comparison" do
    comparison = Comparison::Builder.new(
      [ @offer, @offer ],
      display_currency: "CAD",
      usd_to_cad_rate: "1.3762",
      exchange_rate_date: "2026-08-31",
      exchange_rate_source: "bank_of_canada"
    ).call

    assert_equal "2026-08-31", comparison[:exchange_rate_date]
    assert_equal "bank_of_canada", comparison[:exchange_rate_source]
    assert_equal ExchangeRates::BankOfCanada::SOURCE_URL, comparison[:exchange_rate_source_url]
  end
end
