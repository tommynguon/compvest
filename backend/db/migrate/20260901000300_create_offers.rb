class CreateOffers < ActiveRecord::Migration[8.1]
  def change
    create_table :offers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :company, null: false
      t.string :role, null: false
      t.string :city, null: false
      t.string :jurisdiction, null: false
      t.string :work_mode, null: false, default: "hybrid"
      t.text :notes
      t.integer :salary_cents, null: false, default: 0
      t.integer :annual_bonus_cents, null: false, default: 0
      t.integer :signing_bonus_cents, null: false, default: 0
      t.integer :retirement_match_cents, null: false, default: 0
      t.integer :taxable_benefits_cents, null: false, default: 0
      t.integer :non_taxable_benefits_cents, null: false, default: 0
      t.json :equity_vesting_cents, null: false, default: [ 0, 0, 0, 0 ]
      t.integer :monthly_rent_cents, null: false, default: 0
      t.integer :relocation_cost_cents, null: false, default: 0
      t.integer :commute_cost_per_office_day_cents, null: false, default: 0
      t.decimal :office_days_per_week, null: false, precision: 3, scale: 1, default: 0
      t.integer :working_weeks_per_year, null: false, default: 48
      t.json :deduction_overrides_cents, null: false, default: {}
      t.timestamps
    end

    add_index :offers, [ :user_id, :updated_at ]
  end
end
