(ns sindicato-ufm.utils.sql
  (:require
   [clojure.string :as string] path))

(def showdown (js/require "showdown"))
(def converter (new (. showdown -Converter)))

(defn str-to-link [str]
  (string/lower-case (string/replace str #" " "-")))

(defn link-to-str [link]
  (string/replace link #"-" " "))

(defn markdown-to-html [md]
  (.makeHtml converter md))