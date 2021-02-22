// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.services.articles');
goog.require('cljs.core');
sindicato_ufm.services.articles.get_all = (function sindicato_ufm$services$articles$get_all(pgclient,limit,offset,callback){
return pgclient.query("select * from article order by created desc limit $1 offset $2",[limit,offset]).then((function (a){
return callback.call(null,cljs.core.js__GT_clj.call(null,a.rows),null);
})).catch((function (e){
return callback.call(null,null,e);
}));
});
sindicato_ufm.services.articles.get_row = (function sindicato_ufm$services$articles$get_row(pgclient,headline,callback){
return pgclient.query("select * from article where lower(headline) = $1",[headline]).then((function (a){
return callback.call(null,cljs.core.js__GT_clj.call(null,a.rows),null);
})).catch((function (e){
return callback.call(null,null,e);
}));
});
sindicato_ufm.services.articles.get_by_category = (function sindicato_ufm$services$articles$get_by_category(pgclient,category,limit,offset,callback){
return pgclient.query("select * from article where category = $1 order by created desc limit $2 offset $3",[category,limit,offset]).then((function (a){
return callback.call(null,cljs.core.js__GT_clj.call(null,a.rows),null);
})).catch((function (e){
return callback.call(null,null,e);
}));
});

//# sourceMappingURL=articles.js.map
