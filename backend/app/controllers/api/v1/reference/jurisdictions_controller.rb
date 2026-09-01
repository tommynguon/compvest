module Api
  module V1
    module Reference
      class JurisdictionsController < ApplicationController
        CANADA = {
          "AB" => "Alberta", "BC" => "British Columbia", "MB" => "Manitoba", "NB" => "New Brunswick",
          "NL" => "Newfoundland and Labrador", "NS" => "Nova Scotia", "NT" => "Northwest Territories",
          "NU" => "Nunavut", "ON" => "Ontario", "PE" => "Prince Edward Island", "QC" => "Quebec",
          "SK" => "Saskatchewan", "YT" => "Yukon"
        }.freeze
        UNITED_STATES = Offer::US_JURISDICTIONS.index_with { |code| code }.freeze

        def index
          render json: {
            countries: {
              CA: { name: "Canada", currency: "CAD", jurisdictions: serialize(CANADA) },
              US: { name: "United States", currency: "USD", jurisdictions: serialize(UNITED_STATES) }
            }
          }
        end

        private

        def serialize(jurisdictions)
          jurisdictions.map { |code, name| { code: code, name: name } }
        end
      end
    end
  end
end
