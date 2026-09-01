module Api
  module V1
    module Reference
      class ExchangeRatesController < ApplicationController
        class_attribute :service_class, instance_accessor: false, default: ExchangeRates::BankOfCanada

        def show
          render json: { exchange_rate: self.class.service_class.new.latest }
        rescue ExchangeRates::BankOfCanada::FetchError => error
          render json: { error: "exchange_rate_unavailable", message: error.message }, status: :service_unavailable
        end
      end
    end
  end
end
