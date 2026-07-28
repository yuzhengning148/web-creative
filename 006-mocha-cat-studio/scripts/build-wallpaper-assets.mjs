import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceRoot = process.argv[2];
const outputRoot = path.join(projectRoot, "public", "images", "mocha");

if (!sourceRoot) {
  console.error("Usage: node scripts/build-wallpaper-assets.mjs /path/to/wallpaper");
  process.exit(1);
}

const source = (group, file) => path.join(sourceRoot, group, file);
const outputs = [];

function add(relativePath, group, file, width, quality, crop = null) {
  outputs.push({ relativePath, input: source(group, file), width, quality, crop });
}

const hero = [
  ["01-autumn-pause", "动漫类", "anime_01.jpg", null],
  ["02-blue-forest", "风景类", "scenery_03.jpg", null],
  ["03-paper-monsters", "动漫类", "anime_17.jpg", null],
  ["04-quiet-mountains", "风景类", "scenery_15.jpg", null],
  ["05-underwater-daydream", "动漫类", "anime_13.jpg", { height: 3375, width: 1898, offsetY: 0, offsetX: 700 }],
];

for (const [name, group, file, mobileCrop] of hero) {
  add(`hero/${name}-desktop.jpg`, group, file, 1920, 78);
  add(`hero/${name}-mobile.jpg`, group, file, 960, 74, mobileCrop);
  add(`hero/${name}-thumb.jpg`, group, file, 480, 68);
}

[
  ["01-spring-garden.jpg", "动漫类", "anime_06.jpg"],
  ["02-neon-city.jpg", "风景类", "scenery_12.jpg"],
  ["03-blue-dream.jpg", "动漫类", "anime_09.jpg"],
  ["04-snow-journey.jpg", "风景类", "scenery_05.jpg"],
  ["05-color-transit.jpg", "动漫类", "anime_14.jpg"],
  ["06-sunset-coast.jpg", "风景类", "scenery_17.jpg"],
].forEach(([name, group, file]) => add(`gallery/${name}`, group, file, 1400, 76));

const nav = [
  ["动漫类", "anime_01.jpg"],
  ["风景类", "scenery_03.jpg"],
  ["动漫类", "anime_17.jpg"],
  ["风景类", "scenery_15.jpg"],
  ["动漫类", "anime_13.jpg"],
  ["风景类", "scenery_12.jpg"],
  ["动漫类", "anime_06.jpg"],
  ["风景类", "scenery_05.jpg"],
  ["动漫类", "anime_14.jpg"],
  ["风景类", "scenery_17.jpg"],
];
nav.forEach(([group, file], index) => add(`nav/${String(index + 1).padStart(2, "0")}.jpg`, group, file, 560, 68));

const company = [
  ["动漫类", "anime_08.jpg"],
  ["动漫类", "anime_09.jpg"],
  ["动漫类", "anime_10.jpg"],
  ["动漫类", "anime_18.jpg"],
  ["动漫类", "anime_20.jpg"],
  ["风景类", "scenery_01.jpg"],
  ["风景类", "scenery_02.jpg"],
  ["风景类", "scenery_04.jpg"],
  ["风景类", "scenery_07.jpg"],
  ["风景类", "scenery_08.jpg"],
  ["风景类", "scenery_11.jpg"],
  ["风景类", "scenery_14.jpg"],
];
company.forEach(([group, file], index) => add(`company/${String(index + 1).padStart(2, "0")}.jpg`, group, file, 760, 70));

const ring = [
  ...Array.from({ length: 20 }, (_, index) => ["动漫类", `anime_${String(index + 1).padStart(2, "0")}.jpg`]),
  ["风景类", "scenery_03.jpg"],
  ["风景类", "scenery_05.jpg"],
  ["风景类", "scenery_12.jpg"],
  ["风景类", "scenery_15.jpg"],
  ["风景类", "scenery_17.jpg"],
];
ring.forEach(([group, file], index) => add(`ring/${String(index + 1).padStart(2, "0")}.jpg`, group, file, 640, 68));

[
  ["01.jpg", "风景类", "scenery_14.jpg"],
  ["02.jpg", "风景类", "scenery_04.jpg"],
  ["03.jpg", "风景类", "scenery_12.jpg"],
  ["04.jpg", "动漫类", "anime_05.jpg"],
  ["05.jpg", "动漫类", "anime_17.jpg"],
  ["06.jpg", "动漫类", "anime_19.jpg"],
].forEach(([name, group, file]) => add(`cube/${name}`, group, file, 900, 72));

[
  ["loader.jpg", "动漫类", "anime_15.jpg", 640, 70],
  ["accent.jpg", "动漫类", "anime_12.jpg", 720, 72],
  ["about.jpg", "风景类", "scenery_02.jpg", 1920, 74],
  ["section.jpg", "风景类", "scenery_14.jpg", 1920, 74],
  ["work.jpg", "风景类", "scenery_15.jpg", 1920, 74],
  ["ring-center.jpg", "动漫类", "anime_12.jpg", 900, 72],
  ["footer.jpg", "风景类", "scenery_17.jpg", 1920, 74],
  ["og.jpg", "动漫类", "anime_01.jpg", 1200, 76],
].forEach(([name, group, file, width, quality]) => add(`atmosphere/${name}`, group, file, width, quality));

const tempRoot = mkdtempSync(path.join(tmpdir(), "mocha-wallpaper-assets-"));

try {
  for (const { relativePath, input, width, quality, crop } of outputs) {
    const output = path.join(outputRoot, relativePath);
    mkdirSync(path.dirname(output), { recursive: true });
    let resizeInput = input;

    if (crop) {
      resizeInput = path.join(tempRoot, relativePath.replaceAll("/", "-"));
      execFileSync("sips", [
        "-c", String(crop.height), String(crop.width),
        "--cropOffset", String(crop.offsetY), String(crop.offsetX),
        input,
        "--out", resizeInput,
      ], { stdio: "ignore" });
    }

    execFileSync("sips", [
      "-s", "format", "jpeg",
      "-s", "formatOptions", String(quality),
      "--resampleWidth", String(width),
      resizeInput,
      "--out", output,
    ], { stdio: "ignore" });
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log(`Generated ${outputs.length} optimized Mocha Cat assets in ${outputRoot}`);
