class ImportT100Data
  require "csv"
  require "zlib"
  require "aws-sdk-s3"
  require "tempfile"

  COLUMNS = Route.columns.map(&:name) - ["id", "created_at", "updated_at"]

  def self.format_number(number)
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
  end

  def self.setup_s3_client
    @s3_client ||= Aws::S3::Client.new(
      access_key_id: ENV['CLOUDFLARE_R2_ACCESS_KEY_ID'],
      secret_access_key: ENV['CLOUDFLARE_R2_SECRET_ACCESS_KEY'],
      region: 'auto',
      endpoint: "https://#{ENV['CLOUDFLARE_R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
      force_path_style: true,
      credentials: Aws::Credentials.new(
        ENV['CLOUDFLARE_R2_ACCESS_KEY_ID'],
        ENV['CLOUDFLARE_R2_SECRET_ACCESS_KEY']
      )
    )
  end

  def self.list_available_files(bucket_name)
    s3_client = setup_s3_client
    
    files = []
    s3_client.list_objects_v2(bucket: bucket_name).contents.each do |object|
      if object.key.match?(/^t100_\d{4}_\d{2}(?:_to_\d{4}_\d{2})?\.csv\.zst$/)
        # Parse date range from filename
        if match = object.key.match(/t100_(\d{4})_(\d{2})(?:_to_(\d{4})_(\d{2}))?\.csv\.zst/)
          start_year, start_month, end_year, end_month = match.captures
          
          start_date = Date.new(start_year.to_i, start_month.to_i, 1)
          end_date = if end_year && end_month
            Date.new(end_year.to_i, end_month.to_i, 1)
          else
            start_date
          end
          
          files << {
            key: object.key,
            start_date: start_date,
            end_date: end_date,
            size: object.size
          }
        end
      end
    end
    
    files.sort_by { |f| f[:start_date] }
  end

  def self.get_existing_date_ranges
    # Get all unique year-month combinations already in the database
    existing = Route.distinct.pluck(:month).compact.map { |date| date.beginning_of_month }.to_set
    puts "📊 Found #{format_number(existing.size)} months of data already imported"
    existing
  end

  def self.import_from_s3(bucket_name, file_key = nil, **options)
    s3_client = setup_s3_client
    
    files_to_import = if file_key
      # Import specific file
      [{ key: file_key }]
    else
      # Import all files, but check what's already imported
      available_files = list_available_files(bucket_name)
      existing_dates = get_existing_date_ranges
      
      # Filter files that have new data
      files_to_import = available_files.select do |file_info|
        date_range = (file_info[:start_date]..file_info[:end_date]).map(&:beginning_of_month)
        has_new_data = date_range.any? { |date| !existing_dates.include?(date) }
        
        if has_new_data
          puts "📥 Will import: #{file_info[:key]} (#{file_info[:start_date].strftime('%Y-%m')} to #{file_info[:end_date].strftime('%Y-%m')})"
          true
        else
          puts "⏭️  Skipping: #{file_info[:key]} (data already exists)"
          false
        end
      end
      
      files_to_import
    end

    if files_to_import.empty?
      puts "🎉 No new files to import - all data is up to date!"
      return
    end

    puts "\n📦 Importing #{files_to_import.size} file(s)..."
    
    total_imported = 0
    total_skipped = 0
    
    files_to_import.each_with_index do |file_info, index|
      puts "\n" + "-" * 60
      puts "📁 [#{index + 1}/#{files_to_import.size}] #{file_info[:key]}"
      puts "-" * 60
      
      imported, skipped = import_single_file_from_s3(s3_client, bucket_name, file_info[:key], **options)
      total_imported += imported
      total_skipped += skipped
      
      puts "✅ File complete: #{imported} imported, #{skipped} skipped"
    end
    
    puts "\n" + "=" * 60
    puts "🎉 IMPORT COMPLETE!"
    puts "   Total imported: #{format_number(total_imported)} rows"
    puts "   Total skipped: #{format_number(total_skipped)} rows"
    puts "=" * 60
  end

  def self.import_single_file_from_s3(s3_client, bucket_name, file_key, **options)
    puts "📥 Downloading and decompressing #{file_key}..."
    
    # Download file to temporary location
    Tempfile.create(['t100_import', '.zst'], binmode: true) do |temp_file|
      # Download the compressed file in binary mode
      s3_client.get_object(bucket: bucket_name, key: file_key) do |chunk|
        temp_file.write(chunk)
      end
      temp_file.flush
      temp_file.close
      
      # Decompress if it's a .zst file
      if file_key.end_with?('.zst')
        Tempfile.create(['t100_decompressed', '.csv']) do |decompressed_file|
          decompressed_file.close # Close it so zstd can write to it
          
          # Use zstd to decompress with increased memory limit and force overwrite
          cmd = "zstd -d --force --long=28 --memory=256MB -o \"#{decompressed_file.path}\" \"#{temp_file.path}\""
          
          puts "   🗜️  Decompressing with increased memory limit..."
          
          unless system(cmd)
            # Try with even more memory if first attempt fails
            puts "   🔄 Retrying with maximum memory settings..."
            cmd = "zstd -d --force --long=31 --memory=1GB -o \"#{decompressed_file.path}\" \"#{temp_file.path}\""
            
            unless system(cmd)
              raise "Failed to decompress #{file_key}. The file may require more memory than available. Command: #{cmd}"
            end
          end
          
          # Import from the decompressed file
          import_from_file(decompressed_file.path, **options)
        end
      else
        # For non-compressed files, reopen in text mode
        import_from_file(temp_file.path, **options)
      end
    end
  rescue => e
    puts "❌ Error downloading/decompressing #{file_key}: #{e.message}"
    raise
  end

  def self.import_from_file(file_path, **options)
    batch_size = options[:batch_size] || 10_000
    skip_existing_months = options.fetch(:skip_existing_months, true)
    
    puts "📊 Starting import with batch size: #{format_number(batch_size)}"
    puts "🔄 Month handling: #{skip_existing_months ? 'Skip existing months' : 'Allow duplicate months'}"
    
    ActiveRecord::Base.transaction do
      items = []
      imported_count = 0
      skipped_count = 0
      month_skipped_count = 0
      
      # Get set of months that already have data
      existing_months = if skip_existing_months
        puts "📋 Checking for existing months in database..."
        Route.distinct.pluck(:month).compact.map(&:beginning_of_month).to_set
      else
        Set.new
      end
      
      puts "📋 Found #{format_number(existing_months.size)} months already imported" if skip_existing_months
      puts "📖 Reading CSV file..."
      
      months_in_file = Set.new
      
      CSV.foreach(file_path, headers: true).each_with_index do |row, line_num|
        row_data = row.to_h.transform_keys(&:downcase)

        # Skip rows with missing required data
        if row_data["origin_city_name"].nil? || row_data["dest_city_name"].nil?
          skipped_count += 1
          next
        end

        # Transform data first to get the month
        month_date = Date.new(row_data["year"].to_i, row_data["month"].to_i, 1)
        
        # Skip entire month if it already exists
        if skip_existing_months && existing_months.include?(month_date)
          month_skipped_count += 1
          next
        end
        
        # Track months we're processing
        months_in_file.add(month_date)

        # Process state abbreviations
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

        # Transform data
        row_data["service_class"] = row_data["class"]
        row_data["month"] = month_date

        items << row_data.slice(*COLUMNS)

        # Batch insert when we reach batch size
        if items.size >= batch_size
          begin
            result = Route.insert_all(items)
            imported_count += result.rows.count
            puts "   📈 Batch #{(line_num / batch_size) + 1}: +#{format_number(result.rows.count)} rows (total: #{format_number(imported_count)})"
            items = []
          rescue => e
            puts "   ❌ Error in batch: #{e.message}"
            # Continue with next batch
            items = []
          end
        end
      end

      # Insert remaining items
      unless items.empty?
        begin
          result = Route.insert_all(items)
          imported_count += result.rows.count
          puts "   📈 Final batch: +#{format_number(result.rows.count)} rows (total: #{format_number(imported_count)})"
        rescue => e
          puts "   ❌ Error in final batch: #{e.message}"
        end
      end

      puts "   📊 Import summary:"
      puts "      Imported: #{format_number(imported_count)} rows"
      puts "      Skipped (missing data): #{format_number(skipped_count)} rows"
      puts "      Skipped (existing months): #{format_number(month_skipped_count)} rows" if skip_existing_months
      puts "      New months processed: #{format_number(months_in_file.size)}" if months_in_file.any?
      
      [imported_count, skipped_count + month_skipped_count]
    end
  rescue => e
    puts "❌ Error during import: #{e.message}"
    puts e.backtrace.first(3)
    [0, 0]
  end

  # Legacy method for backward compatibility
  def self.import(file_path, **options)
    import_from_file(file_path, **options)
  end

  # Helper method to show available files
  def self.list_files(bucket_name)
    files = list_available_files(bucket_name)
    
    puts "📋 Available files in #{bucket_name}:"
    puts "-" * 80
    
    files.each do |file|
      size_mb = (file[:size] / 1024.0 / 1024.0).round(1)
      date_range = if file[:start_date] == file[:end_date]
        file[:start_date].strftime('%Y-%m')
      else
        "#{file[:start_date].strftime('%Y-%m')} to #{file[:end_date].strftime('%Y-%m')}"
      end
      
      puts "📁 #{file[:key]}"
      puts "   📅 Date range: #{date_range}"
      puts "   💾 Size: #{size_mb} MB"
      puts
    end
    
    files
  end
end