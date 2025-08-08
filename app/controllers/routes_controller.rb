class RoutesController < ApplicationController
  def index
    @results = RouteSearch.new(params).call
    respond_to do |format|
      format.json { render json: @results }
      format.csv do
        send_data(
          RouteSummary.to_csv(@results[:routes]),
          filename: "route_data-#{Date.today}.csv"
        )
      end
    end
  end

  def date_range
    render json: {from_date: RouteSummary.minimum(:month), to_date: RouteSummary.maximum(:month)}
  end
end