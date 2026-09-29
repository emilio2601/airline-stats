class RoutesController < ApplicationController
  def index
    @results = RouteSearch.new(params).call
    respond_to do |format|
      format.json { render json: @results }
      format.csv do
        send_data(
          RouteSummary.to_csv(@results[:routes]),
          filename: generate_csv_filename
        )
      end
    end
  end

  def date_range
    render json: {from_date: RouteSummary.minimum(:month), to_date: RouteSummary.maximum(:month)}
  end

  private

  def generate_csv_filename
    parts = ['routes']
    
    # Use the more specific airport code if available, otherwise fall back to country
    origin = airport_label(params[:origin]) || params[:origin_country].presence
    dest = airport_label(params[:dest]) || params[:dest_country].presence

    if origin && dest
      parts << "#{origin}_to_#{dest}"
    elsif origin
      parts << "from_#{origin}"
    elsif dest
      parts << "to_#{dest}"
    end
    
    if params[:group_by].present?
      groups = Array.wrap(params[:group_by]).join('_and_')
      parts << "by_#{groups}" 
    end

    timestamp = Time.now.strftime("%Y%m%d_%H%M")
    parts << timestamp
    
    "#{parts.join('_')}.csv"
  end

  def airport_label(value)
    codes = Array.wrap(value).flat_map { |part| part.to_s.split(",") }
      .map { |code| code.strip.upcase.gsub(/[^A-Z0-9]/, "") }
      .reject(&:blank?)
      .uniq
    codes.join("-").presence
  end
end
