module Api
  module V1
    class ComparisonsController < ApplicationController
      def create
        ids = Array(params[:offer_ids]).map(&:to_i).uniq
        return render_invalid_selection unless ids.length == 2

        offers = Offer.where(id: ids).index_by(&:id)
        return render_invalid_selection unless offers.length == 2

        ordered_offers = ids.map { |id| offers.fetch(id) }
        render json: {
          comparison: Comparison::Builder.new(
            ordered_offers,
            display_currency: params[:display_currency],
            usd_to_cad_rate: params[:usd_to_cad_rate]
          ).call
        }
      rescue ArgumentError => error
        render json: { error: error.message }, status: :unprocessable_entity
      end

      private

      def render_invalid_selection
        render json: { error: "select_two_offers" }, status: :unprocessable_entity
      end
    end
  end
end
