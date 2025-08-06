Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"

  get "up" => "rails/health#show", as: :rails_health_check

  resources :routes, only: [:index] do
    get :date_range, on: :collection
  end

  resources :saved_searches, only: [:create, :show]
end
