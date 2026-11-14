/** Gate 1b — Jättebra: stored associations versus accessible expression.
 * Concept-to-token associations, NOT a biological language model.
 * Fixed associative task: the environmental pairing is explicitly supplied.
 */
export class RNG {
  constructor(seed=1){this.s=seed>>>0;}
  next(){let t=this.s+=0x6d2b79f5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
  int(n){return Math.floor(this.next()*n);}
}
export const CONCEPTS=['hello','thank you','very good','goodbye','water','shelter'];
export const TOKENS=['hej','tack','jättebra','hej då','vatten','skydd'];
export const MODES=['dormant','decay','scrambled','naive','rehearsal'];
const N=CONCEPTS.length;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function makeMapping(seed){void seed;return [0,1,2,3,4,5];} // fixed genuine English-Swedish word pairs

export class LexicalBody {
  constructor(seed=1,mode='dormant',mapping=makeMapping(seed)){
    if(!MODES.includes(mode))throw Error('Unknown mode');
    this.seed=seed;this.mode=mode;this.rng=new RNG(seed+77);
    this.mapping=[...mapping];
    this.wood=Array.from({length:N},()=>Array.from({length:N},()=>.025+this.rng.next()*.025));
    this.access=Array.from({length:N},()=>Array(N).fill(0));
    this.energy=Array(N).fill(20);
    this.income=0;this.upkeep=0;this.learningCost=0;this.unpaid=0;this.training=0;this.time=0;
  }
  /** One sensory experience: meaning and accompanying sound arrive together.
   * Local Hebbian update, and a local competition with other word pathways.
   */
  hear(concept,{rate=.050,reactivation=.24}={}){
    const target=this.mapping[concept];
    if(this.energy[concept]<.085)return false;
    this.energy[concept]-=.085;this.learningCost+=.085;
    for(let j=0;j<N;j++){
      if(j===target){this.wood[concept][j]+=rate*(1-this.wood[concept][j]);
        this.access[concept][j]+=reactivation*(1-this.access[concept][j]);}
      else {this.wood[concept][j]*=(1-rate*.1);this.access[concept][j]*=.98;}
    }
    this.training++;return true;
  }
  /** Compare open-ended production and recognition. Recognition bypasses the
   * fast output gate but still depends on stored links. These are model probes.
   */
  score(type='production'){
    let total=0;
    for(let i=0;i<N;i++){
      // Production: concept -> word, gated by currently accessible output pathway.
      // Recognition: heard word -> concept, querying retained associations in reverse.
      const logits=type==='recognition'
        ? this.wood.map(row=>4*row[this.mapping[i]]/.75)
        : this.wood[i].map((w,j)=>4*w*this.access[i][j]/.75);
      const max=Math.max(...logits);
      const exp=logits.map(z=>Math.exp(z-max));
      const answer=type==='recognition'?i:this.mapping[i];
      total+=exp[answer]/exp.reduce((a,b)=>a+b,0);
    }
    return total/N;
  }
  woodTrace(){return this.wood.reduce((s,row,i)=>s+row[this.mapping[i]],0)/N;}
  accessTrace(){return this.access.reduce((s,row,i)=>s+row[this.mapping[i]],0)/N;}
  reserves(){return this.energy.reduce((a,b)=>a+b,0);}
  /** During absence, the environment provides income but no target-language pairing.
   * Dormant paths retain slow connectivity while output access decays.
   * The counterfactual modes distinguish storage from random old weights.
   */
  lapseTick(incomePerNode=.014){
    this.time++;
    for(let i=0;i<N;i++){
      for(let j=0;j<N;j++){
        this.access[i][j]*=.992;
        if(this.mode==='decay')this.wood[i][j]*=.9975;
        else if(this.mode==='rehearsal')this.wood[i][j]*=.999998;
        else this.wood[i][j]*=.9999985;
      }
      this.energy[i]=Math.min(30,this.energy[i]+incomePerNode);
      this.income+=incomePerNode;
      const sum=this.wood[i].reduce((a,b)=>a+b,0);
      const dormant=this.mode==='dormant'||this.mode==='scrambled'||this.mode==='naive';
      const cost=(dormant?.0009:.013)*sum+.00055;
      const paid=Math.min(this.energy[i],cost);
      this.energy[i]-=paid;this.upkeep+=paid;
      if(paid<cost){
        this.unpaid+=cost-paid;
        // Physical starvation erodes unsupported traces; not a target-selection rule.
        const excess=(cost-paid)/Math.max(cost,.000001);
        for(let j=0;j<N;j++)this.wood[i][j]*=1-.009*excess;
      }
    }
  }
  /** Common environment: all learners get same daily exposure distribution,
   * regardless of their mode. In 'rehearsal' the target language is explicitly
   * practiced during absence (an upper bound, not a savings condition).
   */
  lapse(n,incomePerNode=.014){
    for(let k=0;k<n;k++){
      this.lapseTick(incomePerNode);
      if(this.mode==='rehearsal'&&k%18===17)this.hear(Math.floor(k/18)%N,{rate:.03});
    }
  }
  /** One return encounter (one of the six concepts in fixed balanced order). */
  reactivate(steps=120){
    const point=step=>({step,production:this.score(),recognition:this.score('recognition'),wood:this.woodTrace(),access:this.accessTrace(),stored:this.wood.map(row=>row.slice()),gates:this.access.map(row=>row.slice())});
    const trace=[point(0)];
    this.first80=this.score()>=.80?0:null;
    for(let k=0;k<steps;k++){
      this.hear(k%N);
      if(this.first80===null&&this.score()>=.80)this.first80=k+1;
      if([6,12,24,48,72,96,120,180,240].includes(k+1))trace.push(point(k+1));
    }
    return trace;
  }
  /** Equalize total resources at return to isolate stored structure from wealth.
   * Do not change weights, access or their maintenance history.
   */
  matchReturnResources(level=12){this.energy.fill(level);}
  /** Obtain a no-memory control WITHOUT altering language labels or the episode order. */
  makeNaive(){this.wood.forEach(row=>row.forEach((v,j)=>{row[j]=.025+this.rng.next()*.025;}));this.access.forEach(row=>row.fill(0));}
  /** Keep the amount of wood but deliberately destroy meaning-specific alignment. */
  scramble(){this.wood=this.wood.map(row=>row.map((_,j)=>row[(j+1)%N]));this.access=this.access.map(row=>row.map((_,j)=>row[(j+1)%N]));}
  snapshot(){return {mode:this.mode,production:this.score(),recognition:this.score('recognition'),wood:this.woodTrace(),access:this.accessTrace(),energy:this.reserves(),upkeep:this.upkeep,unpaid:this.unpaid};}
}
/** Make 5 matched histories, then return curves. The naive control has the same
 * pre-experiment training opportunity but no old foreign association at return.
 * Endowment matching prevents stored energy alone explaining savings.
 */
export function experiment({seed=11,absence=1200,income=.006,pretrain=720,relearn=120,matchEnergy=true}={}){
  const mapping=makeMapping(seed);
  const agents={};
  for(const mode of MODES){
    const net=new LexicalBody(seed,mode,mapping);
    for(let t=0;t<pretrain;t++)net.hear(t%N);
    // Same depleted initial reserve at beginning of the absence.
    net.energy.fill(3);
    net.lapse(absence,income);
    if(mode==='naive')net.makeNaive();
    if(mode==='scrambled')net.scramble();
    agents[mode]=net;
  }
  const before=Object.fromEntries(MODES.map(mode=>[mode,agents[mode].snapshot()]));
  if(matchEnergy)for(const net of Object.values(agents))net.matchReturnResources(12);
  const curves=Object.fromEntries(MODES.map(mode=>[mode,agents[mode].reactivate(relearn)]));
  const after=Object.fromEntries(MODES.map(mode=>[mode,agents[mode].snapshot()]));
  const crossings=Object.fromEntries(MODES.map(mode=>[mode,agents[mode].first80]));
  return {seed,absence,income,pretrain,relearn,mapping,before,after,curves,crossings};
}
export function crossing(curve,criterion=.80){
 const hit=curve.find(p=>p.production>=criterion);
 return hit?hit.step:null;
}
export function sweep({seeds=[2,11,31,57,91,105,203,333,440,555,809,1001],absences=[200,1200,5000],incomes=[.00015,.006,.045],relearn=240}={}){
 const rows=[];
 for(const absence of absences)for(const income of incomes){
   const tests=seeds.map(seed=>experiment({seed,absence,income,relearn}));
   const result={absence,income,n:tests.length};
   for(const mode of MODES){
     const curves=tests.map(x=>x.curves[mode]);
     const arrival=tests.map(t=>t.crossings[mode]);
     result[mode]={start:mean(curves.map(c=>c[0].production)),
       recognition:mean(curves.map(c=>c[0].recognition)),
       trials80:median(arrival.filter(x=>x!==null)),reach80:arrival.filter(x=>x!==null).length,
       final:mean(curves.map(c=>c.at(-1).production)),
       maintenance:mean(tests.map(x=>x.before[mode].upkeep)),
       energy:mean(tests.map(x=>x.before[mode].energy))};
   }
   const paired=tests.map(t=>t.crossings.naive===null||t.crossings.dormant===null?null:t.crossings.naive-t.crossings.dormant);
   result.savings={positive:paired.filter(x=>x>0).length,equal:paired.filter(x=>x===0).length,
     negative:paired.filter(x=>x<0).length,usable:paired.filter(x=>Number.isFinite(x)).length,
     medianTrialsSaved:median(paired.filter(x=>Number.isFinite(x)))};
   rows.push(result);
 }
 return rows;
}
export function mean(a){return a.reduce((x,y)=>x+y,0)/(a.length||1)}
export function median(a){if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2}
