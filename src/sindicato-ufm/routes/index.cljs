(ns web-app.routes.index)
(def express (js/require "express"))
(def router (.Router express))

(defn index [] #js{"title" "Clojurexpress"})

(defn index-routes []
  (.get router "/" (fn [_ res]
    (.render res "index" (index))))

  router)
