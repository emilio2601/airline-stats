class RoutesController < ApplicationController
  def index
    render json: RouteSearch.new(params).call
  end

  def date_range
    render json: {from_date: Route.minimum(:month), to_date: Route.maximum(:month)}
  end
end