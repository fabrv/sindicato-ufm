// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.config');
goog.require('cljs.core');
sindicato_ufm.config.db = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"connectionString","connectionString",631814971),(cljs.core.truth_(process.env.DATABASE_URL)?process.env.DATABASE_URL:"postgres://postgres:postgres@postgres:5432/postgres"),new cljs.core.Keyword(null,"ssl","ssl",-1781962783),((cljs.core._EQ_.call(null,process.env.DATABASE_URL,"production"))?true:new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"rejectUnauthorized","rejectUnauthorized",-358838576),false], null))], null);

//# sourceMappingURL=config.js.map
