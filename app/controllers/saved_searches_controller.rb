class SavedSearchesController < ApplicationController
  def create
    @saved_search = SavedSearch.new(saved_search_params)

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

  private

  def saved_search_params
    params.require(:saved_search).permit(:search_name, params: [
      :page, :items_per_page, :order_by, :order_dir, :origin_country, :dest_country,
      :from_date, :to_date, :carrier, :aircraft_type, :origin, :dest, :bidirectional,
      :service_class, group_by: []
    ])
  end
end 