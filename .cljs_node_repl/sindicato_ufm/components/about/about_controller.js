// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.components.about.about_controller');
goog.require('cljs.core');
goog.require('sindicato_ufm.services.categories');
sindicato_ufm.components.about.about_controller.about_view = (function sindicato_ufm$components$about$about_controller$about_view(title,links){
return cljs.core.clj__GT_js.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"title","title",636505583),title,new cljs.core.Keyword(null,"links","links",-654507394),links], null));
});
sindicato_ufm.components.about.about_controller.about = (function sindicato_ufm$components$about$about_controller$about(pgclient,callback){
return sindicato_ufm.services.categories.get_all.call(null,pgclient,(100),(0),(function (categories,err){
if(cljs.core.truth_(err)){
throw err;
} else {
return callback.call(null,sindicato_ufm.components.about.about_controller.about_view.call(null,"Sobre nosotros",categories));
}
}));
});

//# sourceMappingURL=about_controller.js.map
