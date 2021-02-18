(ns web-app.routes.users)
(def express (js/require "express"))
(def router (.Router express))

(defn users [] #js{"name" "Juan" "lastname" "Ramirez"})

(defn users-routes []
  (.get router "/" (fn [_ res]
    (.send res (users))))

  router)