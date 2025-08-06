# == Schema Information
#
# Table name: saved_searches
#
#  id           :bigint           not null, primary key
#  params       :jsonb            not null
#  search_name  :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  session_id   :string
#  shareable_id :string           not null
#
# Indexes
#
#  index_saved_searches_on_session_id    (session_id)
#  index_saved_searches_on_shareable_id  (shareable_id) UNIQUE
#
class SavedSearch < ApplicationRecord
  before_create :generate_shareable_id

  validates :params, presence: true

  private

  def generate_shareable_id
    loop do
      self.shareable_id = SecureRandom.alphanumeric(10)
      break unless SavedSearch.exists?(shareable_id: self.shareable_id)
    end
  end
end
