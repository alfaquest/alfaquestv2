import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 8010;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) {
    throw new Error('Chrome was not found. Set CHROME_PATH to run browser smoke tests.');
  }
  return executable;
}

const GAME_PAGES = [
  { file: 'alfaquest.html', name: 'Alfaquest', hasRequiredFlow: true },
  { file: 'alfafillnormal.html', name: 'Alfafill Normal', hasRequiredFlow: true },
  { file: 'alfafilleasy.html', name: 'Alfafill Easy', hasRequiredFlow: false },
  { file: 'alfafillhard.html', name: 'Alfafill Hard', hasRequiredFlow: true }
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
  const pageErrors = [];
  const onPageError = (error) => pageErrors.push(error.message);
  page.on('pageerror', onPageError);
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
  assert(pageErrors.length === 0, `${game.name}: browser error: ${pageErrors.join('; ')}`);
  page.off('pageerror', onPageError);
}

async function runMenuChecks(page) {
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle2' });
  const links = await page.$$eval('a.button', (elements) =>
    elements.map((element) => element.getAttribute('href'))
  );
  assert(
    JSON.stringify(links) === JSON.stringify(GAME_PAGES.map((game) => game.file)),
    `Menu links do not match supported games: ${links.join(', ')}`
  );
}

async function main() {
  const serverScript = path.join(__dirname, 'simple-http-server.js');
  const serverEnv = {
    ...process.env,
    PORT: String(PORT),
    STATIC_ROOT: path.resolve(__dirname, '..', 'dist')
  };
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
      executablePath: findChrome(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await runMenuChecks(page);
    process.stdout.write('PASS: Game menu\n');

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
