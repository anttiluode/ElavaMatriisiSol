import assert from "node:assert/strict";
import {CommunicationWorld} from "./engine.mjs";
const seeds=[3,5,17,73,1105,1121,2036,3341];
const rows=[];
for(const seed of seeds){
 const a=new CommunicationWorld(seed,"compositional").train(1000);
 const b=new CommunicationWorld(seed,"compositional").train(1000);
 assert.deepEqual(a.sender.snapshot(),b.sender.snapshot(),"repeatable A");
 assert.deepEqual(a.receiver.snapshot(),b.receiver.snapshot(),"repeatable B");
 const seen=a.evaluate({count:300,events:[0,1,2]});
 const novel=a.evaluate({count:100,events:[3]});
 const silence=a.evaluate({count:400,events:[0,1,2,3],condition:"silence"});
 const shuffled=a.evaluate({count:400,events:[0,1,2,3],condition:"shuffled"});
 assert.equal(seen.accuracy,1,"seen patterns should be learned");
 assert.equal(novel.accuracy,1,"withheld composition should transfer");
 assert(seen.accuracy>silence.accuracy+.6,"real message beats silence");
 assert(seen.accuracy>shuffled.accuracy+.6,"message structure matters");
 const frozen=JSON.stringify(a.sender.snapshot()),original=JSON.stringify(a.receiver.snapshot());
 const t=a.transfer({rounds:600,seed:seed+707});
 assert.equal(JSON.stringify(a.sender.snapshot()),frozen,"sender frozen while third learns");
 assert.equal(JSON.stringify(a.receiver.snapshot()),original,"original receiver unchanged");
 assert.notDeepEqual(a.receiver.wood,t.pupil.wood,"third has independent weights");
 assert.equal(a.evaluate({events:[0,1,2],sender:a.sender,receiver:t.pupil}).accuracy,1,"fresh receiver can acquire the code");
 assert(a.sender.resources>=0&&a.sender.resources<=100,"bounded A reserves");
 assert(a.receiver.resources>=0&&a.receiver.resources<=100,"bounded B reserves");
 rows.push({seed,seen:seen.accuracy,novel:novel.accuracy,silence:silence.accuracy,
   shuffled:shuffled.accuracy,pupilBefore:t.initial.accuracy,pupilAfter:t.score.accuracy});
}
for(const seed of seeds){
 const h=new CommunicationWorld(seed,"holistic").train(1000);
 assert.equal(h.evaluate({events:[0,1,2]}).accuracy,1,"holistic learns seen patterns");
 assert.equal(h.evaluate({events:[3]}).accuracy,0,"unseen row has no compositional reuse");
}
const fullyExposed=new CommunicationWorld(1105,"holistic",{trainEvents:[0,1,2,3]}).train(2000);
assert.equal(fullyExposed.evaluate({events:[0,1,2,3]}).accuracy,1,
 "holistic can learn fourth pattern when trained on it");
console.log("PASS: 8 matched seeds, 2 architectures, two negative controls, held-out combination, non-copying third learner, bounded energy.");
console.table(rows);
