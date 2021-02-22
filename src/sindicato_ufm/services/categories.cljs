(ns sindicato-ufm.services.categories)

(defn get-all [pgclient limit offset callback]
  (->
   (.query pgclient "select * from category order by id desc limit $1 offset $2" #js[limit offset])
   (.then (fn [a] (callback (js->clj (. a -rows)) nil)))
   (.catch (fn [e] (callback nil e)))))