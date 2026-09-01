require "test_helper"

class ComparisonBuilderTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(name: "Test User", email: "builder@example.com", password: "password123")
    @offer = @user.offers.create!(
      company: "Northstar", role: "Developer", city: "Toronto", jurisdiction: "ON",
      salary_cents: 10_000_000, annual_bonus_cents: 500_000, signing_bonus_cents: 250_000,
      equity_vesting_cents: [ 100_000, 200_000, 300_000, 400_000 ],
      monthly_rent_cents: 200_000, relocation_cost_cents: 300_000,
      commute_cost_per_office_day_cents: 1_000, office_days_per_week: 2
    )
  end

  test "projects signing and relocation only in year one" do
    years = Comparison::OfferProjection.new(@offer).call[:years]

    assert_equal 10_750_000, years.first[:gross_cash_cents]
    assert_equal 10_500_000, years.second[:gross_cash_cents]
    assert_equal 300_000, years.first[:relocation_cents]
    assert_equal 0, years.second[:relocation_cents]
    assert_equal 100_000, years.first[:equity_cents]
    assert_equal 400_000, years.last[:equity_cents]
  end

  test "uses an annual income-tax override" do
    @offer.update!(deduction_overrides_cents: { "1" => { "income_tax_cents" => 1_234_500 } })

    year = Comparison::OfferProjection.new(@offer).call[:years].first

    assert_equal 1_234_500, year[:income_tax_cents]
  end
end
