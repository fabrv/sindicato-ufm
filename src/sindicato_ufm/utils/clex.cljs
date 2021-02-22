(ns sindicato-ufm.utils.clex)

(defn params [req param]
  ((js->clj (. req -params)) param))