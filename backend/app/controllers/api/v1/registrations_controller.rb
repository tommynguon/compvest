module Api
  module V1
    class RegistrationsController < ApplicationController
      def create
        user = User.new(registration_params)

        if user.save
          start_session_for(user)
          render json: { user: user_payload(user) }, status: :created
        else
          render_validation_errors(user)
        end
      end

      private

      def registration_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end

      def user_payload(user)
        user.as_json(only: [ :id, :name, :email ])
      end
    end
  end
end
