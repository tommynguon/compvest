module Comparison
  class Builder
    DISCLAIMER = "Planning estimate only. Actual payroll and tax results depend on personal credits, deductions, pay timing, and employer treatment.".freeze

    def initialize(offers)
      @offers = offers
    end

    def call
      projections = @offers.map { |offer| OfferProjection.new(offer).call }
      winner = projections.max_by { |projection| projection[:totals][:disposable_cash_cents] }
      difference = projections.map { |projection| projection[:totals][:disposable_cash_cents] }.max -
        projections.map { |projection| projection[:totals][:disposable_cash_cents] }.min

      {
        tax_data_version: Tax::Data2026::VERSION,
        disclaimer: DISCLAIMER,
        source_urls: Tax::Data2026::SOURCES,
        offers: projections,
        winner_offer_id: winner[:offer]["id"],
        four_year_disposable_difference_cents: difference
      }
    end
  end
end
