class RoutesController < ApplicationController

  def index
    scope = Route.group(:carrier, :aircraft_type)

    scope = scope.where(origin: params[:origin]) if params[:origin].present?
    scope = scope.where(dest: params[:dest]) if params[:dest].present?
    scope = scope.where(carrier: params[:carrier]) if params[:carrier].present?
    scope = scope.where(aircraft_type: params[:aircraft_type]) if params[:aircraft_type].present?
    scope = scope.where(origin_country: params[:origin_country]) if params[:origin_country].present?
    scope = scope.where(dest_country: params[:dest_country]) if params[:dest_country].present?

    dep_schd   = scope.sum(:departures_scheduled)
    dep_prfm   = scope.sum(:departures_performed)
    seats      = scope.sum(:seats)
    passengers = scope.sum(:passengers)

    base = case params[:order_by]
           when "departures_performed"
            scope.order(sum_departures_performed: params[:order_dir]).sum(:departures_performed)
           when "seats"
            scope.order(sum_seats: params[:order_dir]).sum(:seats)
           when "passengers"
            scope.order(sum_passengers: params[:order_dir]).sum(:passengers)
           else
            passengers
           end

    res = base.map do |row|
      key, data = row
      carrier, aircraft_type = key

      {
        carrier: carrier,
        aircraft_type: aircraft_type,
        departures_scheduled: dep_schd[key],
        departures_performed: dep_prfm[key],
        seats: seats[key],
        passengers: passengers[key]
      }
    end

    render json: res
  end
end