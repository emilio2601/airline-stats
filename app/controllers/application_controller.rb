class ApplicationController < ActionController::API
  include Pagy::Backend

  def fallback_index_html
    render file: 'public/index.html'
  end
end
