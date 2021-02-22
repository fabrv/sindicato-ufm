// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.core');
goog.require('cljs.core');
goog.require('sindicato_ufm.components.index.index_routes');
goog.require('sindicato_ufm.components.about.about_routes');
goog.require('sindicato_ufm.utils.sql');
goog.require('sindicato_ufm.config');
sindicato_ufm.core.express = require("express");
sindicato_ufm.core.logger = require("morgan");
sindicato_ufm.core.path = require("path");
sindicato_ufm.core.pg = require("pg");
sindicato_ufm.core.client = (new sindicato_ufm.core.pg.Client(cljs.core.clj__GT_js.call(null,sindicato_ufm.config.db)));
sindicato_ufm.core.exphbs = require("express-handlebars");
sindicato_ufm.core.app = sindicato_ufm.core.express.call(null);
sindicato_ufm.core.port = (function sindicato_ufm$core$port(){
if(cljs.core.truth_(process.env.PORT)){
return process.env.PORT;
} else {
return (3000);
}
});
sindicato_ufm.core.hbs_config = new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"extname","extname",-310936189),".hbs",new cljs.core.Keyword(null,"defaultLayout","defaultLayout",-1609213847),"layout",new cljs.core.Keyword(null,"helpers","helpers",385052827),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"toLink","toLink",1684622200),sindicato_ufm.utils.sql.str_to_link,new cljs.core.Keyword(null,"mdToHTML","mdToHTML",952912784),sindicato_ufm.utils.sql.markdown_to_html], null)], null);
sindicato_ufm.core.hbs = sindicato_ufm.core.exphbs.create(cljs.core.clj__GT_js.call(null,sindicato_ufm.core.hbs_config));
sindicato_ufm.core.start = (function sindicato_ufm$core$start(){
sindicato_ufm.core.client.connect().then((function (_){
return console.log("Connected to database");
})).catch((function (e){
return console.log(e);
}));

return sindicato_ufm.core.app.engine(".hbs",sindicato_ufm.core.hbs.engine).set("view engine",".hbs").use(sindicato_ufm.core.logger.call(null,"dev")).use(sindicato_ufm.core.express.static("public")).use("/nosotros",sindicato_ufm.components.about.about_routes.about_routes.call(null,sindicato_ufm.core.client)).use("/",sindicato_ufm.components.index.index_routes.index_routes(sindicato_ufm.core.client)).listen(sindicato_ufm.core.port.call(null),cljs.core.PersistentVector.EMPTY,cljs.core.println.call(null,["Running at http://localhost:",cljs.core.str.cljs$core$IFn$_invoke$arity$1(sindicato_ufm.core.port.call(null))].join('')));
});
(cljs.core._STAR_main_cli_fn_STAR_ = sindicato_ufm.core.start);

//# sourceMappingURL=core.js.map
