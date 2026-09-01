module Api
  module V1
    class MeController < ApplicationController
      before_action :require_authentication

      def show
        render json: { user: Current.user.as_json(only: [ :id, :name, :email ]) }
      end
    end
  end
end
