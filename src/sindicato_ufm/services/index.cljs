(ns sindicato-ufm.services.index
  (:require
   [sindicato-ufm.services.categories :as cats]
   [sindicato-ufm.services.articles :as arts]
   [sindicato-ufm.utils.sql :as sql]))

(defn index-view [title links articles]
  (clj->js {
            :title title
            :links links
            :articles articles
  }))

(defn category [pgclient category page callback]
  (arts/get-by-category
   pgclient
   category
   6
   (* page 6)
   (fn [articles err]
     (if err
       (throw err)
       (cats/get-all
        pgclient
        100
        0
        (fn [categories err]
          (if err
            (throw err)
            (callback (index-view "Opinión" categories articles)))))))))

(defn article [pgclient article callback]
  (arts/get-row
   pgclient
   (sql/link-to-str article)
   (fn [articles err]
     (if err
       (throw err)
       (cats/get-all
        pgclient
        100
        0
        (fn [categories err]
          (if err
            (throw err)
            (callback (index-view "Opinión" categories articles)))))))))