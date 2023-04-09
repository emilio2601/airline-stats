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

ActiveRecord::Schema[7.0].define(version: 2023_04_09_074143) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "routes", force: :cascade do |t|
    t.integer "departures_scheduled"
    t.integer "departures_performed"
    t.integer "payload"
    t.integer "seats"
    t.integer "passengers"
    t.integer "freight"
    t.integer "mail"
    t.integer "distance"
    t.integer "ramp_to_ramp"
    t.integer "air_time"
    t.string "unique_carrier"
    t.integer "airline_id"
    t.string "unique_carrier_name"
    t.string "unique_carrier_entity"
    t.string "carrier"
    t.string "carrier_name"
    t.integer "carrier_group"
    t.integer "carrier_group_new"
    t.integer "origin_airport_id"
    t.integer "origin_airport_seq_id"
    t.integer "origin_city_market_id"
    t.string "origin"
    t.string "origin_city_name"
    t.string "origin_state_abr"
    t.integer "dest_airport_id"
    t.integer "dest_airport_seq_id"
    t.integer "dest_city_market_id"
    t.string "dest"
    t.string "dest_city_name"
    t.string "dest_state_abr"
    t.integer "aircraft_group"
    t.integer "aircraft_type"
    t.integer "aircraft_config"
    t.integer "year"
    t.integer "month"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["aircraft_type"], name: "index_routes_on_aircraft_type"
    t.index ["departures_performed"], name: "index_routes_on_departures_performed"
    t.index ["departures_scheduled"], name: "index_routes_on_departures_scheduled"
    t.index ["dest"], name: "index_routes_on_dest"
    t.index ["dest_state_abr"], name: "index_routes_on_dest_state_abr"
    t.index ["distance"], name: "index_routes_on_distance"
    t.index ["freight"], name: "index_routes_on_freight"
    t.index ["mail"], name: "index_routes_on_mail"
    t.index ["month"], name: "index_routes_on_month"
    t.index ["origin"], name: "index_routes_on_origin"
    t.index ["origin_state_abr"], name: "index_routes_on_origin_state_abr"
    t.index ["passengers"], name: "index_routes_on_passengers"
    t.index ["payload"], name: "index_routes_on_payload"
    t.index ["seats"], name: "index_routes_on_seats"
    t.index ["unique_carrier"], name: "index_routes_on_unique_carrier"
    t.index ["year"], name: "index_routes_on_year"
  end

end
