# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_01_000300) do
  create_table "offers", force: :cascade do |t|
    t.integer "annual_bonus_cents", default: 0, null: false
    t.string "city", null: false
    t.integer "commute_cost_per_office_day_cents", default: 0, null: false
    t.string "company", null: false
    t.datetime "created_at", null: false
    t.json "deduction_overrides_cents", default: {}, null: false
    t.json "equity_vesting_cents", default: [0, 0, 0, 0], null: false
    t.string "jurisdiction", null: false
    t.integer "monthly_rent_cents", default: 0, null: false
    t.integer "non_taxable_benefits_cents", default: 0, null: false
    t.text "notes"
    t.decimal "office_days_per_week", precision: 3, scale: 1, default: "0.0", null: false
    t.integer "relocation_cost_cents", default: 0, null: false
    t.integer "retirement_match_cents", default: 0, null: false
    t.string "role", null: false
    t.integer "salary_cents", default: 0, null: false
    t.integer "signing_bonus_cents", default: 0, null: false
    t.integer "taxable_benefits_cents", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.string "work_mode", default: "hybrid", null: false
    t.integer "working_weeks_per_year", default: 48, null: false
    t.index ["user_id", "updated_at"], name: "index_offers_on_user_id_and_updated_at"
    t.index ["user_id"], name: "index_offers_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "token_digest", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["expires_at"], name: "index_sessions_on_expires_at"
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "offers", "users"
  add_foreign_key "sessions", "users"
end
