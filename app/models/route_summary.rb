# == Schema Information
#
# Table name: route_summaries
#
#  aircraft_type        :integer
#  asms                 :bigint
#  carrier              :string
#  departures_performed :bigint
#  departures_scheduled :bigint
#  dest                 :string
#  dest_country         :string
#  month                :date
#  origin               :string
#  origin_country       :string
#  passengers           :bigint
#  rpms                 :bigint
#  seats                :bigint
#  service_class        :string
#
# Indexes
#
#  idx_route_summaries_carrier_month      (carrier,month)
#  idx_route_summaries_countries_month    (origin_country,dest_country,month)
#  idx_route_summaries_origin_dest_month  (origin,dest,month)
#  idx_route_summaries_unique             (month,carrier,origin,dest,origin_country,dest_country,aircraft_type,service_class) UNIQUE
#
class RouteSummary < ApplicationRecord
  self.table_name = "route_summaries"
  self.primary_key = nil

  def readonly?
    true
  end
end 
