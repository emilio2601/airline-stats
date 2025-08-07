Rails.application.config.session_store :cookie_store, 
  key: '_airline_stats_session', 
  domain: :all, 
  tld_length: 2,
  same_site: :lax,
  secure: Rails.env.production? 