require "test_helper"

class ApiFlowTest < ActionDispatch::IntegrationTest
  test "registers, saves two offers, compares them, and signs out" do
    post "/api/v1/register", params: {
      user: { name: "API User", email: "api@example.com", password: "password123" }
    }, as: :json
    assert_response :created
    assert_equal "api@example.com", response.parsed_body.dig("user", "email")

    first_id = create_offer(company: "First Co", jurisdiction: "ON", salary_cents: 10_000_000)
    second_id = create_offer(company: "Second Co", jurisdiction: "AB", salary_cents: 9_800_000)

    get "/api/v1/offers", as: :json
    assert_response :success
    assert_equal 2, response.parsed_body["offers"].length

    post "/api/v1/comparisons", params: { offer_ids: [ first_id, second_id ] }, as: :json
    assert_response :success
    comparison = response.parsed_body["comparison"]
    assert_equal "2026-H2", comparison["tax_data_version"]
    assert_equal 2, comparison["offers"].length
    assert_equal 4, comparison["offers"].first["years"].length

    delete "/api/v1/logout", as: :json
    assert_response :no_content
    get "/api/v1/me", as: :json
    assert_response :unauthorized
  end

  test "cannot read another user's offer" do
    owner = User.create!(name: "Owner", email: "owner@example.com", password: "password123")
    offer = owner.offers.create!(company: "Private Co", role: "Engineer", city: "Ottawa", jurisdiction: "ON")
    User.create!(name: "Viewer", email: "viewer@example.com", password: "password123")

    post "/api/v1/login", params: { email: "viewer@example.com", password: "password123" }, as: :json
    get "/api/v1/offers/#{offer.id}", as: :json

    assert_response :not_found
  end

  private

  def create_offer(company:, jurisdiction:, salary_cents:)
    post "/api/v1/offers", params: {
      offer: {
        company: company, role: "Developer", city: "Toronto", jurisdiction: jurisdiction,
        work_mode: "hybrid", salary_cents: salary_cents, equity_vesting_cents: [ 0, 0, 0, 0 ]
      }
    }, as: :json
    assert_response :created
    response.parsed_body.dig("offer", "id")
  end
end
