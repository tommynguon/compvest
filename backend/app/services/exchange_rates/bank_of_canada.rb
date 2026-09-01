require "bigdecimal"
require "json"
require "net/http"

module ExchangeRates
  class BankOfCanada
    class FetchError < StandardError; end

    ENDPOINT = URI("https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1")
    SOURCE_NAME = "Bank of Canada Valet API"
    SOURCE_URL = "https://www.bankofcanada.ca/valet/docs/"
    CACHE_KEY = "exchange-rates/bank-of-canada/fx-usd-cad/latest"

    def initialize(cache: Rails.cache, fetch_json: nil)
      @cache = cache
      @fetch_json = fetch_json || method(:request_json)
    end

    def latest
      @cache.fetch(CACHE_KEY, expires_in: 24.hours) { parse(@fetch_json.call) }
    rescue FetchError
      raise
    rescue StandardError => error
      raise FetchError, "The latest Bank of Canada rate is temporarily unavailable: #{error.message}"
    end

    private

    def request_json
      response = Net::HTTP.start(
        ENDPOINT.host,
        ENDPOINT.port,
        use_ssl: true,
        open_timeout: 3,
        read_timeout: 5
      ) { |http| http.get(ENDPOINT.request_uri, { "Accept" => "application/json" }) }

      raise FetchError, "Bank of Canada returned HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

      response.body
    rescue Timeout::Error, SocketError, SystemCallError, OpenSSL::SSL::SSLError => error
      raise FetchError, error.message
    end

    def parse(body)
      observation = JSON.parse(body).fetch("observations").last
      rate = BigDecimal(observation.fetch("FXUSDCAD").fetch("v"))
      raise FetchError, "Bank of Canada returned an invalid USD/CAD rate" unless rate.between?(BigDecimal("0.1"), BigDecimal("10"))

      {
        base_currency: "USD",
        quote_currency: "CAD",
        usd_to_cad_rate: rate.to_s("F"),
        observed_at: Date.iso8601(observation.fetch("d")).iso8601,
        source_name: SOURCE_NAME,
        source_url: SOURCE_URL
      }
    rescue JSON::ParserError, KeyError, Date::Error, ArgumentError => error
      raise FetchError, "Bank of Canada returned an unexpected response: #{error.message}"
    end
  end
end
