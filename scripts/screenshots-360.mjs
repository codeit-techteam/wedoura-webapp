// 360° feature screenshots: badges in grids, a 360 photo open in the sphere
// viewer at 1440 and 390, and the linked venue tour. Needs `next start` on
// 3001 (or BASE_URL). Run from the project root:
//   node scripts/screenshots-360.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots/360";
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
  await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1, hasTouch: width === 390 });
  page.on("pageerror", (e) => problems.push(`${width}: pageerror ${e.message}`));
  return page;
}

async function shoot(page, name, width, fullPage = false) {
  await page.screenshot({ path: join(OUT, `${name}-${width}.png`), fullPage });
  console.log("saved", `${name}-${width}.png`);
}

for (const width of [1440, 390]) {
  const page = await newPage(width);

  // Badges in the venue portfolio grid
  await page.goto(`${BASE}/venues/bagh-e-noor-palace`, { waitUntil: "load", timeout: 60000 });
  await sleep(1200);
  await page.evaluate(() => document.getElementById("portfolio")?.scrollIntoView({ block: "start" }));
  await sleep(1500);
  const badges = await page.$$eval("#portfolio button", (btns) =>
    btns.filter((b) => b.textContent?.includes("360°")).length,
  );
  check(`${width} portfolio shows 360 badges (got ${badges})`, badges >= 3);
  await shoot(page, "grid-badges", width);

  // A 360 photo opens in the sphere viewer
  await page.$$eval("#portfolio button", (btns) => btns.find((b) => b.textContent?.includes("360°"))?.click());
  const sphereUp = await page
    .waitForSelector('[aria-label="Photo viewer"] .psv-canvas', { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  check(`${width} 360 photo opens Photo Sphere Viewer`, sphereUp);
  await sleep(2500);
  await shoot(page, "sphere-viewer", width);
  const prevNextVisible = await page.$$eval('[aria-label="Photo viewer"] button', (btns) =>
    btns.filter((b) => ["Previous photo", "Next photo"].includes(b.getAttribute("aria-label") ?? "")).every(
      (b) => getComputedStyle(b).display !== "none",
    ),
  );
  check(`${width} Prev/Next visible on 360 slide`, prevNextVisible);
  // Arrow keys still step photos: moving from the 360 slide lands on a flat one.
  await page.keyboard.press("ArrowRight");
  await sleep(1500);
  const flatAfterArrow = await page.$('[aria-label="Photo viewer"] img');
  check(`${width} arrow key steps off the 360 photo`, !!flatAfterArrow);
  await page.keyboard.press("Escape");
  await sleep(600);

  // The linked venue tour
  await page.evaluate(() =>
    Array.from(document.querySelectorAll("button"))
      .find((b) => b.textContent?.trim() === "Step inside")
      ?.scrollIntoView({ block: "center" }),
  );
  await sleep(400);
  await shoot(page, "tour-still", width);
  await page.$$eval("button", (btns) => btns.find((b) => b.textContent?.trim() === "Step inside")?.click());
  const tourUp = await page
    .waitForSelector(".psv-canvas", { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  check(`${width} tour canvas appears`, tourUp);
  await sleep(3500);
  await shoot(page, "tour-open", width);
  const spaceButtons = await page.$$('[aria-label="Spaces in this tour"] button');
  check(`${width} tour lists 3 spaces (got ${spaceButtons.length})`, spaceButtons.length === 3);
  if (spaceButtons[1]) {
    await spaceButtons[1].click();
    await sleep(2500);
    await shoot(page, "tour-second-scene", width);
  }

  // Badge on a photographer's profile grid too
  await page.goto(`${BASE}/vendors/aperture-marigold`, { waitUntil: "load", timeout: 60000 });
  await sleep(1000);
  await page.evaluate(() => document.getElementById("portfolio")?.scrollIntoView({ block: "start" }));
  await sleep(1200);
  const photographerBadges = await page.$$eval("#portfolio button", (btns) =>
    btns.filter((b) => b.textContent?.includes("360°")).length,
  );
  check(`${width} photographer portfolio has a 360 badge`, photographerBadges >= 1);

  await page.close();
}

await browser.close();
const failed = checks.filter(([, ok]) => !ok);
if (problems.length) console.log("page errors:\n" + problems.join("\n"));
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
