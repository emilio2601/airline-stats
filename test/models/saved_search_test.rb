# == Schema Information
#
# Table name: saved_searches
#
#  id           :bigint           not null, primary key
#  params       :jsonb            not null
#  search_name  :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  shareable_id :string           not null
#
# Indexes
#
#  index_saved_searches_on_shareable_id  (shareable_id) UNIQUE
#
require "test_helper"

class SavedSearchTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
