(ns sindicato-ufm.config)

(def db
  {:connectionString (if (.. js/process -env -DATABASE_URL)
                       (.. js/process -env -DATABASE_URL)
                       "postgres://yccfbeasuxbqjy:89298dfa903a83f89fb9e4ba35c25584f0363302379a75b7f028711033828ab2@ec2-184-73-153-64.compute-1.amazonaws.com:5432/dfp3idvcven38h")
   :ssl (if (= (.. js/process -env -DATABASE_URL) "production")
          true
          {:rejectUnauthorized false})})