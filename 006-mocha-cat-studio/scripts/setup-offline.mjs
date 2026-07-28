import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { applyMochaCatBranding } from "./apply-mocha-cat-branding.mjs";
import { applyOfflineFixes } from "./apply-offline-fixes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const sourceHtml = path.join(root, "tmp-source.html");
const outputHtml = path.join(publicDir, "home.html");
const origin = "https://nudot.com.tw";

const vendorFiles = [
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    dest: "vendor/gsap.min.js",
  },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js",
    dest: "vendor/ScrollTrigger.min.js",
  },
  {
    url: "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
    dest: "vendor/lenis.min.js",
  },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    dest: "vendor/three.min.js",
  },
];

const siteScripts = [
  { url: `${origin}/transitions.js?v=1`, dest: "transitions.js" },
  { url: `${origin}/noise.js?v=5`, dest: "noise.js" },
  { url: `${origin}/js/Flip.min.js`, dest: "js/Flip.min.js" },
  {
    url: `${origin}/js/ScrambleTextPlugin.min.js`,
    dest: "js/ScrambleTextPlugin.min.js",
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const CRITICAL_ASSET_MIN_BYTES = {
  "images/loading.mp4": 800_000,
  "images/cube/t2.webp": 80_000,
};

async function download(url, destPath, retries = 3) {
  const fullPath = path.join(publicDir, destPath);
  let expectedSize = 0;

  try {
    const headRes = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 (offline-cloner)" },
    });
    if (headRes.ok) {
      expectedSize = Number(headRes.headers.get("content-length") || 0);
    }
  } catch {}

  if (fs.existsSync(fullPath)) {
    const localSize = fs.statSync(fullPath).size;
    const minSize = CRITICAL_ASSET_MIN_BYTES[destPath.replace(/\\/g, "/")] || 0;
    const looksComplete =
      localSize > 0 &&
      localSize >= minSize &&
      (expectedSize === 0 || localSize >= expectedSize);
    if (looksComplete) {
      return { destPath, skipped: true };
    }
  }

  ensureDir(fullPath);
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (offline-cloner)" },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      await pipeline(res.body, createWriteStream(fullPath));
      return { destPath, skipped: false, size: fs.statSync(fullPath).size };
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error(`Failed ${url}: ${lastError?.message}`);
}

function collectImagePaths(html) {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\/[^\n]*/g, "");
  const paths = new Set();

  for (const match of stripped.matchAll(/images\/[A-Za-z0-9_./-]+\.[a-z0-9]+/gi)) {
    const rel = match[0].split("?")[0];
    if (rel.includes("core-capabilities/ring/") && rel.endsWith(".jpg")) continue;
    paths.add(rel);
  }

  for (let i = 1; i <= 25; i++) {
    paths.add(
      `images/core-capabilities/ring/${String(i).padStart(2, "0")}.webp`,
    );
  }

  return [...paths].sort();
}

async function downloadGoogleFonts() {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Zalando+Sans+SemiExpanded:ital,wght@0,200..900;1,200..900&display=swap";

  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  let css = await cssRes.text();

  const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(
    (m) => m[1],
  );

  for (const fontUrl of fontUrls) {
    const fileName = fontUrl.split("/").pop().split("?")[0];
    const dest = `fonts/${fileName}`;
    await download(fontUrl, dest);
    css = css.replaceAll(fontUrl, `/fonts/${fileName}`);
  }

  ensureDir(path.join(publicDir, "fonts/fonts.css"));
  fs.writeFileSync(path.join(publicDir, "fonts/fonts.css"), css, "utf8");
}

function buildOfflineHtml(source) {
  let html = source;

  // Keep assets local
  html = html.replaceAll(`${origin}/images/`, "/images/");
  html = html.replace(/(['"])images\//g, "$1/images/");

  // Site scripts
  html = html.replace(/\.\/transitions\.js\?v=1/g, "/transitions.js");
  html = html.replace(/noise\.js\?v=5/g, "/noise.js");
  html = html.replace(/js\/Flip\.min\.js/g, "/js/Flip.min.js");
  html = html.replace(
    /js\/ScrambleTextPlugin\.min\.js/g,
    "/js/ScrambleTextPlugin.min.js",
  );

  // Vendor libs
  html = html.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.12\.2\/gsap\.min\.js/g,
    "/vendor/gsap.min.js",
  );
  html = html.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.12\.2\/ScrollTrigger\.min\.js/g,
    "/vendor/ScrollTrigger.min.js",
  );
  html = html.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/@studio-freight\/lenis@1\.0\.42\/dist\/lenis\.min\.js/g,
    "/vendor/lenis.min.js",
  );
  html = html.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/g,
    "/vendor/three.min.js",
  );

  // Google fonts -> local
  html = html.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g,
    "/fonts/fonts.css",
  );

  // Remove analytics / external-only services
  html = html.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com[^"]*"[^>]*><\/script>/g,
    "",
  );
  html = html.replace(
    /<script>\s*window\.dataLayer[\s\S]*?gtag\('config', 'G-N53QVZL8TL'\);\s*<\/script>/,
    "",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/g,
    "",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/g,
    "",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/use\.typekit\.net" crossorigin>/g,
    "",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/p\.typekit\.net" crossorigin>/g,
    "",
  );
  html = html.replace(/<link rel="dns-prefetch" href="https:\/\/cdn[^"]+">/g, "");
  html = html.replace(/<link[^>]*use\.typekit\.net[^>]*>/g, "");
  html = html.replace(/<noscript>[\s\S]*?typekit[\s\S]*?<\/noscript>/g, "");
  html = html.replace(/<script[^>]*src="\/cdn-cgi\/[^"]*"[^>]*><\/script>/g, "");
  html = html.replace(/<script[^>]*cloudflareinsights[^>]*><\/script>/g, "");

  // Ring gallery config -> local folder, no picsum
  html = html.replace(
    /autoImageFolder:\s*"https:\/\/nudot\.com\.tw\/images\/core-capabilities\/ring"/,
    'autoImageFolder: "/images/core-capabilities/ring"',
  );
  html = html.replace(
    /autoImageFolder:\s*"images\/core-capabilities\/ring"/,
    'autoImageFolder: "/images/core-capabilities/ring"',
  );
  html = html.replace(
    /return `https:\/\/picsum\.photos\/id\/\$\{index \+ 1\}\/320\/400`;/,
    "return `/images/core-capabilities/ring/${String((index % 25) + 1).padStart(2, '0')}.webp`;",
  );

  return html;
}

async function main() {
  if (!fs.existsSync(sourceHtml)) {
    console.log("Downloading source HTML...");
    const res = await fetch(`${origin}/`);
    fs.writeFileSync(sourceHtml, await res.text(), "utf8");
  }

  const html = fs.readFileSync(sourceHtml, "utf8");
  const imagePaths = collectImagePaths(html);

  console.log(`Downloading ${imagePaths.length} image/video assets...`);
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const rel of imagePaths) {
    try {
      const result = await download(`${origin}/${rel}`, rel);
      if (result.skipped) skipped++;
      else downloaded++;
      process.stdout.write(
        `\r[assets] ${downloaded + skipped + failed}/${imagePaths.length} (new:${downloaded} skip:${skipped} fail:${failed})`,
      );
    } catch (error) {
      failed++;
      console.error(`\nMissing: ${rel} -> ${error.message}`);
    }
  }
  console.log("");

  console.log("Downloading vendor + site scripts...");
  for (const file of [...vendorFiles, ...siteScripts]) {
    await download(file.url, file.dest);
  }

  console.log("Downloading Google Fonts...");
  await downloadGoogleFonts();

  console.log("Writing offline HTML...");
  fs.writeFileSync(outputHtml, buildOfflineHtml(html), "utf8");

  console.log("Applying Mocha Cat branding...");
  applyMochaCatBranding(outputHtml);
  applyMochaCatBranding(path.join(publicDir, "transitions.js"));
  applyMochaCatBranding(path.join(root, "src", "app", "layout.tsx"));

  console.log("Applying offline fixes...");
  applyOfflineFixes();

  console.log("\nOffline setup complete.");
  console.log(`HTML: ${outputHtml}`);
  console.log(`Assets: ${downloaded} downloaded, ${skipped} cached, ${failed} failed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
