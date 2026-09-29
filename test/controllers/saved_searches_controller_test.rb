require "test_helper"

class SavedSearchesControllerTest < ActionDispatch::IntegrationTest
  test "saves and returns multiple airports" do
    filters = {
      origin: %w[LAX SFO], dest: %w[GDL PVR], carrier: %w[AA UA],
      group_by: %w[carrier origin], bidirectional_airport: true,
      page: 1, items_per_page: 20
    }

    post "/api/saved_searches", params: { saved_search: { search_name: "West Mexico", params: filters } }, as: :json

    assert_response :created
    saved = response.parsed_body
    assert_equal %w[LAX SFO], saved.dig("params", "origin")
    assert_equal %w[GDL PVR], saved.dig("params", "dest")
    assert_equal true, saved.dig("params", "bidirectional_airport")

    get "/api/saved_searches/#{saved.fetch('shareable_id')}"
    assert_response :success
    assert_equal filters[:group_by], response.parsed_body.dig("params", "group_by")
  end
end
