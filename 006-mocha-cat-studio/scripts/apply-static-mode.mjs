import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

export function applyStaticMode(targetPath = path.join(root, "public", "home.html")) {
  if (!fs.existsSync(targetPath)) return false;

  let html = fs.readFileSync(targetPath, "utf8");

  if (!html.includes("/static-mode.js")) {
    html = html.replace(
      '<link rel="icon" href="/images/fav.webp" type="image/webp">',
      '<link rel="icon" href="/images/fav.webp" type="image/webp">\n  <script src="/static-mode.js"></script>\n  <link rel="stylesheet" href="/static-mode.css">\n  <link rel="stylesheet" href="/mocha-cat-cursor.css">\n  <script src="/mocha-cat-cursor.js" defer></script>',
    );
  }

  if (!html.includes("if (!window.__MOCHA_CAT_STATIC__) {\n          window.addEventListener('mousemove'")) {
    html = html.replace(
      "        window.addEventListener('resize', this._boundResize, { passive: true });\n        window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });",
      "        window.addEventListener('resize', this._boundResize, { passive: true });\n        if (!window.__MOCHA_CAT_STATIC__) {\n          window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });\n        }",
    );
  }

  fs.writeFileSync(targetPath, html, "utf8");
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyStaticMode();
  console.log("Applied static mode patches to public/home.html");
}
