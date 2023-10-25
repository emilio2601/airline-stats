class ImportT100Data
  require "open-uri"
  require "csv"

  DEFAULT_FILENAME = "T_T100I_SEGMENT_ALL_CARRIER.csv"

  COLUMNS = Route.columns.map(&:name) - ["id", "created_at", "updated_at"]

  def self.import(file = DEFAULT_FILENAME, **options)
    ActiveRecord::Base.transaction do
      items = []
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

        items << row_data.slice(*COLUMNS)

        if options[:batch_size] && items.size >= options[:batch_size]
          res = Route.insert_all(items)
          count += res.rows.count
          puts "Successfully imported #{res.rows.count}/#{count} rows"
          items = []
        end
      end

      res = Route.insert_all(items)
      count += res.rows.count
      puts "Successfully imported #{res.rows.count}/#{count} rows. Done!"
    end
  end

  def self.import_from_url(url, ...)
    f = URI.open(url)
    self.import(f, ...)
  end
end