// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('sindicato_ufm.utils.sql');
goog.require('cljs.core');
goog.require('clojure.string');
sindicato_ufm.utils.sql.node$module$path = require('path');
sindicato_ufm.utils.sql.showdown = require("showdown");
sindicato_ufm.utils.sql.converter = (new sindicato_ufm.utils.sql.showdown.Converter());
sindicato_ufm.utils.sql.str_to_link = (function sindicato_ufm$utils$sql$str_to_link(str){
return clojure.string.lower_case.call(null,clojure.string.replace.call(null,str,/ /,"-"));
});
sindicato_ufm.utils.sql.link_to_str = (function sindicato_ufm$utils$sql$link_to_str(link){
return clojure.string.replace.call(null,link,/-/," ");
});
sindicato_ufm.utils.sql.markdown_to_html = (function sindicato_ufm$utils$sql$markdown_to_html(md){
return sindicato_ufm.utils.sql.converter.makeHtml(md);
});

//# sourceMappingURL=sql.js.map
