const fs = require('fs');
const src = fs.readFileSync('allletters-game.js', 'utf8');
const match = src.match(/const orig = \[(.*?)\];/s);
if (!match) throw new Error('Could not parse country list');
const countryList = Function('return [' + match[1] + '];')().map(s => s.toLowerCase());

const letters = 'abcdefghijklmnopqrstuvwxyz';
const FULL = (1 << 26) - 1;

function maskOf(s){
  let mask = 0;
  for (const ch of s) {
    const idx = letters.indexOf(ch);
    if (idx >= 0) mask |= (1 << idx);
  }
  return mask;
}

const items = countryList.map((name, idx) => ({ name, idx, mask: maskOf(name) }));

const byLetter = Array.from({length: 26}, () => []);
for (const item of items){
  for (let i = 0; i < 26; i++){
    if (item.mask & (1 << i)) byLetter[i].push(item.idx);
  }
}

// Sort each letter bucket by descending popcount to prune faster
function popcount(x){
  let c = 0;
  while (x){ x &= (x - 1); c++; }
  return c;
}
for (const arr of byLetter){
  arr.sort((a,b) => popcount(items[b].mask) - popcount(items[a].mask));
}

function search(limit){
  const chosen = [];
  const used = new Set();

  function dfs(covered){
    if (covered === FULL) return true;
    if (chosen.length === limit) return false;

    const remainingSlots = limit - chosen.length;
    const uncoveredMask = FULL & ~covered;
    const uncoveredCount = popcount(uncoveredMask);

    let maxGain = 0;
    for (const item of items){
      if (used.has(item.idx)) continue;
      const gain = popcount(item.mask & uncoveredMask);
      if (gain > maxGain) maxGain = gain;
    }
    if (maxGain === 0) return false;
    if (Math.ceil(uncoveredCount / maxGain) > remainingSlots) return false;

    // choose the hardest uncovered letter: fewest available countries among unused
    let bestLetter = -1;
    let bestOptions = null;
    let bestCount = Infinity;
    for (let i = 0; i < 26; i++){
      if (!(uncoveredMask & (1 << i))) continue;
      const options = byLetter[i].filter(idx => !used.has(idx));
      if (options.length === 0) return false;
      if (options.length < bestCount){
        bestCount = options.length;
        bestOptions = options;
        bestLetter = i;
      }
    }

    for (const idx of bestOptions){
      const item = items[idx];
      const gainMask = item.mask & uncoveredMask;
      if (!gainMask) continue;
      used.add(idx);
      chosen.push(idx);
      if (dfs(covered | item.mask)) return true;
      chosen.pop();
      used.delete(idx);
    }
    return false;
  }

  const ok = dfs(0);
  return ok ? chosen.map(idx => items[idx].name) : null;
}

for (let k = 1; k <= 10; k++){
  const sol = search(k);
  console.log('k=' + k, sol ? 'found' : 'none');
  if (sol){
    console.log('length=' + sol.length);
    console.log(sol.join(' -> '));
    break;
  }
}
