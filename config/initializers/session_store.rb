Rails.application.config.session_store :redis_session_store,
  servers: ["redis://localhost:6379/0/session"],
  expire_after: 90.days,
  key: "_#{Rails.application.class.module_parent_name.downcase}_session",
  threadsafe: true,
  signed: true,
  secure: Rails.env.production? 