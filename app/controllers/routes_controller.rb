class RoutesController < ApplicationController
  def index
    render json: RouteSearch.new(params).call
  end

  def date_range
    render json: {from_date: RouteSummary.minimum(:month), to_date: RouteSummary.maximum(:month)}
  end
end