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
class SavedSearch < ApplicationRecord
  before_create :generate_shareable_id

  validates :params, presence: true

  private

  def generate_shareable_id
    self.shareable_id = SecureRandom.urlsafe_base64(8)
  end
end
