# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tmp_browser_qa.spec.js >> mobile layout smoke pass
- Location: tmp_browser_qa.spec.js:107:1

# Error details

```
Error: expect(received).toBeFalsy()

Received: true
```

# Test source

```ts
  29  |   page.on('request', (req) => {
  30  |     const u = new URL(req.url());
  31  |     const allowedLocal = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname === '127.0.0.1' || u.hostname === 'localhost');
  32  |     const allowedSpecial = ['data:', 'blob:', 'about:'].includes(u.protocol);
  33  |     if (!allowedLocal && !allowedSpecial) {
  34  |       externalRequests.add(req.url());
  35  |     }
  36  |   });
  37  | 
  38  |   await page.goto(BASE, { waitUntil: 'networkidle' });
  39  |   await page.setViewportSize({ width: 1440, height: 900 });
  40  | 
  41  |   await page.screenshot({ path: path.join(OUT_DIR, 'desktop_01_initial.png'), fullPage: true });
  42  | 
  43  |   // Lecture anchors + collapse/expand
  44  |   await expect(page.locator('#sec1')).toBeVisible();
  45  |   await expect(page.locator('#sec8')).toBeVisible();
  46  | 
  47  |   const lectureBody = page.locator('#lectureBody');
  48  |   await expect(lectureBody).not.toHaveClass(/collapsed/);
  49  |   await page.locator('#lectureToggleBtn').click();
  50  |   await expect(lectureBody).toHaveClass(/collapsed/);
  51  |   await page.locator('#lectureToggleBtn').click();
  52  |   await expect(lectureBody).not.toHaveClass(/collapsed/);
  53  | 
  54  |   for (let i = 1; i <= 8; i += 1) {
  55  |     await page.locator(`a[href="#sec${i}"]`).click();
  56  |     await expect(page).toHaveURL(new RegExp(`#sec${i}$`));
  57  |     await expect(page.locator(`#sec${i}`)).toBeVisible();
  58  |   }
  59  | 
  60  |   // Algorithms tab run
  61  |   await page.getByRole('tab', { name: 'Algorithms' }).click();
  62  |   await page.selectOption('#alg-source', 'C6');
  63  |   await page.selectOption('#alg-ordering', 'welsh-powell');
  64  |   await page.click('#alg-build-run');
  65  | 
  66  |   await expect(page.locator('#global-status')).toHaveText(/Running|Done/, { timeout: 5000 });
  67  |   await expect(page.locator('#global-status')).toHaveText(/Done/, { timeout: 30000 });
  68  | 
  69  |   const greedyVertices = await page.locator('#alg-greedy-svg g.vertex').count();
  70  |   const backVertices = await page.locator('#alg-back-svg g.vertex').count();
  71  |   const chartHasContent = await page.locator('#alg-chart > *').count();
  72  | 
  73  |   await page.screenshot({ path: path.join(OUT_DIR, 'desktop_02_algorithms_done.png'), fullPage: true });
  74  | 
  75  |   // Design tab
  76  |   await page.getByRole('tab', { name: 'Design' }).click();
  77  |   await page.click('#design-run-greedy');
  78  |   await page.screenshot({ path: path.join(OUT_DIR, 'desktop_03_design.png'), fullPage: true });
  79  | 
  80  |   // NP tab
  81  |   await page.getByRole('tab', { name: 'NP-Completeness' }).click();
  82  |   await page.fill('#np-formula', '(x1 v x2 v -x3) ^ (-x1 v x2 v x3)');
  83  |   await page.click('#np-build-reduction');
  84  |   await expect(page.locator('#np-size-readout')).toContainText('Formula:', { timeout: 20000 });
  85  |   await page.screenshot({ path: path.join(OUT_DIR, 'desktop_04_np.png'), fullPage: true });
  86  | 
  87  |   const result = {
  88  |     mode: 'desktop',
  89  |     consoleIssues,
  90  |     pageErrors,
  91  |     externalRequests: [...externalRequests],
  92  |     counts: {
  93  |       greedyVertices,
  94  |       backVertices,
  95  |       chartHasContent
  96  |     }
  97  |   };
  98  |   fs.writeFileSync(path.join(OUT_DIR, 'desktop_report.json'), JSON.stringify(result, null, 2));
  99  | 
  100 |   expect(pageErrors, `page errors: ${JSON.stringify(pageErrors)}`).toEqual([]);
  101 |   expect(externalRequests.size, `external requests: ${[...externalRequests].join(', ')}`).toBe(0);
  102 |   expect(greedyVertices).toBeGreaterThan(0);
  103 |   expect(backVertices).toBeGreaterThan(0);
  104 |   expect(chartHasContent).toBeGreaterThan(0);
  105 | });
  106 | 
  107 | test('mobile layout smoke pass', async ({ browser }) => {
  108 |   ensureDir();
  109 |   const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  110 |   const page = await context.newPage();
  111 |   await page.goto(BASE, { waitUntil: 'networkidle' });
  112 | 
  113 |   await page.screenshot({ path: path.join(OUT_DIR, 'mobile_01_initial.png'), fullPage: true });
  114 | 
  115 |   // Ensure no hard horizontal overflow.
  116 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  117 | 
  118 |   // Open algorithms tab and capture.
  119 |   await page.getByRole('tab', { name: 'Algorithms' }).click();
  120 |   await page.screenshot({ path: path.join(OUT_DIR, 'mobile_02_algorithms.png'), fullPage: true });
  121 | 
  122 |   const result = {
  123 |     mode: 'mobile',
  124 |     overflow
  125 |   };
  126 |   fs.writeFileSync(path.join(OUT_DIR, 'mobile_report.json'), JSON.stringify(result, null, 2));
  127 | 
  128 |   await context.close();
> 129 |   expect(overflow).toBeFalsy();
      |                    ^ Error: expect(received).toBeFalsy()
  130 | });
  131 | 
```