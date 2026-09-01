module Tax
  class PayrollCalculator
    def initialize(income_cents:, jurisdiction:)
      @income = income_cents.to_i / 100.0
      @jurisdiction = jurisdiction
    end

    def call
      pension = pension_contributions
      insurance = insurance_contributions

      {
        cpp_qpp_cents: cents(pension[:base] + pension[:second]),
        base_pension_cents: cents(pension[:base]),
        second_pension_cents: cents(pension[:second]),
        ei_qpip_cents: cents(insurance.values.sum),
        ei_cents: cents(insurance[:ei]),
        qpip_cents: cents(insurance[:qpip])
      }
    end

    private

    def pension_contributions
      rules = @jurisdiction == "QC" ? Data2026::QPP : Data2026::CPP
      base_earnings = [ [ @income, rules[:ympe] ].min - rules[:exemption], 0 ].max
      second_earnings = [ [ @income, rules[:yampe] ].min - rules[:ympe], 0 ].max

      { base: base_earnings * rules[:rate], second: second_earnings * rules[:second_rate] }
    end

    def insurance_contributions
      ei_rules = @jurisdiction == "QC" ? Data2026::EI_QUEBEC : Data2026::EI
      ei = [ @income, ei_rules[:maximum] ].min * ei_rules[:rate]
      qpip = @jurisdiction == "QC" ? [ @income, Data2026::QPIP[:maximum] ].min * Data2026::QPIP[:rate] : 0
      { ei: ei, qpip: qpip }
    end

    def cents(value)
      (value * 100).round
    end
  end
end
