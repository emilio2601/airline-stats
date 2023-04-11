class RoutesController < ApplicationController

  def index
    scope = Route.group(:carrier, :aircraft_type)

    scope = scope.where(origin: params[:origin]) if params[:origin].present?
    scope = scope.where(dest: params[:dest]) if params[:dest].present?
    scope = scope.where(carrier: params[:carrier]) if params[:carrier].present?

    dep_schd   = scope.sum(:departures_scheduled)
    dep_prfm   = scope.sum(:departures_performed)
    seats      = scope.sum(:seats)
    passengers = scope.sum(:passengers)

    res = dep_schd.keys.each_with_object({}) do |key, hash|
      icao_code, aircraft_type = key

      hash[icao_code] ||= {}
      hash[icao_code][aircraft_type] = {
        departures_scheduled: dep_schd[key],
        departures_performed: dep_prfm[key],
        seats: seats[key],
        passengers: passengers[key]
      }
    end

    render json: res
  end
end