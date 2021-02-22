(ns sindicato-ufm.services.articles)

(defn get-all [pgclient limit offset callback]
  (->
   (.query pgclient "select * from article limit $1 offset $2" #js[limit offset])
   (.then (fn [a] (callback (js->clj (. a -rows)) nil)))
   (.catch (fn [e] (callback nil e)))))

(defn get-row [pgclient id callback]
  (->
   (.query pgclient "select * from article where id = $1" #js[id])
   (.then (fn [a] (callback (js->clj (. a -rows)) nil)))
   (.catch (fn [e] (callback nil e)))))

(defn get-by-category [pgclient category limit offset callback]
  (->
   (.query pgclient "select * from article where category = $1 limit $2 offset $3" #js[category limit offset])
   (.then (fn [a] (callback (js->clj (. a -rows)) nil)))
   (.catch (fn [e] (callback nil e)))))