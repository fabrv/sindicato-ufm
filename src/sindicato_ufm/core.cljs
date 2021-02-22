(ns sindicato-ufm.core
  (:require
   [sindicato-ufm.components.index.index-routes :as index]
   [sindicato-ufm.components.about.about-routes :as about]
   [sindicato-ufm.utils.sql :as sql]
   [sindicato-ufm.config :as config]))

(def express (js/require "express"))
(def logger (js/require "morgan"))
(def path (js/require "path"))
(def pg (js/require "pg"))

(def client (new (. pg -Client) (clj->js config/db)))

(def exphbs (js/require "express-handlebars"))
(def app (express))

(defn port []
  (if (.. js/process -env -PORT) (.. js/process -env -PORT) 3000))

(def hbs-config {:extname ".hbs"
                 :defaultLayout "layout"
                 :helpers {
                           :toLink sql/str-to-link
                           :mdToHTML sql/markdown-to-html}})

(def hbs
  (.create exphbs (clj->js hbs-config)))

()

(defn start []
  (->
   (.connect client)
   (.then (fn [_]
            (.log js/console "Connected to database")))
   (.catch (fn [e] (.log js/console e))))

  (->
   ; Engine setup
   (.engine app ".hbs" (. hbs -engine))
   (.set "view engine" ".hbs")
   ; Middlewares
   (.use (logger "dev"))
   (.use (.static express "public"))
   ; Routes
   (.use "/nosotros" (about/about-routes))
   (.use "/" (index/index-routes client))
   ; Starting the server
   (.listen (port) []
            (println (str "Running at http://localhost:" (port))))))

(set! *main-cli-fn* start)