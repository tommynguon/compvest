require "test_helper"

class BankOfCanadaTest < ActiveSupport::TestCase
  RESPONSE = {
    observations: [
      { d: "2026-08-31", FXUSDCAD: { v: "1.3762" } }
    ]
  }.to_json

  test "returns the latest official USD to CAD observation" do
    rate = ExchangeRates::BankOfCanada.new(
      cache: ActiveSupport::Cache::MemoryStore.new,
      fetch_json: -> { RESPONSE }
    ).latest

    assert_equal "USD", rate[:base_currency]
    assert_equal "CAD", rate[:quote_currency]
    assert_equal "1.3762", rate[:usd_to_cad_rate]
    assert_equal "2026-08-31", rate[:observed_at]
    assert_equal "Bank of Canada Valet API", rate[:source_name]
  end

  test "caches the observation for repeated requests" do
    requests = 0
    service = ExchangeRates::BankOfCanada.new(
      cache: ActiveSupport::Cache::MemoryStore.new,
      fetch_json: -> { requests += 1; RESPONSE }
    )

    2.times { service.latest }

    assert_equal 1, requests
  end

  test "rejects malformed responses" do
    service = ExchangeRates::BankOfCanada.new(
      cache: ActiveSupport::Cache::MemoryStore.new,
      fetch_json: -> { { observations: [] }.to_json }
    )

    assert_raises(ExchangeRates::BankOfCanada::FetchError) { service.latest }
  end
end
