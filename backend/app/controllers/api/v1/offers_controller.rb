module Api
  module V1
    class OffersController < ApplicationController
      before_action :require_authentication
      before_action :set_offer, only: [ :show, :update, :destroy ]

      def index
        offers = Current.user.offers.order(updated_at: :desc)
        render json: { offers: offers.map { |offer| OfferSerializer.render(offer) } }
      end

      def show
        render json: { offer: OfferSerializer.render(@offer) }
      end

      def create
        offer = Current.user.offers.new(offer_params)

        if offer.save
          render json: { offer: OfferSerializer.render(offer) }, status: :created
        else
          render_validation_errors(offer)
        end
      end

      def update
        if @offer.update(offer_params)
          render json: { offer: OfferSerializer.render(@offer) }
        else
          render_validation_errors(@offer)
        end
      end

      def destroy
        @offer.destroy!
        head :no_content
      end

      private

      def set_offer
        @offer = Current.user.offers.find(params[:id])
      end

      def offer_params
        params.require(:offer).permit(
          :company, :role, :city, :jurisdiction, :work_mode, :notes,
          :salary_cents, :annual_bonus_cents, :signing_bonus_cents,
          :retirement_match_cents, :taxable_benefits_cents,
          :non_taxable_benefits_cents, :monthly_rent_cents,
          :relocation_cost_cents, :commute_cost_per_office_day_cents,
          :office_days_per_week, :working_weeks_per_year,
          equity_vesting_cents: [], deduction_overrides_cents: {}
        )
      end
    end
  end
end
