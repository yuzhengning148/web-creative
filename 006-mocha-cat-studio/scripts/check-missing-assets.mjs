import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

function collectRefs(html) {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\/[^\n]*/g, "");

  const refs = new Set();
  for (const m of stripped.matchAll(
    /["'](\/(?:images|fonts|js|vendor|transitions|noise|static-mode|cursor-shared|project-creative-process|mocha-cat-cursor|nav-menu-shared|page-transitions)[^"'?#]+)/g,
  )) {
    refs.add(m[1].split("?")[0]);
  }
  for (const m of stripped.matchAll(/["'](\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?["']/g)) {
    refs.add(m[1].split("?")[0]);
  }
  return refs;
}

function checkPage(label, htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const refs = collectRefs(html);
  const missing = [...refs].sort().filter((r) => !fs.existsSync(path.join(pub, r.slice(1))));
  const external = [];
  if (html.includes("cdnfonts.com")) external.push("cdnfonts.com");
  if (html.includes("codepen.io")) external.push("codepen.io");
  if (html.includes('src="//images/')) external.push('protocol-relative //images/ paths');
  if (html.includes('<script src=""></script>')) external.push("empty script src");

  console.log(`\n=== ${label} ===`);
  console.log(`Asset refs: ${refs.size}, missing: ${missing.length}`);
  missing.forEach((x) => console.log(`  missing ${x}`));
  if (external.length) {
    console.log(`Offline blockers in HTML: ${external.join(", ")}`);
  }
}

checkPage("home", path.join(pub, "home.html"));
checkPage("contact", path.join(pub, "contact.html"));

const cssPath = path.join(pub, "project-creative-process.css");
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  if (css.includes("cdnfonts.com")) {
    console.log("\n=== project-creative-process.css ===");
    console.log("Offline blocker: cdnfonts.com @import");
  }
}

const jsPath = path.join(pub, "project-creative-process.js");
if (fs.existsSync(jsPath)) {
  const js = fs.readFileSync(jsPath, "utf8");
  if (js.includes("codepen.io")) {
    console.log("\n=== project-creative-process.js ===");
    console.log("Offline note: codepen.io URLs present (may be dead code)");
  }
}
