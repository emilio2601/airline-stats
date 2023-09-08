class ImportT100Data
  require "open-uri"
  require "csv"

  DEFAULT_FILENAME = "T_T100I_SEGMENT_ALL_CARRIER.csv"

  COLUMNS = Route.columns.map(&:name) - ["id", "created_at", "updated_at"]

  def self.import(file = DEFAULT_FILENAME, options = {})
    ActiveRecord::Base.transaction do
      intl_items = []
      count = 0
      
      CSV.foreach(file, headers: true) do |row|
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

        if options[:csv_batch_size] && intl_items.size > options[:csv_batch_size]
          res = Route.import(INTL_COLUMNS, intl_items, options)
          puts "Successfully imported #{res.num_inserts} rows"
          count += res.ids.size
          intl_items = []
        end
      end

      res = Route.import(INTL_COLUMNS, intl_items, options)
      count += res.ids.size
      puts "Successfully imported #{res.num_inserts}/#{count} rows. Done!"
    end
  end

  def self.import_from_url(url, options = {})
    f = URI.open(url)
    self.import(f, options)
  end
end