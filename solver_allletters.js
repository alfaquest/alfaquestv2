// solver_allletters.js
// Find a short sequence of country names whose combined letters cover a-z.
// Strategy: greedy set-cover to get an upper bound, then DFS with pruning to improve.

const countryList = [
"Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
"Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas",
"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
"Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
"Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad",
"Chile","China","Colombia","Comoros","Republic of the Congo","Democratic Republic of the Congo",
"Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic",
"East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
"Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala",
"Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran",
"Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
"Kiribati","North Korea","South Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
"Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","North Macedonia","Madagascar",
"Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
"Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
"Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
"Norway","Oman","Pakistan","Palestine","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
"Poland","Portugal","Qatar","Romania","Russia","Rwanda","St Kitts and Nevis","St Lucia","Saint Vincent and the Grenadines",
"Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone",
"Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain",
"Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
"Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
"United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
"Yemen","Zambia","Zimbabwe"
].map(s => s.toLowerCase());

const FULL_ALPH = 'abcdefghijklmnopqrstuvwxyz'.split('');
const TARGET_SET = new Set(FULL_ALPH);

function lettersOf(s){
  const set = new Set();
  for (let ch of s) {
    ch = ch.toLowerCase();
    if (ch >= 'a' && ch <= 'z') set.add(ch);
  }
  return set;
}

const items = countryList.map((name, idx) => ({
  name,
  idx,
  letters: lettersOf(name)
}));

// Greedy set cover
function greedyCover(){
  const covered = new Set();
  const chosen = [];
  const remaining = new Set(items.map(i => i.idx));
  while (covered.size < 26) {
    let best = null;
    let bestGain = 0;
    for (const idx of remaining) {
      const item = items[idx];
      let gain = 0;
      for (const ch of item.letters) if (!covered.has(ch)) gain++;
      if (gain > bestGain) { bestGain = gain; best = item; }
    }
    if (!best) break;
    chosen.push(best);
    for (const ch of best.letters) covered.add(ch);
    remaining.delete(best.idx);
  }
  return {chosen, covered};
}

// DFS search with pruning using greedy lower bound
let bestSolution = null;
let calls = 0;
const MAX_CALLS = parseInt(process.env.MAX_CALLS || '20000000', 10);

function lowerBoundGreedy(remainingSet, remainingItems){
  // approximate number of additional items needed via greedy on remaining items
  const cover = new Set(remainingSet);
  let count = 0;
  const rem = new Set(remainingItems.map(i => i.idx));
  while (cover.size < 26) {
    let bestGain = 0;
    let bestIdx = null;
    for (const idx of rem) {
      const item = items[idx];
      let gain = 0;
      for (const ch of item.letters) if (!cover.has(ch)) gain++;
      if (gain > bestGain) { bestGain = gain; bestIdx = idx; }
    }
    if (!bestIdx) return Infinity;
    count++;
    for (const ch of items[bestIdx].letters) cover.add(ch);
    rem.delete(bestIdx);
    if (count > 26) break;
  }
  return count;
}

function dfsPartial(chosen, coveredSet, remainingIdxSet){
  calls++;
  if (calls % 500000 === 0) console.log('calls', calls, 'best', bestSolution ? bestSolution.length : '∞', 'current', chosen.length, 'covered', coveredSet.size);
  if (calls > MAX_CALLS) return;
  if (coveredSet.size === 26) {
    if (!bestSolution || chosen.length < bestSolution.length) bestSolution = chosen.slice();
    return;
  }
  // prune if cannot beat current best
  const remainingItems = Array.from(remainingIdxSet).map(idx => items[idx]);
  const lb = lowerBoundGreedy(coveredSet, remainingItems);
  if (bestSolution && (chosen.length + lb >= bestSolution.length)) return;

  // order candidates by potential gain descending
  const candidates = remainingItems.map(it => ({it, gain: Array.from(it.letters).filter(c => !coveredSet.has(c)).length})).filter(x => x.gain>0);
  candidates.sort((a,b) => b.gain - a.gain);

  for (const {it} of candidates){
    if (calls > MAX_CALLS) break;
    const newChosen = chosen.concat(it);
    const newCovered = new Set(coveredSet);
    for (const ch of it.letters) newCovered.add(ch);
    const newRemaining = new Set(remainingIdxSet);
    newRemaining.delete(it.idx);
    dfsPartial(newChosen, newCovered, newRemaining);
  }
}

function findBest(){
  const g = greedyCover();
  console.log('Greedy selected', g.chosen.length, 'countries');
  bestSolution = g.chosen.map(x => x);
  // try to improve
  const initialCovered = new Set();
  const remainingIdxSet = new Set(items.map(i => i.idx));
  dfsPartial([], initialCovered, remainingIdxSet);
  return {bestSolution, calls};
}

(function main(){
  console.log('Running all-letters solver...');
  const start = Date.now();
  const {bestSolution: sol, calls: usedCalls} = findBest();
  const ms = Date.now() - start;
  console.log('calls:', usedCalls, 'time(ms):', ms);
  if (sol) {
    console.log('Solution length:', sol.length);
    sol.forEach((it,i) => console.log((i+1)+'.', it.name));
    const covered = new Set();
    for (const it of sol) for (const ch of it.letters) covered.add(ch);
    console.log('Covered letters:', Array.from(covered).sort().join(','));
    const missing = FULL_ALPH.filter(c => !covered.has(c));
    console.log('Missing letters (should be none):', missing.join(','));
  } else {
    console.log('No solution found');
  }
})();
