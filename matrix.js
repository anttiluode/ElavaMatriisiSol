// Elävä Matriisi — deterministic, dependency-free adaptive resource graph.
// Model abstraction inspired by plant exploration and adaptive flux networks.
// No backpropagation, global optimizer, or biological fidelity claimed.
export class LivingMatrix {
  constructor(seed=1105,patience=180,mode="living"){
    this.seed=Number(seed)||1105; this.patience=patience; this.mode=mode;
    this.s=0;this.randState=(this.seed|0)>>>0;
    this.nodes=[];this.edges=[];this.shoots=[];this.log=[];this.history=[];
    this.stats={harvest:0,burned:0,transport:0,issued:0,recovered:0,success:0,failed:0,cut:0,created:0};
    this.sources=[{x:180,y:158,power:0.9,name:"Morning"},{x:740,y:170,power:0.95,name:"Afternoon"},{x:490,y:258,power:0.58,name:"High light"}];
    this.root=this.node(465,512,60,-1);
    for(const a of [-2.38,-1.58,-0.72])this.sprout(this.root,a,"first growth");
    this.note("Three exploratory tips receive their first loan.");
  }
  rand(){let a=this.randState+=0x6D2B79F5;a=Math.imul(a^(a>>>15),a|1);a^=a+Math.imul(a^(a>>>7),a|61);return ((a^(a>>>14))>>>0)/4294967296;}
  clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  node(x,y,energy,parent){let n={id:this.nodes.length,x,y,E:energy,parent,alive:true,born:this.s,producing:0,flux:0,lastFlow:0,root:parent===-1};this.nodes.push(n);return n;}
  note(s){this.log.unshift({t:this.s,msg:s});if(this.log.length>16)this.log.length=16;}
  sprout(n,angle,why){if(!n||!n.alive||this.shoots.filter(s=>s.alive).length>=14)return null;let t={id:this.shoots.length,node:n,origin:n,angle,age:0,spent:0,active:true,alive:true,paid:false,path:[],why,foundAt:-1};this.shoots.push(t);return t;}
  total(){return this.nodes.reduce((sum,n)=>sum+(n.alive?n.E:0),0);}
  activeNodes(){return this.nodes.filter(n=>n.alive);}
  liveEdges(){return this.edges.filter(e=>e.alive);}
  nearestSource(x,y){let nearest=-1,dist=Infinity;this.sources.forEach((a,i)=>{let d=Math.hypot(x-a.x,y-a.y);if(d<dist){dist=d;nearest=i;}});return {i:nearest,d:dist};}
  lightAt(x,y){let v=0;for(const s of this.sources){const d=Math.hypot(x-s.x,y-s.y);v+=s.power*Math.exp(-d*d/(2*205*205));}return v;}
  steer(t){
    const p=t.node;
    let dx=Math.cos(t.angle)*0.73,dy=Math.sin(t.angle)*0.73-0.13;
    for(const source of this.sources){
      const vx=source.x-p.x,vy=source.y-p.y,d=Math.hypot(vx,vy)+.01;
      const amp=source.power*Math.exp(-d*d/(2*260*260))*0.66;
      dx+=amp*vx/d;dy+=amp*vy/d;
    }
    const wiggle=(this.rand()-.5)*0.56;
    const co=Math.cos(wiggle),si=Math.sin(wiggle);const x=dx*co-dy*si,y=dx*si+dy*co;
    const clx=p.x<58?.6:p.x>880?-.6:0,cly=p.y<53?.6:p.y>570?-.6:0;
    return Math.atan2(y+cly,x+clx);
  }
  grow(t){
    if(!t.alive||!t.active)return;
    t.age+=4;
    const from=t.node;
    if(!from.alive){t.alive=false;return;}
    const maxAge=this.mode==="no-budget"?650:this.patience;
    if(t.age>maxAge){this.fail(t,"loan expired");return;}
    if(this.nodes.length>840){this.fail(t,"space exhausted");return;}
    const cost=this.mode==="no-budget"?0:0.42;
    if(from.E<cost+0.19 && this.mode!=="no-budget")return;
    const angle=this.steer(t);t.angle=angle;
    const step=19;
    const x=this.clamp(from.x+Math.cos(angle)*step,35,895),y=this.clamp(from.y+Math.sin(angle)*step,35,594);
    if(Math.hypot(x-from.x,y-from.y)<6){this.fail(t,"no room to grow");return;}
    if(this.mode!=="no-budget"){from.E-=cost;t.spent+=cost;this.stats.issued+=cost;}
    const n=this.node(x,y,this.mode==="no-budget"?0.45:0.19,from.id);
    if(this.mode!=="no-budget"){from.E-=0.19;}
    const e={id:this.edges.length,a:from.id,b:n.id,D:0.58,flux:0,alive:true,born:this.s,quiet:0,shoot:t.id};
    this.edges.push(e);t.path.push(e.id);t.node=n;this.stats.created++;
    if(this.mode==="no-budget")from.E=Math.max(.5,from.E);
    const light=this.nearestSource(n.x,n.y);
    const home=this.nearestSource(t.origin.x,t.origin.y);
    if(light.d<78 && this.sources[light.i].power>.15 && (t.origin.root||light.i!==home.i||home.d>114)){
      t.paid=true;t.active=false;t.foundAt=light.i;this.stats.success++;
      this.note("A searching branch reached "+this.sources[light.i].name.toLowerCase()+"; the loan can now be serviced by local income.");
    }
  }
  fail(t,why){
    if(!t.alive)return;
    t.alive=false;t.active=false;this.stats.failed++;
    // Wound back to the first edge of this exploratory branch. Any
    // downstream shoots lose their physical connection to the body.
    const descendants=new Set();
    if(t.path.length)descendants.add(this.edges[t.path[0]].b);
    let changed=true;
    while(changed){
      changed=false;
      for(const e of this.edges){
        if(e.alive&&descendants.has(e.a)&&!descendants.has(e.b)){
          descendants.add(e.b);changed=true;
        }
      }
    }
    for(const e of this.edges){
      if(e.alive&&(descendants.has(e.a)||descendants.has(e.b)))e.alive=false;
    }
    let refund=0;
    for(const id of descendants){
      const n=this.nodes[id];if(n&&n.alive){
        refund+=Math.max(0,n.E);n.E=0;n.alive=false;
      }
    }
    for(const other of this.shoots){
      if(other!==t&&other.alive&&descendants.has(other.node.id)){
        other.alive=false;other.active=false;
      }
    }
    if(t.origin.alive&&this.mode!=="no-budget"){
      const amount=refund*.58;t.origin.E+=amount;this.stats.recovered+=amount;
    }
    this.note("A direction withered ("+why+"). "+descendants.size+" segments returned to the body.");
  }
  cut(edgeId){
    const edge=this.edges[edgeId];if(!edge||!edge.alive)return false;
    const children=new Set([edge.b]);let changed=true;
    while(changed){changed=false;for(const e of this.edges){if(e.alive&&children.has(e.a)&&!children.has(e.b)){children.add(e.b);changed=true;}}}
    for(const e of this.edges)if(e.alive&&(e.id===edgeId||children.has(e.a)||children.has(e.b))){e.alive=false;}
    for(const id of children){const n=this.nodes[id];if(n)n.alive=false;}
    for(const t of this.shoots)if(t.alive&&(children.has(t.node.id)||t.path.some(id=>!this.edges[id].alive))){t.active=false;t.alive=false;}
    this.stats.cut++;this.note("A branch was severed. "+children.size+" descendants lost their supply path.");
    return true;
  }
  harvest(){
    for(const n of this.nodes)if(n.alive){n.producing=0;n.flux=0;}
    this.nodes[this.root.id].E+=0.035;this.stats.harvest+=0.035;
    for(const source of this.sources){
      if(source.power<=0)continue;
      let cand=[],sum=0;
      for(const n of this.nodes){
        if(!n.alive)continue;const d=Math.hypot(n.x-source.x,n.y-source.y);
        if(d>=108)continue;const w=(1-d/108)**1.7;
        if(w>0){cand.push([n,w]);sum+=w;}
      }
      if(sum)for(const [n,w] of cand){const income=source.power*w/sum;n.E+=income;n.producing+=income;this.stats.harvest+=income;}
    }
  }
  transport(){
    // First plan every transfer; then scale simultaneous outgoing flux
    // to prevent any node spending more energy than it actually holds.
    const delta=new Float64Array(this.nodes.length);
    const outgoing=new Float64Array(this.nodes.length);
    const planned=[];
    for(const e of this.edges){
      if(!e.alive)continue;
      const a=this.nodes[e.a],b=this.nodes[e.b];
      if(!a.alive||!b.alive){e.alive=false;continue;}
      const q=this.clamp(e.D*0.17*(a.E-b.E),-1.35,1.35);
      planned.push([e,q]);
      if(q>0)outgoing[e.a]+=q;
      else outgoing[e.b]-=q;
    }
    const scale=new Float64Array(this.nodes.length);
    for(const n of this.nodes){
      scale[n.id]=!n.alive||outgoing[n.id]<=0?1:
        Math.min(1,Math.max(0,n.E-.02)/outgoing[n.id]);
    }
    for(const [e,unscaled] of planned){
      const q=unscaled*(unscaled>=0?scale[e.a]:scale[e.b]);
      e.flux=q;delta[e.a]-=q;delta[e.b]+=q;
      const a=this.nodes[e.a],b=this.nodes[e.b];
      a.flux+=Math.abs(q);b.flux+=Math.abs(q);
      this.stats.transport+=Math.abs(q);
      if(this.mode!=="no-canal"){
        e.D=this.clamp(e.D+0.018*Math.sqrt(Math.abs(q))-0.003*e.D,0.03,2.6);
      }
      e.quiet=Math.abs(q)<.008?e.quiet+1:Math.max(0,e.quiet-3);
    }
    for(const n of this.nodes)if(n.alive)n.E=Math.max(0,n.E+delta[n.id]);
  }
  upkeep(){
    for(const n of this.nodes){
      if(!n.alive)continue;
      const c=n.root?0.006:0.009;
      const paid=Math.min(n.E,c);n.E-=paid;this.stats.burned+=paid;
    }
  }
  retire(){
    if(this.mode==="no-budget")return;
    for(const t of this.shoots){
      if(!t.alive||t.active||!t.paid)continue;
      const path=t.path.map(id=>this.edges[id]).filter(e=>e&&e.alive);
      if(!path.length){t.alive=false;continue;}
      // An established path isn't immediately destroyed by a lost light;
      // actual starvation or long-term absent transport must erode it.
      const noSupply=path.every(e=>e.quiet>220&&e.D<0.31);
      if(noSupply){this.fail(t,"unused path");}
    }
  }
  branch(){
    if(this.nodes.length>760||this.shoots.filter(t=>t.active&&t.alive).length>8)return;
    const candidates=this.nodes.filter(n=>n.alive && this.s-n.born>35 && n.E>1.7 && (n.flux>.02||n.producing>.025));
    if(!candidates.length)return;
    const n=candidates[Math.floor(this.rand()*candidates.length)];
    if(this.rand()>.52)return;
    const p=n.parent<0?null:this.nodes[n.parent];
    const a=p?Math.atan2(n.y-p.y,n.x-p.x):(-Math.PI/2);
    this.sprout(n,a+(this.rand()<.5?-1:1)*(0.65+this.rand()*1.1),"side shoot");
  }
  tick(){
    this.s++;
    this.harvest();
    this.transport();
    this.upkeep();
    if(this.s%4===0)for(const t of this.shoots.slice())this.grow(t);
    if(this.s%38===0)this.branch();
    if(this.s%26===0)this.retire();
    if(this.s%10===0)this.history.push({t:this.s,E:this.total(),nodes:this.activeNodes().length,success:this.stats.success,failed:this.stats.failed});
    if(this.history.length>450)this.history.shift();
  }
  summary(){return {tick:this.s,energy:this.total(),branches:this.liveEdges().length,active:this.shoots.filter(t=>t.active&&t.alive).length,success:this.stats.success,withered:this.stats.failed,recovered:this.stats.recovered,harvest:this.stats.harvest,conductance:this.liveEdges().reduce((s,e)=>s+e.D,0)/(this.liveEdges().length||1)};}
}
