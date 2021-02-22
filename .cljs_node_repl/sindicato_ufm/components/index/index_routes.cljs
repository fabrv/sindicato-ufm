(ns sindicato-ufm.components.index.index_routes
  (:require
   [sindicato-ufm.components.index.index-controller :as controller]))

(def express (js/require "express"))
(def router (.Router express))

(defn index-routes [pgclient]
  (.get router
        "/"
        (fn [_ res]
          (controller/category pgclient "opinion" 0
                          (fn [data]
                            (.render res "index" data)))))

  (.get router
        "/articulo/:article"
        (fn [req res]
          (controller/article pgclient (.. req -params -article)
                         (fn [data]
                           (.render res "index" data)))))

  (.get router
        "/:category"
        (fn [req res]
          (controller/category pgclient (.. req -params -category) 0
                          (fn [data]
                            (.render res "index" data)))))

  router)
