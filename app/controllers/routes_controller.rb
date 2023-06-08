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

    dep_schd    = scope.sum(:departures_scheduled)
    dep_prfm    = scope.sum(:departures_performed)
    seats       = scope.sum(:seats)
    passengers  = scope.sum(:passengers)
    asms        = scope.sum("seats * distance")
    rpms        = scope.sum("passengers * distance")
    load_factor = group_load_factor(scope.select("SUM(passengers)/NULLIF(SUM(seats::float), 0) as load_factor").select(mod_params).order(:load_factor))

    base = case params[:order_by]
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
            base_load_factor = scope.order(load_factor: params[:order_dir]).select("SUM(passengers)/NULLIF(SUM(seats::float), 0) as load_factor").select(mod_params)
            group_load_factor(base_load_factor)
           else
            passengers
           end

    if params[:group_by].blank?
      return render json: [{
        departures_scheduled: dep_schd,
        departures_performed: dep_prfm,
        seats: seats,
        passengers: passengers,
        asms: asms,
        rpms: rpms,
        load_factor: load_factor.values.first
      }]
    end

    res = base.map do |row|
      key, data = row

      base = {
        departures_scheduled: dep_schd[key],
        departures_performed: dep_prfm[key],
        seats: seats[key],
        passengers: passengers[key],
        asms: asms[key],
        rpms: rpms[key],
        load_factor: load_factor[key]
      }

      if params[:group_by].length == 1
        base[params[:group_by].first] = key
      else
        params[:group_by].each_with_index do |group, idx|
          base[group] = key[idx]
        end
      end

      base
    end

    render json: res
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