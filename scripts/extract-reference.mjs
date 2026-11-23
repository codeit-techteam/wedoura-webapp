// Streams every file in docs/reference/client-v2/*.html.
// Embedded data: images and videos are written to public/ref/<page>/,
// deduplicated by sha256. Markup, CSS and JS land in
// docs/reference/client-v2/extracted/<page>/.
//
// Never load these HTML files any other way: they are large because of the
// embedded media. Run: node scripts/extract-reference.mjs
import { createHash } from "node:crypto";
import { createReadStream, rmSync, writeFileSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "docs/reference/client-v2");
const extractedRoot = join(srcDir, "extracted");

const EXT = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  gif: "gif",
  webp: "webp",
  "svg+xml": "svg",
  avif: "avif",
  bmp: "bmp",
  "x-icon": "ico",
  "vnd.microsoft.icon": "ico",
  apng: "apng",
  mp4: "mp4",
  webm: "webm",
  ogg: "ogv",
  quicktime: "mov",
  "x-m4v": "m4v",
  mpeg: "mpeg",
};

const HEADER_RE = /^data:(image|video)\/([a-zA-Z0-9.+-]+)((?:;[a-zA-Z0-9.+-]+=?[^;,]*)*)$/i;

function extFor(subtype) {
  const key = subtype.toLowerCase();
  return EXT[key] || key.replace(/[^a-z0-9]+/g, "").slice(0, 8) || "bin";
}

function isBase64Char(code) {
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    code === 43 ||
    code === 47 ||
    code === 61 ||
    code === 10 ||
    code === 13 ||
    code === 32 ||
    code === 9
  );
}

/** The quote or paren that opened this URI, ignoring whitespace. */
function openerDelimiter(before) {
  for (let i = before.length - 1; i >= 0; i--) {
    const c = before[i];
    if (c === " " || c === "\n" || c === "\r" || c === "\t") continue;
    if (c === '"' || c === "'") return c;
    if (c === "(") return ")";
    return null;
  }
  return null;
}

/**
 * Pull markup, CSS, JS and media out of one HTML string already in memory
 * only as a streaming carry buffer. `onAsset` receives each unique file.
 */
export function extractHtml(html, page, onAsset) {
  const assets = new Map();
  let imageN = 0;
  let videoN = 0;
  let mode = "html";
  const buckets = { html: "", css: "", js: "" };
  let pending = "";
  let lastChars = "";
  /** The script or style block currently being collected. */
  let block = null;

  const remember = (chunk) => {
    if (!chunk) return;
    lastChars = (lastChars + chunk).slice(-8);
  };

  const bucketFor = () => (mode === "style" ? "css" : mode === "script" ? "js" : "html");

  const emit = (chunk) => {
    if (!chunk) return;
    buckets[bucketFor()] += chunk;
    remember(chunk);
  };

  /** End of a start/end tag, ignoring `>` inside quoted attributes. */
  const findTagEnd = (text, start) => {
    let quote = null;
    for (let p = start + 1; p < text.length; p++) {
      const c = text[p];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") {
        quote = c;
        continue;
      }
      if (c === ">") return p;
    }
    return -1;
  };

  /** Replace image and video data URIs inside one complete fragment. */
  const replaceUris = (fragment) => {
    let out = "";
    let p = 0;
    while (p < fragment.length) {
      const at = findData(fragment, p);
      if (!(at >= 0)) {
        out += fragment.slice(p);
        break;
      }
      out += fragment.slice(p, at);
      lastChars = out.slice(-8);
      const uri = parseUri(fragment, at, true);
      if (!uri || uri.incomplete || uri.literal) {
        const end = uri?.end ?? at + 5;
        out += fragment.slice(at, end);
        p = end;
        continue;
      }
      out += uri.path;
      p = uri.end;
    }
    return out;
  };

  const save = (kind, subtype, base64, rawPayload) => {
    let buf;
    if (base64) {
      const cleaned = rawPayload.replace(/\s/g, "");
      if (cleaned.length < 8) return null;
      buf = Buffer.from(cleaned, "base64");
    } else {
      let text = rawPayload;
      if (text.includes("%")) {
        try {
          text = decodeURIComponent(text.replace(/\+/g, " "));
        } catch {
          /* keep the raw payload */
        }
      }
      buf = Buffer.from(text);
    }
    if (buf.length < 8) return null;

    const hash = createHash("sha256").update(buf).digest("hex");
    const where = mode === "style" ? "css" : mode === "script" ? "js" : "html";
    const existing = assets.get(hash);
    if (existing) {
      existing.uses[where] = (existing.uses[where] || 0) + 1;
      return existing.publicPath;
    }

    const n = kind === "video" ? ++videoN : ++imageN;
    const filename = `${kind === "video" ? "video" : "image"}-${String(n).padStart(2, "0")}.${extFor(subtype)}`;
    const publicPath = `/ref/${page}/${filename}`;
    const asset = {
      hash,
      filename,
      publicPath,
      bytes: buf.length,
      mime: `${kind}/${subtype.toLowerCase()}`,
      kind,
      uses: { [where]: 1 },
    };
    assets.set(hash, asset);
    onAsset(asset, buf);
    return publicPath;
  };

  const sniffImage = (buf) => {
    if (buf.length < 12) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
    return null;
  };

  /**
   * Some references store a panorama as a script tag whose body is raw
   * base64 (the page later prefixes data:image/jpeg;base64,). Lift those
   * into real files so the script stays readable.
   */
  const liftRawImage = (body, openTag) => {
    const trimmed = body.trim();
    if (trimmed.length < 500 || !/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) return null;
    const buf = Buffer.from(trimmed.replace(/\s/g, ""), "base64");
    const subtype = sniffImage(buf);
    if (!subtype) return null;
    const publicPath = save("image", subtype, true, trimmed);
    if (!publicPath) return null;
    const id = /\bid\s*=\s*("([^"]*)"|'([^']*)')/i.exec(openTag);
    const label = id?.[2] ?? id?.[3] ?? "embedded";
    return `/* ${label} ${publicPath} */\n`;
  };

  const findData = (text, from) => {
    let i = from;
    const lowerHint = text;
    while (i < lowerHint.length) {
      const at = lowerHint.indexOf("data:", i);
      if (at === -1) return -1;
      const head = lowerHint.slice(at, Math.min(lowerHint.length, at + 24)).toLowerCase();
      if (head.startsWith("data:image/") || head.startsWith("data:video/")) return at;
      if (at >= lowerHint.length - 12) return -2;
      i = at + 5;
    }
    return -1;
  };

  const parseUri = (text, start, final) => {
    const comma = text.indexOf(",", start);
    if (comma === -1 || comma - start > 160) {
      if (!final && (comma === -1 || comma - start > 160) && text.length - start < 180) return { incomplete: true };
      return { literal: true, end: start + 5 };
    }
    const header = text.slice(start, comma).replace(/\s/g, "");
    const match = HEADER_RE.exec(header);
    if (!match) return { literal: true, end: start + 5 };

    const kind = match[1].toLowerCase();
    const subtype = match[2];
    const base64 = /;base64(?:;|$)/i.test(header);
    const delim = openerDelimiter(lastChars);
    let end = comma + 1;

    if (base64) {
      while (end < text.length && isBase64Char(text.charCodeAt(end))) end++;
      if (!final && end === text.length) return { incomplete: true };
    } else if (delim === '"' || delim === "'") {
      while (end < text.length && text[end] !== delim) end++;
      if (end >= text.length) return final ? { payloadEnd: end } : { incomplete: true };
    } else if (delim === ")") {
      while (end < text.length && text[end] !== ")") end++;
      if (end >= text.length) return final ? { payloadEnd: end } : { incomplete: true };
    } else {
      while (end < text.length && !/[\s"'()<>]/.test(text[end])) end++;
      if (!final && end === text.length) return { incomplete: true };
    }

    const publicPath = save(kind, subtype, base64, text.slice(comma + 1, end));
    if (!publicPath) return { literal: true, end: start + 5 };
    return { path: publicPath, end };
  };

  const findEndTag = (text, from) => {
    const target = mode === "style" ? "</style" : "</script";
    let i = from;
    while (i < text.length) {
      const at = text.indexOf("<", i);
      if (at === -1) return -1;
      if (at > text.length - target.length) return -2;
      if (text.slice(at, at + target.length).toLowerCase() === target) return at;
      i = at + 1;
    }
    return -1;
  };

  const scan = (text, final) => {
    let i = 0;
    while (i < text.length) {
      if (mode === "html" && text.startsWith("<!--", i)) {
        const end = text.indexOf("-->", i + 4);
        if (end === -1) {
          if (!final) return text.slice(i);
          emit(replaceUris(text.slice(i)));
          return "";
        }
        emit(replaceUris(text.slice(i, end + 3)));
        i = end + 3;
        continue;
      }

      let dataAt = -1;
      let tagAt = -1;
      if (mode === "html") {
        dataAt = findData(text, i);
        tagAt = text.indexOf("<", i);
        if (tagAt !== -1 && tagAt > text.length - 2 && !final) tagAt = -2;
      } else {
        dataAt = findData(text, i);
        tagAt = findEndTag(text, i);
      }

      const dataReady = dataAt >= 0;
      const tagReady = tagAt >= 0;
      const incompleteMark = dataAt === -2 || tagAt === -2;

      if (!dataReady && !tagReady) {
        if (!final) {
          if (incompleteMark) {
            const hold = Math.max(i, text.length - 24);
            emit(text.slice(i, hold));
            return text.slice(hold);
          }
          const hold = Math.max(i, text.length - 16);
          emit(text.slice(i, hold));
          return text.slice(hold);
        }
        emit(text.slice(i));
        return "";
      }

      let next = -1;
      let kind = "";
      if (dataReady && (!tagReady || dataAt <= tagAt)) {
        next = dataAt;
        kind = "data";
      } else {
        next = tagAt;
        kind = "tag";
      }

      emit(text.slice(i, next));

      if (kind === "data") {
        const uri = parseUri(text, next, final);
        if (uri.incomplete) return text.slice(next);
        if (uri.literal) {
          emit(text.slice(next, uri.end));
          i = uri.end;
          continue;
        }
        emit(uri.path);
        i = uri.end;
        continue;
      }

      const gt = mode === "html" ? findTagEnd(text, next) : text.indexOf(">", next);
      if (gt === -1) {
        if (!final) return text.slice(next);
        emit(mode === "html" ? replaceUris(text.slice(next)) : text.slice(next));
        return "";
      }
      const raw = text.slice(next, gt + 1);
      if (mode === "html") {
        const name = /^<\s*([a-zA-Z0-9:-]+)/.exec(raw)?.[1]?.toLowerCase() ?? "";
        if (name === "style" || name === "script") {
          const bucket = name === "style" ? "css" : "js";
          if (buckets[bucket].length) buckets[bucket] += "\n\n";
          block = { bucket, start: buckets[bucket].length, tag: raw };
          mode = name === "style" ? "style" : "script";
        } else {
          emit(replaceUris(raw));
        }
      } else {
        if (block?.bucket === "js") {
          const body = buckets.js.slice(block.start);
          const lifted = liftRawImage(body, block.tag);
          if (lifted) buckets.js = buckets.js.slice(0, block.start) + lifted;
        }
        block = null;
        mode = "html";
      }
      i = gt + 1;
    }
    return "";
  };

  const chunkSize = 256 * 1024;
  for (let offset = 0; offset < html.length; offset += chunkSize) {
    const piece = html.slice(offset, offset + chunkSize);
    const text = pending + piece;
    const final = offset + chunkSize >= html.length;
    pending = scan(text, final);
  }
  if (pending) {
    pending = scan(pending, true);
    if (pending) emit(pending);
  }

  const markup = buckets.html.replace(/>\s*</g, ">\n<").trim() + "\n";
  const css = buckets.css.replace(/\}\s*/g, "}\n").trim() + (buckets.css.trim() ? "\n" : "");
  const js = buckets.js.trim() + (buckets.js.trim() ? "\n" : "");
  return { markup, css, js, assets: [...assets.values()] };
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function textOf(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attr(raw, name) {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(raw);
  return (m?.[2] ?? m?.[3] ?? m?.[4] ?? "").trim();
}

function summarise(page, markup, css, js, assets) {
  const sections = [];
  for (const m of markup.matchAll(/<(section|header|footer|nav|main|form|article)\b([^>]*)>/gi)) {
    const id = attr(m[2], "id");
    const cls = attr(m[2], "class");
    sections.push(`- \`${m[1].toLowerCase()}\`${id ? ` #${id}` : ""}${cls ? ` .${cls.split(/\s+/).slice(0, 6).join(".")}` : ""}`);
  }

  const headings = [];
  for (const m of markup.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = textOf(m[2]);
    if (text) headings.push(`- h${m[1]}: ${text}`);
  }

  const copy = [];
  for (const m of markup.matchAll(/<(p|li|blockquote|figcaption|label)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = textOf(m[2]);
    if (text.length < 2) continue;
    copy.push(`- (${m[1].toLowerCase()}) ${text.slice(0, 400)}`);
    if (copy.length >= 400) break;
  }

  const fields = [];
  for (const m of markup.matchAll(/<(input|select|textarea)\b([^>]*)\/?>/gi)) {
    const tag = m[1].toLowerCase();
    const type = attr(m[2], "type") || (tag === "textarea" ? "textarea" : tag === "select" ? "select" : "text");
    if (type === "hidden") continue;
    const name = attr(m[2], "name") || attr(m[2], "id") || attr(m[2], "aria-label") || attr(m[2], "placeholder");
    const placeholder = attr(m[2], "placeholder");
    fields.push(`- ${tag}${type ? ` type=${type}` : ""}${name ? ` name=${name}` : ""}${placeholder ? ` placeholder="${placeholder}"` : ""}`);
  }
  for (const m of markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const text = textOf(m[2]) || attr(m[1], "aria-label");
    if (text) fields.push(`- button: ${text.slice(0, 160)}`);
  }

  const interactions = [];
  const seen = new Set();
  const note = (line) => {
    if (!line || seen.has(line)) return;
    seen.add(line);
    interactions.push(`- ${line}`);
  };
  for (const m of markup.matchAll(/\s(?:onclick|onchange|onsubmit|oninput)\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    note(`markup ${m[0].trim().slice(0, 180)}`);
  }
  for (const m of js.matchAll(/addEventListener\(\s*['"]([^'"]+)['"]/g)) note(`listens for ${m[1]}`);
  for (const m of js.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)) note(`function ${m[1]}()`);
  for (const m of js.matchAll(/(?:querySelector(?:All)?|getElementById)\(\s*['"]([^'"]+)['"]/g)) note(`queries ${m[1]}`);
  for (const m of markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attr(m[1], "href");
    const text = textOf(m[2]) || attr(m[1], "aria-label");
    if (!text && !href) continue;
    if (href.startsWith("/ref/")) continue;
    note(`link ${text || "(no text)"} → ${href || "(no href)"}`.slice(0, 220));
    if (interactions.length > 250) break;
  }

  const images = assets.filter((a) => a.kind === "image");
  const videos = assets.filter((a) => a.kind === "video");
  const fileLine = (a) => {
    const uses = Object.entries(a.uses)
      .map(([k, n]) => `${k} ×${n}`)
      .join(", ");
    return `- \`${a.publicPath}\` (${a.mime}, ${a.bytes} bytes, ${uses})`;
  };

  const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
  return [
    `# ${page}`,
    "",
    `Extracted by \`scripts/extract-reference.mjs\` from \`docs/reference/client-v2/${page}.html\`.`,
    `Markup ${kb(markup)}, CSS ${kb(css)}, JS ${kb(js)}. ${images.length} images, ${videos.length} videos.`,
    "",
    "## Sections",
    "",
    ...(sections.length ? sections : ["- (none detected)"]),
    "",
    "## Headings",
    "",
    ...(headings.length ? headings : ["- (none detected)"]),
    "",
    "## Copy",
    "",
    ...(copy.length ? copy : ["- (none detected)"]),
    "",
    "## Form fields",
    "",
    ...(fields.length ? fields : ["- (none detected)"]),
    "",
    "## Interactions",
    "",
    ...(interactions.length ? interactions.slice(0, 300) : ["- (none detected)"]),
    "",
    "## Images",
    "",
    ...(images.length ? images.map(fileLine) : ["- (none)"]),
    "",
    "## Videos",
    "",
    ...(videos.length ? videos.map(fileLine) : ["- (none)"]),
    "",
  ].join("\n");
}

function selfTest() {
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const gif = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const html = `<!doctype html><style>b{background:url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%201%201%27%3E%3Crect%20width%3D%271%27%20height%3D%271%27%2F%3E%3C%2Fsvg%3E")}</style><img alt="dot" src="data:image/png;base64,${png}"><script>const g = "data:image/gif;base64,${gif}";</script><h1>Hello</h1><p>Copy</p>`;
  const written = [];
  const result = extractHtml(html, "self-test", (asset) => written.push(asset.publicPath));
  const ok =
    written.length === 3 &&
    !/data:(image|video)\//i.test(result.markup + result.css + result.js) &&
    result.css.includes("/ref/self-test/") &&
    result.css.includes(".svg") &&
    result.markup.includes("/ref/self-test/") &&
    result.markup.includes(".png") &&
    result.js.includes("/ref/self-test/") &&
    result.js.includes(".gif") &&
    result.markup.includes("<h1>Hello</h1>") &&
    !result.markup.includes("<script") &&
    !result.markup.includes("<style");
  if (!ok) {
    console.error("extract-reference self-test failed");
    console.error(result.markup);
    console.error(result.css);
    console.error(result.js);
    process.exit(1);
  }
}

async function readStreamed(file) {
  const stream = createReadStream(file, { encoding: "utf8", highWaterMark: 1024 * 1024 });
  let html = "";
  for await (const chunk of stream) html += chunk;
  if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);
  return html;
}

function kb(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

async function main() {
  selfTest();
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const names = (await readdir(srcDir)).filter((name) => name.endsWith(".html") && (!only || name === `${only}.html` || name === only)).sort();
  if (names.length === 0) {
    console.error(`No HTML files in ${srcDir}`);
    process.exit(1);
  }

  const rows = [];
  for (const name of names) {
    const page = name.replace(/\.html$/i, "");
    const started = Date.now();
    process.stdout.write(`reading ${page}… `);
    const html = await readStreamed(join(srcDir, name));
    const assetDir = join(root, "public/ref", page);
    const outDir = join(extractedRoot, page);
    rmSync(assetDir, { recursive: true, force: true });
    rmSync(outDir, { recursive: true, force: true });
    await mkdir(assetDir, { recursive: true });
    await mkdir(outDir, { recursive: true });

    const result = extractHtml(html, page, (asset, buf) => {
      writeFileSync(join(assetDir, asset.filename), buf);
    });
    await writeFile(join(outDir, "markup.html"), result.markup);
    await writeFile(join(outDir, "styles.css"), result.css);
    await writeFile(join(outDir, "script.js"), result.js);
    await writeFile(join(outDir, "summary.md"), summarise(page, result.markup, result.css, result.js, result.assets));

    const images = result.assets.filter((a) => a.kind === "image").length;
    const videos = result.assets.filter((a) => a.kind === "video").length;
    const leaked = ["markup", "css", "js"].filter((key) =>
      /data:(?:image|video)\/[a-zA-Z0-9.+-]+[^,]{0,120},(?:[A-Za-z0-9+/]{16}|%3Csvg|<svg)/i.test(result[key]),
    );
    rows.push({ page, images, videos, ms: Date.now() - started, leaked: leaked.join(",") });
    console.log(`${images} images, ${videos} videos, ${kb(Buffer.byteLength(html))} in ${Date.now() - started}ms${leaked.length ? ` LEAK in ${leaked}` : ""}`);
  }

  const pageW = Math.max(6, ...rows.map((r) => r.page.length));
  console.log("");
  console.log(`${"page".padEnd(pageW)}  ${"images".padStart(6)}  ${"videos".padStart(6)}`);
  for (const row of rows) {
    console.log(`${row.page.padEnd(pageW)}  ${String(row.images).padStart(6)}  ${String(row.videos).padStart(6)}`);
  }
  const leaks = rows.filter((r) => r.leaked);
  if (leaks.length) process.exitCode = 1;
}

const entry = (process.argv[1] ?? "").replaceAll("\\", "/");
if (entry.endsWith("extract-reference.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
