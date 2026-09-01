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
end
