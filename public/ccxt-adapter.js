/* Browser-side CCXT public market adapter; private methods intentionally excluded. */
(function(root){'use strict';
const exchanges=['binance','bitget','bybit','okx','kraken','coinbase'];
function normalizeSymbol(s){return String(s||'BTC/USDT').replace(/-/g,'/').toUpperCase()}
class PublicCCXT{
 constructor(){this.lib=null;this.instances={};this.status={};}
 init(lib=root.ccxt){this.lib=lib||null;return!!this.lib}
 async exchange(name){if(!exchanges.includes(name))throw Error('Exchange is not in the allowlist');if(!this.lib)throw Error('CCXT browser bundle unavailable');const C=this.lib[name];if(!C)throw Error('CCXT exchange class missing: '+name);if(!this.instances[name])this.instances[name]=new C({enableRateLimit:true,timeout:12000});return this.instances[name]}
 async markets(name){const x=await this.exchange(name),m=await x.loadMarkets();return Object.values(m).filter(v=>v.active!==false).map(v=>({symbol:v.symbol,id:v.id,base:v.base,quote:v.quote,type:v.type,spot:v.spot,swap:v.swap,future:v.future,active:v.active})).slice(0,2000)}
 async ticker(name,symbol){return(await this.exchange(name)).fetchTicker(normalizeSymbol(symbol))}
 async candles(name,symbol,timeframe='1h',limit=200){return(await this.exchange(name)).fetchOHLCV(normalizeSymbol(symbol),timeframe,undefined,limit)}
 async book(name,symbol,limit=25){return(await this.exchange(name)).fetchOrderBook(normalizeSymbol(symbol),limit)}
 async trades(name,symbol,limit=100){return(await this.exchange(name)).fetchTrades(normalizeSymbol(symbol),undefined,limit)}
 async test(name){const t=Date.now();try{const x=await this.exchange(name);await x.loadMarkets();this.status[name]={ok:true,latency:Date.now()-t,checkedAt:Date.now(),error:null};return this.status[name]}catch(e){this.status[name]={ok:false,latency:Date.now()-t,checkedAt:Date.now(),error:String(e.message||e).slice(0,180)};return this.status[name]}}
}
root.JPTICCXT=new PublicCCXT();
})(window);
