module Money
  class CurrencyConverter
    DEFAULT_USD_TO_CAD_RATE = BigDecimal("1.3888")
    RATE_DATE = "2026-08-28"
    SOURCE_URL = "https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates-lookup/"

    attr_reader :display_currency, :usd_to_cad_rate

    def initialize(display_currency: "CAD", usd_to_cad_rate: DEFAULT_USD_TO_CAD_RATE)
      @display_currency = display_currency.to_s.upcase
      @usd_to_cad_rate = BigDecimal(usd_to_cad_rate.to_s)
      raise ArgumentError, "unsupported display currency" unless %w[CAD USD].include?(@display_currency)
      raise ArgumentError, "invalid exchange rate" unless @usd_to_cad_rate.between?(BigDecimal("0.1"), BigDecimal("10"))
    end

    def convert_cents(cents, from:)
      source = from.to_s.upcase
      return cents.to_i if source == display_currency

      value = BigDecimal(cents.to_i.to_s)
      converted = source == "USD" ? value * usd_to_cad_rate : value / usd_to_cad_rate
      converted.round(0, :half_up).to_i
    end
  end
end
