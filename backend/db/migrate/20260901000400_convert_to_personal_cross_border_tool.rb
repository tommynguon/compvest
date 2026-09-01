class ConvertToPersonalCrossBorderTool < ActiveRecord::Migration[8.1]
  def up
    remove_index :offers, [ :user_id, :updated_at ] if index_exists?(:offers, [ :user_id, :updated_at ])
    remove_reference :offers, :user, foreign_key: true

    add_column :offers, :country_code, :string, null: false, default: "CA"
    add_column :offers, :currency_code, :string, null: false, default: "CAD"
    add_column :offers, :employment_type, :string, null: false, default: "full_time"
    add_column :offers, :pay_basis, :string, null: false, default: "annual"
    add_column :offers, :hourly_rate_cents, :integer, null: false, default: 0
    add_column :offers, :hours_per_week, :decimal, null: false, precision: 4, scale: 1, default: 40
    add_column :offers, :term_weeks, :integer, null: false, default: 16
    add_column :offers, :monthly_other_living_costs_cents, :integer, null: false, default: 0

    drop_table :sessions
    drop_table :users
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "CompVest intentionally removes shared-user authentication"
  end
end
