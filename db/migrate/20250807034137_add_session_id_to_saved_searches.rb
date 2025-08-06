class AddSessionIdToSavedSearches < ActiveRecord::Migration[8.0]
  def change
    add_column :saved_searches, :session_id, :string
    add_index :saved_searches, :session_id
  end
end
