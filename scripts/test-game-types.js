const { spawn } = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = 8010;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const GAME_PAGES = [
  { file: 'alfaquest.html', name: 'Alfaquest', hasRequiredFlow: true },
  { file: 'alfafilleasy.html', name: 'Alfafill Easy', hasRequiredFlow: false },
  { file: 'alfafillnormal.html', name: 'Alfafill Normal', hasRequiredFlow: true },
  { file: 'alfafillhard.html', name: 'Alfafill Hard', hasRequiredFlow: true },
  { file: 'alfafill-sequence.html', name: 'Alfafill Sequence', hasRequiredFlow: true },
  { file: 'allletters.html', name: 'Allletters', hasRequiredFlow: true }
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (e) {
      // Retry until timeout.
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

async function runPageChecks(page, game) {
  const url = `${BASE_URL}/${game.file}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('#countryInput');
  await page.waitForSelector('#submitCountry');
  await page.waitForSelector('#submittedList');

  const objectiveText = await page.$eval('.instructions', (el) => el.textContent || '');
  assert(objectiveText.includes('Objective:'), `${game.name}: missing Objective line`);

  await page.waitForSelector('#submittedLegend');

  const sessionPositionOk = await page.evaluate(() => {
    const sessionEl = document.getElementById('sessionInfo');
    const listEl = document.getElementById('submittedList');
    if (!sessionEl || !listEl || !sessionEl.parentElement || !listEl.parentElement) return false;
    if (sessionEl.parentElement.parentElement !== listEl.parentElement) return false;
    const rel = sessionEl.parentElement.compareDocumentPosition(listEl);
    return (rel & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });

  assert(sessionPositionOk, `${game.name}: session/required info not found in submitted panel`);

  await page.click('#resetLocal');
  await delay(120);
  const resetToast = await page.$('#alfa-toast');
  if (resetToast) await resetToast.click();
  await delay(160);

  await page.type('#countryInput', 'Albania');
  await page.click('#submitCountry');
  await delay(180);

  const state = await page.evaluate(() => {
    const liCount = document.querySelectorAll('#submittedList li').length;
    const sessionInfoText = (document.getElementById('sessionInfo')?.textContent || '').trim();
    const hasRequiredBadge = (document.getElementById('sessionInfo')?.innerHTML || '').includes('Required:');
    const hasLegend = !!document.getElementById('submittedLegend');
    return { liCount, sessionInfoText, hasRequiredBadge, hasLegend };
  });

  assert(state.hasLegend, `${game.name}: legend missing`);
  assert(state.liCount >= 1, `${game.name}: first submission was not recorded`);

  if (game.hasRequiredFlow) {
    assert(state.hasRequiredBadge, `${game.name}: required-letter badge missing after submission`);
  }
}

async function main() {
  const serverScript = path.join(__dirname, 'simple-http-server.js');
  const serverEnv = { ...process.env, PORT: String(PORT) };
  const server = spawn(process.execPath, [serverScript], {
    cwd: path.resolve(__dirname, '..'),
    env: serverEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (chunk) => {
    process.stdout.write(`[server] ${chunk}`);
  });
  server.stderr.on('data', (chunk) => {
    process.stderr.write(`[server:err] ${chunk}`);
  });

  const cleanup = () => {
    if (!server.killed) server.kill();
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(1);
  });

  let browser;
  try {
    await waitForServer(`${BASE_URL}/alfaquest.html`, 15000);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    for (const game of GAME_PAGES) {
      await runPageChecks(page, game);
      process.stdout.write(`PASS: ${game.name}\n`);
    }

    process.stdout.write('All game type checks passed.\n');
  } finally {
    if (browser) await browser.close();
    cleanup();
  }
}

main().catch((err) => {
  console.error('Game test suite failed:', err.message);
  process.exit(1);
});
