class CreateRoutes < ActiveRecord::Migration[7.0]
  def change
    create_table :routes do |t|
      t.integer :departures_scheduled, index: true
      t.integer :departures_performed, index: true
      t.integer :payload, index: true
      t.integer :seats, index: true
      t.integer :passengers, index: true
      t.integer :freight, index: true
      t.integer :mail, index: true
      t.integer :distance, index: true
      t.integer :ramp_to_ramp
      t.integer :air_time
      t.string :unique_carrier, index: true
      t.integer :airline_id
      t.string :unique_carrier_name
      t.string :unique_carrier_entity
      t.string :carrier
      t.string :carrier_name
      t.integer :carrier_group
      t.integer :carrier_group_new
      t.integer :origin_airport_id
      t.integer :origin_airport_seq_id
      t.integer :origin_city_market_id
      t.string :origin, index: true
      t.string :origin_city_name
      t.string :origin_state_abr, index: true
      t.string :origin_country, index: true
      t.integer :dest_airport_id
      t.integer :dest_airport_seq_id
      t.integer :dest_city_market_id
      t.string :dest, index: true
      t.string :dest_city_name
      t.string :dest_state_abr, index: true
      t.string :dest_country, index: true
      t.integer :aircraft_group
      t.integer :aircraft_type, index: true
      t.integer :aircraft_config
      t.date :month, index: true
      t.string :service_class, index: true

      t.timestamps
    end
  end
end