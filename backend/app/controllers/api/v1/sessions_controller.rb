module Api
  module V1
    class SessionsController < ApplicationController
      def create
        user = User.find_by(email: params[:email].to_s.strip.downcase)

        if user&.authenticate(params[:password])
          start_session_for(user)
          render json: { user: user.as_json(only: [ :id, :name, :email ]) }
        else
          render json: { error: "invalid_credentials" }, status: :unauthorized
        end
      end

      def destroy
        end_session
        head :no_content
      end
    end
  end
end
