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

function allNewLetters(word, usedBase){
  const used = new Set(usedBase);
  const letters = new Set();
  for (const ch of word) if (ch >= 'a' && ch <= 'z') letters.add(ch);
  const out = [];
  for (const ch of letters){
    if (!used.has(ch)){
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

let best = null;
const memo = new Map();
let calls = 0;

function key(req, usedLetters, usedCountries){
  return req + '|' + [...usedLetters].sort().join('') + '|' + [...usedCountries].sort().join('|');
}

function dfs(usedLetters, usedCountries, path){
  calls++;
  if (usedLetters.size === 26){
    if (!best || path.length < best.length) best = path.slice();
    return true;
  }
  if (best && path.length >= best.length) return false;
  const req = nextRequired(usedLetters);
  if (!req) return false;
  const k = key(req, usedLetters, usedCountries);
  const seenDepth = memo.get(k);
  if (seenDepth !== undefined && seenDepth <= path.length) return false;
  memo.set(k, path.length);

  const options = (byStart.get(req) || []).slice();
  options.sort((a,b) => {
    const gainA = allNewLetters(a, usedLetters).length;
    const gainB = allNewLetters(b, usedLetters).length;
    return gainB - gainA;
  });

  let found = false;
  for (const word of options){
    if (usedCountries.has(word)) continue;
    const gained = allNewLetters(word, usedLetters);
    if (gained.length === 0) continue;
    if (gained.length === 1 && gained[0] === req) continue;
    const nextLetters = new Set(usedLetters);
    for (const ch of gained) nextLetters.add(ch);
    const nextCountries = new Set(usedCountries);
    nextCountries.add(word);
    path.push(word);
    if (dfs(nextLetters, nextCountries, path)) found = true;
    path.pop();
  }
  return found;
}

dfs(new Set(), new Set(), []);
console.log('calls', calls);
if (best){
  console.log('solvable=true length=' + best.length);
  console.log(best.join(' -> '));
} else {
  console.log('solvable=false');
}
