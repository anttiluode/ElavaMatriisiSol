import {CONCEPTS,TOKENS,experiment,crossing} from './engine.mjs';
const $=id=>document.getElementById(id);
const checkpoints=[0,6,12,24,48,72,96,120,180,240];
const MODE_NAMES={dormant:'Dormant / protected wood',decay:'Unprotected / fades away',scrambled:'Retained wood / wrong relationships',naive:'Fresh association learner',rehearsal:'Active rehearsal (expensive)'};
const pct=n=>(100*n).toFixed(n<.01?1:0)+'%';
let result,idx=0,playing=false,last=0;
function run(){
  playing=false;$('play').textContent='Play return';
  result=experiment({seed:Number($('seed').value)||1105,absence:Number($('absence').value),income:Number($('income').value),relearn:240});
  idx=0;draw();
}
function node(type,txt,cls){const e=document.createElement(type);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e;}
function pathways(){
  const mode=$('mode').value;
  const v=result.curves[mode][idx];
  const host=$('pathlist');host.replaceChildren();
  for(let i=0;i<CONCEPTS.length;i++){
    const row=node('div',undefined,'pathrow'+(i===2?' highlight':''));
    row.append(node('div',CONCEPTS[i],'wordleft'));
    const trackbox=node('div',undefined,'trackbox');
    for(const [label,val,gold] of [['WOOD',v.stored[i][i],false],['ACCESS',v.gates[i][i],true]]){
      const track=node('div',undefined,'track');track.append(node('span',label,'trackLabel'));
      const bar=node('div',undefined,'trackbar'+(gold?' gold':''));
      const fill=node('span');fill.style.width=Math.max(0,Math.min(100,val*100))+'%';
      bar.append(fill);track.append(bar);trackbox.append(track);
    }
    row.append(trackbox,node('div',TOKENS[i],'wordright'));host.append(row);
  }
}
function chart(){
  const canvas=$('chart'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const left=52,right=w-23,top=23,bottom=h-35;
  ctx.fillStyle='#0b1c14';ctx.fillRect(0,0,w,h);
  ctx.font='12px ui-monospace,monospace';ctx.textAlign='right';
  for(let i=0;i<=5;i++){
    const y=bottom-i/5*(bottom-top);
    ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.strokeStyle='#3b584448';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#9aad9e';ctx.fillText((i*20)+'%',left-8,y+4);
  }
  const X=step=>left+Math.sqrt(step/240)*(right-left),Y=val=>bottom-val*(bottom-top);
  for(const tick of [0,6,24,72,120,240]){
    ctx.fillStyle='#93aa99';ctx.textAlign='center';ctx.fillText(String(tick),X(tick),h-13);
  }
  const series=[
    ['dormant','production','#a5dfaa',3.5],
    ['dormant','recognition','#beb6fa',2.2],
    ['naive','production','#eec78c',2.5],
    ['scrambled','production','#e5a27d',2],
    ['decay','production','#7daba7',1.5],
  ];
  for(const [mode,key,color,width] of series){
    const curve=result.curves[mode];ctx.beginPath();ctx.lineWidth=width;ctx.strokeStyle=color;
    ctx.setLineDash(mode==='dormant'&&key==='recognition'?[5,6]:mode==='decay'?[2,5]:[]);
    curve.forEach((p,i)=>i?ctx.lineTo(X(p.step),Y(p[key])):ctx.moveTo(X(p.step),Y(p[key])));ctx.stroke();ctx.setLineDash([]);
  }
  const selected=$('mode').value;
  if(selected!=='dormant'&&!['naive','scrambled','decay'].includes(selected)){
    const curve=result.curves[selected];ctx.beginPath();ctx.lineWidth=3;ctx.strokeStyle='#fff4bd';
    curve.forEach((p,i)=>i?ctx.lineTo(X(p.step),Y(p.production)):ctx.moveTo(X(p.step),Y(p.production)));ctx.stroke();
  }
  const step=checkpoints[idx],selectedPoint=result.curves[selected][idx];
  ctx.strokeStyle='#ffffff79';ctx.lineWidth=1;ctx.setLineDash([4,5]);
  ctx.beginPath();ctx.moveTo(X(step),top);ctx.lineTo(X(step),bottom);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(X(step),Y(selectedPoint.production),6,0,Math.PI*2);
  ctx.fillStyle='#f4e8c2';ctx.fill();ctx.strokeStyle='#133021';ctx.stroke();
  ctx.font='11px ui-monospace,monospace';ctx.fillStyle='#a5bda6';ctx.textAlign='left';
  ctx.fillText('EXPECTED CORRECT RETRIEVAL',left,15);
  ctx.textAlign='right';ctx.fillText('RE-EXPOSURES',right,h-13);
}
function table(){
  const rows=[['dormant','Dormant wood'],['decay','Unprotected wood'],['scrambled','Scrambled wood'],['naive','First-time learner'],['rehearsal','Active rehearsal']];
  const body=$('tablebody');body.replaceChildren();
  for(const [mode,label] of rows){
    const tr=node('tr');if(mode==='dormant')tr.className='special';
    const s=result.before[mode],time=result.crossings[mode];
    const cells=[label,pct(s.production),pct(s.recognition),time===null?'>240':time+'',s.upkeep.toFixed(1)];
    for(let i=0;i<cells.length;i++){
      const td=node('td',cells[i]);
      if(mode==='dormant'&&i===2&&s.recognition>.9)td.className='win';
      if(mode==='dormant'&&i===2&&s.recognition<.4)td.className='lose';
      tr.append(td);
    }
    body.append(tr);
  }
}
function insight(){
  const d=result.before.dormant,n=result.before.naive;
  const saved=result.crossings.naive-result.crossings.dormant;
  if(d.recognition<.4)return 'The body ran out of maintenance resources. Stored links eroded; the old language no longer gives an advantage. Dormancy is cheap, not free.';
  if(d.production>.4)return 'After this shorter absence, production is weakened but not inaccessible. The old routes are still partly awake.';
  return 'The old words are difficult to produce, but the stored associations remain recognizable. Relearning saves '+(Number.isFinite(saved)?saved:'—')+' paired encounters at the 80% threshold.';
}
function draw(){
  if(!result)return;
  $('position').value=idx; $('positionLabel').textContent=checkpoints[idx];
  $('lapseLabel').textContent=Number(result.absence).toLocaleString('en')+' time steps';
  $('returnLabel').textContent=checkpoints[idx]+' paired presentations';
  $('stageLabel').textContent='RETURN / '+checkpoints[idx]+' new exposures';
  $('modeCaption').textContent=MODE_NAMES[$('mode').value];
  const p=result.curves[$('mode').value][idx];
  $('productionMetric').textContent=pct(p.production);$('recognitionMetric').textContent=pct(p.recognition);
  $('woodMetric').textContent=pct(p.wood);$('accessMetric').textContent=pct(p.access);
  $('insight').textContent=insight();
  const spend=result.before.dormant.upkeep.toFixed(1),spentActive=result.before.rehearsal.upkeep.toFixed(1);
  $('economy').textContent='Maintenance during absence: dormant '+spend+' vs active rehearsal '+spentActive+' resource units (all 6 meanings). Dormant reserves left: '+result.before.dormant.energy.toFixed(1)+'. Unpaid upkeep: '+result.before.dormant.unpaid.toFixed(2)+'. These are different experimental treatments, not matched practice schedules.';
  pathways();table();chart();
}
function step(){idx=Math.min(checkpoints.length-1,idx+1);if(idx===checkpoints.length-1){playing=false;$('play').textContent='Play return';}draw();}
$('run').addEventListener('click',run);
$('mode').addEventListener('change',draw);
$('play').addEventListener('click',()=>{
  if(idx===checkpoints.length-1)idx=0;
  playing=!playing;$('play').textContent=playing?'Pause':'Play return';draw();last=performance.now();
});
$('step').addEventListener('click',()=>{playing=false;$('play').textContent='Play return';step();});
$('rewind').addEventListener('click',()=>{playing=false;$('play').textContent='Play return';idx=0;draw();});
$('position').addEventListener('input',e=>{playing=false;$('play').textContent='Play return';idx=Number(e.target.value);draw();});
for(const id of ['absence','income','seed'])$(id).addEventListener('change',run);
function loop(now){
  if(playing&&now-last>660){last=now;step();}
  requestAnimationFrame(loop);
}
run();requestAnimationFrame(loop);
