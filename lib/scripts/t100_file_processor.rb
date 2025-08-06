#!/usr/bin/env ruby

require 'zip'
require 'csv'
require 'aws-sdk-s3'
require 'zlib'
require 'fileutils'
require 'tempfile'
require 'ruby-progressbar'
require 'open3'

module Scripts
  class T100FileProcessor
    def initialize(bucket_name, input_directory = '.')
      @bucket_name = bucket_name
      @input_directory = input_directory
      @s3_client = setup_s3_client
      @existing_files = fetch_existing_files
    end

    def process_all_files
      zip_files = Dir.glob(File.join(@input_directory, '*.zip'))
      
      if zip_files.empty?
        puts "No ZIP files found in #{@input_directory}"
        return
      end

      puts "\n" + "="*80
      puts "📦 T-100 FILE PROCESSOR"
      puts "="*80
      puts "Found #{zip_files.length} ZIP files to process"
      puts "Found #{@existing_files.length} existing files in bucket"
      puts "="*80 + "\n"
      
      # Overall progress bar
      overall_progress = ProgressBar.create(
        title: 'Overall',
        total: zip_files.length,
        format: '%t: |%B| %c/%C files (%p%%) %e'
      )
      
      processed = 0
      skipped = 0
      
      zip_files.each_with_index do |zip_file, index|
        puts "\n" + "-"*60
        puts "📁 [#{index + 1}/#{zip_files.length}] #{File.basename(zip_file)}"
        puts "-"*60
        
        result = process_file(zip_file)
        case result
        when :processed
          processed += 1
          puts "✅ PROCESSED"
        when :skipped
          skipped += 1
          puts "⏭️  SKIPPED"
        end
        
        overall_progress.increment
        puts "-"*60
      end
      
      overall_progress.finish
      puts "\n" + "="*80
      puts "🎉 PROCESSING COMPLETE!"
      puts "   Processed: #{processed} files"
      puts "   Skipped: #{skipped} files"
      puts "="*80 + "\n"
    end

    def fetch_existing_files
      puts "\n📋 Fetching existing files from bucket..."
      
      existing_files = {}
      
      begin
        @s3_client.list_objects_v2(bucket: @bucket_name).contents.each do |object|
          filename = object.key
          
          # Parse date range from filename like "t100_2023_01_to_2023_03.csv.zst"
          if match = filename.match(/t100_(\d{4})_(\d{2})(?:_to_(\d{4})_(\d{2}))?\.csv\.zst/)
            start_year, start_month, end_year, end_month = match.captures
            
            min_date = Date.new(start_year.to_i, start_month.to_i, 1)
            max_date = if end_year && end_month
              Date.new(end_year.to_i, end_month.to_i, 1)
            else
              min_date
            end
            
            existing_files[filename] = { min: min_date, max: max_date }
          end
        end
        
        puts "   Found #{existing_files.length} existing T-100 files"
      rescue => e
        puts "   ⚠️  Warning: Could not fetch existing files: #{e.message}"
        puts "   Proceeding without incremental update checks..."
      end
      
      existing_files
    end

    def check_incremental_update(new_date_range)
      new_filename = generate_filename(new_date_range)
      
      # Check if exact same file exists
      if @existing_files.key?(new_filename)
        return { type: :skip }
      end
      
      # Check for overlapping files that should be replaced
      overlapping_files = @existing_files.select do |filename, existing_range|
        ranges_overlap?(new_date_range, existing_range) && 
        new_range_is_broader?(new_date_range, existing_range)
      end
      
      if overlapping_files.any?
        # Find the file with the most overlap (should be replaced)
        file_to_delete = overlapping_files.keys.first # For simplicity, take first match
        puts "   🔄 New file has broader date range, will replace existing file"
        return { type: :delete_and_upload, delete_file: file_to_delete }
      end
      
      # Check if this range is already covered by existing broader files
      covered_by_existing = @existing_files.any? do |filename, existing_range|
        range_covers?(existing_range, new_date_range)
      end
      
      if covered_by_existing
        return { type: :skip }
      end
      
      # Safe to upload as new file
      { type: :upload }
    end

    def ranges_overlap?(range1, range2)
      range1[:min] <= range2[:max] && range1[:max] >= range2[:min]
    end

    def new_range_is_broader?(new_range, existing_range)
      new_range[:min] <= existing_range[:min] && new_range[:max] >= existing_range[:max]
    end

    def range_covers?(covering_range, covered_range)
      covering_range[:min] <= covered_range[:min] && covering_range[:max] >= covered_range[:max]
    end

    private

    def setup_s3_client
      # Configure for Cloudflare R2
      Aws::S3::Client.new(
        access_key_id: ENV['CLOUDFLARE_R2_ACCESS_KEY_ID'],
        secret_access_key: ENV['CLOUDFLARE_R2_SECRET_ACCESS_KEY'],
        region: 'auto', # R2 uses 'auto' for region
        endpoint: "https://#{ENV['CLOUDFLARE_R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        force_path_style: true
      )
    end

    def process_file(zip_file_path)
      # Create temporary directory for processing
      Dir.mktmpdir do |temp_dir|
        # Extract ZIP file
        csv_file_path = extract_zip_file(zip_file_path, temp_dir)
        return :skipped unless csv_file_path

        # Analyze date range from CSV
        date_range = analyze_date_range(csv_file_path)
        return :skipped unless date_range

        # Check if we need to process this file
        action = check_incremental_update(date_range)
        case action[:type]
        when :skip
          puts "   → Already exists with same or broader date range"
          return :skipped
        when :delete_and_upload
          puts "   🗑️  Deleting overlapping file: #{action[:delete_file]}"
          delete_file_from_bucket(action[:delete_file])
          @existing_files.delete(action[:delete_file]) # Update our cache
        end

        puts ""  # Add space before compression

        # Compress with zstd
        compressed_file_path = compress_with_zstd(csv_file_path, date_range, temp_dir)
        return :skipped unless compressed_file_path

        puts ""  # Add space before upload

        # Upload to R2
        upload_to_r2(compressed_file_path, date_range)
        
        # Update our cache of existing files
        new_filename = generate_filename(date_range)
        @existing_files[new_filename] = date_range
        
        puts "   → Saved as: #{new_filename}"
        return :processed
      end
    rescue => e
      puts "   ❌ Error: #{e.message}"
      puts "      #{e.backtrace.first}"
      return :skipped
    end

    def extract_zip_file(zip_file_path, temp_dir)
      Zip::File.open(zip_file_path) do |zip_file|
        csv_entry = zip_file.entries.find { |entry| entry.name.end_with?('.csv') }
        
        unless csv_entry
          puts "   ❌ No CSV file found in ZIP"
          return nil
        end

        csv_file_path = File.join(temp_dir, csv_entry.name)
        csv_entry.extract(csv_file_path)
        puts "   📂 Extracted: #{csv_entry.name}"
        return csv_file_path
      end
    rescue => e
      puts "   ❌ Error extracting: #{e.message}"
      nil
    end

    def analyze_date_range(csv_file_path)
      min_date = nil
      max_date = nil
      row_count = 0

      puts "   📅 Analyzing date range..."
      
      CSV.foreach(csv_file_path, headers: true) do |row|
        year = row['YEAR']&.to_i
        month = row['MONTH']&.to_i
        
        next unless year && month && year > 1900 && month.between?(1, 12)

        date = Date.new(year, month, 1)
        min_date = date if min_date.nil? || date < min_date
        max_date = date if max_date.nil? || date > max_date
        
        row_count += 1
        
        # Sample first 10000 rows for performance on large files
        break if row_count >= 10000
      end

      if min_date && max_date
        puts "   📅 Date range: #{min_date.strftime('%Y-%m')} to #{max_date.strftime('%Y-%m')} (#{row_count} rows sampled)"
        { min: min_date, max: max_date }
      else
        puts "   ❌ Could not determine date range from CSV"
        nil
      end
    rescue => e
      puts "   ❌ Error analyzing date range: #{e.message}"
      nil
    end

    def compress_with_zstd(csv_file_path, date_range, temp_dir)
      output_filename = generate_filename(date_range)
      compressed_file_path = File.join(temp_dir, output_filename)
      file_size = File.size(csv_file_path)

      # Check zstd version and use --max if available (v1.5.7+), fallback to --ultra -22
      zstd_version = `zstd --version 2>/dev/null`.strip
      use_max = zstd_version.match(/v(\d+)\.(\d+)\.(\d+)/) do |m|
        major, minor, patch = m[1].to_i, m[2].to_i, m[3].to_i
        major > 1 || (major == 1 && minor > 5) || (major == 1 && minor == 5 && patch >= 7)
      end

      if use_max
        cmd = "zstd --max --progress -o \"#{compressed_file_path}\" \"#{csv_file_path}\""
        puts "   🗜️  Compressing with zstd --max (maximum compression)..."
      else
        cmd = "zstd -19 --ultra -22 --progress -o \"#{compressed_file_path}\" \"#{csv_file_path}\""
        puts "   🗜️  Compressing with zstd --ultra -22..."
      end
      
      puts "   " + "-"*40
      
      # Use zstd's built-in progress display
      success = system(cmd)
      
      puts "   " + "-"*40
      
      unless success
        puts "   ❌ zstd compression failed. Trying Ruby zlib as fallback..."
        return compress_with_zlib(csv_file_path, date_range, temp_dir)
      end

      original_size = File.size(csv_file_path)
      compressed_size = File.size(compressed_file_path)
      ratio = ((1 - compressed_size.to_f / original_size) * 100).round(1)
      
      puts "   ✅ Compressed: #{format_bytes(original_size)} → #{format_bytes(compressed_size)} (#{ratio}% reduction)"
      compressed_file_path
    rescue => e
      puts "   ❌ Error with zstd compression: #{e.message}"
      puts "   Falling back to zlib compression..."
      compress_with_zlib(csv_file_path, date_range, temp_dir)
    end

    def compress_with_zlib(csv_file_path, date_range, temp_dir)
      output_filename = generate_filename(date_range).gsub('.zst', '.gz')
      compressed_file_path = File.join(temp_dir, output_filename)
      file_size = File.size(csv_file_path)

      puts "🗜️  Compressing with zlib (fallback)..."
      
      progress = ProgressBar.create(
        title: '🗜️  Compressing',
        total: file_size,
        format: '%t: |%B| %c/%C bytes (%p%%) %e'
      )
      
      bytes_processed = 0
      
      Zlib::GzipWriter.open(compressed_file_path) do |gz|
        File.open(csv_file_path, 'rb') do |file|
          while chunk = file.read(8192)
            gz.write(chunk)
            bytes_processed += chunk.length
            progress.progress = bytes_processed
          end
        end
      end
      
      progress.finish

      original_size = File.size(csv_file_path)
      compressed_size = File.size(compressed_file_path)
      ratio = ((1 - compressed_size.to_f / original_size) * 100).round(1)
      
      puts "✅ Compressed: #{format_bytes(original_size)} -> #{format_bytes(compressed_size)} (#{ratio}% reduction)"
      compressed_file_path
    end

    def generate_filename(date_range)
      if date_range[:min] == date_range[:max]
        # Single month
        "t100_#{date_range[:min].strftime('%Y_%m')}.csv.zst"
      else
        # Date range
        "t100_#{date_range[:min].strftime('%Y_%m')}_to_#{date_range[:max].strftime('%Y_%m')}.csv.zst"
      end
    end

    def upload_to_r2(file_path, date_range)
      filename = File.basename(file_path)
      file_size = File.size(file_path)
      
      puts "   ☁️  Uploading to R2..."
      
      progress = ProgressBar.create(
        title: '   Uploading',
        total: file_size,
        format: '%t: |%B| %c/%C bytes (%p%%) %a %e'
      )
      
      uploaded_bytes = 0
      
      File.open(file_path, 'rb') do |file|
        # For large files, we could implement multipart upload with progress
        # For now, we'll show indeterminate progress during upload
        upload_thread = Thread.new do
          @s3_client.put_object(
            bucket: @bucket_name,
            key: filename,
            body: file,
            content_type: 'application/zstd'
          )
        end
        
        # Show progress animation while uploading
        while upload_thread.alive?
          # Simulate progress (we can't easily track S3 upload progress with basic put_object)
          uploaded_bytes = [uploaded_bytes + file_size / 100, file_size - 1].min
          progress.progress = uploaded_bytes
          sleep 0.1
        end
        
        upload_thread.join
        progress.progress = file_size
      end
      
      progress.finish
      puts "   ✅ Uploaded: #{format_bytes(file_size)} to Infrequent Access storage"
    rescue => e
      progress&.finish
      puts "   ❌ Error uploading to R2: #{e.message}"
      raise
    end

    def format_bytes(bytes)
      units = ['B', 'KB', 'MB', 'GB']
      size = bytes.to_f
      unit_index = 0
      
      while size >= 1024 && unit_index < units.length - 1
        size /= 1024
        unit_index += 1
      end
      
      "#{size.round(1)} #{units[unit_index]}"
    end
  end
end

# Usage
if __FILE__ == $0
  unless ARGV[0]
    puts "Usage: ruby #{$0} <bucket-name> [input-directory]"
    puts "Environment variables needed:"
    puts "  CLOUDFLARE_R2_ACCESS_KEY_ID"
    puts "  CLOUDFLARE_R2_SECRET_ACCESS_KEY" 
    puts "  CLOUDFLARE_R2_ACCOUNT_ID"
    puts ""
    puts "Required gem: gem install rubyzip aws-sdk-s3 ruby-progressbar"
    exit 1
  end

  bucket_name = ARGV[0]
  input_directory = ARGV[1] || '.'

  # Check required environment variables
  required_vars = %w[CLOUDFLARE_R2_ACCESS_KEY_ID CLOUDFLARE_R2_SECRET_ACCESS_KEY CLOUDFLARE_R2_ACCOUNT_ID]
  missing_vars = required_vars.select { |var| ENV[var].nil? || ENV[var].empty? }
  
  unless missing_vars.empty?
    puts "❌ Missing required environment variables: #{missing_vars.join(', ')}"
    exit 1
  end

  processor = Scripts::T100FileProcessor.new(bucket_name, input_directory)
  processor.process_all_files
end 