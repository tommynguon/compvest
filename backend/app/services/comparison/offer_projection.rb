module Comparison
  class OfferProjection
    def initialize(offer)
      @offer = offer
    end

    def call
      years = (1..4).map { |year| project_year(year) }

      {
        offer: OfferSerializer.render(@offer),
        years: years,
        totals: sum_years(years)
      }
    end

    private

    def project_year(year)
      signing_bonus = year == 1 ? @offer.signing_bonus_cents : 0
      equity = @offer.equity_vesting_cents.fetch(year - 1, 0).to_i
      gross_cash = @offer.salary_cents + @offer.annual_bonus_cents + signing_bonus
      taxable_income = gross_cash + equity + @offer.taxable_benefits_cents
      payroll = Tax::PayrollCalculator.new(income_cents: taxable_income, jurisdiction: @offer.jurisdiction).call
      income_tax = Tax::IncomeTaxCalculator.new(
        income_cents: taxable_income,
        jurisdiction: @offer.jurisdiction,
        payroll: payroll
      ).call
      deductions = apply_overrides(year, payroll.merge(income_tax))
      location_costs = location_costs_for(year)
      spendable_value = gross_cash + equity - deductions[:income_tax_cents] -
        deductions[:cpp_qpp_cents] - deductions[:ei_qpip_cents]
      benefits = @offer.retirement_match_cents + @offer.taxable_benefits_cents + @offer.non_taxable_benefits_cents

      {
        year: year,
        gross_cash_cents: gross_cash,
        equity_cents: equity,
        taxable_income_cents: taxable_income,
        income_tax_cents: deductions[:income_tax_cents],
        federal_tax_cents: deductions[:federal_tax_cents],
        provincial_tax_cents: deductions[:provincial_tax_cents],
        cpp_qpp_cents: deductions[:cpp_qpp_cents],
        ei_qpip_cents: deductions[:ei_qpip_cents],
        spendable_after_deductions_cents: spendable_value,
        rent_cents: location_costs[:rent_cents],
        commute_cents: location_costs[:commute_cents],
        relocation_cents: location_costs[:relocation_cents],
        location_costs_cents: location_costs.values.sum,
        disposable_cash_cents: spendable_value - location_costs.values.sum,
        benefits_cents: benefits,
        total_package_cents: gross_cash + equity + benefits
      }
    end

    def apply_overrides(year, deductions)
      overrides = @offer.deduction_overrides_cents.fetch(year.to_s, {})
      %i[income_tax_cents cpp_qpp_cents ei_qpip_cents].each do |key|
        value = overrides[key.to_s]
        deductions[key] = value.to_i if value.present?
      end
      deductions
    end

    def location_costs_for(year)
      {
        rent_cents: @offer.monthly_rent_cents * 12,
        commute_cents: (@offer.commute_cost_per_office_day_cents * @offer.office_days_per_week * @offer.working_weeks_per_year).round,
        relocation_cents: year == 1 ? @offer.relocation_cost_cents : 0
      }
    end

    def sum_years(years)
      keys = years.first.keys - [ :year ]
      keys.to_h { |key| [ key, years.sum { |year| year[key] } ] }
    end
  end
end
