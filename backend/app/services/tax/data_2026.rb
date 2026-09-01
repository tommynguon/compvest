module Tax
  module Data2026
    VERSION = "2026-H2"
    FEDERAL_BRACKETS = [
      [ 0, 0.14 ], [ 58_523, 0.205 ], [ 117_045, 0.26 ],
      [ 181_440, 0.29 ], [ 258_482, 0.33 ]
    ].freeze

    PROVINCES = {
      "AB" => { basic: 22_769, brackets: [ [ 0, 0.08 ], [ 61_200, 0.10 ], [ 154_259, 0.12 ], [ 185_111, 0.13 ], [ 246_813, 0.14 ], [ 370_220, 0.15 ] ] },
      "BC" => { basic: 13_216, brackets: [ [ 0, 0.056 ], [ 50_363, 0.077 ], [ 100_728, 0.105 ], [ 115_648, 0.1229 ], [ 140_430, 0.147 ], [ 190_405, 0.168 ], [ 265_545, 0.205 ] ] },
      "MB" => { basic: 15_780, brackets: [ [ 0, 0.108 ], [ 47_000, 0.1275 ], [ 100_000, 0.174 ] ] },
      "NB" => { basic: 13_664, brackets: [ [ 0, 0.094 ], [ 52_333, 0.14 ], [ 104_666, 0.16 ], [ 193_861, 0.195 ] ] },
      "NL" => { basic: 13_094, brackets: [ [ 0, 0.087 ], [ 44_678, 0.145 ], [ 89_354, 0.158 ], [ 159_528, 0.178 ], [ 223_340, 0.198 ], [ 285_319, 0.208 ], [ 570_638, 0.213 ], [ 1_141_275, 0.218 ] ] },
      "NS" => { basic: 11_932, brackets: [ [ 0, 0.0879 ], [ 30_995, 0.1495 ], [ 61_991, 0.1667 ], [ 97_417, 0.175 ], [ 157_124, 0.21 ] ] },
      "NT" => { basic: 18_198, brackets: [ [ 0, 0.059 ], [ 53_003, 0.086 ], [ 106_009, 0.122 ], [ 172_346, 0.1405 ] ] },
      "NU" => { basic: 19_659, brackets: [ [ 0, 0.04 ], [ 55_801, 0.07 ], [ 111_602, 0.09 ], [ 181_439, 0.115 ] ] },
      "ON" => { basic: 12_989, brackets: [ [ 0, 0.0505 ], [ 53_891, 0.0915 ], [ 107_785, 0.1116 ], [ 150_000, 0.1216 ], [ 220_000, 0.1316 ] ] },
      "PE" => { basic: 15_000, brackets: [ [ 0, 0.095 ], [ 33_928, 0.1347 ], [ 65_820, 0.166 ], [ 106_890, 0.1762 ], [ 142_520, 0.19 ], [ 200_000, 0.20 ] ] },
      "QC" => { basic: 18_952, brackets: [ [ 0, 0.14 ], [ 54_345, 0.19 ], [ 108_680, 0.24 ], [ 132_245, 0.2575 ] ] },
      "SK" => { basic: 20_381, brackets: [ [ 0, 0.105 ], [ 54_532, 0.125 ], [ 155_805, 0.145 ] ] },
      "YT" => { basic: 16_452, brackets: [ [ 0, 0.064 ], [ 58_523, 0.09 ], [ 117_045, 0.109 ], [ 181_440, 0.128 ], [ 500_000, 0.15 ] ] }
    }.freeze

    FEDERAL_BASIC_MAX = 16_452
    FEDERAL_BASIC_MIN = 14_829
    FEDERAL_BASIC_PHASEOUT_START = 181_440
    FEDERAL_BASIC_PHASEOUT_END = 258_482
    CANADA_EMPLOYMENT_AMOUNT = 1_501

    CPP = { exemption: 3_500, ympe: 74_600, yampe: 85_000, rate: 0.0595, second_rate: 0.04 }.freeze
    QPP = { exemption: 3_500, ympe: 74_600, yampe: 85_000, rate: 0.063, second_rate: 0.04 }.freeze
    EI = { maximum: 68_900, rate: 0.0163 }.freeze
    EI_QUEBEC = { maximum: 68_900, rate: 0.013 }.freeze
    QPIP = { maximum: 103_000, rate: 0.0043 }.freeze

    SOURCES = [
      "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jul/t4127-jul-payroll-deductions-formulas.html",
      "https://www.revenuquebec.ca/en/online-services/forms-and-publications/current-details/tp-1015-f-v/"
    ].freeze
  end
end
