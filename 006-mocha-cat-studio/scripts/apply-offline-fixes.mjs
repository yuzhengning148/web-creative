import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const htmlReplacements = [
  ['src="//images/', 'src="/images/'],
  ['href="//images/', 'href="/images/'],
  [/<script src=""><\/script>\s*/g, ""],
];

function patchHtml(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return false;

  let html = fs.readFileSync(fullPath, "utf8");
  for (const [from, to] of htmlReplacements) {
    html = typeof from === "string" ? html.split(from).join(to) : html.replace(from, to);
  }
  fs.writeFileSync(fullPath, html, "utf8");
  return true;
}

function patchCreativeProcessCss() {
  const cssPath = path.join(publicDir, "project-creative-process.css");
  if (!fs.existsSync(cssPath)) return false;

  let css = fs.readFileSync(cssPath, "utf8");
  css = css.replace(
    /@import url\("https:\/\/fonts\.cdnfonts\.com\/css\/pp-neue-montreal"\);\s*\n/,
    "/* offline: PP Neue Montreal replaced with site fonts from /fonts/fonts.css */\n",
  );
  css = css.replace(
    '--font-primary: "PP Neue Montreal", sans-serif;',
    '--font-primary: "DM Sans", "Helvetica Neue", Arial, sans-serif;',
  );
  fs.writeFileSync(cssPath, css, "utf8");
  return true;
}

function patchCreativeProcessJs() {
  const jsPath = path.join(publicDir, "project-creative-process.js");
  if (!fs.existsSync(jsPath)) return false;

  let js = fs.readFileSync(jsPath, "utf8");
  js = js.replace(
    /this\.loadSound\('hover', 'https:\/\/assets\.codepen\.io[^']+'\);\s*\n\s*this\.loadSound\('click', 'https:\/\/assets\.codepen\.io[^']+'\);\s*\n\s*this\.loadSound\('textChange', 'https:\/\/assets\.codepen\.io[^']+'\);/,
    "// offline: external sfx disabled",
  );
  fs.writeFileSync(jsPath, js, "utf8");
  return true;
}

export function applyOfflineFixes() {
  const results = {
    contactHtml: patchHtml("public/contact.html"),
    creativeCss: patchCreativeProcessCss(),
    creativeJs: patchCreativeProcessJs(),
  };
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = applyOfflineFixes();
  for (const [key, ok] of Object.entries(results)) {
    console.log(`${ok ? "Updated" : "Skipped"} ${key}`);
  }
}
