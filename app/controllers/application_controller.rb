class ApplicationController < ActionController::API
  include Pagy::Backend

  def fallback_index_html
    render file: Rails.root.join('public', 'index.html'), layout: false
  end
end
