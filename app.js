import {LivingMatrix} from "./matrix.js";
const el=id=>document.getElementById(id);
const world=el("world"),cx=world.getContext("2d"),trace=el("history"),lc=trace.getContext("2d");
const W=960,H=620;
let m,paused=false,action="inspect",drag=-1,dark=false,original=[],pointer=null,last=0,acc=0,frames=0;
const format=x=>Math.round(x).toLocaleString("en");
function reset(){
  m=new LivingMatrix(Number(el("seed").value)||1105,Number(el("patience").value),el("mode").value);
  paused=false;action="inspect";drag=-1;dark=false;original=m.sources.map(s=>s.power);acc=0;
  el("pause").textContent="Pause";el("cut").classList.remove("active");el("move").classList.remove("active");el("drought").classList.remove("active");
  el("modeLabel").textContent={living:"LIVING / CANALIZED","no-canal":"CHANNELS / FIXED","no-budget":"GROWTH / FREE"}[m.mode];
  el("stageHint").textContent="Cut a branch, or drag a glowing light to change the room";
  update();
}
function update(){
  const s=m.summary();
  el("mEnergy").textContent=format(s.energy);el("mEdges").textContent=format(s.branches);
  el("mLoans").textContent=format(s.active);el("mReturns").textContent=format(s.success);
  el("mWither").textContent=format(s.withered);el("mRecovered").textContent=s.recovered.toFixed(1);
  el("tickLabel").textContent="T = "+String(s.tick).padStart(4,"0")+" · SEED "+m.seed;
  el("statusText").textContent=paused?"SIMULATION PAUSED":"SYSTEM GROWING";
  el("runStatus").classList.toggle("paused",paused);
  el("log").replaceChildren(...m.log.slice(0,6).map(item=>{
    const row=document.createElement("div");row.className="entry";
    const t=document.createElement("time");t.textContent=String(item.t).padStart(4,"0");
    row.append(t,document.createTextNode(item.msg));return row;
  }));
}
function path(a,b,color,width=1){
  cx.strokeStyle=color;cx.lineWidth=width;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();
}
function circle(x,y,r,fill,stroke){
  cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);
  if(fill){cx.fillStyle=fill;cx.fill();}
  if(stroke){cx.strokeStyle=stroke;cx.lineWidth=1.3;cx.stroke();}
}
function render(){
  cx.fillStyle="#0a1b14";cx.fillRect(0,0,W,H);
  for(let x=0;x<=W;x+=40)path({x,y:0},{x,y:H},"#294e3930",.7);
  for(let y=0;y<=H;y+=40)path({x:0,y},{x:W,y},"#294e3930",.7);
  for(const s of m.sources){
    const g=cx.createRadialGradient(s.x,s.y,0,s.x,s.y,145);
    g.addColorStop(0,"rgba(238,188,105,"+(.18*s.power)+")");
    g.addColorStop(.45,"rgba(216,179,109,"+(.055*s.power)+")");
    g.addColorStop(1,"rgba(216,179,109,0)");
    circle(s.x,s.y,145,g);
    cx.setLineDash([4,7]);circle(s.x,s.y,108,null,"rgba(228,195,126,"+(.28*s.power)+")");cx.setLineDash([]);
    circle(s.x,s.y,13,"#eac07722","#eac07799");
    circle(s.x,s.y,7,s.power>.2?"#f1cd88":"#65513b");
    cx.font="11px ui-monospace,monospace";cx.textAlign="center";cx.fillStyle="#e6c99a";
    cx.fillText(s.name.toUpperCase(),s.x,s.y-23);
  }
  const growing=new Set(m.shoots.filter(t=>t.active&&t.alive).flatMap(t=>t.path));
  const highlight=action==="cut"&&pointer?nearEdge(pointer.x,pointer.y):null;
  for(const e of m.edges){
    if(!e.alive)continue;
    const a=m.nodes[e.a],b=m.nodes[e.b];if(!a.alive||!b.alive)continue;
    const weak=e.D<.3&&e.quiet>50;
    const weight=1.1+Math.min(7,e.D*2.5);
    path(a,b,"#092419",weight+3.4);
    path(a,b,weak?"#a2736190":e.D>1.05?"#8cdbb4d9":"#63b48dd2",weight);
    if(growing.has(e.id)){
      cx.setLineDash([2,6]);path(a,b,"#eabd7385",1.4);cx.setLineDash([]);
    }
    if(Math.abs(e.flux)>.04){
      const phase=((m.s*.021*Math.sign(e.flux)+e.id*.37)%1+1)%1;
      circle(a.x+(b.x-a.x)*phase,a.y+(b.y-a.y)*phase,1.6+Math.min(2,Math.abs(e.flux)*2),e.flux>0?"#fff0ae":"#a6eccc");
    }
    if(highlight&&highlight.e.id===e.id&&highlight.dist<25)path(a,b,"#f7a68c",6);
  }
  for(const t of m.shoots){
    if(!t.alive||!t.active||!t.node.alive)continue;
    const p=t.node;
    const fraction=t.age/(m.mode==="no-budget"?650:m.patience);
    circle(p.x,p.y,9+2.5*Math.sin(m.s*.14+t.id),null,fraction>.74?"#ed937c":"#edce89");
    path(p,{x:p.x+Math.cos(t.angle)*18,y:p.y+Math.sin(t.angle)*18},"#f1ca7f",2);
    circle(p.x,p.y,3.5,"#f5d890");
  }
  circle(m.root.x,m.root.y,13,"#102f23","#a3ddb17c");
  circle(m.root.x,m.root.y,6,"#d1ecc3");
  cx.font="11px ui-monospace,monospace";cx.textAlign="center";cx.fillStyle="#b8d0b8";
  cx.fillText("SHARED ROOT",m.root.x,m.root.y+32);
}
function graph(){
  lc.fillStyle="#0b1d15";lc.fillRect(0,0,trace.width,trace.height);
  const a=m.history;if(a.length<2)return;
  for(let y=18;y<90;y+=22)pathChart({x:0,y},{x:300,y},"#355c473d");
  function chart(key,color){
    const max=Math.max(1,...a.map(p=>p[key]));
    lc.beginPath();lc.lineWidth=1.8;lc.strokeStyle=color;
    a.forEach((p,i)=>{const x=3+i/(a.length-1)*294,y=83-p[key]/max*76;i?lc.lineTo(x,y):lc.moveTo(x,y);});
    lc.stroke();
  }
  chart("E","#e8c582");chart("nodes","#7bccaa");
}
function pathChart(a,b,col){lc.strokeStyle=col;lc.beginPath();lc.moveTo(a.x,a.y);lc.lineTo(b.x,b.y);lc.stroke();}
function position(ev){const r=world.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};}
function distEdge(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);}
function nearEdge(x,y){
  let result=null,dist=Infinity;
  for(const e of m.edges){if(!e.alive)continue;const d=distEdge(x,y,m.nodes[e.a],m.nodes[e.b]);if(d<dist){dist=d;result=e;}}
  return result?{e:result,dist}:null;
}
function light(x,y){
  let i=-1,d=Infinity;
  m.sources.forEach((s,k)=>{const h=Math.hypot(x-s.x,y-s.y);if(h<d){d=h;i=k;}});
  return {i,d};
}
function setAction(next){
  action=action===next?"inspect":next;
  el("cut").classList.toggle("active",action==="cut");el("move").classList.toggle("active",action==="move");
  world.style.cursor=action==="move"?"grab":action==="cut"?"crosshair":"default";
  el("stageHint").textContent=action==="cut"?"Click a stem to cut its descendants":
    action==="move"?"Drag a glowing light to somewhere new":"Cut a branch, or drag a glowing light to change the room";
}
world.addEventListener("pointerdown",ev=>{
  pointer=position(ev);
  if(action==="cut"){
    const hit=nearEdge(pointer.x,pointer.y);
    if(hit&&hit.dist<24){m.cut(hit.e.id);setAction("inspect");update();}
    else el("interactionHelp").textContent="Select a visible stem; a cut detaches all its downstream branches.";
    return;
  }
  const near=light(pointer.x,pointer.y);
  if(near.d<42){drag=near.i;world.setPointerCapture(ev.pointerId);}
});
world.addEventListener("pointermove",ev=>{
  pointer=position(ev);
  if(drag>=0){
    m.sources[drag].x=Math.max(30,Math.min(930,pointer.x));
    m.sources[drag].y=Math.max(30,Math.min(590,pointer.y));
  }
});
function release(){if(drag>=0){m.note("Light moved: existing paths must now earn their upkeep elsewhere.");drag=-1;update();}}
world.addEventListener("pointerup",release);
world.addEventListener("pointercancel",release);
world.addEventListener("pointerleave",()=>{if(drag<0)pointer=null;});
el("cut").onclick=()=>setAction("cut");el("move").onclick=()=>setAction("move");
el("pause").onclick=()=>{paused=!paused;el("pause").textContent=paused?"Resume":"Pause";update();};
el("step").onclick=()=>{paused=true;m.tick();el("pause").textContent="Resume";update();graph();render();};
el("reset").onclick=reset;el("mode").onchange=reset;el("seed").onchange=reset;
el("drought").onclick=()=>{
  dark=!dark;m.sources.forEach((s,i)=>s.power=dark?original[i]*.08:original[i]);
  el("drought").classList.toggle("active",dark);
  m.note(dark?"Shade covered the room. Income is now 8% of the old light.":"The light returned.");
  update();
};
el("patience").oninput=()=>{m.patience=Number(el("patience").value);el("patienceValue").textContent=m.patience+" ticks";};
el("speed").oninput=()=>{el("speedValue").textContent=Number(el("speed").value).toFixed(2).replace(/0$/,"")+"×";};
document.addEventListener("keydown",ev=>{
  if(["INPUT","SELECT"].includes(document.activeElement?.tagName))return;
  if(ev.code==="Space"){ev.preventDefault();el("pause").click();}
  if(ev.key.toLowerCase()==="r")reset();
});
function loop(now){
  const dt=Math.min(.08,Math.max(0,(now-last)/1000||0));last=now;
  if(!paused){
    acc+=dt*25*Number(el("speed").value);
    let n=0;while(acc>=1&&n<18){m.tick();acc--;n++;}
    acc=Math.min(acc,25);
  }
  render();
  if(++frames%8===0){update();graph();}
  requestAnimationFrame(loop);
}
reset();requestAnimationFrame(loop);
