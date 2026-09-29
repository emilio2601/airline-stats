require "test_helper"

class RouteSearchTest < ActiveSupport::TestCase
  setup do
    [
      ["LAX", "GDL", 10],
      ["SFO", "PVR", 20],
      ["GDL", "LAX", 30],
      ["ORD", "GDL", 40]
    ].each do |origin, dest, seats|
      Route.create!(origin: origin, dest: dest, origin_country: origin == "GDL" ? "MX" : "US",
                    dest_country: %w[GDL PVR].include?(dest) ? "MX" : "US",
                    carrier: "AA", unique_carrier: "AA", service_class: "F",
                    month: Date.new(2026, 1, 1), departures_performed: 1,
                    seats: seats, passengers: seats / 2, distance: 100)
    end
    RouteSummary.connection.execute("REFRESH MATERIALIZED VIEW route_summaries")
  end

  test "multiple airports accept array and comma separated values" do
    results = search(origin: [" lax ", "SFO", "LAX"], dest: "gdl, pvr")

    assert_equal [["LAX", "GDL"], ["SFO", "PVR"]], pairs(results)
    assert_equal 30, results[:routes].sum(&:seats)
  end

  test "both directions includes reverse routes once" do
    results = search(origin: ["LAX", "SFO"], dest: ["GDL", "PVR"], bidirectional_airport: true)

    assert_equal [["GDL", "LAX"], ["LAX", "GDL"], ["SFO", "PVR"]], pairs(results)
    assert_equal 60, results[:routes].sum(&:seats)
  end

  test "both airport directions also reverses active country filters" do
    filters = { origin: "LAX", dest: "GDL", origin_country: "US", dest_country: "MX" }

    assert_equal [["LAX", "GDL"]], pairs(search(filters))
    assert_equal [["GDL", "LAX"], ["LAX", "GDL"]], pairs(search(filters.merge(bidirectional_airport: true)))
  end

  private

  def search(filters)
    RouteSearch.new({ format: "csv", group_by: %w[origin dest], order_by: "seats" }.merge(filters)).call
  end

  def pairs(results)
    results[:routes].map { |route| [route.origin, route.dest] }.sort
  end
end
