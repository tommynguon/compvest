module Api
  module V1
    module Reference
      class JurisdictionsController < ApplicationController
        NAMES = {
          "AB" => "Alberta", "BC" => "British Columbia", "MB" => "Manitoba",
          "NB" => "New Brunswick", "NL" => "Newfoundland and Labrador",
          "NS" => "Nova Scotia", "NT" => "Northwest Territories",
          "NU" => "Nunavut", "ON" => "Ontario", "PE" => "Prince Edward Island",
          "QC" => "Quebec", "SK" => "Saskatchewan", "YT" => "Yukon"
        }.freeze

        def index
          render json: { jurisdictions: NAMES.map { |code, name| { code: code, name: name } } }
        end
      end
    end
  end
end
