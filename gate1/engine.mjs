/** Gate 1: two independent resource-maintained matrices communicating about a hidden 2x2 world.
 * Agents learn from economic receipts, not named labels or global backpropagation.
 * The two-slot decomposition of the world is SUPPLIED, not spontaneously discovered.
 */
export class RNG {
 constructor(seed=1105){this.s=Number(seed)>>>0}
 next(){let t=this.s+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}
 int(n){return Math.floor(this.next()*n)}
}
export const PATCHES=["lower left","upper left","lower right","upper right"];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function softmaxChoice(weights,rng,temp){
 const max=Math.max(...weights),exp=weights.map(v=>Math.exp((v-max)/temp));
 let z=exp.reduce((a,b)=>a+b,0)*rng.next();
 for(let i=0;i<weights.length;i++){z-=exp[i];if(z<=0)return i}
 return weights.length-1;
}
function maxChoice(weights){return weights.indexOf(Math.max(...weights))}
function makeMatrix(rows,cols,rng){
 return Array.from({length:rows},()=>Array.from({length:cols},()=>.52+(rng.next()-.5)*.13));
}
export class Organism {
 constructor(kind,seed=1,protocol="compositional"){
  this.kind=kind;this.protocol=protocol;this.rng=new RNG(seed);
  this.resources=45;this.capacity=100;this.paid=0;this.received=0;this.sends=0;this.rewired=0;this.age=0;
  // Own matrices: observation->symbol for A, symbol->action for B.
  // The 2-slot protocol exposes the 2 dimensions of the toy world by design.
  if(protocol==="compositional"){
   this.wood=Array.from({length:2},()=>makeMatrix(2,2,this.rng));
  }else{
   this.wood=[makeMatrix(4,4,this.rng)];
  }
  this.fast=this.wood.map(rows=>rows.map(row=>row.map(()=>0)));
 }
 choose(input,temp=.23,greedy=false){
  const output=[];
  for(let i=0;i<this.wood.length;i++){
   const idx=this.protocol==="compositional"?((input>>i)&1):input;
   const weights=this.wood[i][idx].map((v,j)=>v+this.fast[i][idx][j]);
   output.push(greedy?maxChoice(weights):softmaxChoice(weights,this.rng,temp));
  }
  return this.protocol==="compositional"?output[0]|(output[1]<<1):output[0];
 }
 learn(input,chosen,receipt,learning=.045){
  // Reinforcement of activated associations from a local economic receipt;
  // no supervised target symbol and no cross-network gradient.
  const amount=clamp((receipt-2.45)/4,-.53,1.3);
  for(let i=0;i<this.wood.length;i++){
   const row=this.protocol==="compositional"?((input>>i)&1):input;
   const col=this.protocol==="compositional"?((chosen>>i)&1):chosen;
   this.fast[i][row][col]=clamp(this.fast[i][row][col]+learning*amount,-1.8,1.8);
  }
 }
 maintain(){
  this.age++;let upkeep=0;
  for(let i=0;i<this.wood.length;i++)
   for(let j=0;j<this.wood[i].length;j++)
    for(let k=0;k<this.wood[i][j].length;k++){
     let w=this.wood[i][j][k],f=this.fast[i][j][k];
     w=clamp(w+.0045*Math.tanh(f)-.00017*w,.02,2.7);
     this.wood[i][j][k]=w;
     this.fast[i][j][k]*=.995;
     upkeep+=w*.003;
    }
  this.resources=clamp(this.resources-.038-upkeep,0,this.capacity);
  this.paid+=.038+upkeep;
 }
 snapshot(){
  return {kind:this.kind,resources:this.resources,
   wood:this.wood.map(rows=>rows.map(row=>row.slice())),
   fast:this.fast.map(rows=>rows.map(row=>row.slice()))};
 }
}
export class CommunicationWorld {
 constructor(seed=1105,protocol="compositional",opts={}){
  this.seed=seed;this.rng=new RNG(seed);this.protocol=protocol;
  this.sender=new Organism("sender",seed+101,protocol);
  this.receiver=new Organism("receiver",seed+503,protocol);
  this.t=0;this.events=[];this.score=0;this.total=0;this.count=0;
  this.last=null;this.trainEvents=opts.trainEvents||[0,1,2];
 }
 one({event=null,condition="paired",learn=true,sender=null,receiver=null}={}){
  sender=sender||this.sender;receiver=receiver||this.receiver;
  const e=event===null?this.trainEvents[this.rng.int(this.trainEvents.length)]:event;
  let message=sender.choose(e);
  if(condition==="shuffled")message=sender.choose(this.rng.int(4));
  const action=condition==="silence"?this.rng.int(4):receiver.choose(message);
  const correct=action===e;
  const oneBit=Number((action&1)===(e&1))+Number(((action>>1)&1)===((e>>1)&1));
  const gained=correct?8:oneBit===1?1.5:0;
  // Resources are harvested at the visited patch, not granted for a named class.
  const price=condition==="silence"?0:.38;
  const dividend=gained*.25;
  receiver.resources=clamp(receiver.resources+gained-dividend-price,0,receiver.capacity);
  sender.resources=clamp(sender.resources+dividend,0,sender.capacity);
  if(learn){
   const receipt=gained-price;
   if(condition==="paired"){sender.learn(e,message,receipt);receiver.learn(message,action,receipt)}
   sender.maintain();receiver.maintain();this.t++;this.count++;
   this.total+=gained;this.score+=correct?1:0;
   if(this.t%100===0)this.events.push({
    t:this.t,accuracy:this.score/this.count,harvest:this.total/this.count,
    senderE:sender.resources,receiverE:receiver.resources
   });
   this.last={e,message,action,gained,correct,condition};
  }
  return {event:e,message,action,gained,correct};
 }
 train(n){for(let i=0;i<n;i++)this.one();return this}
 evaluate({count=320,events=[0,1,2,3],condition="paired",seed=987,greedy=true,sender=this.sender,receiver=this.receiver}={}){
  // Pure evaluation: do not learn or advance either trained agent's random state.
  const rng=new RNG(seed);
  let correct=0,harvest=0;
  const perEvent=[{n:0,c:0},{n:0,c:0},{n:0,c:0},{n:0,c:0}];
  for(let i=0;i<count;i++){
   const e=events[i%events.length];
   const src=condition==="shuffled"?rng.int(4):e;
   const msg=sender.choose(src,.23,greedy);
   const action=condition==="silence"?rng.int(4):receiver.choose(msg,.23,greedy);
   const hits=action===e;
   const oneBit=Number((action&1)===(e&1))+Number(((action>>1)&1)===((e>>1)&1));
   const reward=hits?8:oneBit===1?1.5:0;
   correct+=hits?1:0;harvest+=reward;perEvent[e].n++;perEvent[e].c+=hits?1:0;
  }
  return {accuracy:correct/count,harvest:harvest/count,
   byEvent:perEvent.map(x=>x.n?x.c/x.n:null)};
 }
 transfer({rounds=2500,seed=this.seed+707}={}){
  const pupil=new Organism("receiver",seed,this.protocol),rng=new RNG(seed+100);
  const initial=this.evaluate({events:this.trainEvents,sender:this.sender,receiver:pupil});
  const log=[];
  for(let i=0;i<rounds;i++){
   const e=this.trainEvents[rng.int(this.trainEvents.length)];
   const msg=this.sender.choose(e,.23,true); // A remains frozen throughout
   const action=pupil.choose(msg,.27);
   const oneBit=Number((action&1)===(e&1))+Number(((action>>1)&1)===((e>>1)&1));
   const gained=action===e?8:oneBit===1?1.5:0;
   pupil.resources=clamp(pupil.resources+gained*.75-.38,0,pupil.capacity);
   pupil.learn(msg,action,gained-.38);pupil.maintain();
   if(i%250===249)log.push({t:i+1,
    accuracy:this.evaluate({count:160,events:this.trainEvents,sender:this.sender,receiver:pupil}).accuracy});
  }
  return {pupil,initial,log,
   score:this.evaluate({count:320,events:[0,1,2,3],sender:this.sender,receiver:pupil})};
 }
}
