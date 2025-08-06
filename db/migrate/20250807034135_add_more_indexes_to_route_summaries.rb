class AddMoreIndexesToRouteSummaries < ActiveRecord::Migration[7.1]
  def change
    # For destination-only searches with a date range
    add_index :route_summaries, [:dest_country, :origin_country, :month], name: 'idx_route_summaries_dest_country_month'
    add_index :route_summaries, [:dest, :origin, :month], name: 'idx_route_summaries_dest_origin_month'

    # For searches without a date range
    add_index :route_summaries, [:origin_country, :dest_country], name: 'idx_route_summaries_countries_no_month'
    add_index :route_summaries, [:dest_country, :origin_country], name: 'idx_route_summaries_dest_country_no_month'
    add_index :route_summaries, [:carrier], name: 'idx_route_summaries_carrier_no_month'
  end
end
