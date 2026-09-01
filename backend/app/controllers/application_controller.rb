class ApplicationController < ActionController::API
  include ActionController::Cookies

  SESSION_COOKIE = :offerlens_session

  before_action :resume_session

  private

  def resume_session
    Current.session = Session.authenticate(cookies.signed[SESSION_COOKIE])
    Current.user = Current.session&.user
  end

  def require_authentication
    return if Current.user

    render json: { error: "authentication_required" }, status: :unauthorized
  end

  def start_session_for(user)
    session, raw_token = Session.issue_for(user)
    cookies.signed[SESSION_COOKIE] = {
      value: raw_token,
      expires: session.expires_at,
      httponly: true,
      same_site: :lax,
      secure: Rails.env.production?
    }
    Current.session = session
    Current.user = user
  end

  def end_session
    Current.session&.destroy
    cookies.delete(SESSION_COOKIE, same_site: :lax)
    Current.reset
  end

  def render_validation_errors(record)
    render json: { error: "validation_failed", details: record.errors.to_hash(true) },
      status: :unprocessable_entity
  end
end
