require "test_helper"

class TaxCalculatorTest < ActiveSupport::TestCase
  test "calculates positive deductions for all provinces and territories" do
    Offer::JURISDICTIONS.each do |jurisdiction|
      payroll = Tax::PayrollCalculator.new(income_cents: 10_000_000, jurisdiction: jurisdiction).call
      income_tax = Tax::IncomeTaxCalculator.new(
        income_cents: 10_000_000,
        jurisdiction: jurisdiction,
        payroll: payroll
      ).call

      assert_predicate payroll[:cpp_qpp_cents], :positive?, jurisdiction
      assert_predicate payroll[:ei_qpip_cents], :positive?, jurisdiction
      assert_predicate income_tax[:income_tax_cents], :positive?, jurisdiction
    end
  end

  test "applies the second CPP band above YMPE" do
    below = Tax::PayrollCalculator.new(income_cents: 7_000_000, jurisdiction: "ON").call
    above = Tax::PayrollCalculator.new(income_cents: 8_500_000, jurisdiction: "ON").call

    assert_equal 0, below[:second_pension_cents]
    assert_equal 41_600, above[:second_pension_cents]
  end

  test "includes Quebec QPIP and federal abatement" do
    payroll = Tax::PayrollCalculator.new(income_cents: 10_000_000, jurisdiction: "QC").call
    taxes = Tax::IncomeTaxCalculator.new(income_cents: 10_000_000, jurisdiction: "QC", payroll: payroll).call

    assert_predicate payroll[:qpip_cents], :positive?
    assert_operator taxes[:federal_tax_cents], :<, taxes[:provincial_tax_cents]
  end

  test "calculates federal, FICA, and progressive California taxes" do
    taxes = Tax::UsCalculator.new(income_cents: 12_000_000, jurisdiction: "CA").call

    assert_predicate taxes[:federal_tax_cents], :positive?
    assert_predicate taxes[:regional_tax_cents], :positive?
    assert_equal 744_000, taxes[:social_security_cents]
    assert_equal 174_000, taxes[:medicare_cents]
  end

  test "supports flat-tax and no-wage-tax states plus DC" do
    colorado = Tax::UsCalculator.new(income_cents: 10_000_000, jurisdiction: "CO").call
    washington = Tax::UsCalculator.new(income_cents: 10_000_000, jurisdiction: "WA").call
    district = Tax::UsCalculator.new(income_cents: 10_000_000, jurisdiction: "DC").call

    assert_predicate colorado[:regional_tax_cents], :positive?
    assert_equal 0, washington[:regional_tax_cents]
    assert_operator district[:regional_tax_cents], :>, colorado[:regional_tax_cents]
  end

  test "caps Social Security wages and applies additional Medicare" do
    taxes = Tax::UsCalculator.new(income_cents: 30_000_000, jurisdiction: "TX").call

    assert_equal 1_143_900, taxes[:social_security_cents]
    assert_equal 525_000, taxes[:medicare_cents]
  end
end
