class Session < ApplicationRecord
  LIFETIME = 30.days

  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }

  def self.issue_for(user)
    raw_token = SecureRandom.urlsafe_base64(32)
    session = user.sessions.create!(token_digest: digest(raw_token), expires_at: LIFETIME.from_now)
    [ session, raw_token ]
  end

  def self.authenticate(raw_token)
    return if raw_token.blank?

    active.find_by(token_digest: digest(raw_token))
  end

  def self.digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end
end
