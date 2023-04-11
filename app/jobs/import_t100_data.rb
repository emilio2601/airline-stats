class ImportT100Data
  require "CSV"

  DOMESTIC_FILE = "T_T100D_SEGMENT_US_CARRIER_ONLY.csv"
  INTL_FILE = "T_T100I_SEGMENT_ALL_CARRIER.csv"

  INTL_COLUMNS = Route.columns.map(&:name) - ["id", "created_at", "updated_at"]
  DOMESTIC_COLUMNS = INTL_COLUMNS - ["origin_country", "dest_country"]

  def import_domestic
    domestic_items = []
    CSV.foreach(DOMESTIC_FILE, headers: true) do |row|
      domestic_items << row.to_h.transform_keys(&:downcase)
    end
    res = Route.import(DOMESTIC_COLUMNS, domestic_items)
    Route.where(id: res.ids).update_all(origin_country: "USA", dest_country: "USA")
  end

  def import_intl
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

      intl_items << row_data
    end
    Route.import(INTL_COLUMNS, intl_items)
  end
end