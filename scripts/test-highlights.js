const puppeteer = require('puppeteer');
(async()=>{
  const urlBase = 'http://127.0.0.1:8000';
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  async function runOn(path, inputs){
    await page.goto(urlBase + path, {waitUntil:'networkidle2'});
    for (const name of inputs){
      await page.type('#countryInput', name);
      await page.click('#submitCountry');
      await new Promise(r => setTimeout(r, 200));
    }
    const html = await page.$eval('#submittedList', el => el.innerHTML);
    return html;
  }

  try{
    const seq = ['Albania','Latvia','Tonga','Oman','Mozambique','Zimbabwe','Ireland','Rwanda','North Korea','Hungary','Uganda','Ghana'];
    const alerts = [];
    page.on('dialog', async dlg => { alerts.push(dlg.message()); await dlg.dismiss(); });
    await page.goto(urlBase + '/alfaquest.html', {waitUntil:'networkidle2'});
    for (const name of seq){
      await page.type('#countryInput', name);
      await page.click('#submitCountry');
      await new Promise(r => setTimeout(r, 150));
    }
    const domState = await page.evaluate(()=>{
      const lis = Array.from(document.querySelectorAll('#submittedList li')).map(li=>({text: li.textContent, html: li.innerHTML}));
      // compute remaining letters from displayed grid
      const used = new Set();
      for (const el of document.querySelectorAll('#letterGrid .letter-cell')) if (el.classList.contains('used')) used.add(el.textContent.toLowerCase());
      const remaining = Array.from('abcdefghijklmnopqrstuvwxyz').filter(c=>!used.has(c));
      // parse required from sessionInfo display and compute available ourselves
      const si = document.getElementById('sessionInfo') ? document.getElementById('sessionInfo').textContent : '';
      const m = si.match(/required=([A-Za-z\?])/);
      const req = m ? m[1].toLowerCase() : null;
      const countryList = Array.from(document.querySelectorAll('#submittedList li')).map(li=>li.textContent.replace(/^\d+\.\s*/,''));
      const allCountries = (window._alfa_country_display && Object.values(window._alfa_country_display)) ? Object.values(window._alfa_country_display).map(s=>s.toLowerCase()) : [];
      const avail = [];
      if (req){
        for (const c of allCountries){ if (c.charAt(0) !== req) continue; for (const ch of c) if (remaining.indexOf(ch)!==-1){ avail.push(c); break; } }
      }
      return {
        submittedList: lis,
        remainingLetters: remaining,
        required: req,
        availableForRequired: avail,
        submitDisabled: document.getElementById('submitCountry') ? document.getElementById('submitCountry').disabled : null,
        inputDisabled: document.getElementById('countryInput') ? document.getElementById('countryInput').disabled : null,
        sessionInfo: document.getElementById('sessionInfo') ? document.getElementById('sessionInfo').textContent : ''
      };
    });
    console.log('alerts:', alerts);
    console.log('dom state after sequence:', JSON.stringify(domState, null, 2));
  }catch(e){ console.error('Test error', e); }
  await browser.close();
})();
