import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const replacements = [
  // Meta & SEO
  [
    "核點 Nudot Studio｜台中網頁設計 × 品牌視覺升級 × 動態特效",
    "Mocha Cat Studio｜咖啡色的猫 × 个人作品集 × 创作实验",
  ],
  [
    "專注於台中網頁設計的頂尖團隊——核點設計 NUDOT。我們深耕高階網頁設計、動態特效設計與品牌視覺升級。結合流體極簡美學與高階前端技術，為企業打造具備國際大器格局的沉浸式互動網站，讓數位體驗成為您最強的商業資產。",
    "Mocha Cat Studio（咖啡色的猫）是一个个人混合作品集，记录网页、视觉、影像、动效与持续发生的创作实验。",
  ],
  [
    "專注於台中網頁設計的頂尖團隊——核點設計 NUDOT。深耕高階網頁設計、動態特效設計與品牌視覺升級，為企業打造具備國際大器格局的沉浸式互動網站。",
    "Mocha Cat Studio collects web, visual, image, motion and mixed creative work.",
  ],
  [
    "台中網頁設計, 網頁設計, 動態特效設計, 品牌視覺升級, 高階網頁設計, 互動網站設計, UIUX設計, 品牌設計, 企業官網改版, GSAP動態網頁, NUDOT, 核點設計, 台中網站設計, 台中視覺設計",
    "Mocha Cat Studio, 咖啡色的猫, 个人作品集, 视觉设计, 网页设计, 动效, 影像, 创作实验",
  ],
  ["核點設計 NUDOT", "Mocha Cat Studio"],
  ["https://nudot.com.tw/", "/"],
  [
    "核點設計 NUDOT｜台中網頁設計 × 動態特效設計 × 品牌視覺升級",
    "Mocha Cat Studio｜咖啡色的猫 × 个人作品集 × 创作实验",
  ],

  // JSON-LD
  ["NUDOT 核點創意", "Mocha Cat Studio"],
  [
    "台灣頂尖品牌策略設計工作室，專精品牌識別、數位互動、Gen-AI Visual 與網頁開發，打造 AWW／FWA 等級視覺體驗。",
    "一个记录网页、视觉、影像、动效与创作实验的个人混合作品集。",
  ],
  ["hello@nudot.com.tw", "zzzzchen.gong@foxmail.com"],

  // Hero display type
  ['<div class="huge-text">STUDIO</div>', '<div class="huge-text">Mocha</div>'],
  ['<div class="huge-text">DIGITAL</div>', '<div class="huge-text">Cat</div>'],
  ['<div class="small-tag">( Brand Direction )</div>', '<div class="small-tag" aria-hidden="true"></div>'],
  [
    "<div class=\"reveal-wrap\"><span class=\"reveal-inner\">Nudot is committed to the art of subtraction. We offer a curated</span></div>",
    "<div class=\"reveal-wrap\"><span class=\"reveal-inner\">Mocha Cat collects web, visual, motion and image experiments</span></div>",
  ],
  [
    '<div class="footer-brand-title">NUDOT. STUDIO<sup>TM</sup></div>',
    '<div class="footer-brand-title">MOCHA CAT. STUDIO<sup>TM</sup></div>',
  ],

  // Page transition & nav
  [
    '<div class="page-transition-meta is-top-left">NUDOT</div>',
    '<div class="page-transition-meta is-top-left">MOCHA CAT</div>',
  ],
  ["NUDOT CREATIVE STUDIO", "MOCHA CAT STUDIO"],
  ["NUDOT home", "Mocha Cat home"],
  ["NUDOT 核點創意", "Mocha Cat Studio"],
  ["( 核點創意 )", "( 关于 Mocha Cat )"],
  ["( 核點實驗室 )", "( Mocha Cat 实验室 )"],
  ["核點創意", "关于 Mocha Cat"],
  ["核點實驗室", "Mocha Cat 实验室"],
  ["核點洞察", "Mocha Cat 洞察"],
  ["( 設計案例 )", "( 精选案例 )"],
  ["設計案例", "精选案例"],

  // Loader
  ['<span class="nd-letter nd-n">N</span>', '<span class="nd-letter nd-n">M</span>'],
  ['<span class="nd-letter nd-d">D</span>', '<span class="nd-letter nd-d">C</span>'],

  // Hero
  ["( Brand Direction )", ""],
  ["核心策略規劃", "网页与交互"],
  ["品牌識別", "视觉与平面"],
  ["內容創意", "影像与动效"],
  ["技術趨勢實踐", "持续实验"],
  ["Creative Strategy", "Web & Interaction"],
  ["Brand Identity", "Visual & Graphic"],
  ["Creative Content", "Image & Motion"],
  ["Web Design", "Ongoing Experiments"],
  ["( 網頁互動開發 )", "( Web & Interaction )"],
  ["( 動態設計 )", "( Visual & Image )"],
  ["( 高階網頁設計 )", "( Mixed Practice )"],
  ["( 品牌核心識別 )", "( Personal Archive )"],
  [
    "Strategy, Design, and<br>\n                    Development. Lightning-fast, lean,<br>\n                    and sensibly priced.",
    "网页、视觉、影像与动效。<br>\n                    一些认真完成的作品，<br>\n                    也有还在生长的实验。",
  ],
  [
    '<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="375f525b5b587759425358431954585a194340">[email&#160;protected]</a>',
    '<a href="mailto:zzzzchen.gong@foxmail.com">zzzzchen.gong@foxmail.com</a>',
  ],
  ["0983-750 522<br>", "欢迎合作与交流<br>"],
  ["核點 Nudot Studio 2026©", "Mocha Cat Studio"],
  ["Nudot Creative Studio", "Mocha Cat Studio"],
  ["COSMIC SERIES", "CURRENT MIX"],
  ["Cosmic Harmony", "Visual Study 01"],

  // Scroll intro
  ["( 品牌策略專家 )", "( Personal Studio )"],
  ["( 守護美學核心，定義數位落點 )", "( One curious cat, many ways to make things )"],
  ["( 核心落點，構築數位地標 )", "( A personal archive of work in progress )"],
  [
    "從核心策略到技術實作，核點致力於讓每一組代碼都承載美學，讓每一個像素都具備商業靈魂<br>讓您的創意，在數位世界中自由呼吸",
    "Mocha Cat 在网页、视觉、影像与动效之间来回探索<br>不同媒介，共用同一个个人视角",
  ],

  // Marquee
  ["WEBDESIGN", "WEB"],
  ["（ 網頁設計 ）", "（ 网页 ）"],
  ["（ 介面/體驗 ）", "（ 视觉 ）"],
  ["（ 動態設計 ）", "（ 动效 ）"],
  ["BRANDING", "IMAGE"],
  ["（ 品牌識別 ）", "（ 影像 ）"],

  // STM section
  ["alt=\"NUDOT\"", "alt=\"Mocha Cat\""],
  ["設計語言", "设计语言"],
  ["品牌識別系統建構中", "Ideas still growing"],
  ["視覺敘事", "体验叙事"],
  ["視覺系統載入中", "New experiments loading"],
  ["數位體驗", "数字体验"],
  ["品牌顧問", "Personal archive"],
  ["創意策略", "创意策略"],
  ["創意能量持續輸出中", "Creative energy in flow"],
  ["品牌個性定義", "产品个性定义"],
  ["數位品牌規範", "Web design notes"],
  ["動態視覺設計", "动效视觉设计"],
  ["品牌核心價值", "产品核心价值"],
  [
    '<div class="stm-el stm-el--xl stm-pos-1" data-stm-alt="stm-pos-2" data-stm-scramble="2.5">N</div>',
    '<div class="stm-el stm-el--xl stm-pos-1" data-stm-alt="stm-pos-2" data-stm-scramble="2.5">M</div>',
  ],
  [
    '<div class="stm-el stm-el--xl stm-pos-3" data-stm-alt="stm-pos-9" data-stm-scramble="2.5">U</div>',
    '<div class="stm-el stm-el--xl stm-pos-3" data-stm-alt="stm-pos-9" data-stm-scramble="2.5">O</div>',
  ],
  [
    '<div class="stm-el stm-el--xl stm-pos-1" data-stm-alt="stm-pos-3" data-stm-scramble="2.5">D</div>',
    '<div class="stm-el stm-el--xl stm-pos-1" data-stm-alt="stm-pos-3" data-stm-scramble="2.5">C</div>',
  ],
  [
    '<div class="stm-el stm-el--xl stm-pos-3" data-stm-alt="stm-pos-10" data-stm-scramble="2.5"\n                data-stm-flip-ease="expo.in">O</div>',
    '<div class="stm-el stm-el--xl stm-pos-3" data-stm-alt="stm-pos-10" data-stm-scramble="2.5"\n                data-stm-flip-ease="expo.in">H</div>',
  ],
  [
    '<div class="stm-el stm-el--xl stm-pos-2" data-stm-alt="stm-pos-3" data-stm-scramble="2.5">T</div>',
    '<div class="stm-el stm-el--xl stm-pos-2" data-stm-alt="stm-pos-3" data-stm-scramble="2.5">A</div>',
  ],

  // About & capabilities
  ["（ 專注本質的數位實踐 ）", "（ Mixed Creative Practice ）"],
  [
    "Mocha Cat Studio｜台中網頁設計 × 動態特效設計 × 品牌視覺升級",
    "Mocha Cat Studio｜咖啡色的猫 × 个人作品集 × 创作实验",
  ],
  [
    "任何強大的数字体验，都源自一個精準的「核點」。Mocha Cat 前端工作室專注台中網頁設計、高階商業視覺圖像生成與 AI 動態影像製作，以最精準的數位工藝，讓每一個像素都發揮最大的品牌商業價值。",
    "咖啡色的猫是一间个人工作室，也是一份持续更新的作品档案。这里收集网页、视觉、影像、动效，以及暂时还无法分类的实验。",
  ],
  [
    "任何強大的數位體驗，都源自一個精準的「核點」。NUDOT 核點創意專注台中網頁設計、高階商業視覺圖像生成與 AI 動態影像製作，以最精準的數位工藝，讓每一個像素都發揮最大的品牌商業價值。",
    "咖啡色的猫是一间个人工作室，也是一份持续更新的作品档案。这里收集网页、视觉、影像、动效，以及暂时还无法分类的实验。",
  ],
  [
    "Mocha Cat 前端工作室｜台中網頁設計・高階商業視覺生成・AI 動態影像。整合组件化设计、互動體驗設計與 Gen-AI 視覺技術，為品牌打造具備國際競爭力的數位体验叙事。",
    "Mocha Cat Studio（咖啡色的猫）是一个个人混合作品集，记录网页、视觉、影像、动效与持续发生的创作实验。",
  ],
  ["THE SECTORS", "THE MIX"],
  ["DEFINING THE CORE DNA OF", "A PERSONAL ARCHIVE OF"],
  ["BRAND AESTHETICS", "WORK IN PROGRESS"],
  ["14Y_VISUAL_MASTERY", "WEB_VISUAL_IMAGE"],
  ["400+_DEPLOYED_WORKS", "INDEPENDENT_PRACTICE"],
  ["跨領域視覺與數位整合", "A mixed creative practice"],
  ["( 網頁視覺美學 )", "( Web & Interaction )"],
  ["( 高階商業視覺 )", "( Visual & Graphic )"],
  ["( 使用體驗與介面 )", "( Image & Motion )"],
  ["( AI 圖像 · 影像 )", "( Open Experiments )"],

  // Gallery & footer
  ["( 重新定義品牌的視覺思維 )", "( Selected mixed works )"],
  ["BY NUDOT", "BY MOCHA CAT"],
  ["數位視覺能量釋放點", "一些完成的作品，也有正在生长的实验"],
  [
    "NUDOT 核點創意｜台中網頁設計・高階商業視覺生成・AI 動態影像。整合品牌識別、互動體驗設計與 Gen-AI 視覺技術，為品牌打造具備國際競爭力的數位視覺敘事。",
    "Mocha Cat Studio（咖啡色的猫）是一份个人混合作品集，记录网页、视觉、影像、动效与持续发生的创作实验。",
  ],
  ["臺中市北屯區文心路三段447號", "个人工作室 · Mixed creative practice"],
  ["核點創意有限公司", "Mocha Cat Studio"],
  ["&#169; 2026 NUDOT STUDIO. ALL RIGHTS RESERVED.", "&#169; MOCHA CAT STUDIO. PERSONAL WORK ARCHIVE."],
  ["Web Design Studio Commercial Visual · AI Motion Est. 2026 · Taichung", "Personal Studio · Web · Visual · Motion · Image"],

  // Wave zh map in JS
  ["'Core-Site': '（核心網站）'", "'Core-Site': '（核心站点）'"],
  ["'Gen-AI Visual': '（生成式 AI 視覺）'", "'Gen-AI Visual': '（前端视觉）'"],
  ["'Motion Flow': '（動態流動）'", "'Motion Flow': '（动效流动）'"],
  ["'WebGL Realm': '（WebGL 領域）'", "'WebGL Realm': '（WebGL 领域）'"],
  ["'3D Matrix': '（3D 矩陣）'", "'3D Matrix': '（3D 矩阵）'"],
  ["'Interaction': '（交互設計）'", "'Interaction': '（交互设计）'"],
  ["'Pixel Perfect': '（完美像素）'", "'Pixel Perfect': '（像素精准）'"],
  ["'Logic Build': '（邏輯建構）'", "'Logic Build': '（逻辑构建）'"],
  ["'Fluid UI': '（流動介面）'", "'Fluid UI': '（流动界面）'"],
  ["'Aero Design': '（輕量化設計）'", "'Aero Design': '（轻量设计）'"],
  ["'Pure Code': '（純粹代碼）'", "'Pure Code': '（纯粹代码）'"],
  ["'Digital Art': '（數位藝術）'", "'Digital Art': '（数字艺术）'"],
  ["'Strategy': '（策略）'", "'Strategy': '（策略）'"],
  ["'Design': '（設計）'", "'Design': '（设计）'"],
  ["'Tech': '（技術）'", "'Tech': '（技术）'"],
  ["'Creative': '（創意）'", "'Creative': '（创意）'"],
  ["'Motion': '（動態）'", "'Motion': '（动效）'"],
  ["'Brand': '（品牌）'", "'Brand': '（产品）'"],
  ["'Future': '（未來）'", "'Future': '（未来）'"],
  ["'Vision': '（願景）'", "'Vision': '（愿景）'"],
  ["'System': '（系統）'", "'System': '（系统）'"],
  ["'Labs': '（實驗室）'", "'Labs': '（实验室）'"],
  ["'Core': '（核心）'", "'Core': '（核心）'"],
  ["'Craft': '（工藝）'", "'Craft': '（工艺）'"],

  // Social (remove wrong handles)
  ['href="https://www.instagram.com/nudotlabs/"', 'href="#"'],
  ['href="https://www.threads.com/@nudotlabs"', 'href="#"'],
  [
    'href="https://www.facebook.com/profile.php?id=61588727983387&locale=zh_TW"',
    'href="#"',
  ],
  ['href="https://www.instagram.com/nudotlabs"', 'href="#"'],
];

function applyReplacements(content) {
  let result = content;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  result = result
    .replaceAll("Mocha Cat Frontend Studio", "Mocha Cat Studio")
    .replaceAll("Mocha Cat 前端工作室", "Mocha Cat Studio")
    .replaceAll("hello@tttise.com", "zzzzchen.gong@foxmail.com")
    .replace(/<a href="#"[^>]*>Instagram<\/a>/g, "<span>DOUYIN</span>")
    .replace(/<a href="#"[^>]*>Threads<\/a>/g, "<span>XIAOHONGSHU</span>")
    .replace(/<a href="#"[^>]*>Facebook<\/a>/g, "");
  return result;
}

export function applyMochaCatBranding(targetPath) {
  const fullPath = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(root, targetPath);

  if (!fs.existsSync(fullPath)) return false;

  const updated = applyReplacements(fs.readFileSync(fullPath, "utf8"));
  fs.writeFileSync(fullPath, updated, "utf8");
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = [
    "public/home.html",
    "public/contact.html",
    "public/transitions.js",
    "src/app/layout.tsx",
  ];

  for (const file of files) {
    const ok = applyMochaCatBranding(file);
    console.log(`${ok ? "Updated" : "Skipped"} ${file}`);
  }
}
