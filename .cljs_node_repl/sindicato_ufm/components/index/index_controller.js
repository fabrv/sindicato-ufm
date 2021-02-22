// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.components.index.index_controller');
goog.require('cljs.core');
goog.require('sindicato_ufm.services.categories');
goog.require('sindicato_ufm.services.articles');
goog.require('sindicato_ufm.utils.sql');
sindicato_ufm.components.index.index_controller.index_view = (function sindicato_ufm$components$index$index_controller$index_view(title,links,articles){
return cljs.core.clj__GT_js.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"title","title",636505583),title,new cljs.core.Keyword(null,"links","links",-654507394),links,new cljs.core.Keyword(null,"articles","articles",-454771639),articles], null));
});
sindicato_ufm.components.index.index_controller.category = (function sindicato_ufm$components$index$index_controller$category(pgclient,category,page,callback){
return sindicato_ufm.services.articles.get_by_category.call(null,pgclient,category,(100),(page * (100)),(function (articles,err){
if(cljs.core.truth_(err)){
throw err;
} else {
return sindicato_ufm.services.categories.get_all.call(null,pgclient,(100),(0),(function (categories,err__$1){
if(cljs.core.truth_(err__$1)){
throw err__$1;
} else {
return callback.call(null,sindicato_ufm.components.index.index_controller.index_view.call(null,"Opini\u00F3n",categories,articles));
}
}));
}
}));
});
sindicato_ufm.components.index.index_controller.article = (function sindicato_ufm$components$index$index_controller$article(pgclient,article,callback){
return sindicato_ufm.services.articles.get_row.call(null,pgclient,sindicato_ufm.utils.sql.link_to_str.call(null,article),(function (articles,err){
if(cljs.core.truth_(err)){
throw err;
} else {
return sindicato_ufm.services.categories.get_all.call(null,pgclient,(100),(0),(function (categories,err__$1){
if(cljs.core.truth_(err__$1)){
throw err__$1;
} else {
return callback.call(null,sindicato_ufm.components.index.index_controller.index_view.call(null,"Opini\u00F3n",categories,articles));
}
}));
}
}));
});

//# sourceMappingURL=index_controller.js.map
