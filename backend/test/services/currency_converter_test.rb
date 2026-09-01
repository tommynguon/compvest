require "test_helper"

class CurrencyConverterTest < ActiveSupport::TestCase
  test "converts in both directions with cent-level rounding" do
    to_cad = Money::CurrencyConverter.new(display_currency: "CAD", usd_to_cad_rate: "1.3888")
    to_usd = Money::CurrencyConverter.new(display_currency: "USD", usd_to_cad_rate: "1.3888")

    assert_equal 13_888, to_cad.convert_cents(10_000, from: "USD")
    assert_equal 10_000, to_usd.convert_cents(13_888, from: "CAD")
    assert_equal 10_001, to_usd.convert_cents(13_889, from: "CAD")
  end

  test "leaves values unchanged when currencies match" do
    converter = Money::CurrencyConverter.new(display_currency: "CAD", usd_to_cad_rate: "1.3888")

    assert_equal 12_345, converter.convert_cents(12_345, from: "CAD")
  end

  test "rejects unsupported currencies and unrealistic rates" do
    assert_raises(ArgumentError) { Money::CurrencyConverter.new(display_currency: "EUR") }
    assert_raises(ArgumentError) { Money::CurrencyConverter.new(usd_to_cad_rate: "0") }
  end
end
