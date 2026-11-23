(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.JPTISessionIntelligence=api})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const DEFAULTS=[
{id:"sydney",name:"Sydney",zone:"Australia/Sydney",open:"08:00",close:"17:00",assets:["AUD","NZD"]},
{id:"tokyo",name:"Tokyo",zone:"Asia/Tokyo",open:"09:00",close:"18:00",assets:["JPY","AUD"]},
{id:"london",name:"London",zone:"Europe/London",open:"08:00",close:"17:00",assets:["GBP","EUR"]},
{id:"new-york",name:"New York",zone:"America/New_York",open:"08:00",close:"17:00",assets:["USD"]}
];
const parts=(date,zone)=>{const p=new Intl.DateTimeFormat("en-CA",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date);return Object.fromEntries(p.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]))};
const minutes=s=>{const [h,m]=String(s||"").split(":").map(Number);return h*60+m};
const validTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(s));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class SessionIntelligenceEngine{
 constructor(options={}){this.sessions=(options.sessions||DEFAULTS).map(x=>({...x}));this.historyLimit=options.historyLimit||1200;this.candles=[];this.ranges={};this.events=[];this.outcomes=[];this.context={symbol:"BTCUSDT",market:"spot",exchange:"unknown"};this.current=null;this.lastTransition=null;this.lastSetupKey="";this.configError=null}
 configure(sessions){if(!Array.isArray(sessions)||!sessions.length)throw Error("At least one session is required");const ids=new Set();for(const s of sessions){if(!s.id||ids.has(s.id)||!s.name||!validTime(s.open)||!validTime(s.close)||!s.zone)throw Error("Invalid session id, name, timezone or HH:MM window");new Intl.DateTimeFormat("en",{timeZone:s.zone});ids.add(s.id)}this.sessions=sessions.map(s=>({...s}));return this.sessions}
 setContext(context={}){this.context={...this.context,...context};this.candles=[];this.ranges={};this.events=[];this.lastSetupKey="";this.current=null;return this}
 sessionAt(date=new Date()){const d=date instanceof Date?date:new Date(date);if(!Number.isFinite(d.getTime()))return null;const found=this.sessions.map(s=>{const p=parts(d,s.zone),minute=+p.hour*60 + +p.minute,start=minutes(s.open),end=minutes(s.close),active=start<end?minute>=start&&minute<end:minute>=start||minute<end;return{...s,active,localDate:p.year+"-"+p.month+"-"+p.day,localTime:p.hour+":"+p.minute,minute,progress:active?clamp((minute-start+(start>end&&minute<end?1440:0))/((end-start+1440)%1440||1440)*100,0,100):0}}).filter(s=>s.active);return found.sort((a,b)=>a.progress-b.progress)[0]||null}
 snapshot(date=new Date()){const active=this.sessionAt(date),all=this.sessions.map(s=>{const p=parts(date,s.zone),minute=+p.hour*60 + +p.minute,start=minutes(s.open),end=minutes(s.close),isActive=start<end?minute>=start&&minute<end:minute>=start||minute<end;return{id:s.id,name:s.name,zone:s.zone,localTime:p.hour+":"+p.minute,active:isActive,open:s.open,close:s.close}});return{active,all,overlap:all.filter(x=>x.active).map(x=>x.name),utc:new Date(date).toISOString()}}
 observeCandle(c,date){if(!c||![c.open,c.high,c.low,c.close].every(x=>Number.isFinite(+x))||+c.high<+c.low)return null;const ts=Number(c.time)>1e12?+c.time:Number(c.time)>0?+c.time*1000:(date?new Date(date).getTime():Date.now()),d=new Date(ts),active=this.sessionAt(d),prev=this.current;const state=active?{id:active.id,name:active.name,localDate:active.localDate,zone:active.zone}:null;
 if((prev?.id||null)!==(state?.id||null)){this.lastTransition={from:prev?.name||"Off-session",to:state?.name||"Off-session",ts};this.events.unshift({type:"session_transition",ts,detail:this.lastTransition.from+" → "+this.lastTransition.to,session:state?.name||"Off-session"});this.lastSetupKey=""}this.current=state;
 this.candles.push({...c,time:ts,session:state?.id||"off-session"});if(this.candles.length>this.historyLimit)this.candles.splice(0,this.candles.length-this.historyLimit);
 if(!active)return{session:null,range:null,setup:null,transition:this.lastTransition};
 const key=active.id+":"+active.localDate;let r=this.ranges[key];if(!r)r=this.ranges[key]={session:active.name,sessionId:active.id,date:active.localDate,zone:active.zone,high:+c.high,low:+c.low,open:+c.open,close:+c.close,bars:0,volume:0,firstTs:ts,lastTs:ts};r.high=Math.max(r.high,+c.high);r.low=Math.min(r.low,+c.low);r.close=+c.close;r.bars++;r.volume+=Math.max(0,+c.volume||0);r.lastTs=ts;
 const setup=this.classify(c,active,r);return{session:active,range:r,setup,transition:this.lastTransition}}
 classify(c,active,range){const prior=this.candles.slice(-25,-1),priorRange=prior.length?{high:Math.max(...prior.map(x=>x.high)),low:Math.min(...prior.map(x=>x.low))}:null;let type="none",direction="neutral",score=0,notes=[];const body=Math.abs(+c.close-+c.open),span=Math.max(1e-12,+c.high-+c.low),closePos=(+c.close-+c.low)/span;const candleTs=Number(c.time)>1e12?+c.time:+c.time*1000,asiaDate=parts(new Date(candleTs),"Asia/Tokyo"),asiaKey=asiaDate.year+"-"+asiaDate.month+"-"+asiaDate.day,asia=this.ranges["tokyo:"+asiaKey];
 if(asia&&(active.id==="london"||active.id==="new-york")&&+c.low<asia.low&&+c.close>asia.low){type="asia-low-sweep-reclaim";direction="bullish";score=65;notes.push("Price swept below the completed Tokyo-session low and closed back above it")}
 else if(asia&&(active.id==="london"||active.id==="new-york")&&+c.high>asia.high&&+c.close<asia.high){type="asia-high-sweep-reclaim";direction="bearish";score=65;notes.push("Price swept above the completed Tokyo-session high and closed back below it")}
 else if(priorRange&&+c.low<priorRange.low&&+c.close>priorRange.low){type="failed-low-reclaim";direction="bullish";score=58;notes.push("Candle swept and reclaimed recent low")}
 else if(priorRange&&+c.high>priorRange.high&&+c.close<priorRange.high){type="failed-high-reclaim";direction="bearish";score=58;notes.push("Candle swept and reclaimed recent high")}
 if(body/span>.65){score+=12;notes.push("Large candle body relative to range")}
 if(direction==="bullish"&&closePos>.7||direction==="bearish"&&closePos<.3){score+=8;notes.push("Close location supports rejection")}
 if(type==="none"&&range.bars>=3&&(+c.close>range.high-span*.05||+c.close<range.low+span*.05)){type="session-range-expansion";direction=+c.close>range.high-span*.05?"bullish":"bearish";score=35;notes.push("Session range expansion candidate")}
 score=clamp(score,0,85);const key=active.id+":"+active.localDate+":"+type+":"+Math.floor(+c.close/span);let setup=type==="none"?null:{type,direction,score,confidence:score<50?"low":score<70?"moderate":"candidate",session:active.name,notes,ts:Number(c.time)>1e12?+c.time:+c.time*1000,validated:false};
 if(setup&&key!==this.lastSetupKey){this.lastSetupKey=key;this.events.unshift({type:"setup_candidate",ts:setup.ts,session:active.name,detail:type+" · "+direction+" · "+score+"/100 (heuristic)"});if(this.events.length>250)this.events.length=250}
 return setup}
 recordOutcome(record){if(!record||!record.sessionId||!["win","loss","breakeven"].includes(record.result))throw Error("Outcome requires sessionId and win/loss/breakeven result");const x={...record,ts:record.ts||Date.now()};this.outcomes.push(x);return x}
 performance(){const out={};for(const s of this.sessions){const a=this.outcomes.filter(x=>x.sessionId===s.id),w=a.filter(x=>x.result==="win").length,l=a.filter(x=>x.result==="loss").length;out[s.id]={name:s.name,trades:a.length,wins:w,losses:l,breakeven:a.length-w-l,winRate:w+l?w/(w+l):null,netR:a.reduce((n,x)=>n+(Number(x.rMultiple)||0),0),sampleQuality:a.length>=30?"usable sample":a.length>=10?"early sample":"insufficient sample"}}return out}
 alphaEvidence(setup){const p=this.performance()[this.current?.id];return{session:this.current?.name||"Off-session",setupType:setup?.type||"none",direction:setup?.direction||"neutral",candidateScore:setup?.score||0,performanceSample:p?.trades||0,empiricalWinRate:p?.winRate??null,netR:p?.netR??0,weightingEligible:!!p&&p.trades>=30,warning:"Session labels and setup scores are heuristic. No empirical weighting until a session has at least 30 recorded outcomes."}}
 getRange(date=new Date()){const s=this.sessionAt(date);if(!s)return null;return this.ranges[s.id+":"+s.localDate]||null}
 getEvents(limit=10){return this.events.slice(0,limit)}
}
return{SessionIntelligenceEngine,DEFAULT_SESSIONS:DEFAULTS,sessionParts:parts};
});
