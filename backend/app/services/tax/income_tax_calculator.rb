module Tax
  class IncomeTaxCalculator
    def initialize(income_cents:, jurisdiction:, payroll:)
      @income = income_cents.to_i / 100.0
      @jurisdiction = jurisdiction
      @payroll = payroll
    end

    def call
      federal = federal_tax
      provincial = provincial_tax

      {
        federal_tax_cents: cents(federal),
        provincial_tax_cents: cents(provincial),
        income_tax_cents: cents(federal + provincial)
      }
    end

    private

    def federal_tax
      lowest_rate = Data2026::FEDERAL_BRACKETS.first.last
      payroll_credit = base_payroll_dollars * lowest_rate
      credits = (federal_basic_amount + [ @income, Data2026::CANADA_EMPLOYMENT_AMOUNT ].min) * lowest_rate
      tax = progressive_tax(@income, Data2026::FEDERAL_BRACKETS) - credits - payroll_credit
      tax *= 0.835 if @jurisdiction == "QC"
      [ tax, 0 ].max
    end

    def provincial_tax
      rules = Data2026::PROVINCES.fetch(@jurisdiction)
      lowest_rate = rules[:brackets].first.last
      tax = progressive_tax(@income, rules[:brackets])
      tax -= rules[:basic] * lowest_rate
      tax -= base_payroll_dollars * lowest_rate unless @jurisdiction == "QC"
      tax = [ tax, 0 ].max
      tax += ontario_surtax(tax) + ontario_health_premium if @jurisdiction == "ON"
      tax
    end

    def progressive_tax(income, brackets)
      brackets.each_with_index.sum do |(floor, rate), index|
        ceiling = brackets[index + 1]&.first || income
        taxable = [ [ income, ceiling ].min - floor, 0 ].max
        taxable * rate
      end
    end

    def federal_basic_amount
      return Data2026::FEDERAL_BASIC_MAX if @income <= Data2026::FEDERAL_BASIC_PHASEOUT_START
      return Data2026::FEDERAL_BASIC_MIN if @income >= Data2026::FEDERAL_BASIC_PHASEOUT_END

      range = Data2026::FEDERAL_BASIC_PHASEOUT_END - Data2026::FEDERAL_BASIC_PHASEOUT_START
      progress = (@income - Data2026::FEDERAL_BASIC_PHASEOUT_START) / range
      Data2026::FEDERAL_BASIC_MAX - progress * (Data2026::FEDERAL_BASIC_MAX - Data2026::FEDERAL_BASIC_MIN)
    end

    def base_payroll_dollars
      (@payroll[:base_pension_cents] + @payroll[:ei_cents] + @payroll[:qpip_cents]) / 100.0
    end

    def ontario_surtax(basic_tax)
      [ basic_tax - 5_818, 0 ].max * 0.20 + [ basic_tax - 7_446, 0 ].max * 0.36
    end

    def ontario_health_premium
      case @income
      when ..20_000 then 0
      when ..36_000 then [ (@income - 20_000) * 0.06, 300 ].min
      when ..48_000 then [ 300 + (@income - 36_000) * 0.06, 450 ].min
      when ..72_000 then [ 450 + (@income - 48_000) * 0.25, 600 ].min
      when ..200_000 then [ 600 + (@income - 72_000) * 0.25, 750 ].min
      else [ 750 + (@income - 200_000) * 0.25, 900 ].min
      end
    end

    def cents(value)
      (value * 100).round
    end
  end
end
