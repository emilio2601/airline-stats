namespace :t100 do
  desc "Process T-100 ZIP files and upload to R2"
  task :process, [:bucket_name, :input_directory] => :environment do |t, args|
    require_relative '../scripts/t100_processor'
    
    bucket_name = args[:bucket_name] || ENV['R2_BUCKET_NAME']
    input_directory = args[:input_directory] || '.'
    
    unless bucket_name
      puts "Usage: rails t100:process[bucket-name,input-directory]"
      puts "Or set R2_BUCKET_NAME environment variable"
      exit 1
    end
    
    processor = T100FileProcessor.new(bucket_name, input_directory)
    processor.process_all_files
  end

  desc "Import T-100 data from R2 storage"
  task :import, [:bucket_name, :file_key] => :environment do |t, args|
    require_relative '../scripts/import_t100_data'
    bucket_name = args[:bucket_name] || ENV['R2_BUCKET_NAME'] || 'airline-stats-t100-data'
    
    if args[:file_key]
      ImportT100Data.import_from_s3(bucket_name, args[:file_key])
    else
      ImportT100Data.import_from_s3(bucket_name)
    end
  end
  
  desc "List available T-100 files in R2"
  task :list, [:bucket_name] => :environment do |t, args|
    require_relative '../scripts/import_t100_data'
    bucket_name = args[:bucket_name] || ENV['R2_BUCKET_NAME'] || 'airline-stats-t100-data'
    ImportT100Data.list_files(bucket_name)
  end
end