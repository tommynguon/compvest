module Api
  module V1
    class OffersController < ApplicationController
      DEDUCTION_OVERRIDE_FIELDS = %i[income_tax_cents cpp_qpp_cents ei_qpip_cents].freeze

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
        attributes = params.require(:offer).permit(
          :company, :city, :jurisdiction, :work_mode, :notes,
          :salary_cents, :annual_bonus_cents, :signing_bonus_cents,
          :retirement_match_cents, :taxable_benefits_cents,
          :non_taxable_benefits_cents, :monthly_rent_cents,
          :relocation_cost_cents, :commute_cost_per_office_day_cents,
          :office_days_per_week, :working_weeks_per_year,
          equity_vesting_cents: []
        )
        attributes[:role] = params.dig(:offer, :role).to_s
        attributes[:deduction_overrides_cents] = sanitized_deduction_overrides
        attributes
      end

      def sanitized_deduction_overrides
        raw = params.dig(:offer, :deduction_overrides_cents)
        return {} unless raw.respond_to?(:dig)

        (1..4).each_with_object({}) do |year, result|
          values = DEDUCTION_OVERRIDE_FIELDS.filter_map do |field|
            value = raw.dig(year.to_s, field)
            [ field, value.to_i ] if value.present?
          end.to_h
          result[year.to_s] = values if values.any?
        end
      end
    end
  end
end
