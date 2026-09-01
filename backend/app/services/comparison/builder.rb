module Comparison
  class Builder
    DISCLAIMER = <<~TEXT.squish.freeze
      Planning estimate only. Results assume a single filer, standard or basic deductions, no dependents,
      taxation based on work location, and internship income within one calendar year. Municipal taxes,
      visas, treaties, foreign-tax credits, health-plan premiums, and unusual residency rules are excluded.
    TEXT

    def initialize(offers, display_currency: nil, usd_to_cad_rate: nil)
      @offers = offers
      @converter = Money::CurrencyConverter.new(
        display_currency: display_currency,
        usd_to_cad_rate: usd_to_cad_rate
      )
    end

    def call
      projections = @offers.map { |offer| OfferProjection.new(offer, converter: @converter).call }
      comparison_basis = internship_comparison?(projections) ? "weekly_savings" : "four_year_savings"
      values = projections.map { |projection| comparison_value(projection, comparison_basis) }
      winner_index = values.each_index.max_by { |index| values[index] }

      {
        tax_data_version: "#{Tax::Data2026::VERSION} / #{Tax::UsData2026::VERSION}",
        display_currency: @converter.display_currency,
        usd_to_cad_rate: @converter.usd_to_cad_rate.to_s("F"),
        exchange_rate_date: Money::CurrencyConverter::RATE_DATE,
        comparison_basis: comparison_basis,
        disclaimer: DISCLAIMER,
        source_urls: (Tax::Data2026::SOURCES + Tax::UsData2026::SOURCES).uniq,
        offers: projections,
        winner_offer_id: projections.fetch(winner_index).dig(:offer, "id"),
        savings_difference_cents: values.max - values.min
      }
    end

    private

    def internship_comparison?(projections)
      projections.any? { |projection| projection.dig(:offer, "employment_type") == "internship" }
    end

    def comparison_value(projection, basis)
      return projection[:weekly_savings_cents] if basis == "weekly_savings"

      projection.dig(:totals, :estimated_savings_cents)
    end
  end
end
