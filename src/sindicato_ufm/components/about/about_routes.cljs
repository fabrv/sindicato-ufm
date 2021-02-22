(ns sindicato-ufm.components.about.about-routes)

(def express (js/require "express"))
(def router (.Router express))

(defn about-routes []
  (.get router "/"
        (fn [_ res]
          (.render res "about")))
  router)