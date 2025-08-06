# == Schema Information
#
# Table name: routes
#
#  id                    :bigint           not null, primary key
#  air_time              :integer
#  aircraft_config       :integer
#  aircraft_group        :integer
#  aircraft_type         :integer
#  carrier               :string
#  carrier_group         :integer
#  carrier_group_new     :integer
#  carrier_name          :string
#  departures_performed  :integer
#  departures_scheduled  :integer
#  dest                  :string
#  dest_city_name        :string
#  dest_country          :string
#  dest_state_abr        :string
#  distance              :integer
#  freight               :integer
#  mail                  :integer
#  month                 :date
#  origin                :string
#  origin_city_name      :string
#  origin_country        :string
#  origin_state_abr      :string
#  passengers            :integer
#  payload               :integer
#  ramp_to_ramp          :integer
#  seats                 :integer
#  service_class         :string
#  unique_carrier        :string
#  unique_carrier_entity :string
#  unique_carrier_name   :string
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  airline_id            :integer
#  dest_airport_id       :integer
#  dest_airport_seq_id   :integer
#  dest_city_market_id   :integer
#  origin_airport_id     :integer
#  origin_airport_seq_id :integer
#  origin_city_market_id :integer
#
class Route < ApplicationRecord
end
