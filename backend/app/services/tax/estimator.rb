module Tax
  class Estimator
    def initialize(income_cents:, country_code:, jurisdiction:)
      @income_cents = income_cents
      @country_code = country_code
      @jurisdiction = jurisdiction
    end

    def call
      return UsCalculator.new(income_cents: @income_cents, jurisdiction: @jurisdiction).call if @country_code == "US"

      payroll = PayrollCalculator.new(income_cents: @income_cents, jurisdiction: @jurisdiction).call
      income_tax = IncomeTaxCalculator.new(income_cents: @income_cents, jurisdiction: @jurisdiction, payroll: payroll).call
      {
        federal_tax_cents: income_tax[:federal_tax_cents], regional_tax_cents: income_tax[:provincial_tax_cents],
        income_tax_cents: income_tax[:income_tax_cents], payroll_deductions_cents: payroll[:cpp_qpp_cents] + payroll[:ei_qpip_cents],
        cpp_qpp_cents: payroll[:cpp_qpp_cents], ei_qpip_cents: payroll[:ei_qpip_cents]
      }
    end
  end
end
