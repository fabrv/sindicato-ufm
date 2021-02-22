(ns sindicato-ufm.routes.index
  (:require
   [sindicato-ufm.services.index :as index]))

(def express (js/require "express"))
(def router (.Router express))

(defn index-routes [pgclient]
  (.get router
        "/"
        (fn [_ res]
          (index/category pgclient "opinion" 0
                          (fn [data]
                            (.render res "index" data)))))

  (.get router
        "/articulo/:article"
        (fn [req res]
          ))

  (.get router
        "/:category"
        (fn [req res]
          (index/category pgclient (.. req -params -category) 0
                          (fn [data]
                            (.render res "index" data)))))

  router)
