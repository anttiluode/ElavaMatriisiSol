import assert from 'node:assert/strict';
import {LexicalBody,experiment,sweep,CONCEPTS,TOKENS,crossing} from './engine.mjs';
const seeds=[2,11,31,57,91,105,203,333,440,555,809,1001];
assert.equal(CONCEPTS[2],'very good');assert.equal(TOKENS[2],'jättebra');
const run=experiment({seed:11,absence:1200,income:.006,relearn:240});
assert.deepEqual(run,experiment({seed:11,absence:1200,income:.006,relearn:240}), 'seed reproducible');
assert(run.before.dormant.recognition>.90,'representation retained');
assert(run.before.dormant.production<.22,'access becomes quiet');
assert(run.before.dormant.recognition>run.before.naive.recognition+.65,'recognition differs from novice');
assert(run.before.scrambled.recognition<.08,'shuffled wood does not preserve labels');
assert(crossing(run.curves.dormant)<crossing(run.curves.naive),'faster relearning when stored');
assert(run.before.dormant.upkeep<run.before.rehearsal.upkeep*.35,'dormancy has low maintenance');
const starving=experiment({seed:11,absence:5000,income:.00015,relearn:240});
assert(starving.before.dormant.recognition<.4,'very scarce budget destroys wood too');
assert(crossing(starving.curves.dormant)>=crossing(starving.curves.naive),'no free survival after extreme starvation');
for(const s of seeds){
 const e=experiment({seed:s,absence:1200,income:.006,relearn:240});
 assert(e.before.dormant.recognition>.9);
 assert(e.before.dormant.production<.2);
 assert(crossing(e.curves.dormant)<crossing(e.curves.naive));
 for(const mode of Object.keys(e.before)){
  const b=e.before[mode];
  assert(Number.isFinite(b.energy)&&b.energy>=0&&b.energy<=180.000001);
  assert(Number.isFinite(b.upkeep)&&b.upkeep>=0);
  assert(e.curves[mode].every(p=>p.production>0&&p.production<=1&&p.recognition>0&&p.recognition<=1));
 }
}
const n=new LexicalBody(1105);
for(let k=0;k<480;k++)n.hear(k%6);
const probe=n.wood.map(row=>row.slice());
n.energy.fill(10);
const beforeE=n.reserves();n.lapse(100,.002);
assert(n.reserves()<=beforeE+6*100*.002+1e-7,'maintenance and learning must not create energy');
assert(probe.some((row,i)=>row.some((val,j)=>n.wood[i][j]!==val)),'wood must be dynamic');
const report=sweep({seeds});
assert.equal(report.length,9);
assert(report.every(r=>r.savings.usable===12));
console.log('PASS Gate 1b: deterministic; production/recognition dissociation; semantic scramble; scarce-resource loss; 12 matched seeds; energy accounting.');
console.table(report.map(r=>({absence:r.absence,income:r.income,savings:r.savings.medianTrialsSaved,
  dormantRecall:r.dormant.start.toFixed(3),dormantRecognition:r.dormant.recognition.toFixed(3),
  dormant80:r.dormant.trials80,naive80:r.naive.trials80,storedEnergy:r.dormant.energy.toFixed(1)})));
