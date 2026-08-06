// Browser port of solver_allletters.js
// Provides a simple UI for greedy + DFS improved search to cover a-z with country names.

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

function lettersOf(s){
  const set = new Set();
  for (let ch of s) {
    ch = ch.toLowerCase();
    if (ch >= 'a' && ch <= 'z') set.add(ch);
  }
  return set;
}

const items = countryList.map((name, idx) => ({ name, idx, letters: lettersOf(name) }));

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

// Browser-friendly DFS with yielding
let stopFlag = false;
let calls = 0;

function lowerBoundGreedy(coveredSet, remainingIdxSet){
  const cover = new Set(coveredSet);
  let count = 0;
  const rem = new Set(remainingIdxSet);
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

async function dfsPartial(chosen, coveredSet, remainingIdxSet, state){
  calls++;
  if (calls % 20000 === 0) {
    appendStatus(`calls=${calls} chosen=${chosen.length} covered=${coveredSet.size}`);
    // yield to UI
    await new Promise(r => setTimeout(r, 0));
  }
  if (stopFlag) return null;
  if (coveredSet.size === 26) return chosen.slice();

  const remainingItems = Array.from(remainingIdxSet).map(idx => items[idx]);
  const lb = lowerBoundGreedy(coveredSet, remainingIdxSet);
  if (state.best && (chosen.length + lb >= state.best.length)) return null;

  // order candidates by potential gain desc
  const candidates = remainingItems.map(it => ({it, gain: Array.from(it.letters).filter(c => !coveredSet.has(c)).length})).filter(x => x.gain>0);
  candidates.sort((a,b) => b.gain - a.gain);

  for (const {it} of candidates){
    if (stopFlag) return null;
    const newChosen = chosen.concat(it);
    const newCovered = new Set(coveredSet);
    for (const ch of it.letters) newCovered.add(ch);
    const newRemaining = new Set(remainingIdxSet);
    newRemaining.delete(it.idx);
    const res = await dfsPartial(newChosen, newCovered, newRemaining, state);
    if (res) {
      // update best
      if (!state.best || res.length < state.best.length) state.best = res.slice();
      return res;
    }
  }
  return null;
}

function appendOutput(text){
  const out = document.getElementById('output');
  out.textContent += text + '\n';
  out.scrollTop = out.scrollHeight;
}
function setStatus(s){ document.getElementById('status').textContent = s; }
function appendStatus(s){ const st = document.getElementById('status'); st.textContent = s; }

async function runSolver(){
  stopFlag = false;
  calls = 0;
  document.getElementById('output').textContent = '';
  setStatus('Running...');
  const maxCallsInput = document.getElementById('maxCalls');
  const MAX_CALLS = parseInt(maxCallsInput.value || '2000000', 10);
  const greedyOnly = document.getElementById('greedyOnly').checked;
  const g = greedyCover();
  appendOutput('Greedy selected ' + g.chosen.length + ' countries:');
  g.chosen.forEach((it,i)=> appendOutput((i+1)+'. '+it.name));
  appendOutput('---');
  if (greedyOnly) { setStatus('Done (greedy)'); return; }

  const initialCovered = new Set();
  const remainingIdxSet = new Set(items.map(i=>i.idx));
  const state = { best: g.chosen.map(x=>x) };

  // start DFS
  const start = performance.now();
  const res = await dfsPartial([], initialCovered, remainingIdxSet, state);
  const ms = Math.round(performance.now() - start);
  appendOutput('---');
  appendOutput('calls: '+calls+' time(ms): '+ms);
  if (state.best) {
    appendOutput('Best solution length: '+state.best.length);
    state.best.forEach((it,i)=> appendOutput((i+1)+'. '+it.name));
    const covered = new Set();
    for (const it of state.best) for (const ch of it.letters) covered.add(ch);
    appendOutput('Covered letters: '+Array.from(covered).sort().join(','));
    const missing = FULL_ALPH.filter(c => !covered.has(c));
    appendOutput('Missing (should be none): '+missing.join(','));
  } else {
    appendOutput('No solution found');
  }
  setStatus('Done');
}

function stopSolver(){ stopFlag = true; setStatus('Stopping...'); }

// Wire UI
window.addEventListener('load', ()=>{
  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
  startBtn.addEventListener('click', async ()=>{
    startBtn.disabled = true; stopBtn.disabled = false; document.getElementById('output').textContent = '';
    try { await runSolver(); } finally { startBtn.disabled = false; stopBtn.disabled = true; }
  });
  stopBtn.addEventListener('click', ()=>{ stopSolver(); });
});
