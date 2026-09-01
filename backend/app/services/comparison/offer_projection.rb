module Comparison
  class OfferProjection
    MONEY_KEYS = %i[
      gross_cash_cents equity_cents taxable_income_cents income_tax_cents
      federal_tax_cents regional_tax_cents payroll_deductions_cents
      cpp_qpp_cents ei_qpip_cents social_security_cents medicare_cents
      spendable_after_deductions_cents rent_cents commute_cents relocation_cents
      other_living_costs_cents location_costs_cents estimated_savings_cents
      benefits_cents total_package_cents
    ].freeze

    def initialize(offer, converter:)
      @offer = offer
      @converter = converter
    end

    def call
      periods = period_numbers.map { |number| convert_period(project_period(number)) }
      totals = sum_periods(periods)
      comparison_weeks = internship? ? @offer.term_weeks : 208

      {
        offer: OfferSerializer.render(@offer),
        native_currency: @offer.currency_code,
        display_currency: @converter.display_currency,
        periods: periods,
        totals: totals,
        comparison_weeks: comparison_weeks,
        weekly_savings_cents: divide_cents(totals[:estimated_savings_cents], comparison_weeks)
      }
    end

    private

    def project_period(number)
      factor = internship? ? BigDecimal(@offer.term_weeks.to_s) / 52 : BigDecimal("1")
      signing_bonus = number == 1 ? @offer.signing_bonus_cents : 0
      equity = prorate(@offer.equity_vesting_cents.fetch(number - 1, 0), factor)
      gross_cash = base_pay(factor) + prorate(@offer.annual_bonus_cents, factor) + signing_bonus
      taxable_benefits = prorate(@offer.taxable_benefits_cents, factor)
      taxable_income = gross_cash + equity + taxable_benefits
      deductions = apply_overrides(number, estimate_tax(taxable_income))
      costs = living_costs(number, factor)
      spendable = gross_cash + equity - deductions[:income_tax_cents] - deductions[:payroll_deductions_cents]
      benefits = prorate(
        @offer.retirement_match_cents + @offer.taxable_benefits_cents + @offer.non_taxable_benefits_cents,
        factor
      )

      {
        period_number: number,
        label: internship? ? "Internship term" : "Year #{number}",
        duration_weeks: internship? ? @offer.term_weeks : 52,
        gross_cash_cents: gross_cash,
        equity_cents: equity,
        taxable_income_cents: taxable_income,
        income_tax_cents: deductions[:income_tax_cents],
        federal_tax_cents: deductions[:federal_tax_cents],
        regional_tax_cents: deductions[:regional_tax_cents],
        payroll_deductions_cents: deductions[:payroll_deductions_cents],
        cpp_qpp_cents: deductions[:cpp_qpp_cents].to_i,
        ei_qpip_cents: deductions[:ei_qpip_cents].to_i,
        social_security_cents: deductions[:social_security_cents].to_i,
        medicare_cents: deductions[:medicare_cents].to_i,
        spendable_after_deductions_cents: spendable,
        rent_cents: costs[:rent_cents],
        commute_cents: costs[:commute_cents],
        relocation_cents: costs[:relocation_cents],
        other_living_costs_cents: costs[:other_living_costs_cents],
        location_costs_cents: costs.values.sum,
        estimated_savings_cents: spendable - costs.values.sum,
        benefits_cents: benefits,
        total_package_cents: gross_cash + equity + benefits
      }
    end

    def estimate_tax(taxable_income)
      Tax::Estimator.new(
        income_cents: taxable_income,
        country_code: @offer.country_code,
        jurisdiction: @offer.jurisdiction
      ).call
    end

    def apply_overrides(period, deductions)
      overrides = @offer.deduction_overrides_cents.fetch(period.to_s, {})
      %i[income_tax_cents payroll_deductions_cents].each do |key|
        value = overrides[key.to_s]
        deductions[key] = value.to_i if value.present?
      end
      deductions
    end

    def living_costs(period, factor)
      {
        rent_cents: prorate(@offer.monthly_rent_cents * 12, factor),
        commute_cents: commute_cost(factor),
        relocation_cents: period == 1 ? @offer.relocation_cost_cents : 0,
        other_living_costs_cents: prorate(@offer.monthly_other_living_costs_cents * 12, factor)
      }
    end

    def base_pay(factor)
      return prorate(@offer.salary_cents, factor) if @offer.pay_basis == "annual"

      weeks = internship? ? @offer.term_weeks : 52
      (@offer.hourly_rate_cents * @offer.hours_per_week * weeks).round
    end

    def commute_cost(factor)
      annual = @offer.commute_cost_per_office_day_cents * @offer.office_days_per_week *
        @offer.working_weeks_per_year
      prorate(annual, factor)
    end

    def convert_period(period)
      period.each_with_object({}) do |(key, value), converted|
        converted[key] = if MONEY_KEYS.include?(key)
          @converter.convert_cents(value, from: @offer.currency_code)
        else
          value
        end
      end
    end

    def sum_periods(periods)
      MONEY_KEYS.to_h { |key| [ key, periods.sum { |period| period[key].to_i } ] }
    end

    def divide_cents(cents, divisor)
      (BigDecimal(cents.to_s) / divisor).round(0, BigDecimal::ROUND_HALF_UP).to_i
    end

    def prorate(cents, factor)
      (BigDecimal(cents.to_s) * factor).round(0, BigDecimal::ROUND_HALF_UP).to_i
    end

    def period_numbers
      internship? ? [ 1 ] : (1..4)
    end

    def internship?
      @offer.employment_type == "internship"
    end
  end
end
