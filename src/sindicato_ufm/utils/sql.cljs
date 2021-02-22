(ns sindicato-ufm.utils.sql
  (:require
   [clojure.string :as string] path))

(defn str-to-link [str]
  (string/lower-case (string/replace str #" " "-")))

(defn link-to-str [link]
  (string/replace link #"-" " "))
