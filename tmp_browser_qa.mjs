import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/index.html';
const OUT_DIR = path.join(process.cwd(), 'docs', 'qa_artifacts');
fs.mkdirSync(OUT_DIR, { recursive: true });

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function runDesktop() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleIssues = [];
  const pageErrors = [];
  const externalRequests = new Set();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') {
      consoleIssues.push({ type: t, text: msg.text() });
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message || String(err)));
  page.on('request', (req) => {
    try {
      const u = new URL(req.url());
      const allowedLocal = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname === '127.0.0.1' || u.hostname === 'localhost');
      const allowedSpecial = ['data:', 'blob:', 'about:'].includes(u.protocol);
      if (!allowedLocal && !allowedSpecial) externalRequests.add(req.url());
    } catch {}
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_01_initial.png'), fullPage: true });

  // lecture anchors
  for (let i = 1; i <= 8; i += 1) {
    const idCount = await page.locator(`#sec${i}`).count();
    const linkCount = await page.locator(`a[href="#sec${i}"]`).count();
    assert(idCount === 1, `expected #sec${i} exactly once, got ${idCount}`);
    assert(linkCount === 1, `expected roadmap link #sec${i} exactly once, got ${linkCount}`);
  }

  // collapse/expand
  await page.click('#lectureToggleBtn');
  {
    const collapsed = await page.locator('#lectureBody').evaluate((el) => el.classList.contains('collapsed'));
    assert(collapsed, 'lecture did not collapse');
  }
  await page.click('#lectureToggleBtn');
  {
    const collapsed = await page.locator('#lectureBody').evaluate((el) => el.classList.contains('collapsed'));
    assert(!collapsed, 'lecture did not expand back');
  }

  // roadmap jumps
  for (let i = 1; i <= 8; i += 1) {
    await page.click(`a[href="#sec${i}"]`);
    await page.waitForTimeout(80);
    const hash = await page.evaluate(() => location.hash);
    assert(hash === `#sec${i}`, `expected hash #sec${i}, got ${hash}`);
  }

  // algorithms run
  await page.click('button.tab-btn[data-tab="algorithms"]');
  await page.selectOption('#alg-source', 'C6');
  await page.selectOption('#alg-ordering', 'welsh-powell');
  await page.click('#alg-build-run');

  const start = Date.now();
  while (Date.now() - start < 35000) {
    const txt = await page.locator('#global-status').innerText();
    if (/Done/i.test(txt)) break;
    await page.waitForTimeout(250);
  }
  const statusNow = await page.locator('#global-status').innerText();
  assert(/Done/i.test(statusNow), `algorithms did not finish as Done (status=${statusNow})`);

  const greedyVertices = await page.locator('#alg-greedy-svg g.vertex').count();
  const backVertices = await page.locator('#alg-back-svg g.vertex').count();
  const chartHasContent = await page.locator('#alg-chart > *').count();

  assert(greedyVertices > 0, 'greedy svg has zero vertices');
  assert(backVertices > 0, 'backtracking svg has zero vertices');
  assert(chartHasContent > 0, 'growth chart has no drawn elements');

  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_02_algorithms_done.png'), fullPage: true });

  // design
  await page.click('button.tab-btn[data-tab="design"]');
  await page.click('#design-run-greedy');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_03_design.png'), fullPage: true });

  // NP
  await page.click('button.tab-btn[data-tab="np"]');
  await page.fill('#np-formula', '(x1 v x2 v -x3) ^ (-x1 v x2 v x3)');
  await page.click('#np-build-reduction');
  const npStart = Date.now();
  while (Date.now() - npStart < 25000) {
    const txt = await page.locator('#np-size-readout').innerText();
    if (txt.includes('Formula:')) break;
    await page.waitForTimeout(150);
  }
  const npReadout = await page.locator('#np-size-readout').innerText();
  assert(npReadout.includes('Formula:'), `np size readout missing formula line (${npReadout})`);
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_04_np.png'), fullPage: true });

  const result = {
    mode: 'desktop',
    statusNow,
    counts: { greedyVertices, backVertices, chartHasContent },
    consoleIssues,
    pageErrors,
    externalRequests: [...externalRequests]
  };
  fs.writeFileSync(path.join(OUT_DIR, 'desktop_report.json'), JSON.stringify(result, null, 2));

  await context.close();
  await browser.close();

  assert(pageErrors.length === 0, `page errors: ${JSON.stringify(pageErrors)}`);
  assert(externalRequests.size === 0, `external requests: ${JSON.stringify([...externalRequests])}`);
  return result;
}

async function runMobile() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_01_initial.png'), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

  await page.click('button.tab-btn[data-tab="algorithms"]');
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_02_algorithms.png'), fullPage: true });

  const result = { mode: 'mobile', overflow };
  fs.writeFileSync(path.join(OUT_DIR, 'mobile_report.json'), JSON.stringify(result, null, 2));

  await context.close();
  await browser.close();

  assert(!overflow, 'mobile horizontal overflow detected');
  return result;
}

(async () => {
  const desktop = await runDesktop();
  const mobile = await runMobile();
  const summary = { ok: true, desktop, mobile };
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
})().catch((err) => {
  const summary = { ok: false, error: err.message || String(err) };
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.error(err);
  process.exit(1);
});
