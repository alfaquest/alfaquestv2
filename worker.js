// Module-style Cloudflare Worker with a `Session` Durable Object for incremental play

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

const ALPH = "abcdefghijklmnopqrstuvyz".split(''); // original game letters (w,x omitted)
const IGNORED = ['w','x'];
const FULL_ALPH = "abcdefghijklmnopqrstuvwxyz".split(''); // new variant uses all letters

function corsHeaders(origin){
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function withCors(response, origin){
  const headers = new Headers(response.headers);
  const c = corsHeaders(origin);
  for (const k of Object.keys(c)) headers.set(k, c[k]);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Helper: extract a-z letters from a string
function extractLetters(s){
  const out = new Set();
  for (let i=0;i<s.length;i++){
    const ch = s.charAt(i).toLowerCase();
    if (ch >= 'a' && ch <= 'z') out.add(ch);
  }
  return Array.from(out);
}

// Durable Object class to track session state incrementally
export class Session {
  constructor(state, env){
    this.state = state;
    this.env = env;
  }

  async ensureInitialized(){
    const init = await this.state.storage.get('init');
    if (!init){
      await this.state.storage.put('letters', []);
      await this.state.storage.put('texts', []);
      await this.state.storage.put('init', true);
    }
  }

  async fetch(request){
    const url = new URL(request.url);
    await this.ensureInitialized();

    if (request.method === 'POST' && url.pathname === '/submit'){
      // Accept JSON { text: "..." }
      try {
        const body = await request.json();
        const text = String(body.text || '');
        if (!text) return new Response(JSON.stringify({error:'No text provided'}), {status:400, headers:{'Content-Type':'application/json'}});

        // update stored texts
        const texts = (await this.state.storage.get('texts')) || [];
        texts.push(text);
        await this.state.storage.put('texts', texts);

        // update letters
        const letters = new Set((await this.state.storage.get('letters')) || []);
        const extracted = extractLetters(text);
        for (const ch of extracted) letters.add(ch);
        const lettersArr = Array.from(letters).sort();
        await this.state.storage.put('letters', lettersArr);

        const remaining = FULL_ALPH.filter(c => lettersArr.indexOf(c) === -1);
        const success = remaining.length === 0;
        return new Response(JSON.stringify({used: lettersArr, remaining, success, count: lettersArr.length}), {status:200, headers:{'Content-Type':'application/json'}});
      } catch (e){
        return new Response(JSON.stringify({error:'Invalid JSON body'}), {status:400, headers:{'Content-Type':'application/json'}});
      }
    }

    if (request.method === 'GET' && url.pathname === '/status'){
      const letters = (await this.state.storage.get('letters')) || [];
      const texts = (await this.state.storage.get('texts')) || [];
      const remaining = FULL_ALPH.filter(c => letters.indexOf(c) === -1);
      const success = remaining.length === 0;
      return new Response(JSON.stringify({used: letters, remaining, success, count: letters.length, texts}), {status:200, headers:{'Content-Type':'application/json'}});
    }

    return new Response('Not Found', {status:404});
  }
}

// Main worker fetch handler (module-style) — routes to existing APIs and session endpoints
export default {
  async fetch(request, env){
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Session management endpoints (incremental play)
    // Create session: POST /session/create with optional {name}
    if (request.method === 'POST' && url.pathname === '/session/create'){
      try {
        const body = await request.json();
        const name = (body && body.name) ? String(body.name) : crypto.randomUUID();
        // Use idFromName so same name maps to same DO instance; deterministic
        const id = env.SESSIONS.idFromName(name);
        const stub = env.SESSIONS.get(id);
        // Ensure initialization by calling status
        await stub.fetch(new Request('https://dummy/status'));
        return withCors(new Response(JSON.stringify({session: name}), {status:200, headers:{'Content-Type':'application/json'}}), origin);
      } catch (e){
        return withCors(new Response(JSON.stringify({error:'Invalid JSON body'}), {status:400, headers:{'Content-Type':'application/json'}}), origin);
      }
    }

    // Submit text to session: POST /session/:name/submit
    if (request.method === 'POST' && url.pathname.startsWith('/session/') && url.pathname.endsWith('/submit')){
      const parts = url.pathname.split('/');
      // ['', 'session', ':name', 'submit']
      if (parts.length >= 4){
        const name = parts[2];
        const id = env.SESSIONS.idFromName(name);
        const stub = env.SESSIONS.get(id);
        // forward the body to DO
        const forwarded = await stub.fetch(new Request('https://dummy/submit', {method:'POST', body: await request.text(), headers: {'Content-Type': request.headers.get('Content-Type') || 'application/json'}}));
        return withCors(forwarded, origin);
      }
    }

    // Get session status: GET /session/:name
    if (request.method === 'GET' && url.pathname.startsWith('/session/')){
      const parts = url.pathname.split('/');
      // ['', 'session', ':name']
      if (parts.length >= 3){
        const name = parts[2];
        const id = env.SESSIONS.idFromName(name);
        const stub = env.SESSIONS.get(id);
        const forwarded = await stub.fetch(new Request('https://dummy/status'));
        return withCors(forwarded, origin);
      }
    }

    // Keep original API endpoints for compatibility
    if (request.method === 'POST' && url.pathname === '/api/letters'){
      try {
        const body = await request.json();
        const words = Array.isArray(body.words) ? body.words.map(w => String(w).toLowerCase()) : [];
        if (words.length === 0) return withCors(new Response(JSON.stringify({error:'No words submitted'}), {status:400, headers:{'Content-Type':'application/json'}}), origin);
        const combined = words.join('');
        const used = [];
        for (const ch of FULL_ALPH){ if (combined.indexOf(ch) !== -1) used.push(ch); }
        const remaining = FULL_ALPH.filter(c => used.indexOf(c) === -1);
        const success = remaining.length === 0;
        return withCors(new Response(JSON.stringify({used, remaining, success, count: used.length}), {status:200, headers:{'Content-Type':'application/json'}}), origin);
      } catch (e){
        return withCors(new Response(JSON.stringify({error:'Invalid JSON body'}), {status:400, headers:{'Content-Type':'application/json'}}), origin);
      }
    }

    // legacy /api/next kept for compatibility (stateless)
    if (request.method === 'POST' && url.pathname === '/api/next'){
      try {
        const body = await request.json();
        const words = Array.isArray(body.words) ? body.words.map(w => String(w).toLowerCase()) : [];
        const result = computeNext(words);
        if (result.error) return withCors(new Response(JSON.stringify({error: result.error}), {status: result.status || 400, headers:{'Content-Type':'application/json'}}), origin);
        return withCors(new Response(JSON.stringify({next: result.next, used: result.used}), {status:200, headers:{'Content-Type':'application/json'}}), origin);
      } catch (e){
        return withCors(new Response(JSON.stringify({error:'Invalid JSON body'}), {status:400, headers:{'Content-Type':'application/json'}}), origin);
      }
    }

    return withCors(new Response('Not Found', {status:404}), origin);
  }
}

// computeNext retained from original, stateless helper
function computeNext(words){
  let alpha = ALPH.slice();
  let used = IGNORED.slice();
  let prevCommon = null;

  for (let i = 0; i < words.length; i++){
    const w = words[i];
    if (typeof w !== 'string' || w.length === 0) return {error: 'Invalid word at index '+i, status:400};
    if (countryList.indexOf(w) === -1) return {error: 'Word not in country list: '+w, status:404};
    if (used.indexOf(w.charAt(0)) !== -1) return {error: 'Word already used: '+w, status:404};

    if (i === 0){
      if (!w.startsWith('a')) return {error: 'First word must start with "a"', status:404};
    } else {
      if (w.charAt(0) !== prevCommon) return {error: 'Word starting letter does not match required letter', status:404};
    }

    used.push(w.charAt(0));
    alpha = alpha.filter(c => c !== w.charAt(0));

    let common = '';
    for (let j = 0; j < w.length; j++){
      if (alpha.indexOf(w.charAt(j)) !== -1){ common = w.charAt(j); break; }
    }

    if (common === '') return {error: 'You have ran out of letters, GAME OVER', status:400};
    prevCommon = common;
  }

  if (words.length === 0) return {error: 'No words submitted', status:400};
  return {next: prevCommon.toUpperCase(), used};
}
