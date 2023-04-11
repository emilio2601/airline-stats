class RoutesController < ApplicationController

  def index
    routes = Route.where(origin: "EWR", dest: "SFO").group(:carrier_name, :aircraft_type).sum(:seats)

    render json: routes
  end
end