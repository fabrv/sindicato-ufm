(ns sindicato-ufm.core
  (:require
   [sindicato-ufm.routes.users :as users]
   [sindicato-ufm.routes.index :as index]))

(def express (js/require "express"))
(def logger (js/require "morgan"))
(def app (express))

(defn port []
  (if process.env.PORT process.env.PORT 3000))

(defn static[root] (.static express root))

(defn start []
  (->
   (.set app "view engine" "hbs")
   (.use (logger "dev"))
   (.use (static "public"))
   (.use "/" (index/index-routes))
   (.use "/users" (users/users-routes))
   (.listen (port) []
            (println (str "Running at http://localhost:" (port))))))

(set! *main-cli-fn* start)