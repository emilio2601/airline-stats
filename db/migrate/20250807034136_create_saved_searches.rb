class CreateSavedSearches < ActiveRecord::Migration[8.0]
  def change
    create_table :saved_searches do |t|
      t.string :search_name
      t.jsonb :params, null: false
      t.string :shareable_id, null: false

      t.timestamps
    end
    add_index :saved_searches, :shareable_id, unique: true
  end
end
