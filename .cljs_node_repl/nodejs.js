// Compiled by ClojureScript 1.10.758 {:target :nodejs}
goog.provide('cljs.nodejs');
goog.require('cljs.core');
cljs.nodejs.require = require;
cljs.nodejs.process = process;
cljs.nodejs.enable_util_print_BANG_ = (function cljs$nodejs$enable_util_print_BANG_(){
(cljs.core._STAR_print_newline_STAR_ = false);

cljs.core.set_print_fn_BANG_.call(null,(function() { 
var G__546__delegate = function (args){
return console.log.apply(console,cljs.core.into_array.call(null,args));
};
var G__546 = function (var_args){
var args = null;
if (arguments.length > 0) {
var G__547__i = 0, G__547__a = new Array(arguments.length -  0);
while (G__547__i < G__547__a.length) {G__547__a[G__547__i] = arguments[G__547__i + 0]; ++G__547__i;}
  args = new cljs.core.IndexedSeq(G__547__a,0,null);
} 
return G__546__delegate.call(this,args);};
G__546.cljs$lang$maxFixedArity = 0;
G__546.cljs$lang$applyTo = (function (arglist__548){
var args = cljs.core.seq(arglist__548);
return G__546__delegate(args);
});
G__546.cljs$core$IFn$_invoke$arity$variadic = G__546__delegate;
return G__546;
})()
);

cljs.core.set_print_err_fn_BANG_.call(null,(function() { 
var G__549__delegate = function (args){
return console.error.apply(console,cljs.core.into_array.call(null,args));
};
var G__549 = function (var_args){
var args = null;
if (arguments.length > 0) {
var G__550__i = 0, G__550__a = new Array(arguments.length -  0);
while (G__550__i < G__550__a.length) {G__550__a[G__550__i] = arguments[G__550__i + 0]; ++G__550__i;}
  args = new cljs.core.IndexedSeq(G__550__a,0,null);
} 
return G__549__delegate.call(this,args);};
G__549.cljs$lang$maxFixedArity = 0;
G__549.cljs$lang$applyTo = (function (arglist__551){
var args = cljs.core.seq(arglist__551);
return G__549__delegate(args);
});
G__549.cljs$core$IFn$_invoke$arity$variadic = G__549__delegate;
return G__549;
})()
);

return null;
});

//# sourceMappingURL=nodejs.js.map
