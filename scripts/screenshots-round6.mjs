// Round-6 screenshots: the redesigned homepage and a vendor profile at 1440
// and 390 (full page), after the type/colour/spacing pass.
// Needs `next start` on 3001. Run from the project root:
//   node scripts/screenshots-round6.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots/round-6";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];
const checks = [];
const check = (name, ok) => {
  checks.push([name, ok]);
  console.log(`${ok ? "ok " : "FAIL"} ${name}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function newPage(width) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(`${width}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`${width}: pageerror ${e.message}`));
  page.on("requestfailed", (r) => problems.push(`${width}: requestfailed ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${width}: HTTP ${r.status()} ${r.url()}`);
  });
  return page;
}

async function settleAndShoot(page, name, width) {
  await sleep(1300);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await sleep(1000);
  check(
    `${name}-${width} no horizontal overflow`,
    (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0,
  );
  await page.screenshot({ path: join(OUT, `${name}-${width}.png`), fullPage: true });
  console.log("saved", `${name}-${width}.png`);
}

for (const width of [1440, 390]) {
  const page = await newPage(width);

  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 60000 });
  await settleAndShoot(page, "home", width);
  const homeText = await page.evaluate(() => document.body.innerText);
  // innerText reflects the label's CSS uppercasing, so match case-insensitively.
  check(`${width} no partner band`, !/in partnership with/i.test(homeText));
  const featuredCount = await page.$$eval(
    'section[aria-label="Featured vendors"] li > div > a[href^="/vendors/"]',
    (els) => els.length,
  );
  check(`${width} featured grid shows six cards`, featuredCount === 6);

  await page.goto(`${BASE}/vendors/aperture-marigold`, { waitUntil: "load", timeout: 60000 });
  await settleAndShoot(page, "vendor-profile", width);

  await page.close();
}

await browser.close();
const failed = checks.filter(([, ok]) => !ok);
console.log(problems.length ? "console problems:\n" + problems.join("\n") : "no console errors or warnings");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length || problems.length ? 1 : 0);
