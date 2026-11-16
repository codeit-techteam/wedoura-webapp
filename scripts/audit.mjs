// Full-site audit: crawl every internal page at 1440 and 390, exercise the
// key interactions, keyboard paths and a layout-shift probe. Needs a running
// production server: BASE_URL=http://localhost:3001 node scripts/audit.mjs
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];
const checks = [];
const check = (name, ok, detail = "") => {
  checks.push([name, ok]);
  console.log(`${ok ? "ok " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

function watch(page, label) {
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(`${label}: console ${m.type()}: ${m.text().slice(0, 160)}`);
  });
  page.on("pageerror", (e) => problems.push(`${label}: pageerror: ${e.message.slice(0, 160)}`));
}

// ---------------------------------------------------------------- 1 · crawl
async function crawl(width) {
  const seen = new Set(["/"]);
  const queue = ["/"];
  const page = await browser.newPage();
  await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
  watch(page, `crawl${width}`);
  let pages = 0;
  const failures = [];

  while (queue.length > 0) {
    const path = queue.shift();
    const response = await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 }).catch(() => null);
    const status = response?.status() ?? 0;
    pages += 1;
    if (status >= 400) failures.push(`${path} -> ${status}`);
    await sleep(500);

    const report = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h.startsWith("/") && !h.startsWith("//"))
        .map((h) => h.split("#")[0])
        .filter(Boolean);
      const bareImgs = Array.from(document.querySelectorAll("img")).filter(
        (img) => !img.getAttribute("width") && getComputedStyle(img).position !== "absolute",
      ).length;
      return {
        links: [...new Set(links)],
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        title: document.title,
        bareImgs,
      };
    });

    if (report.overflow > 0) failures.push(`${path} overflows ${report.overflow}px @${width}`);
    if (!report.title) failures.push(`${path} has no <title>`);
    if (report.bareImgs > 0) failures.push(`${path} has ${report.bareImgs} img(s) without dimensions`);
    for (const link of report.links) {
      const clean = link.split("?")[0];
      if (!seen.has(clean)) {
        seen.add(clean);
        queue.push(clean);
      }
    }
  }
  await page.close();
  check(`crawl @${width}: ${pages} pages, all 200, no overflow, titled, sized images`, failures.length === 0, failures.join("; "));
}

await crawl(1440);
await crawl(390);

// --------------------------------------------------------- 2 · interactions
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
watch(page, "interact");
const goto = async (path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
  await sleep(1000);
};

// Navbar panels + search
await goto("/");
await page.hover('button[aria-controls="vendors-panel"]');
await sleep(700);
check("vendors panel opens on hover", !!(await page.$("#vendors-panel")));
await page.keyboard.press("Escape");
await page.$eval('button[aria-label="Search"]', (el) => el.click());
await sleep(600);
await page.type("#site-search", "udai");
await sleep(400);
const suggestion = await page.$("#search-suggestions a");
check("search suggests for 'udai'", !!suggestion);
if (suggestion) {
  await suggestion.click();
  await sleep(900);
  check("suggestion navigates", page.url().includes("city=udaipur") || page.url().includes("/vendors"));
}

// Home tabs crossfade
await goto("/");
await page.$$eval('[role="tab"]', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(600);
check("home tab writes ?category=venues", page.url().includes("category=venues"));

// Vendors: budget filter + load more + bottom sheet at 390
await goto("/vendors");
const selects = await page.$$("select");
await selects[2].select("b3");
await sleep(600);
const b3Count = await page.evaluate(() => document.body.innerText.match(/\d+ vendors?/)?.[0]);
check(`budget b3 filters (got "${b3Count}")`, b3Count === "2 vendors");
await selects[3].select("price-asc");
await sleep(500);
check("sort writes URL", page.url().includes("sort=price-asc"));
await goto("/vendors");
await page.$$eval("button", (btns) => btns.find((b) => b.textContent?.trim() === "Show more")?.click());
await sleep(500);
const afterMore = await page.evaluate(
  () => document.querySelectorAll('main a[href^="/vendors/"] img').length,
);
check(`load more shows all 12 cards (got ${afterMore})`, afterMore === 12);

const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
watch(mobile, "mobile");
await mobile.goto(`${BASE}/vendors`, { waitUntil: "load", timeout: 60000 });
await sleep(1000);
await mobile.$$eval("button", (btns) => btns.find((b) => b.textContent?.includes("Filters"))?.click());
await sleep(700);
check("mobile filter bottom sheet opens", !!(await mobile.$('[role="dialog"][aria-label="Filters"]')));
await mobile.keyboard.press("Escape");
await sleep(500);
check("Escape closes the sheet", !(await mobile.$('[role="dialog"][aria-label="Filters"]')));
await mobile.close();

// Profile: subnav anchor, viewer, album, inquiry validation + success, sticky bar
await goto("/vendors/aperture-marigold");
await page.$$eval('nav[aria-label="Profile sections"] a', (links) => links.find((l) => l.textContent === "Pricing")?.click());
await sleep(900);
check("subnav anchor scrolls to pricing", await page.evaluate(() => Math.abs(document.getElementById("pricing").getBoundingClientRect().top) < 300));
await page.evaluate(() => document.querySelector("#portfolio button")?.scrollIntoView({ block: "center" }));
await sleep(400);
await page.$eval("#portfolio button", (el) => el.click());
await sleep(800);
check("portfolio viewer opens", !!(await page.$('[aria-label="Photo viewer"]')));
await page.keyboard.press("ArrowRight");
await sleep(400);
await page.keyboard.press("Escape");
await sleep(1000);
check("Escape closes viewer", !(await page.$('[aria-label="Photo viewer"]')));
await page.evaluate(() => document.querySelector("#albums button")?.scrollIntoView({ block: "center" }));
await sleep(300);
await page.$eval("#albums button", (el) => el.click());
await sleep(800);
check("album opens its sequence", !!(await page.$('[aria-label="Photo viewer"]')));
await page.keyboard.press("Escape");
await sleep(400);
await page.evaluate(() => document.getElementById("inquiry")?.scrollIntoView());
await sleep(500);
await page.$eval('#inquiry button[type="submit"]', (el) => el.click());
await sleep(400);
check("inquiry shows validation errors", (await page.$$('#inquiry [role="alert"]')).length >= 3);
await page.type("#inq-name", "Test Person");
await page.type("#inq-whatsapp", "+91 9876543210");
await page.type("#inq-city", "Udaipur");
await page.type("#inq-message", "A two-day wedding in October, around 150 guests.");
await page.$eval('#inquiry button[type="submit"]', (el) => el.click());
await sleep(600);
check("inquiry success state", !!(await page.$('#inquiry [role="status"]')));

// Venue tour loads PSV on demand
await goto("/venues/bagh-e-noor-palace");
await page.evaluate(() => Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Step inside")?.scrollIntoView({ block: "center" }));
await sleep(400);
await page.$$eval("button", (btns) => btns.find((b) => b.textContent?.trim() === "Step inside")?.click());
await sleep(4000);
check("360 tour canvas appears", !!(await page.$(".psv-canvas")));
const spaceButtons = await page.$$('[aria-label="Spaces in this tour"] button');
check(`tour lists 3 spaces (got ${spaceButtons.length})`, spaceButtons.length === 3);
if (spaceButtons[1]) {
  await spaceButtons[1].click();
  await sleep(2500);
  check("space strip switches node", await page.evaluate(() => document.querySelector('[aria-label="Spaces in this tour"] button[aria-pressed="true"]')?.textContent === "The lawn"));
}

// Gallery filter + viewer + vendor link
await goto("/gallery");
await page.$$eval('[role="tab"]', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(600);
check("gallery filter writes URL", page.url().includes("category=venues"));
await page.$eval('main button[aria-label^="Open"]', (el) => el.click());
await sleep(800);
check("gallery viewer opens with vendor link", !!(await page.$('[aria-label="Photo viewer"] a')));
await page.keyboard.press("Escape");

// Saved: both kinds + remove
await goto("/real-weddings");
await page.$eval('button[aria-label^="Save"]', (el) => el.click());
await goto("/vendors");
await page.$eval('button[aria-label^="Save"]', (el) => el.click());
await goto("/saved");
const vendorCount = await page.evaluate(() => document.body.innerText.includes("Vendors (1)"));
const storyCount = await page.evaluate(() => document.body.innerText.includes("Stories (1)"));
check("saved shows one vendor and one story", vendorCount && storyCount);
await page.$$eval('[role="tab"]', (tabs) => tabs.find((t) => t.textContent?.startsWith("Stories"))?.click());
await sleep(500);
await page.$eval('button[aria-pressed="true"]', (el) => el.click());
await sleep(500);
check("story removed from saved", await page.evaluate(() => document.body.innerText.includes("No stories saved yet")));

// Honeymoon panel
await goto("/honeymoon");
await page.$eval('ul[aria-label="Destinations"] button', (el) => el.click());
await sleep(700);
check("honeymoon panel opens via URL", page.url().includes("place=") && !!(await page.$('section[aria-label]')));

// Blogs filter + article
await goto("/blogs");
await page.$$eval('[role="tab"]', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(500);
check("blogs filter works", page.url().includes("category=venues"));

// Signup steps
await goto("/list-your-business");
await page.evaluate(() => document.querySelector("form")?.scrollIntoView());
await sleep(400);
await page.$eval('form button[type="submit"]', (el) => el.click());
await sleep(300);
check("signup step 1 validates", (await page.$$('form [role="alert"]')).length === 1);
await page.type("#su-business", "Test Films");
await page.$eval('form button[type="submit"]', (el) => el.click());
await sleep(500);
check("signup advances to step 2", !!(await page.$("#su-category")));

// Login validation
await goto("/login");
await page.$eval('button[type="submit"]', (el) => el.click());
await sleep(300);
check("login validates", (await page.$$('[role="alert"]')).length === 2);

// Studio tabs
await goto("/vendor-studio?tab=inquiries");
check("studio deep link works", await page.evaluate(() => document.body.innerText.includes("Sample · 2 days ago")));

// 404 (on an unwatched page: the 404 response itself logs a console error)
{
  const p404 = await browser.newPage();
  await p404.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const notFoundResponse = await p404.goto(`${BASE}/this-page-does-not-exist`, { waitUntil: "load" });
  check(
    "unknown URL returns 404 page",
    notFoundResponse.status() === 404 && (await p404.evaluate(() => document.body.innerText.includes("wandered off"))),
  );
  await p404.close();
}

// Footer FAQ anchor
await goto("/about");
await page.$$eval('a[href="/#faq"]', (links) => links[0]?.click());
await sleep(1500);
check("footer FAQ link lands on the homepage FAQ", await page.evaluate(() => !!document.getElementById("faq") && Math.abs(document.getElementById("faq").getBoundingClientRect().top) < window.innerHeight));

// ------------------------------------------------------------- 3 · keyboard
await goto("/");
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
const focusInfo = await page.evaluate(() => {
  const el = document.activeElement;
  const style = getComputedStyle(el, ":focus-visible");
  return { tag: el?.tagName, hasOutlineRule: style.outlineStyle !== "none" || true, inHeader: !!el?.closest("header") };
});
check("tab reaches the navbar", focusInfo.inHeader);
const outline = await page.evaluate(() => {
  const probe = document.querySelector("header a, header button");
  probe.focus();
  return getComputedStyle(probe).outlineColor;
});
check("focus outline is the gold token", outline.includes("168") || outline.includes("rgb(168, 134, 74)"));

// --------------------------------------------------------------- 4 · CLS
for (const path of ["/", "/vendors/aperture-marigold", "/real-weddings/udaipur-lake-wedding"]) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
  await sleep(1500);
  await p.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await sleep(500);
  const cls = await p.evaluate(() => window.__cls);
  check(`CLS on ${path} ≤ 0.1 (got ${cls.toFixed(4)})`, cls <= 0.1);
  await p.close();
}

await page.close();
await browser.close();
const failed = checks.filter(([, ok]) => !ok);
console.log(problems.length ? "console problems:\n" + [...new Set(problems)].join("\n") : "no console errors or warnings");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length || problems.length ? 1 : 0);
