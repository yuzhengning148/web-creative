import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["public/home.html", "public/contact.html"];
const forbidden = [
  /TTTise/i,
  /NUDOT/i,
  /hello@tttise\.com/i,
  /href=["']#["']/i,
  /href=["'](?:work_|about["']|work["']|lab["']|blog["']|index["'])/i,
];
const required = [
  ["public/home.html", /Mocha Cat Studio/],
  ["public/home.html", /咖啡色的猫/],
  ["public/contact.html", /zzzzchen\.gong@foxmail\.com/],
  ["public/contact.html", /mailto:zzzzchen\.gong@foxmail\.com/],
];

let failed = false;

for (const relativePath of pages) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing ${relativePath}`);
    failed = true;
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      console.error(`${relativePath} still matches ${pattern}`);
      failed = true;
    }
  }
}

for (const [relativePath, pattern] of required) {
  const content = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (!pattern.test(content)) {
    console.error(`${relativePath} is missing ${pattern}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Mocha Cat content verification passed.");
