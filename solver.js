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

const ALPH = "abcdefghijklmnopqrstuvyz".split(''); // 24 letters, w/x omitted
const IGNORED = ['w','x'];

// configuration
const PROGRESS_INTERVAL = 200000; // log every N calls
const MAX_CALLS = parseInt(process.env.MAX_CALLS || '10000000', 10); // safety cutoff

let found = null;
let calls = 0;
let bestDepth = 0;
let bestSequence = null;

// Precompute words by starting letter to avoid filtering repeatedly
const startMap = {};
for (const w of countryList) {
  const s = w.charAt(0);
  if (!startMap[s]) startMap[s] = [];
  startMap[s].push(w);
}

// Score candidate word: fewer remaining letter-options first (heuristic)
function candidateScore(word, alpha){
  let count = 0;
  for (let i = 0; i < word.length; i++) if (alpha.indexOf(word.charAt(i)) !== -1) count++;
  return count;
}

function firstCommonWithAlpha(word, alpha){
  for(let i=0;i<word.length;i++){
    if(alpha.indexOf(word.charAt(i)) !== -1) return word.charAt(i);
  }
  return null;
}

function dfs(wordsSoFar, alpha, usedStarts, prevCommon){
  calls++;
  if (wordsSoFar.length > bestDepth) {
    bestDepth = wordsSoFar.length;
    bestSequence = wordsSoFar.slice();
  }
  if ((calls & (PROGRESS_INTERVAL - 1)) === 0) {
    console.log(`calls=${calls} depth=${wordsSoFar.length} bestDepth=${bestDepth}`);
  }
  if (calls > MAX_CALLS) return false;
  if(found) return true;
  if(wordsSoFar.length > 0 && wordsSoFar.length === ALPH.length){
    // found full sequence
    found = wordsSoFar.slice();
    return true;
  }

  if (wordsSoFar.length === 0) {
    // first word must start with 'a'
    const candidates = (startMap['a'] || []).slice();
    candidates.sort((a,b) => candidateScore(a, alpha) - candidateScore(b, alpha));
    for (const c of candidates) {
      if (usedStarts.has(c.charAt(0))) continue;
      const start = c.charAt(0);
      const newUsed = new Set(usedStarts);
      newUsed.add(start);
      const newAlpha = alpha.filter(x => x !== start);
      const common = firstCommonWithAlpha(c, newAlpha);
      if (!common) {
        // allow if this would be the final word (fills all starting letters)
        if (wordsSoFar.length + 1 === ALPH.length) {
          found = [...wordsSoFar, c];
          return true;
        }
        continue;
      }
      const newPrev = common;
      if (dfs([...wordsSoFar, c], newAlpha, newUsed, newPrev)) return true;
    }
  } else {
    // need next word to start with prevCommon
    if (!prevCommon) return false;
    const candidates = (startMap[prevCommon] || []).slice();
    // filter and sort by heuristic
    const filtered = candidates.filter(w => !usedStarts.has(w.charAt(0)));
    filtered.sort((a,b) => candidateScore(a, alpha) - candidateScore(b, alpha));
    for (const c of filtered) {
      const start = c.charAt(0);
      const newUsed = new Set(usedStarts);
      newUsed.add(start);
      const newAlpha = alpha.filter(x => x !== start);
      const common = firstCommonWithAlpha(c, newAlpha);
      if (!common) {
        if (wordsSoFar.length + 1 === ALPH.length) {
          found = [...wordsSoFar, c];
          return true;
        }
        continue;
      }
      const newPrev = common;
      if (dfs([...wordsSoFar, c], newAlpha, newUsed, newPrev)) return true;
    }
  }
  return false;
}

(function main(){
  const initialAlpha = ALPH.slice();
  const initialUsed = new Set(IGNORED); // mark w/x as used
  console.log('Searching...');
  const ok = dfs([], initialAlpha, initialUsed, null);
  console.log('calls:', calls);
  if(ok && found){
    console.log('Found sequence of length', found.length);
    found.forEach((w,i) => console.log((i+1)+". "+w));
  } else {
    console.log('No sequence found');
    if (bestSequence) {
      console.log('Best depth reached:', bestDepth);
      bestSequence.forEach((w,i) => console.log((i+1)+". "+w));
      // show which letters are still remaining (from ALPH)
      const usedStarts = new Set(IGNORED);
      for (const w of bestSequence) usedStarts.add(w.charAt(0));
      const remaining = ALPH.filter(c => !usedStarts.has(c));
      console.log('Remaining starting letters:', remaining.join(', '));
    }
  }
})();
