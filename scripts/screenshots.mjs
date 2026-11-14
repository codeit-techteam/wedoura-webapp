// Captures the site chrome at 390px and 1440px into docs/screenshots and
// checks keyboard behaviour and reduced motion along the way.
// Needs a running dev or start server and a local Chrome.
//   BASE_URL=http://localhost:3001 npm run screenshots
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs/screenshots");
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const problems = [];
const checks = [];
const check = (name, ok) => {
  checks.push([name, ok]);
  console.log(`${ok ? "ok " : "FAIL"} ${name}`);
};

async function session(width, height, mobile, run) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(`${width}: ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`${width}: pageerror: ${e.message}`));
  const shot = async (name) => {
    await sleep(500);
    await page.screenshot({ path: join(OUT, `${name}-${width}.png`) });
    console.log("saved", `${name}-${width}.png`);
  };
  await run(page, shot, width);
  await page.close();
}

const scroll = async (page, y) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await sleep(350);
};

// Click with a diagnostic when Puppeteer cannot find a clickable point.
async function click(page, selector) {
  try {
    await page.click(selector);
  } catch (error) {
    const state = await page.$eval(selector, (el) => {
      const r = el.getBoundingClientRect();
      const header = el.closest("header");
      return { rect: [r.left, r.top, r.width, r.height], display: getComputedStyle(el).display, headerHidden: header?.dataset.hidden, scrollY: window.scrollY };
    });
    check(`click ${selector} (${error.message}; ${JSON.stringify(state)})`, false);
    await page.$eval(selector, (el) => el.click());
  }
}

const navHidden = (page) => page.$eval("header.site-nav", (el) => el.dataset.hidden === "true");

await session(1440, 900, false, async (page, shot) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await sleep(1200);
  await shot("navbar-hero");

  await scroll(page, 1400);
  await scroll(page, 1600);
  check("1440 navbar hides on scroll down", await navHidden(page));
  await scroll(page, 1450);
  check("1440 navbar returns on scroll up", !(await navHidden(page)));
  await shot("navbar-scrolled");

  await scroll(page, 0);
  await page.hover('button[aria-controls="vendors-panel"]');
  await sleep(700);
  check("1440 vendors panel opens on hover", !!(await page.$("#vendors-panel")));
  await shot("vendors-panel");
  await page.mouse.move(720, 870);
  await sleep(600);
  check("1440 vendors panel closes when pointer leaves", !(await page.$("#vendors-panel")));

  await page.focus('button[aria-controls="vendors-panel"]');
  await page.keyboard.press("Enter");
  await sleep(450);
  check(
    "1440 vendors panel opens on Enter",
    (await page.$eval('button[aria-controls="vendors-panel"]', (el) => el.getAttribute("aria-expanded"))) === "true",
  );
  await page.keyboard.press("Tab");
  await sleep(200);
  check("1440 Tab moves into the panel", await page.evaluate(() => !!document.activeElement?.closest("#vendors-panel")));
  await page.keyboard.press("Escape");
  await sleep(450);
  check(
    "1440 Escape closes vendors panel and refocuses button",
    await page.evaluate(
      () => !document.querySelector("#vendors-panel") && document.activeElement?.getAttribute("aria-controls") === "vendors-panel",
    ),
  );

  await click(page, 'button[aria-label="Search"]');
  await sleep(600);
  check("1440 search focuses the input", await page.evaluate(() => document.activeElement?.id === "site-search"));
  await page.type("#site-search", "Photographers in Udaipur");
  await shot("search-overlay");
  await page.keyboard.press("Escape");
  await sleep(450);
  check(
    "1440 Escape closes search and returns focus",
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Search"),
  );

  await scroll(page, 100000);
  await sleep(600);
  await shot("footer");

  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "load" });
  await scroll(page, 0);
  await click(page, 'button[aria-controls="vendors-panel"]');
  await sleep(300);
  check("1440 reduced motion: vendors panel still opens", !!(await page.$("#vendors-panel")));
  await page.keyboard.press("Escape");
  await click(page, 'button[aria-label="Search"]');
  await sleep(300);
  check("1440 reduced motion: search still opens", !!(await page.$("#site-search")));
  await page.keyboard.press("Escape");
});

await session(390, 844, true, async (page, shot) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await sleep(1200);
  await shot("navbar-hero");
  await scroll(page, 1400);
  await scroll(page, 1600);
  check("390 navbar hides on scroll down", await navHidden(page));
  await scroll(page, 1450);
  check("390 navbar returns on scroll up", !(await navHidden(page)));
  await shot("navbar-scrolled");
  await shot("bottom-bar");

  await scroll(page, 0);
  await click(page, 'button[aria-label="Open menu"]');
  await sleep(1300);
  check(
    "390 menu focuses its close button",
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Close menu"),
  );
  await shot("mobile-menu");
  await page.evaluate(() => document.querySelector('[role="dialog"][aria-label="Menu"]')?.scrollTo({ top: 10000 }));
  await shot("vendors-panel");
  await page.evaluate(() => document.querySelector('[role="dialog"][aria-label="Menu"]')?.scrollTo({ top: 0 }));
  await page.keyboard.press("Escape");
  await sleep(450);
  check(
    "390 Escape closes menu and refocuses menu button",
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Open menu"),
  );

  await click(page, 'button[aria-label="Open menu"]');
  await sleep(700);
  const buttons = await page.$$('[role="dialog"][aria-label="Menu"] button');
  for (const b of buttons) {
    const text = await b.evaluate((el) => el.textContent?.trim());
    if (text === "Search") await b.click();
  }
  await sleep(700);
  check("390 menu search opens the overlay with focus", await page.evaluate(() => document.activeElement?.id === "site-search"));
  await page.type("#site-search", "Udaipur");
  await shot("search-overlay");
  await page.keyboard.press("Escape");
  await sleep(400);

  await scroll(page, 100000);
  await sleep(600);
  await shot("footer");

  check("390 no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  check(
    "390 bottom bar links are at least 44px tall",
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('nav[aria-label="Primary, mobile"] a')).every((a) => a.getBoundingClientRect().height >= 44),
    ),
  );
});

await session(1920, 1000, false, async (page, shot) => {
  await page.goto(`${BASE}/styleguide`, { waitUntil: "load" });
  await scroll(page, 700);
  await shot("container-wide-screen");
  const box = await page.$eval("main .container-site", (el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(window.innerWidth - r.right), width: Math.round(r.width) };
  });
  check(`1920 container centred (${box.width}px wide, ${box.left}/${box.right} margins)`, Math.abs(box.left - box.right) <= 1);
});

// Homepage: full pages and one capture per section into docs/screenshots/home.
const HOME_OUT = join(OUT, "home");
mkdirSync(HOME_OUT, { recursive: true });
const HOME_SECTIONS = [
  ["hero", 'section[aria-label="Welcome"]'],
  ["categories", 'section[aria-label="Vendor categories"]'],
  ["featured-vendors", 'section[aria-label="Featured vendors"]'],
  ["real-weddings", 'section[aria-label="Real weddings"]'],
  ["films", 'section[aria-label="Wedding films"]'],
  ["cities", 'section[aria-label="Browse by city"]'],
  ["why-wedoura", 'section[aria-label="Why Wedoura"]'],
  ["blog", 'section[aria-label="From the blog"]'],
  ["faq", "#faq"],
  ["list-your-business", 'section[aria-label="List your business"]'],
];

async function homeSession(width, height, mobile) {
  await session(width, height, mobile, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await sleep(1000);
    // Walk the page so lazy images load and the reveals have played.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 180));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await sleep(900);
    await page.screenshot({ path: join(HOME_OUT, `home-full-${width}.png`), fullPage: true });
    console.log("saved", `home/home-full-${width}.png`);

    let index = 0;
    for (const [name, selector] of HOME_SECTIONS) {
      index += 1;
      const el = await page.$(selector);
      check(`${width} home section present: ${name}`, !!el);
      if (!el) continue;
      await page.evaluate(
        (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: "instant", block: "start" }),
        selector,
      );
      await sleep(900);
      const n = String(index).padStart(2, "0");
      const path = join(HOME_OUT, `home-${n}-${name}-${width}.png`);
      try {
        await el.screenshot({ path });
      } catch {
        await page.screenshot({ path });
      }
      console.log("saved", `home/home-${n}-${name}-${width}.png`);
    }

    check(
      `${width} home no horizontal overflow`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    );

    // FAQ accordion: the second item opens on click.
    await page.evaluate(() => document.querySelector("#faq")?.scrollIntoView({ behavior: "instant" }));
    await sleep(600);
    await page.$eval("#faq-button-1", (el) => el.click());
    await sleep(700);
    check(
      `${width} FAQ accordion opens`,
      (await page.$eval("#faq-button-1", (el) => el.getAttribute("aria-expanded"))) === "true",
    );
  });
}

await homeSession(1440, 900, false);
await homeSession(390, 844, true);

await browser.close();
const failed = checks.filter(([, ok]) => !ok);
console.log(problems.length ? "console problems:\n" + problems.join("\n") : "no console errors or warnings");
console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length || problems.length ? 1 : 0);
