import {CommunicationWorld,PATCHES} from "./engine.mjs";
const $=id=>document.getElementById(id);
let lab,paused=false,accumulator=0,lastFrame=0,frames=0;
const order=[1,3,0,2],percent=x=>(x*100).toFixed(x>=.999?0:1)+"%";
const text=(id,s)=>$(id).textContent=String(s);
function color(v){
 const t=Math.max(0,Math.min(1,(v+.2)/3));
 return "rgba("+Math.round(68+123*t)+","+Math.round(78+142*t)+","+Math.round(61+99*t)+","+(.26+.64*t)+")";
}
function spots(id,selected=null,actual=null){
 const host=$(id);host.replaceChildren();
 for(const i of order){
  const div=document.createElement("div");div.className="patch";
  if(i===selected)div.classList.add("real");
  if(id==="actedPatches"&&i===actual)div.classList.add(i===selected?"guess":"wrong");
  const label=document.createElement("b");label.textContent=PATCHES[i];div.append(label);host.append(div);
 }
}
function matrix(id,organism){
 const host=$(id);host.replaceChildren();
 for(let slot=0;slot<organism.wood.length;slot++){
  const part=document.createElement("div");part.className="heat";
  const name=document.createElement("small");
  name.textContent=organism.protocol==="compositional"?(slot===0?"Slot A · vertical":"Slot B · horizontal"):"One 4-symbol code";
  part.append(name);
  const grid=document.createElement("div");grid.className="heatrow";
  if(organism.protocol==="holistic")grid.classList.add("four");
  organism.wood[slot].forEach((row,r)=>{
   row.forEach((weight,c)=>{
    const value=weight+organism.fast[slot][r][c];
    const bar=document.createElement("div");bar.className="weight";
    bar.style.background=color(value);bar.title="Conductance + fast state = "+value.toFixed(2);
    grid.append(bar);
   });
  });
  part.append(grid);host.append(part);
 }
}
function symbol(code){
 if(code===null||code===undefined)return "—";
 return lab.protocol==="compositional"?
  ["○","●"][code&1]+" "+["△","▲"][(code>>1)&1]:
  ["✦","◈","◆","✶"][code];
}
function showEncounter(e){
 if(!e){
  spots("seenPatches");spots("actedPatches");
  text("eventText","No event yet");text("actText","Waiting for a message");text("message","—");return;
 }
 spots("seenPatches",e.e);spots("actedPatches",e.e,e.action);
 text("eventText","Observer sees: "+PATCHES[e.e]);
 text("actText",e.correct?"Contact. +"+e.gained.toFixed(1)+" sugar":"Missed. "+e.gained.toFixed(1)+" sugar found");
 $("actText").classList.toggle("negative",!e.correct);
 text("message",symbol(e.message));
}
function chart(){
 const c=$("trace"),g=c.getContext("2d"),w=c.width,h=c.height;
 g.fillStyle="#0b1b16";g.fillRect(0,0,w,h);
 for(let y=20;y<h;y+=21){
  g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.strokeStyle="#31554344";g.lineWidth=1;g.stroke();
 }
 const d=lab.events;if(d.length<2)return;
 for(const [key,scale,col] of [["accuracy",1,"#9be0af"],["harvest",8,"#e9c38a"]]){
  g.beginPath();g.lineWidth=2;g.strokeStyle=col;
  d.forEach((p,i)=>{
   const x=3+i/(d.length-1)*(w-6),y=h-5-(p[key]/scale)*(h-12);
   if(i===0)g.moveTo(x,y);else g.lineTo(x,y);
  });g.stroke();
 }
}
function scores(){
 text("trialMetric",lab.t.toLocaleString("en"));
 text("harvestMetric",lab.count?(lab.total/lab.count).toFixed(2):"0.00");
 text("senderBudget",lab.sender.resources.toFixed(1));
 text("receiverBudget",lab.receiver.resources.toFixed(1));
 text("stepCount","ROUND "+String(lab.t).padStart(4,"0")+" · SEED "+lab.seed);
 const seen=lab.evaluate({events:lab.trainEvents,count:300});
 const fourth=lab.evaluate({events:[3],count:100});
 const silence=lab.evaluate({events:[0,1,2,3],condition:"silence",count:400});
 const shuffled=lab.evaluate({events:[0,1,2,3],condition:"shuffled",count:400});
 text("seenScore",percent(seen.accuracy));text("heldScore",percent(fourth.accuracy));
 text("muteScore",percent(silence.accuracy));text("shuffleScore",percent(shuffled.accuracy));
 matrix("senderWeights",lab.sender);matrix("receiverWeights",lab.receiver);
 chart();
}
function reset(){
 const seed=Number($("seed").value)||1105,protocol=$("protocol").value;
 const trainEvents=$("holdout").checked?[0,1,2]:[0,1,2,3];
 lab=new CommunicationWorld(seed,protocol,{trainEvents});
 accumulator=0;paused=false;
 text("runningStatus","LEARNING");$("liveDot").classList.remove("off");text("pause","Pause");
 text("protocolCaption",protocol==="compositional"?"2 SIGNAL SLOTS":"1 SIGNAL SLOT");
 text("third","No third learner yet. Train A and B, then introduce a fresh receiver. A remains frozen during teaching.");
 showEncounter(null);scores();
}
function tick(n=1){
 for(let i=0;i<n;i++)lab.one();
 showEncounter(lab.last);scores();
}
$("pause").addEventListener("click",()=>{
 paused=!paused;$("liveDot").classList.toggle("off",paused);
 text("pause",paused?"Resume":"Pause");text("runningStatus",paused?"PAUSED":"LEARNING");
});
$("stepOne").addEventListener("click",()=>{
 paused=true;$("liveDot").classList.add("off");
 text("runningStatus","PAUSED");text("pause","Resume");tick(1);
});
$("train1000").addEventListener("click",()=>tick(1000));
$("newPupil").addEventListener("click",()=>{
 // The sender is frozen, and the original receiver is untouched.
 const t=lab.transfer({rounds:800,seed:lab.seed+707});
 const before=percent(t.initial.accuracy);
 const after=percent(lab.evaluate({sender:lab.sender,receiver:t.pupil,events:lab.trainEvents,count:300}).accuracy);
 const all=percent(t.score.accuracy);
 $("third").replaceChildren();
 const p=document.createElement("div");p.textContent=
  "Fresh C: "+before+" → "+after+" on trained events. Across all four: "+all+".";
 const s=document.createElement("small");
 s.textContent="A was frozen. B was untouched. Only C learned from its own resource receipts.";
 $("third").append(p,s);
});
$("reset").addEventListener("click",reset);
$("protocol").addEventListener("change",reset);
$("holdout").addEventListener("change",reset);
$("seed").addEventListener("change",reset);
$("rate").addEventListener("input",()=>text("rateValue",$("rate").value+"×"));
document.addEventListener("keydown",e=>{
 if(["INPUT","SELECT"].includes(document.activeElement?.tagName))return;
 if(e.code==="Space"){e.preventDefault();$("pause").click();}
});
function frame(now){
 const dt=Math.min(.08,Math.max(0,(now-lastFrame)/1000||0));lastFrame=now;
 if(!paused){
  accumulator+=dt*30*Number($("rate").value);
  const steps=Math.min(100,Math.floor(accumulator));
  accumulator=Math.min(500,accumulator-steps);
  if(steps){for(let i=0;i<steps;i++)lab.one();showEncounter(lab.last);}
 }
 if(++frames%6===0)scores();
 requestAnimationFrame(frame);
}
reset();requestAnimationFrame(frame);
