class CreateRouteSummaries < ActiveRecord::Migration[8.0]
  def change
    create_view :route_summaries, materialized: true
  end
end
