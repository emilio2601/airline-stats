class RoutesController < ApplicationController
  def index
    mod_params = params[:group_by]&.map do |group|
      case group
      when "year"
        "DATE_TRUNC('year', month)"
      when "month"
        "DATE_TRUNC('month', month)"
      else
        group
      end
    end

    scope = Route.group(mod_params)
            
    scope = scope.where(origin: params[:origin]) if params[:origin].present?
    scope = scope.where(dest: params[:dest]) if params[:dest].present?
    scope = scope.where(carrier: params[:carrier]) if params[:carrier].present?
    scope = scope.where(aircraft_type: params[:aircraft_type]) if params[:aircraft_type].present?
    scope = scope.where(origin_country: params[:origin_country]) if params[:origin_country].present?
    scope = scope.where(dest_country: params[:dest_country]) if params[:dest_country].present?
    scope = scope.where(service_class: params[:service_class]) if params[:service_class].present?
    scope = scope.where("month >= ?", params[:from_date]) if params[:from_date].present?
    scope = scope.where("month <= ?", params[:to_date]) if params[:to_date].present?

    dep_schd    = scope.async_sum(:departures_scheduled)
    dep_prfm    = scope.async_sum(:departures_performed)
    seats       = scope.async_sum(:seats)
    passengers  = scope.async_sum(:passengers)
    asms        = scope.async_sum("seats * distance")
    rpms        = scope.async_sum("passengers * distance")

    dep_schd    = dep_schd.value
    dep_prfm    = dep_prfm.value
    seats       = seats.value
    passengers  = passengers.value
    asms        = asms.value
    rpms        = rpms.value

    load_factor = group_load_factor(scope.select("SUM(passengers)/NULLIF(SUM(seats::float), 0) as load_factor").select(mod_params).order(:load_factor))

    scope = scope.page(params[:page]).per(params[:items_per_page])

    base = case params[:order_by]
           when "carrier"
            scope.order(carrier: params[:order_dir]).sum(:passengers)
           when "year"
            scope.order(date_trunc_year_month: params[:order_dir]).sum(:passengers)
           when "month"
            scope.order(date_trunc_month_month: params[:order_dir]).sum(:passengers)
           when "departures_performed"
            scope.order(sum_departures_performed: params[:order_dir]).sum(:departures_performed)
           when "seats"
            scope.order(sum_seats: params[:order_dir]).sum(:seats)
           when "passengers"
            scope.order(sum_passengers: params[:order_dir]).sum(:passengers)
           when "asms"
            scope.order(sum_seats_all_distance: params[:order_dir]).sum("seats * distance")
           when "rpms"
            scope.order(sum_passengers_all_distance: params[:order_dir]).sum("passengers * distance")
           when "load_factor"
            order_clause = params[:order_dir] == "desc" ? "load_factor DESC NULLS LAST" : "load_factor ASC NULLS FIRST"
            base_load_factor = scope.order(order_clause).select("SUM(passengers)/NULLIF(SUM(seats::float), 0) as load_factor").select(mod_params)
            group_load_factor(base_load_factor)
           else
            passengers
           end

    if params[:group_by].blank?
      routes = {
        departures_scheduled: dep_schd,
        departures_performed: dep_prfm,
        seats: seats,
        passengers: passengers,
        asms: asms,
        rpms: rpms,
        load_factor: load_factor.values.first
      }

      return render json: {routes: [routes], total_items: 1, total_pages: 1}
    end

    res = base.map do |row|
      key, data = row

      base_row = {
        departures_scheduled: dep_schd[key],
        departures_performed: dep_prfm[key],
        seats: seats[key],
        passengers: passengers[key],
        asms: asms[key],
        rpms: rpms[key],
        load_factor: load_factor[key]
      }

      if params[:group_by].length == 1
        base_row[params[:group_by].first] = key
      else
        params[:group_by].each_with_index do |group, idx|
          base_row[group] = key[idx]
        end
      end

      base_row
    end

    render json: {routes: res, total_items: scope.total_count, total_pages: scope.total_pages}
  end

  def group_load_factor(base)
    corrected_load_factor = {}
    mod_params = params[:group_by]&.map do |group|
      case group
      when "year", "month"
        "date_trunc"
      else
        group
      end
    end

    base.map do |row|
      key_base = row.as_json.with_indifferent_access.slice(*mod_params)
      key_base["date_trunc"] = Time.new(key_base["date_trunc"]) if key_base.has_key?("date_trunc")
      key = key_base.values

      key = key[0] if key.length == 1
      corrected_load_factor[key] = row.load_factor
    end

    corrected_load_factor
  end
end