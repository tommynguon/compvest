class ApplicationController < ActionController::API
  private

  def render_validation_errors(record)
    render json: { error: "validation_failed", details: record.errors.to_hash(true) },
      status: :unprocessable_entity
  end
end
