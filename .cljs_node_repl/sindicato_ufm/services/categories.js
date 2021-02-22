// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.services.categories');
goog.require('cljs.core');
sindicato_ufm.services.categories.get_all = (function sindicato_ufm$services$categories$get_all(pgclient,limit,offset,callback){
return pgclient.query("select * from category order by id desc limit $1 offset $2",[limit,offset]).then((function (a){
return callback.call(null,cljs.core.js__GT_clj.call(null,a.rows),null);
})).catch((function (e){
return callback.call(null,null,e);
}));
});

//# sourceMappingURL=categories.js.map
