(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.JPTILiquidityEngine=api})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const MAX_EVENTS=500,MAX_LEVELS=100;
const keyOf=p=>Number(p).toPrecision(12);
const finite=n=>Number.isFinite(+n)&&+n>0;
class LiquidityBehaviorEngine{
 constructor(options={}){this.maxEvents=options.maxEvents||MAX_EVENTS;this.levelLimit=options.levelLimit||MAX_LEVELS;this.events=[];this.previous=null;this.lastPrice=null;this.lastCandle=null;this.sequence=0;this.context={exchange:"unknown",symbol:"unknown",market:"unknown"}}
 setContext(context={}){this.context={...this.context,...context};this.previous=null;this.lastPrice=null;this.lastCandle=null;return this}
 emit(type,ts,price,side,qty,confidence,detail,source="snapshot"){
  const event={id:++this.sequence,ts:Number(ts)||Date.now(),type,price:finite(price)?+price:null,side:side||"unknown",qty:finite(qty)?+qty:0,confidence,source,exchange:this.context.exchange,symbol:this.context.symbol,market:this.context.market,detail:String(detail||"")};
  this.events.push(event);if(this.events.length>this.maxEvents)this.events.splice(0,this.events.length-this.maxEvents);return event
 }
 snapshot(book,ts=Date.now()){
  if(!book||!Array.isArray(book.bids)||!Array.isArray(book.asks))return [];
  const clean=(levels,side)=>levels.slice(0,this.levelLimit).map(x=>Array.isArray(x)?{price:+x[0],qty:+x[1]}:{price:+x.price,qty:+x.qty}).filter(x=>finite(x.price)&&finite(x.qty)).map(x=>({...x,side}));
  const current={bids:clean(book.bids,"bid"),asks:clean(book.asks,"ask")},created=[];
  const map=levels=>new Map(levels.map(x=>[keyOf(x.price),x]));
  if(this.previous){
   for(const side of ["bids","asks"]){
    const old=map(this.previous[side]),now=map(current[side]),label=side==="bids"?"bid":"ask";
    for(const [key,level] of now){const before=old.get(key);
     if(!before)created.push(this.emit("liquidity_appeared",ts,level.price,label,level.qty,"observed","New displayed level appeared in sampled snapshot"));
     else{const change=level.qty-before.qty,threshold=Math.max(before.qty*.08,1e-12);
      if(change>threshold)created.push(this.emit("replenishment_estimate",ts,level.price,label,change,"inferred","Displayed quantity increased between snapshots; replenishment is an estimate"));
      else if(change< -threshold)created.push(this.emit("liquidity_reduction_estimate",ts,level.price,label,-change,"inferred","Displayed quantity decreased; trade consumption and cancellation cannot be separated"));
     }
    }
    for(const [key,level] of old)if(!now.has(key))created.push(this.emit("level_disappeared",ts,level.price,label,level.qty,"inferred","Previously displayed level absent from next sampled snapshot; cause unknown"));
   }
  }else created.push(this.emit("baseline_snapshot",ts,null,"unknown",0,"observed","Initial depth baseline; no prior snapshot for comparison"));
  this.previous=current;return created
 }
 trade(trade){
  if(!trade||!finite(trade.price)||!finite(trade.size))return null;
  const ts=+trade.ts||Date.now(),side=trade.side==="buy"||trade.side==="sell"?trade.side:"unknown";
  const e=this.emit("trade_print",ts,+trade.price,side,+trade.size,side==="unknown"?"limited":"observed","Venue trade print; aggressor side supplied by venue when available","trade");
  const book=this.previous;if(book&&side!=="unknown"){
   const opposing=side==="buy"?book.asks:book.bids,level=opposing.find(x=>Math.abs(x.price-trade.price)/trade.price<1e-8);
   if(level&&trade.size>=level.qty*.15)this.emit("level_trade_interaction",ts,level.price,side,trade.size,"inferred","Trade size is material relative to last sampled opposing quote; snapshot is not synchronized tick depth","trade");
  }
  return e
 }
 candle(candle,ts){
  if(!candle||![candle.open,candle.high,candle.low,candle.close].every(finite))return [];
  const time=+candle.time||ts||Date.now(),out=[],prev=this.lastCandle;
  if(prev){
   const range=Math.max(prev.high-prev.low,prev.close*.0001),move=candle.close-prev.close;
   if(Math.abs(move)>range*.75)out.push(this.emit("price_displacement",time,candle.close,move>0?"up":"down",Math.abs(move),"observed","Candle close moved materially relative to prior candle range","candle"));
   if(candle.high>prev.high&&candle.close<prev.high)out.push(this.emit("failed_high_break",time,prev.high,"ask",candle.high-prev.high,"inferred","Price traded above prior high and closed back below it","candle"));
   if(candle.low<prev.low&&candle.close>prev.low)out.push(this.emit("failed_low_break",time,prev.low,"bid",prev.low-candle.low,"inferred","Price traded below prior low and closed back above it","candle"));
  }
  const recent=this.events.filter(e=>e.ts>=time-120000&&e.ts<=time+3000),buys=recent.filter(e=>e.type==="trade_print"&&e.side==="buy").reduce((n,e)=>n+e.qty,0),sells=recent.filter(e=>e.type==="trade_print"&&e.side==="sell").reduce((n,e)=>n+e.qty,0);
  if(buys>0&&candle.close<=candle.open&&buys>=sells*1.5)out.push(this.emit("absorption_candidate",time,candle.close,"ask",buys,"low","Buy-initiated prints coincided with a non-rising candle; candidate only, needs synchronized depth and repeated tests","classifier"));
  if(sells>0&&candle.close>=candle.open&&sells>=buys*1.5)out.push(this.emit("absorption_candidate",time,candle.close,"bid",sells,"low","Sell-initiated prints coincided with a non-falling candle; candidate only, needs synchronized depth and repeated tests","classifier"));
  this.lastCandle={open:+candle.open,high:+candle.high,low:+candle.low,close:+candle.close};return out
 }
 sweep(price,ts=Date.now()){
  if(!finite(price)||!this.previous)return null;
  const levels=[...this.previous.bids,...this.previous.asks],near=levels.filter(x=>Math.abs(x.price-price)/price<.002).sort((a,b)=>Math.abs(a.price-price)-Math.abs(b.price-price))[0];
  if(!near)return null;
  return this.emit("sweep_candidate",ts,near.price,near.side,near.qty,"low","Price approached a recently displayed liquidity level; no tick-level queue depletion proof","heuristic")
 }
 timeline(limit=80){return this.events.slice(-Math.max(1,limit)).reverse()}
 stats(){const counts={};for(const e of this.events)counts[e.type]=(counts[e.type]||0)+1;return{events:this.events.length,counts,lastEvent:this.events.at(-1)||null,baselineReady:!!this.previous}}
 clear(){this.events=[];this.previous=null;this.lastCandle=null;this.sequence=0}
}
return{LiquidityBehaviorEngine,MAX_EVENTS};
});
