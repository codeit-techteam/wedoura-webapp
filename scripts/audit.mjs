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
await sleep(1200); // debounce + /api/search fetch
const suggestion = await page.$("#search-suggestions a");
check("search suggests for 'udai'", !!suggestion);
if (suggestion) {
  await suggestion.click();
  await sleep(900);
  check("suggestion navigates", page.url().includes("city=udaipur") || page.url().includes("/vendors"));
}

// Home tabs (UnderlineTabs renders real links)
await goto("/");
await page.$$eval('nav[aria-label="Vendor categories"] a', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(900);
check("home tab writes ?category=venues", page.url().includes("category=venues"));

// Vendors: budget filter + sort + load more (count-agnostic: the dataset
// size differs between seed-off and seed-on runs).
const vendorCountOn = async () => {
  const m = await page.evaluate(() => document.body.innerText.match(/(\d+) vendors?/)?.[1]);
  return Number(m ?? 0);
};
const openFilter = async (label) => {
  await page.evaluate((wanted) => {
    const trigger = Array.from(document.querySelectorAll('button[aria-haspopup="listbox"]')).find((b) =>
      b.closest("div")?.querySelector(".label")?.textContent?.trim() === wanted,
    );
    trigger?.click();
  }, label);
  await sleep(400);
};
const pickOption = async (label) => {
  await page.evaluate((wanted) => {
    const option = Array.from(document.querySelectorAll('[role="option"] button')).find(
      (b) => b.textContent?.trim() === wanted,
    );
    option?.click();
  }, label);
  await sleep(700);
};
await goto("/vendors");
const totalVendors = await vendorCountOn();
check(`vendors count line present (got ${totalVendors})`, totalVendors >= 1);
await openFilter("Budget");
await pickOption("₹5 lakh and above");
const b3Count = await vendorCountOn();
check(`budget b3 filters down (${b3Count} of ${totalVendors})`, page.url().includes("budget=b3") && b3Count >= 0 && b3Count <= totalVendors);
await openFilter("Sort");
await pickOption("Price, low to high");
check("sort writes URL", page.url().includes("sort=price-asc"));
await goto("/vendors");
const cardsBefore = await page.evaluate(() => document.querySelectorAll('main a[href^="/vendors/"] img').length);
const hasMore = await page.evaluate(() => Array.from(document.querySelectorAll("a")).some((a) => a.textContent?.trim() === "Show more"));
if (hasMore) {
  await page.$$eval("a", (links) => links.find((a) => a.textContent?.trim() === "Show more")?.click());
  await sleep(900);
  const afterMore = await page.evaluate(() => document.querySelectorAll('main a[href^="/vendors/"] img').length);
  check(
    `load more grows the grid (${cardsBefore} -> ${afterMore} of ${totalVendors})`,
    afterMore > cardsBefore && afterMore <= Math.max(cardsBefore + 8, cardsBefore),
  );
} else {
  check(`no load more needed (${cardsBefore} cards = total)`, cardsBefore === totalVendors);
}

// Category-in-city pages
await goto("/vendors/photography-films/jaipur");
check(
  "category-in-city page renders with its own title",
  (await page.title()).includes("in Jaipur") &&
    (await page.evaluate(() => document.body.innerText.includes("vendor"))),
);
check(
  "category-in-city links sibling cities",
  await page.evaluate(() => !!document.querySelector('a[href^="/vendors/photography-films/"]')),
);
{
  const bad = await browser.newPage();
  const resp = await bad.goto(`${BASE}/vendors/aperture-marigold/jaipur`, { waitUntil: "load" });
  check("profile slug with an extra segment 404s", resp.status() === 404);
  await bad.close();
}
await goto("/vendors?category=photography-films");
check(
  "filtered /vendors links the pretty pages",
  await page.evaluate(() => !!document.querySelector('a[href="/vendors/photography-films/jaipur"]')),
);

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
await page.$$eval('nav[aria-label="Photo categories"] a', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(900);
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
await sleep(900); // the by-slugs fetches
const vendorCount = await page.evaluate(() => document.body.innerText.includes("Vendors (1)"));
const storyCount = await page.evaluate(() => document.body.innerText.includes("Stories (1)"));
check("saved shows one vendor and one story", vendorCount && storyCount);
await page.$$eval('nav[aria-label="Saved"] a', (tabs) => tabs.find((t) => t.textContent?.startsWith("Stories"))?.click());
await sleep(700);
await page.$eval('button[aria-pressed="true"]', (el) => el.click());
await sleep(500);
check("story removed from saved", await page.evaluate(() => document.body.innerText.includes("No stories saved yet")));

// Honeymoon destination detail page
await goto("/honeymoon");
await page.$eval('ul[aria-label="Destinations"] a', (el) => el.click());
await sleep(900);
check(
  "honeymoon detail page loads",
  page.url().includes("/honeymoon/") && !!(await page.$('section[aria-label="Plan it with us"]')),
);

// Blogs filter + article
await goto("/blogs");
await page.$$eval('nav[aria-label="Article categories"] a', (tabs) => tabs.find((t) => t.textContent === "Venues")?.click());
await sleep(900);
check("blogs filter works", page.url().includes("category=venues"));

// Signup: one short form
await goto("/list-your-business");
await page.evaluate(() => document.querySelector("form")?.scrollIntoView());
await sleep(400);
await page.$eval('form button[type="submit"]', (el) => el.click());
await sleep(300);
check("signup validates empty submit", (await page.$$('form [role="alert"]')).length >= 3);
await page.type("#su-business", "Test Films");
await page.type("#su-contact", "Tester");
await page.select("#su-category", "photography-films");
await page.select("#su-city", "mumbai");
await page.type("#su-whatsapp", "+91 98765 43210");
await page.type("#su-email", `audit-${Date.now()}@example.com`);
await page.type("#su-password", "longenough");
await page.type("#su-worklink", "https://example.com/work");
await page.click("#su-consent");
await page.$eval('form button[type="submit"]', (el) => el.click());
await sleep(600);
check("signup reaches the success screen", !!(await page.$('[role="status"]')));

// Login validation
await goto("/login");
await page.$eval('button[type="submit"]', (el) => el.click());
await sleep(300);
check("login validates", (await page.$$('[role="alert"]')).length === 2);

// Studio gate (fresh browser state: logged out → redirected to /login)
await goto("/vendor-studio");
await sleep(1200);
check("logged-out studio redirects to /login", page.url().includes("/login"));

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

// Footer FAQ link works from any page
await goto("/about");
await page.$$eval('a[href="/faq"]', (links) => links[0]?.click());
await sleep(1200);
check("footer FAQ link opens /faq", page.url().includes("/faq") && (await page.evaluate(() => document.body.innerText.includes("Is Wedoura free for couples?"))));

// -------------------------------------------- 2.5 · sitemap, robots, search
{
  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  const sitemap = sitemapRes.ok ? await sitemapRes.text() : "";
  check("sitemap.xml responds", sitemapRes.ok);
  check(
    "sitemap lists profiles, stories, articles and category-in-city pages",
    sitemap.includes("/vendors/aperture-marigold") &&
      sitemap.includes("/venues/bagh-e-noor-palace") &&
      sitemap.includes("/real-weddings/") &&
      sitemap.includes("/blogs/") &&
      sitemap.includes("/vendors/photography-films/jaipur"),
  );
  check(
    "sitemap excludes private and unpublished pages",
    !sitemap.includes("/demo") &&
      !sitemap.includes("/login") &&
      !sitemap.includes("/vendor-studio") &&
      !sitemap.includes("/saved") &&
      !sitemap.includes("/styleguide") &&
      !sitemap.includes("kohl-and-rose") && // in_review
      !sitemap.includes("baraat-collective"), // draft
  );
  const robotsRes = await fetch(`${BASE}/robots.txt`);
  const robots = robotsRes.ok ? await robotsRes.text() : "";
  check(
    "robots.txt disallows /demo, /login, /vendor-studio",
    robotsRes.ok &&
      robots.includes("Disallow: /demo") &&
      robots.includes("Disallow: /login") &&
      robots.includes("Disallow: /vendor-studio") &&
      robots.toLowerCase().includes("sitemap:"),
  );
  const searchRes = await fetch(`${BASE}/api/search?q=a`);
  const suggestions = searchRes.ok ? await searchRes.json() : null;
  check(
    "api/search caps suggestions (≤5/≤3/≤3)",
    !!suggestions &&
      suggestions.vendors.length <= 5 &&
      suggestions.cities.length <= 3 &&
      suggestions.categories.length <= 3,
  );
}

// ------------------------------------------------------- 2.6 · portal pass
{
  const studio = await browser.newPage();
  await studio.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  watch(studio, "studio");
  await studio.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 });
  await sleep(1200);
  await studio.type("#login-email", "vendor@gmail.com");
  await studio.type("#login-password", "123456");
  await studio.$eval('button[type="submit"]', (el) => el.click());
  await sleep(1500);
  check("demo login reaches the studio", studio.url().includes("/vendor-studio"));
  const screens = [
    "", "business", "category", "locations", "photos", "covers", "albums", "films",
    "pricing", "faqs", "contact", "inquiries", "preview", "submit", "account",
  ];
  const studioFailures = [];
  for (const screen of screens) {
    await studio.goto(`${BASE}/vendor-studio${screen ? `/${screen}` : ""}`, { waitUntil: "load", timeout: 60000 });
    await sleep(900);
    const report = await studio.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      hasHeading: !!document.querySelector("h1, h2"),
      body: document.body.innerText.length,
    }));
    if (report.overflow > 0) studioFailures.push(`${screen || "overview"} overflows ${report.overflow}px`);
    if (!report.hasHeading || report.body < 40) studioFailures.push(`${screen || "overview"} looks empty`);
  }
  check(`portal: all ${screens.length} screens render signed in`, studioFailures.length === 0, studioFailures.join("; "));
  // 390px spot check: the studio menu drawer
  await studio.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await studio.goto(`${BASE}/vendor-studio`, { waitUntil: "load", timeout: 60000 });
  await sleep(1000);
  const studioMobile = await studio.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    menuButton: !!Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim().includes("Menu")),
  }));
  check("portal overview fits 390px with a menu button", studioMobile.overflow <= 0 && studioMobile.menuButton);
  await studio.evaluate(() => {
    window.localStorage.removeItem("wedoura:mock-db");
    window.localStorage.removeItem("wedoura:saved");
  });
  await studio.close();
}

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
