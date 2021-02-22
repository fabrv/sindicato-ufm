// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.components.about.about_routes');
goog.require('cljs.core');
goog.require('sindicato_ufm.components.about.about_controller');
sindicato_ufm.components.about.about_routes.express = require("express");
sindicato_ufm.components.about.about_routes.router = sindicato_ufm.components.about.about_routes.express.Router();
sindicato_ufm.components.about.about_routes.about_routes = (function sindicato_ufm$components$about$about_routes$about_routes(pgclient){
sindicato_ufm.components.about.about_routes.router.get("/",(function (_,res){
return sindicato_ufm.components.about.about_controller.about.call(null,pgclient,(function (data){
return res.render("about",data);
}));
}));

return sindicato_ufm.components.about.about_routes.router;
});

//# sourceMappingURL=about_routes.js.map
