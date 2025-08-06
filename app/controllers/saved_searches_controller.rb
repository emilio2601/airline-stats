class SavedSearchesController < ApplicationController
  before_action :set_saved_search, only: [:destroy]

  def index
    @saved_searches = SavedSearch.where(session_id: session.id.to_s)
    render json: @saved_searches
  end

  def create
    session[:init] = true # Force session initialization
    @saved_search = SavedSearch.new(saved_search_params)
    @saved_search.session_id = session.id.to_s

    if @saved_search.save
      render json: @saved_search, status: :created
    else
      render json: @saved_search.errors, status: :unprocessable_entity
    end
  end

  def show
    @saved_search = SavedSearch.find_by!(shareable_id: params[:id])
    render json: @saved_search
  end

  def destroy
    @saved_search.destroy
  end

  private

  def set_saved_search
    @saved_search = SavedSearch.find_by!(id: params[:id], session_id: session.id.to_s)
  end

  def saved_search_params
    params.require(:saved_search).permit(:search_name, params: [
      :page, :items_per_page, :order_by, :order_dir, :origin_country, :dest_country,
      :from_date, :to_date, :carrier, :aircraft_type, :origin, :dest, :bidirectional,
      :service_class, group_by: []
    ])
  end
end 