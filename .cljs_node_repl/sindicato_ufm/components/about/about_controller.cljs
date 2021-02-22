(ns sindicato-ufm.components.about.about-controller 
  (:require [sindicato-ufm.services.categories :as cats]))

(defn about-view [title links]
  (clj->js {:title title
            :links links}))

(defn about [pgclient callback]
  (cats/get-all
   pgclient
   100
   0
   (fn [categories err]
     (if err
       (throw err)
       (callback (about-view "Sobre nosotros" categories))))))