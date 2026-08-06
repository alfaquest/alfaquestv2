const fs = require('fs');
const src = fs.readFileSync('allletters-game.js', 'utf8');
const match = src.match(/const orig = \[(.*?)\];/s);
if (!match) throw new Error('Could not parse country list');
const countryList = Function('return [' + match[1] + '];')().map(s => s.toLowerCase());

const ALPH = 'abcdefghijklmnopqrstuvwxyz'.split('');
const GAME_ALPH = ALPH.filter(c => c !== 'w' && c !== 'x');
const letterIndex = new Map(ALPH.map((c, i) => [c, i]));
const startIndex = new Map(GAME_ALPH.map((c, i) => [c, i]));
const FULL_MASK = (1 << 26) - 1;

function normalize(s){ return String(s || '').trim().toLowerCase(); }
function lettersMask(word){
  let mask = 0;
  for (const ch of normalize(word)) {
    const idx = letterIndex.get(ch);
    if (idx !== undefined) mask |= (1 << idx);
  }
  return mask;
}

function nextRequiredFromWord(word, usedStartsMask){
  for (const ch of normalize(word)) {
    const idx = startIndex.get(ch);
    if (idx !== undefined && ((usedStartsMask & (1 << idx)) === 0)) return ch;
  }
  return null;
}

const byStart = new Map();
const items = countryList.map(name => {
  const start = name[0];
  const item = { name, start, mask: lettersMask(name) };
  if (!byStart.has(start)) byStart.set(start, []);
  byStart.get(start).push(item);
  return item;
});

function popcount(x){
  let c = 0;
  while (x) { x &= (x - 1); c++; }
  return c;
}

let best = null;
const memo = new Map();
let calls = 0;

function dfs(required, usedStartsMask, usedLettersMask, path){
  calls++;
  if (usedLettersMask === FULL_MASK) {
    best = path.slice();
    return true;
  }
  if (!required) return false;
  if (best && path.length >= best.length) return false;

  const key = required + '|' + usedStartsMask + '|' + usedLettersMask;
  const prevBestDepth = memo.get(key);
  if (prevBestDepth !== undefined && prevBestDepth <= path.length) return false;
  memo.set(key, path.length);

  const options = (byStart.get(required) || []).slice();
  options.sort((a, b) => popcount((b.mask & ~usedLettersMask) >>> 0) - popcount((a.mask & ~usedLettersMask) >>> 0));

  for (const item of options) {
    const startBit = 1 << startIndex.get(item.start);
    if (usedStartsMask & startBit) continue;
    const nextUsedStartsMask = usedStartsMask | startBit;
    const nextRequired = nextRequiredFromWord(item.name, nextUsedStartsMask);
    const nextUsedLettersMask = usedLettersMask | item.mask;
    path.push(item.name);
    if (dfs(nextRequired, nextUsedStartsMask, nextUsedLettersMask, path)) return true;
    path.pop();
  }
  return false;
}

for (let depthHint = 1; depthHint <= 24; depthHint++) {
  // branch-and-bound uses best; iterative wrapper just lets us print progress
  if (best) break;
  dfs('a', 0, 0, []);
  console.log('search pass', depthHint, 'calls', calls, 'best', best ? best.length : null);
  break;
}

if (best) {
  console.log('solvable=true length=' + best.length);
  console.log(best.join(' -> '));
} else {
  console.log('solvable=false');
}
