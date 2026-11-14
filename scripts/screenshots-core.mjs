// Core-pages screenshots + behaviour spot-checks. Run from the project root.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3001";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots/core";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];
const checks = [];
const check = (name, ok) => {
  checks.push([name, ok]);
  console.log(`${ok ? "ok " : "FAIL"} ${name}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function capture(path, name, width) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(`${name}-${width}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`${name}-${width}: pageerror ${e.message}`));
  await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
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
  return page;
}

for (const width of [1440, 390]) {
  (await capture("/vendors", "vendors", width)).close();
  (await capture("/vendors/aperture-marigold-sample", "vendor-profile", width)).close();
  (await capture("/real-weddings/sample-udaipur-lake-wedding", "story", width)).close();
}

// Behaviour spot-checks at 1440.
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
page.on("pageerror", (e) => problems.push(`checks: pageerror ${e.message}`));

// 1. URL filter: /vendors?category=venues shows only the 2 venues.
await page.goto(`${BASE}/vendors?category=venues`, { waitUntil: "load", timeout: 60000 });
await sleep(1200);
const countText = await page.evaluate(() => document.body.innerText.match(/\d+ vendors?/)?.[0] ?? "");
check(`/vendors?category=venues count reads "2 vendors" (got "${countText}")`, countText === "2 vendors");

// 2. Changing the city select updates the URL.
await page.select("select", "");
const selects = await page.$$("select");
await selects[1].select("jaipur");
await sleep(700);
check("city select writes ?city=jaipur to the URL", page.url().includes("city=jaipur"));

// 3. Save button toggles the navbar count.
await page.goto(`${BASE}/vendors`, { waitUntil: "load", timeout: 60000 });
await sleep(1200);
await page.$eval('button[aria-label^="Save"]', (el) => el.click());
await sleep(500);
const savedBadge = await page.evaluate(() => document.querySelector('a[href="/saved"]')?.textContent ?? "");
check(`saving shows 1 in the navbar (got "${savedBadge.trim()}")`, savedBadge.includes("1"));
await page.$eval('button[aria-pressed="true"]', (el) => el.click());

// 4. Profile subnav exists and the viewer opens from the portfolio.
await page.goto(`${BASE}/vendors/aperture-marigold-sample`, { waitUntil: "load", timeout: 60000 });
await sleep(1500);
check("profile subnav renders", !!(await page.$('nav[aria-label="Profile sections"]')));
await page.evaluate(() => document.querySelector("#portfolio button")?.scrollIntoView({ block: "center" }));
await sleep(600);
await page.$eval("#portfolio button", (el) => el.click());
await sleep(900);
check("portfolio opens the photo viewer", !!(await page.$('[aria-label="Photo viewer"]')));
await page.keyboard.press("Escape");
await sleep(500);

// 5. Search overlay suggests a vendor.
await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 60000 });
await sleep(1200);
await page.$eval('button[aria-label="Search"]', (el) => el.click());
await sleep(700);
await page.type("#site-search", "marigold");
await sleep(500);
const suggestions = await page.evaluate(() =>
  Array.from(document.querySelectorAll("#search-suggestions a")).map((a) => a.textContent?.trim() ?? ""),
);
check(
  `search suggests Marigold vendors (got ${suggestions.length})`,
  suggestions.some((s) => s.includes("Marigold")),
);

await page.close();
await browser.close();
const failed = checks.filter(([, ok]) => !ok);
console.log(problems.length ? "console problems:\n" + problems.join("\n") : "no console errors or warnings");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length || problems.length ? 1 : 0);
