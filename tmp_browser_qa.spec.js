const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:4173/index.html';
const OUT_DIR = path.join(__dirname, 'docs', 'qa_artifacts');

function ensureDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

test('desktop browser QA pass', async ({ page }) => {
  ensureDir();
  const consoleIssues = [];
  const pageErrors = [];
  const externalRequests = new Set();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') {
      consoleIssues.push({ type: t, text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  page.on('request', (req) => {
    const u = new URL(req.url());
    const allowedLocal = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname === '127.0.0.1' || u.hostname === 'localhost');
    const allowedSpecial = ['data:', 'blob:', 'about:'].includes(u.protocol);
    if (!allowedLocal && !allowedSpecial) {
      externalRequests.add(req.url());
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_01_initial.png'), fullPage: true });

  // Lecture anchors + collapse/expand
  await expect(page.locator('#sec1')).toBeVisible();
  await expect(page.locator('#sec8')).toBeVisible();

  const lectureBody = page.locator('#lectureBody');
  await expect(lectureBody).not.toHaveClass(/collapsed/);
  await page.locator('#lectureToggleBtn').click();
  await expect(lectureBody).toHaveClass(/collapsed/);
  await page.locator('#lectureToggleBtn').click();
  await expect(lectureBody).not.toHaveClass(/collapsed/);

  for (let i = 1; i <= 8; i += 1) {
    await page.locator(`a[href="#sec${i}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#sec${i}$`));
    await expect(page.locator(`#sec${i}`)).toBeVisible();
  }

  // Algorithms tab run
  await page.getByRole('tab', { name: 'Algorithms' }).click();
  await page.selectOption('#alg-source', 'C6');
  await page.selectOption('#alg-ordering', 'welsh-powell');
  await page.click('#alg-build-run');

  await expect(page.locator('#global-status')).toHaveText(/Running|Done/, { timeout: 5000 });
  await expect(page.locator('#global-status')).toHaveText(/Done/, { timeout: 30000 });

  const greedyVertices = await page.locator('#alg-greedy-svg g.vertex').count();
  const backVertices = await page.locator('#alg-back-svg g.vertex').count();
  const chartHasContent = await page.locator('#alg-chart > *').count();

  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_02_algorithms_done.png'), fullPage: true });

  // Design tab
  await page.getByRole('tab', { name: 'Design' }).click();
  await page.click('#design-run-greedy');
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_03_design.png'), fullPage: true });

  // NP tab
  await page.getByRole('tab', { name: 'NP-Completeness' }).click();
  await page.fill('#np-formula', '(x1 v x2 v -x3) ^ (-x1 v x2 v x3)');
  await page.click('#np-build-reduction');
  await expect(page.locator('#np-size-readout')).toContainText('Formula:', { timeout: 20000 });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop_04_np.png'), fullPage: true });

  const result = {
    mode: 'desktop',
    consoleIssues,
    pageErrors,
    externalRequests: [...externalRequests],
    counts: {
      greedyVertices,
      backVertices,
      chartHasContent
    }
  };
  fs.writeFileSync(path.join(OUT_DIR, 'desktop_report.json'), JSON.stringify(result, null, 2));

  expect(pageErrors, `page errors: ${JSON.stringify(pageErrors)}`).toEqual([]);
  expect(externalRequests.size, `external requests: ${[...externalRequests].join(', ')}`).toBe(0);
  expect(greedyVertices).toBeGreaterThan(0);
  expect(backVertices).toBeGreaterThan(0);
  expect(chartHasContent).toBeGreaterThan(0);
});

test('mobile layout smoke pass', async ({ browser }) => {
  ensureDir();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_01_initial.png'), fullPage: true });

  // Ensure no hard horizontal overflow.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

  // Open algorithms tab and capture.
  await page.getByRole('tab', { name: 'Algorithms' }).click();
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_02_algorithms.png'), fullPage: true });

  const result = {
    mode: 'mobile',
    overflow
  };
  fs.writeFileSync(path.join(OUT_DIR, 'mobile_report.json'), JSON.stringify(result, null, 2));

  await context.close();
  expect(overflow).toBeFalsy();
});
