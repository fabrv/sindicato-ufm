(ns sindicato-ufm.components.about.about-routes 
  (:require [sindicato-ufm.components.about.about-controller :as controller]))

(def express (js/require "express"))
(def router (.Router express))

(defn about-routes [pgclient]
  (.get router "/"
        (fn [_ res]
          (controller/about
           pgclient
           (fn [data]
           (.render res "about" data)))))
  router)