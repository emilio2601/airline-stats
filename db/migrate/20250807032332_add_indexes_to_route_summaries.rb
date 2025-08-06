class AddIndexesToRouteSummaries < ActiveRecord::Migration[7.1]
  def change
    add_index :route_summaries,
      [:month, :carrier, :origin, :dest, :origin_country, :dest_country, :aircraft_type, :service_class],
      unique: true,
      name: 'idx_route_summaries_unique'
    
    add_index :route_summaries, [:origin_country, :dest_country, :month], name: 'idx_route_summaries_countries_month'
    add_index :route_summaries, [:origin, :dest, :month], name: 'idx_route_summaries_origin_dest_month'
    add_index :route_summaries, [:carrier, :month], name: 'idx_route_summaries_carrier_month'
  end
end 