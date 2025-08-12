class RouteSearch
  include Pagy::Backend

  # Whitelists for security
  GROUPABLE_COLUMNS = %w[carrier aircraft_type origin dest origin_country dest_country year quarter month].freeze
  ORDERABLE_COLUMNS = %w[
    carrier aircraft_type origin dest origin_country dest_country year quarter month
    departures_scheduled departures_performed seats passengers asms rpms load_factor
  ].freeze
  ORDER_DIRECTIONS  = %w[asc desc].freeze

  def initialize(params)
    @params = params
  end

  def call
    scope = base_scope
      .select(select_clause)
      .group(group_expressions)
      .order(Arel.sql(order_clause))

    if params[:format] == 'csv'
      return { routes: scope.to_a, total_items: scope.to_a.length, total_pages: 1 }
    end

    pagy, routes = pagy(scope, items: params[:items_per_page] || 20)

    {
      routes: routes,
      total_items: pagy.count,
      total_pages: pagy.pages
    }
  end

  private

  attr_reader :params

  def base_scope
    scope = RouteSummary.all

    # --- Standard Filters ---
    [:carrier, :aircraft_type, :service_class].each do |key|
      scope = scope.where(key => params[key]) if params[key].present?
    end
    
    scope = scope.where(month: params[:from_date]..) if params[:from_date].present?
    scope = scope.where(month: ..params[:to_date]) if params[:to_date].present?

    # --- Airport Filters (with bidirectional logic) ---
    if bidirectional_airport?
      base = scope
      if params[:origin].present? && params[:dest].present?
        scope = base.where(origin: params[:dest], dest: params[:origin])
                    .or(base.where(origin: params[:origin], dest: params[:dest]))
      elsif params[:origin].present?
        scope = base.where(origin: params[:origin])
                    .or(base.where(dest: params[:origin]))
      elsif params[:dest].present?
        scope = base.where(dest: params[:dest])
                    .or(base.where(origin: params[:dest]))
      end
    else
      scope = scope.where(origin: params[:origin]) if params[:origin].present?
      scope = scope.where(dest: params[:dest]) if params[:dest].present?
    end

    # --- Country Filters (with bidirectional logic) ---
    if bidirectional_country?
      base = scope
      if params[:origin_country].present? && params[:dest_country].present?
        scope = base.where(origin_country: params[:dest_country], dest_country: params[:origin_country])
                    .or(base.where(origin_country: params[:origin_country], dest_country: params[:dest_country]))
      elsif params[:origin_country].present?
        scope = base.where(origin_country: params[:origin_country])
                    .or(base.where(dest_country: params[:origin_country]))
      elsif params[:dest_country].present?
        scope = base.where(dest_country: params[:dest_country])
                    .or(base.where(origin_country: params[:dest_country]))
      end
    else
      scope = scope.where(origin_country: params[:origin_country]) if params[:origin_country].present?
      scope = scope.where(dest_country: params[:dest_country]) if params[:dest_country].present?
    end

    scope
  end

  def select_clause
    select_statements = [
      "SUM(departures_scheduled) AS departures_scheduled",
      "SUM(departures_performed) AS departures_performed",
      "SUM(seats) AS seats",
      "(SUM(seats)::numeric / NULLIF(SUM(departures_performed)::numeric, 0)) AS seats_per_flight",  
      "SUM(passengers) AS passengers",
      "(SUM(passengers)::numeric / NULLIF(SUM(departures_performed)::numeric, 0)) AS passengers_per_flight",
      "SUM(asms) AS asms",
      "SUM(rpms) AS rpms",
      "(SUM(passengers)::numeric / NULLIF(SUM(seats)::numeric, 0)) AS load_factor"
    ]

    # When exporting CSV, optionally filter by visible columns and
    # include per-flight columns alongside their base metrics when requested
    if params[:visible_columns].present?
      allowed_aliases = Array.wrap(params[:visible_columns]).dup
      if ActiveRecord::Type::Boolean.new.deserialize(params[:per_flight])
        allowed_aliases << 'seats_per_flight' if allowed_aliases.include?('seats')
        allowed_aliases << 'passengers_per_flight' if allowed_aliases.include?('passengers')
      end
      select_statements.select! { |s| allowed_aliases.include?(s.split(' AS ').last) }
    end

    (group_aliases + select_statements).join(", ")
  end

  def group_expressions
    sanitized_group_by.map do |group|
      case group
      when "year" then "DATE_TRUNC('year', month)"
      when "quarter" then "DATE_TRUNC('quarter', month)"
      when "month" then "DATE_TRUNC('month', month)"
      else group
      end
    end
  end

  def group_aliases
    sanitized_group_by.map do |group|
      case group
      when "year" then "DATE_TRUNC('year', month) as year"
      when "quarter" then "DATE_TRUNC('quarter', month) as quarter"
      when "month" then "DATE_TRUNC('month', month) as month"
      else group
      end
    end
  end

  def order_clause
    order_by = sanitized_order_by
    order_dir = sanitized_order_dir

    aggregated_columns = [
      "departures_scheduled", "departures_performed", "seats",
      "passengers", "asms", "rpms"
    ]

    if ["year", "quarter", "month"].include?(order_by)
      # This is a grouping column based on a date truncation
      "DATE_TRUNC('#{order_by}', month) #{order_dir}"
    elsif aggregated_columns.include?(order_by)
      # This is an aggregated column, so we must order by the aggregation
      "SUM(#{order_by}) #{order_dir}"
    elsif order_by == "load_factor"
      # Special case for the calculated load_factor
      "(SUM(passengers)::numeric / NULLIF(SUM(seats)::numeric, 0)) #{order_dir} NULLS LAST"
    else
      # This must be a regular grouping column (e.g., carrier)
      "#{order_by} #{order_dir}"
    end
  end

  def bidirectional_airport?
    ActiveRecord::Type::Boolean.new.deserialize(params[:bidirectional_airport])
  end

  def bidirectional_country?
    ActiveRecord::Type::Boolean.new.deserialize(params[:bidirectional_country])
  end

  # --- Sanitization Methods ---

  def sanitized_group_by
    return [] if params[:group_by].blank?
    Array.wrap(params[:group_by]).select { |g| GROUPABLE_COLUMNS.include?(g) }
  end

  def sanitized_order_by
    ORDERABLE_COLUMNS.include?(params[:order_by]) ? params[:order_by] : "seats"
  end

  def sanitized_order_dir
    ORDER_DIRECTIONS.include?(params[:order_dir]&.downcase) ? params[:order_dir] : "desc"
  end
end 