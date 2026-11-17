// Round-5 screenshots: the redesigned public profile and the vendor portal
// (overview, photos, pricing) at 1440 and 390, logged in as the demo vendor.
// Needs `next start` on 3001. Run from the project root:
//   node scripts/screenshots-round5.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots/round-5";
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

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 });
  await sleep(800);
  await page.type('input[type="email"]', "vendor@gmail.com");
  await page.type('input[type="password"]', "123456");
  await page.$eval('button[type="submit"]', (el) => el.click());
  await page.waitForFunction(() => location.pathname.startsWith("/vendor-studio"), { timeout: 20000 });
}

for (const width of [1440, 390]) {
  const page = await newPage(width);

  // Public profile (logged out is fine — static render).
  await page.goto(`${BASE}/vendors/aperture-marigold`, { waitUntil: "load", timeout: 60000 });
  await settleAndShoot(page, "vendor-profile", width);

  // Portal, logged in as the demo vendor.
  await login(page);
  check(`${width} login lands in the studio`, page.url().includes("/vendor-studio"));

  for (const [path, name] of [
    ["/vendor-studio", "portal-overview"],
    ["/vendor-studio/photos", "portal-photos"],
    ["/vendor-studio/pricing", "portal-pricing"],
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
    await settleAndShoot(page, name, width);
  }

  // The seeded listing is the published Aperture & Marigold.
  const studioName = await page.evaluate(() => document.body.innerText);
  check(`${width} studio shows Aperture & Marigold`, studioName.includes("Aperture & Marigold"));
  check(`${width} studio shows Published status`, /published/i.test(studioName));

  await page.close();
}

await browser.close();
const failed = checks.filter(([, ok]) => !ok);
console.log(problems.length ? "console problems:\n" + problems.join("\n") : "no console errors or warnings");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length || problems.length ? 1 : 0);
