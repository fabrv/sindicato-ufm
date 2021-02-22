(ns sindicato-ufm.core
  (:require
   [sindicato-ufm.routes.index :as index]
   [clojure.string :as string] path))

(def express (js/require "express"))
(def logger (js/require "morgan"))
(def path (js/require "path"))
(def pg (js/require "pg"))

(def client (new (. pg -Client) #js{:connectionString "postgres://yccfbeasuxbqjy:89298dfa903a83f89fb9e4ba35c25584f0363302379a75b7f028711033828ab2@ec2-184-73-153-64.compute-1.amazonaws.com:5432/dfp3idvcven38h"
                                    :ssl #js{:rejectUnauthorized false}}))


(def exphbs (js/require "express-handlebars"))
(def app (express))

(defn port []
  (if (.. js/process -env -PORT) (.. js/process -env -PORT) 3000))

(defn str-to-link [str]
  (string/lower-case (string/replace str #" " "-")))

(def hbs-config {:extname ".hbs"
                 :defaultLayout "layout"
                 :helpers {:toLink str-to-link}})

(def hbs
  (.create exphbs (clj->js hbs-config)))

()

(defn start []
  (->
   (.connect client)
   (.then (fn [_]
            (.log js/console "connected to pg")))
   (.catch (fn [e] (.log js/console e))))

  (->
   ; Engine setup
   (.engine app ".hbs" (. hbs -engine))
   (.set "view engine" ".hbs")
   ; Middlewares
   (.use (logger "dev"))
   (.use (.static express "public"))
   ; Routes
   (.use "/" (index/index-routes client))
   ; Starting the server
   (.listen (port) []
            (println (str "Running at http://localhost:" (port))))))

(set! *main-cli-fn* start)