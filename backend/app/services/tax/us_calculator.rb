module Tax
  class UsCalculator
    def initialize(income_cents:, jurisdiction:)
      @income = income_cents.to_i / 100.0
      @jurisdiction = jurisdiction
    end

    def call
      federal = progressive_tax([ @income - UsData2026::FEDERAL_STANDARD_DEDUCTION, 0 ].max, UsData2026::FEDERAL_BRACKETS)
      regional = state_tax
      social_security = [ @income, UsData2026::SOCIAL_SECURITY[:maximum] ].min * UsData2026::SOCIAL_SECURITY[:rate]
      medicare = @income * UsData2026::MEDICARE[:rate]
      medicare += [ @income - UsData2026::MEDICARE[:additional_threshold], 0 ].max * UsData2026::MEDICARE[:additional_rate]

      {
        federal_tax_cents: cents(federal), regional_tax_cents: cents(regional),
        income_tax_cents: cents(federal + regional), payroll_deductions_cents: cents(social_security + medicare),
        social_security_cents: cents(social_security), medicare_cents: cents(medicare)
      }
    end

    private

    def state_tax
      return 0 if UsData2026::NO_WAGE_TAX.include?(@jurisdiction)

      rule = UsData2026::STATE_RULES.fetch(@jurisdiction)
      taxable = [ @income - rule.fetch(:deduction, 0), 0 ].max
      rule[:brackets] ? progressive_tax(taxable, rule[:brackets]) : taxable * rule.fetch(:rate)
    end

    def progressive_tax(income, brackets)
      brackets.each_with_index.sum do |(floor, rate), index|
        ceiling = brackets[index + 1]&.first || income
        [ [ income, ceiling ].min - floor, 0 ].max * rate
      end
    end

    def cents(value) = (value * 100).round
  end
end
