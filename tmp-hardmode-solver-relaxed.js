const fs = require('fs');

const src = fs.readFileSync('allletters-game.js', 'utf8');
const match = src.match(/const orig = \[(.*?)\];/s);
if (!match) throw new Error('Could not parse country list');
const countries = Function('return [' + match[1] + '];')().map(s => s.toLowerCase());

const ALPH = 'abcdefghijklmnopqrstuvwxyz'.split('');
const GAME_ALPH = ALPH.filter(c => c !== 'w' && c !== 'x');

function nextRequired(used){
  for (const ch of GAME_ALPH){
    if (!used.has(ch)) return ch;
  }
  return null;
}

function isComplete(used, submitted){
  const hasW = used.has('w');
  const hasX = used.has('x');
  const hasZ = used.has('z');
  const last = submitted.length ? submitted[submitted.length - 1] : '';
  const lastStartsZ = last.startsWith('z');
  const coreDone = GAME_ALPH.filter(ch => ch !== 'z').every(ch => used.has(ch));
  return coreDone && hasW && hasX && (hasZ || lastStartsZ);
}

function getCollectedSeq(word, usedBase){
  const used = new Set(usedBase);
  const req = nextRequired(used);
  if (!req || word[0] !== req) return [];

  const letters = new Set([...word].filter(ch => ch >= 'a' && ch <= 'z'));
  const out = [];
  const reqIdx = GAME_ALPH.indexOf(req);
  for (let i = reqIdx; i < GAME_ALPH.length; i++){
    const ch = GAME_ALPH[i];
    if (used.has(ch)) continue;
    if (!letters.has(ch)) break;
    out.push(ch);
    used.add(ch);
  }
  for (const ch of ['w','x']){
    if (letters.has(ch) && !used.has(ch)){
      out.push(ch);
      used.add(ch);
    }
  }
  return out;
}

const byStart = new Map();
for (const c of countries){
  const s = c[0];
  if (!byStart.has(s)) byStart.set(s, []);
  byStart.get(s).push(c);
}

let calls = 0;
let best = null;
const memo = new Set();

function key(used, usedCountries){
  const u = [...used].sort().join('');
  const c = [...usedCountries].sort().join('|');
  return u + '::' + c;
}

function dfs(used, usedCountries, path, maxDepth){
  calls++;
  if (isComplete(used, path)){
    if (!best || path.length < best.length) best = [...path];
    return true;
  }
  if (path.length >= maxDepth) return false;
  if (best && path.length >= best.length) return false;

  const req = nextRequired(used);
  if (!req) return false;

  const k = key(used, usedCountries);
  if (memo.has(k)) return false;
  memo.add(k);

  const options = byStart.get(req) || [];
  let any = false;
  for (const word of options){
    if (usedCountries.has(word)) continue;
    const collected = getCollectedSeq(word, used);
    if (collected.length === 0) continue;

    const used2 = new Set(used);
    for (const ch of collected) used2.add(ch);
    const usedCountries2 = new Set(usedCountries);
    usedCountries2.add(word);

    path.push(word);
    if (dfs(used2, usedCountries2, path, maxDepth)) any = true;
    path.pop();
  }
  return any;
}

for (let depth = 6; depth <= 16; depth++){
  memo.clear();
  calls = 0;
  const ok = dfs(new Set(), new Set(), [], depth);
  console.log('depth', depth, 'ok', ok, 'calls', calls, 'best', best ? best.length : null);
  if (ok) break;
}

if (best){
  console.log('solvable=true length=' + best.length);
  console.log(best.join(' -> '));
} else {
  console.log('solvable=false');
}

