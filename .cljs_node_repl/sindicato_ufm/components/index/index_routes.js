// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.components.index.index_routes');
goog.require('cljs.core');
goog.require('sindicato_ufm.components.index.index_controller');
sindicato_ufm.components.index.index_routes.express = require("express");
sindicato_ufm.components.index.index_routes.router = sindicato_ufm.components.index.index_routes.express.Router();
sindicato_ufm.components.index.index_routes.index_routes = (function sindicato_ufm$components$index$index_routes$index_routes(pgclient){
sindicato_ufm.components.index.index_routes.router.get("/",(function (_,res){
return sindicato_ufm.components.index.index_controller.category.call(null,pgclient,"opinion",(0),(function (data){
return res.render("index",data);
}));
}));

sindicato_ufm.components.index.index_routes.router.get("/articulo/:article",(function (req,res){
return sindicato_ufm.components.index.index_controller.article.call(null,pgclient,req.params.article,(function (data){
return res.render("index",data);
}));
}));

sindicato_ufm.components.index.index_routes.router.get("/:category",(function (req,res){
return sindicato_ufm.components.index.index_controller.category.call(null,pgclient,req.params.category,(0),(function (data){
return res.render("index",data);
}));
}));

return sindicato_ufm.components.index.index_routes.router;
});

//# sourceMappingURL=index_routes.js.map
