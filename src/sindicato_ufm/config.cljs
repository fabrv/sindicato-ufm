(ns sindicato-ufm.config)

(def db
  {:connectionString (if (.. js/process -env -DATABASE_URL)
                       (.. js/process -env -DATABASE_URL)
                       "postgres://postgres:postgres@postgres:5432/postgres")
   :ssl (if (= (.. js/process -env -DATABASE_URL) "production")
          true
          {:rejectUnauthorized false})})