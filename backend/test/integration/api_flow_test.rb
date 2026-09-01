require "test_helper"

class ApiFlowTest < ActionDispatch::IntegrationTest
  test "opens directly, saves two cross-border offers, and compares them" do
    get "/api/v1/offers", as: :json
    assert_response :success

    canadian_id = create_offer(
      company: "First Co", country_code: "CA", currency_code: "CAD", jurisdiction: "ON",
      salary_cents: 10_000_000
    )
    american_id = create_offer(
      company: "Second Co", country_code: "US", currency_code: "USD", jurisdiction: "WA",
      salary_cents: 9_800_000
    )

    post "/api/v1/comparisons", params: {
      offer_ids: [ canadian_id, american_id ], display_currency: "USD", usd_to_cad_rate: "1.4"
    }, as: :json

    assert_response :success
    comparison = response.parsed_body["comparison"]
    assert_equal "USD", comparison["display_currency"]
    assert_equal "1.4", comparison["usd_to_cad_rate"]
    assert_equal 2, comparison["offers"].length
    assert_equal 4, comparison["offers"].first["periods"].length
    assert_equal "four_year_savings", comparison["comparison_basis"]
  end

  test "supports local offer CRUD without a session" do
    offer_id = create_offer(
      company: "Local Co", country_code: "CA", currency_code: "CAD", jurisdiction: "AB",
      salary_cents: 8_000_000
    )

    patch "/api/v1/offers/#{offer_id}", params: { offer: { notes: "Updated locally" } }, as: :json
    assert_response :success
    assert_equal "Updated locally", response.parsed_body.dig("offer", "notes")

    delete "/api/v1/offers/#{offer_id}", as: :json
    assert_response :no_content
  end

  test "rejects an invalid exchange rate" do
    ids = [
      create_offer(company: "One", country_code: "CA", currency_code: "CAD", jurisdiction: "ON", salary_cents: 1),
      create_offer(company: "Two", country_code: "CA", currency_code: "CAD", jurisdiction: "QC", salary_cents: 1)
    ]

    post "/api/v1/comparisons", params: {
      offer_ids: ids, display_currency: "CAD", usd_to_cad_rate: "0"
    }, as: :json

    assert_response :unprocessable_entity
    assert_equal "invalid exchange rate", response.parsed_body["error"]
  end

  test "returns the latest Bank of Canada exchange rate" do
    result = {
      base_currency: "USD", quote_currency: "CAD", usd_to_cad_rate: "1.3762",
      observed_at: "2026-08-31", source_name: "Bank of Canada Valet API",
      source_url: "https://www.bankofcanada.ca/valet/docs/"
    }
    fake_service = Class.new do
      define_method(:latest) { result }
    end
    controller = Api::V1::Reference::ExchangeRatesController
    original_service = controller.service_class
    controller.service_class = fake_service

    begin
      get "/api/v1/reference/exchange_rate", as: :json
    ensure
      controller.service_class = original_service
    end

    assert_response :success
    assert_equal "1.3762", response.parsed_body.dig("exchange_rate", "usd_to_cad_rate")
    assert_equal "2026-08-31", response.parsed_body.dig("exchange_rate", "observed_at")
  end

  private

  def create_offer(company:, country_code:, currency_code:, jurisdiction:, salary_cents:)
    city = country_code == "US" ? "Seattle" : "Toronto"
    post "/api/v1/offers", params: {
      offer: {
        company: company, role: "Developer", city: city, country_code: country_code,
        currency_code: currency_code, jurisdiction: jurisdiction, employment_type: "full_time",
        pay_basis: "annual", work_mode: "hybrid", salary_cents: salary_cents,
        equity_vesting_cents: [ 0, 0, 0, 0 ]
      }
    }, as: :json
    assert_response :created
    response.parsed_body.dig("offer", "id")
  end
end
