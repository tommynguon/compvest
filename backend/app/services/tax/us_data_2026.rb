module Tax
  module UsData2026
    VERSION = "2026-US"
    FEDERAL_STANDARD_DEDUCTION = 16_100
    FEDERAL_BRACKETS = [
      [ 0, 0.10 ], [ 12_400, 0.12 ], [ 50_400, 0.22 ], [ 105_700, 0.24 ],
      [ 201_775, 0.32 ], [ 256_225, 0.35 ], [ 640_600, 0.37 ]
    ].freeze
    SOCIAL_SECURITY = { maximum: 184_500, rate: 0.062 }.freeze
    MEDICARE = { rate: 0.0145, additional_threshold: 200_000, additional_rate: 0.009 }.freeze

    NO_WAGE_TAX = %w[AK FL NV NH SD TN TX WA WY].freeze

    # Single-filer planning rules. Detailed brackets cover common internship markets;
    # remaining states use their 2026 headline rate after the listed basic deduction.
    STATE_RULES = {
      "AL" => { deduction: 3_000, brackets: [ [ 0, 0.02 ], [ 500, 0.04 ], [ 3_000, 0.05 ] ] },
      "AR" => { deduction: 2_470, rate: 0.039 }, "AZ" => { deduction: 8_350, rate: 0.025 },
      "CA" => { deduction: 5_540, brackets: [ [ 0, 0.01 ], [ 11_079, 0.02 ], [ 26_264, 0.04 ], [ 41_452, 0.06 ], [ 57_542, 0.08 ], [ 72_724, 0.093 ], [ 371_479, 0.103 ], [ 445_771, 0.113 ], [ 742_953, 0.123 ], [ 1_000_000, 0.133 ] ] },
      "CO" => { deduction: 16_100, rate: 0.044 }, "CT" => { deduction: 15_000, rate: 0.0699 },
      "DC" => { deduction: 16_100, brackets: [ [ 0, 0.04 ], [ 10_000, 0.06 ], [ 40_000, 0.065 ], [ 60_000, 0.085 ], [ 250_000, 0.0925 ], [ 500_000, 0.0975 ], [ 1_000_000, 0.1075 ] ] },
      "DE" => { deduction: 3_250, rate: 0.066 }, "GA" => { deduction: 12_000, rate: 0.0519 },
      "HI" => { deduction: 4_400, rate: 0.11 }, "IA" => { deduction: 16_100, rate: 0.038 },
      "ID" => { deduction: 16_100, rate: 0.053 }, "IL" => { deduction: 2_925, rate: 0.0495 },
      "IN" => { deduction: 1_000, rate: 0.0295 }, "KS" => { deduction: 12_765, rate: 0.0558 },
      "KY" => { deduction: 3_360, rate: 0.035 }, "LA" => { deduction: 12_875, rate: 0.03 },
      "MA" => { deduction: 4_400, rate: 0.05 }, "MD" => { deduction: 6_550, rate: 0.0475 },
      "ME" => { deduction: 13_650, brackets: [ [ 0, 0.058 ], [ 27_399, 0.0675 ], [ 64_849, 0.0715 ] ] },
      "MI" => { deduction: 5_900, rate: 0.0425 }, "MN" => { deduction: 15_300, brackets: [ [ 0, 0.0535 ], [ 33_310, 0.068 ], [ 109_430, 0.0785 ], [ 203_150, 0.0985 ] ] },
      "MO" => { deduction: 16_100, rate: 0.047 }, "MS" => { deduction: 18_300, rate: 0.04 },
      "MT" => { deduction: 16_100, brackets: [ [ 0, 0.047 ], [ 47_500, 0.0565 ] ] },
      "NC" => { deduction: 12_750, rate: 0.0399 }, "ND" => { deduction: 16_100, rate: 0.0195 },
      "NE" => { deduction: 8_850, brackets: [ [ 0, 0.0246 ], [ 4_130, 0.0351 ], [ 24_760, 0.0455 ] ] },
      "NJ" => { deduction: 1_000, brackets: [ [ 0, 0.014 ], [ 20_000, 0.0175 ], [ 35_000, 0.035 ], [ 40_000, 0.0553 ], [ 75_000, 0.0637 ], [ 500_000, 0.0897 ], [ 1_000_000, 0.1075 ] ] },
      "NM" => { deduction: 16_100, brackets: [ [ 0, 0.015 ], [ 5_500, 0.032 ], [ 16_500, 0.043 ], [ 33_500, 0.047 ], [ 66_500, 0.049 ], [ 210_000, 0.059 ] ] },
      "NY" => { deduction: 8_000, brackets: [ [ 0, 0.039 ], [ 8_500, 0.044 ], [ 11_700, 0.0515 ], [ 13_900, 0.054 ], [ 80_650, 0.059 ], [ 215_400, 0.0685 ], [ 1_077_550, 0.0965 ] ] },
      "OH" => { deduction: 28_450, rate: 0.0275 },
      "OK" => { deduction: 7_350, brackets: [ [ 0, 0.0 ], [ 3_750, 0.025 ], [ 4_900, 0.035 ], [ 7_200, 0.045 ] ] },
      "OR" => { deduction: 2_910, brackets: [ [ 0, 0.0475 ], [ 4_550, 0.0675 ], [ 11_400, 0.0875 ], [ 125_000, 0.099 ] ] },
      "PA" => { deduction: 0, rate: 0.0307 }, "RI" => { deduction: 16_450, rate: 0.0599 },
      "SC" => { deduction: 8_350, brackets: [ [ 0, 0.0 ], [ 3_640, 0.03 ], [ 18_230, 0.06 ] ] },
      "UT" => { deduction: 0, rate: 0.045 },
      "VA" => { deduction: 9_680, brackets: [ [ 0, 0.02 ], [ 3_000, 0.03 ], [ 5_000, 0.05 ], [ 17_000, 0.0575 ] ] },
      "VT" => { deduction: 12_950, brackets: [ [ 0, 0.0335 ], [ 49_400, 0.066 ], [ 119_700, 0.076 ], [ 249_700, 0.0875 ] ] },
      "WI" => { deduction: 14_660, brackets: [ [ 0, 0.035 ], [ 15_110, 0.044 ], [ 51_950, 0.053 ], [ 332_720, 0.0765 ] ] },
      "WV" => { deduction: 2_000, brackets: [ [ 0, 0.0222 ], [ 10_000, 0.0296 ], [ 25_000, 0.0333 ], [ 40_000, 0.0444 ], [ 60_000, 0.0482 ] ] }
    }.freeze

    SOURCES = [
      "https://www.irs.gov/irb/2025-45_IRB",
      "https://www.ssa.gov/OACT/COLA/cbb.html",
      "https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/"
    ].freeze
  end
end
