class RemoveIndexesFromRoutes < ActiveRecord::Migration[7.1]
  def change
    remove_index :routes, :departures_scheduled
    remove_index :routes, :departures_performed
    remove_index :routes, :payload
    remove_index :routes, :seats
    remove_index :routes, :passengers
    remove_index :routes, :freight
    remove_index :routes, :mail
    remove_index :routes, :distance
    remove_index :routes, :unique_carrier
    remove_index :routes, :origin
    remove_index :routes, :origin_state_abr
    remove_index :routes, :origin_country
    remove_index :routes, :dest
    remove_index :routes, :dest_state_abr
    remove_index :routes, :dest_country
    remove_index :routes, :aircraft_type
    remove_index :routes, :month
    remove_index :routes, :service_class
  end
end 