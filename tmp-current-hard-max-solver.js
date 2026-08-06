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
let calls = 0;
const memo = new Map();

function possibleMoveCountUpperBound(used){
  let count = 0;
  const seenReq = new Set();
  const tempUsed = new Set(used);
  while (true){
    const req = nextRequired(tempUsed);
    if (!req || seenReq.has(req)) break;
    seenReq.add(req);
    tempUsed.add(req);
    count++;
  }
  return count;
}

function dfs(usedLetters, usedCountries, path){
  calls++;
  if (usedLetters.size === 26){
    if (!best || path.length > best.length) best = path.slice();
    return;
  }

  const req = nextRequired(usedLetters);
  if (!req) return;

  // optimistic upper bound: one move per remaining required start letter.
  const maxAdditionalMoves = possibleMoveCountUpperBound(usedLetters);
  if (best && path.length + maxAdditionalMoves <= best.length) return;

  const key = req + '|' + [...usedLetters].sort().join('') + '|' + [...usedCountries].sort().join('|');
  const prev = memo.get(key);
  if (prev !== undefined && prev >= path.length) return;
  memo.set(key, path.length);

  const options = (byStart.get(req) || []).slice();
  // For longest search, prefer smaller gains first.
  options.sort((a, b) => {
    const gainA = allNewLetters(a, usedLetters).length;
    const gainB = allNewLetters(b, usedLetters).length;
    if (gainA !== gainB) return gainA - gainB;
    return a.localeCompare(b);
  });

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
    dfs(nextLetters, nextCountries, path);
    path.pop();
  }
}

dfs(new Set(), new Set(), []);
console.log('calls', calls);
if (best){
  console.log('max_length=' + best.length);
  console.log(best.join(' -> '));
} else {
  console.log('no_solution');
}
