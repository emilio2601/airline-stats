class ImportT100Data
  require "csv"

  DOMESTIC_FILE = "T_T100D_SEGMENT_US_CARRIER_ONLY.csv"
  INTL_FILE = "T_T100I_SEGMENT_ALL_CARRIER.csv"

  INTL_COLUMNS = Route.columns.map(&:name) - ["id", "created_at", "updated_at"]
  DOMESTIC_COLUMNS = INTL_COLUMNS - ["origin_country", "dest_country"]

  def self.import_domestic
    domestic_items = []
    CSV.foreach(DOMESTIC_FILE, headers: true) do |row|
      row_data = row.to_h.transform_keys(&:downcase)
      row_data["service_class"] = row_data["class"]
      row_data["month"] = Date.new(row_data["year"].to_i, row_data["month"].to_i)
      domestic_items << row_data
    end
    res = Route.import(DOMESTIC_COLUMNS, domestic_items)
    Route.where(id: res.ids).update_all(origin_country: "US", dest_country: "US")
  end

  def self.import_intl
    intl_items = []
    CSV.foreach(INTL_FILE, headers: true) do |row|
      row_data = row.to_h.transform_keys(&:downcase)

      if row_data["origin_country"] == "US"
        row_data["origin_state_abr"] = row_data["origin_city_name"].split(", ").last
      else
        row_data["origin_state_abr"] = nil
      end

      if row_data["dest_country"] == "US"
        row_data["dest_state_abr"] = row_data["dest_city_name"].split(", ").last
      else
        row_data["dest_state_abr"] = nil
      end

      row_data["service_class"] = row_data["class"]
      row_data["month"] = Date.new(row_data["year"].to_i, row_data["month"].to_i)

      intl_items << row_data
    end
    Route.import(INTL_COLUMNS, intl_items)
  end

  def self.import_all
    Route.destroy_all
    import_domestic
    import_intl
  end
end