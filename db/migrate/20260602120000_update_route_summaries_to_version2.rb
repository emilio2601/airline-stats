class UpdateRouteSummariesToVersion2 < ActiveRecord::Migration[8.1]
  # v2 adds unique_carrier to the materialized view grain so reused T-100 carrier
  # codes (e.g. "PA", "CP") are grouped/labelled by the disambiguated unique_carrier
  # instead of being merged.
  #
  # Scenic re-applies the existing indexes when it rebuilds a materialized view,
  # except the unique index (whose grain changes here). Index operations are written
  # idempotently so the migration converges regardless of what Scenic restored.
  def up
    update_view :route_summaries, version: 2, revert_to_version: 1, materialized: true
    swap_unique_index(%i[month carrier unique_carrier origin dest origin_country dest_country aircraft_type service_class])
    add_index :route_summaries, [:unique_carrier], name: 'idx_route_summaries_unique_carrier', if_not_exists: true
    ensure_secondary_indexes
  end

  def down
    update_view :route_summaries, version: 1, revert_to_version: 2, materialized: true
    remove_index :route_summaries, name: 'idx_route_summaries_unique_carrier', if_exists: true
    swap_unique_index(%i[month carrier origin dest origin_country dest_country aircraft_type service_class])
    ensure_secondary_indexes
  end

  private

  def swap_unique_index(columns)
    remove_index :route_summaries, name: 'idx_route_summaries_unique', if_exists: true
    add_index :route_summaries, columns, unique: true, name: 'idx_route_summaries_unique'
  end

  def ensure_secondary_indexes
    add_index :route_summaries, %i[origin_country dest_country month], name: 'idx_route_summaries_countries_month', if_not_exists: true
    add_index :route_summaries, %i[origin dest month], name: 'idx_route_summaries_origin_dest_month', if_not_exists: true
    add_index :route_summaries, %i[carrier month], name: 'idx_route_summaries_carrier_month', if_not_exists: true
    add_index :route_summaries, %i[dest_country origin_country month], name: 'idx_route_summaries_dest_country_month', if_not_exists: true
    add_index :route_summaries, %i[dest origin month], name: 'idx_route_summaries_dest_origin_month', if_not_exists: true
    add_index :route_summaries, %i[origin_country dest_country], name: 'idx_route_summaries_countries_no_month', if_not_exists: true
    add_index :route_summaries, %i[dest_country origin_country], name: 'idx_route_summaries_dest_country_no_month', if_not_exists: true
    add_index :route_summaries, [:carrier], name: 'idx_route_summaries_carrier_no_month', if_not_exists: true
  end
end
