import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";
import { applyOfflineFixes } from "./apply-offline-fixes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const origin = "https://nudot.com.tw";

const SHARED_ASSETS = [
  { url: `${origin}/cursor-shared.css?v=1`, dest: "cursor-shared.css" },
  { url: `${origin}/nav-menu-shared.css?v=1`, dest: "nav-menu-shared.css" },
  { url: `${origin}/page-transitions.css?v=1`, dest: "page-transitions.css" },
  { url: `${origin}/project-creative-process.css?v=1`, dest: "project-creative-process.css" },
  { url: `${origin}/cursor-shared.js?v=1`, dest: "cursor-shared.js" },
  { url: `${origin}/project-creative-process.js?v=1`, dest: "project-creative-process.js" },
  { url: `${origin}/images/contact.svg?v=2`, dest: "images/contact.svg" },
  { url: `${origin}/images/lab/hourglass.svg`, dest: "images/lab/hourglass.svg" },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function download(url, destPath) {
  const fullPath = path.join(publicDir, destPath);
  ensureDir(fullPath);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (offline-cloner)" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  await pipeline(res.body, createWriteStream(fullPath));
}

function buildContactHtml(source) {
  let html = source;

  html = html.replaceAll(`${origin}/images/`, "/images/");
  html = html.replace(/(['"])images\//g, "$1/images/");
  html = html.replace(/\.\/transitions\.js\?v=1/g, "/transitions.js");
  html = html.replace(/noise\.js\?v=4/g, "/noise.js");
  html = html.replace(/cursor-shared\.css\?v=1/g, "/cursor-shared.css");
  html = html.replace(/nav-menu-shared\.css\?v=1/g, "/nav-menu-shared.css");
  html = html.replace(/page-transitions\.css\?v=1/g, "/page-transitions.css");
  html = html.replace(/project-creative-process\.css\?v=1/g, "/project-creative-process.css");
  html = html.replace(/cursor-shared\.js\?v=1/g, "/cursor-shared.js");
  html = html.replace(/project-creative-process\.js\?v=1/g, "/project-creative-process.js");
  html = html.replace(/images\/contact\.svg\?v=2/g, "/images/contact.svg");

  html = html.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.12\.2\/gsap\.min\.js/g,
    "/vendor/gsap.min.js",
  );
  html = html.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.12\.2\/ScrollTrigger\.min\.js/g,
    "/vendor/ScrollTrigger.min.js",
  );
  html = html.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.12\.2\/dist\/CustomEase\.min\.js/g,
    "",
  );
  html = html.replace(/<script src=""><\/script>\s*/g, "");
  html = html.replace(/\/\/images\//g, "/images/");
  html = html.replace(
    /https:\/\/cdn\.jsdelivr\.net\/gh\/studio-freight\/lenis@1\.0\.29\/bundled\/lenis\.min\.js/g,
    "/vendor/lenis.min.js",
  );
  html = html.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@barba\/core[^"]*" defer><\/script>\s*/g,
    "",
  );
  html = html.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g,
    "/fonts/fonts.css",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g,
    "",
  );
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g,
    "",
  );
  html = html.replace(
    /<link rel="stylesheet" href="https:\/\/use\.typekit\.net[^"]+">\s*/g,
    "",
  );
  html = html.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com[^"]*"[^>]*><\/script>\s*/g,
    "",
  );
  html = html.replace(
    /<script>\s*window\.dataLayer[\s\S]*?gtag\('config', 'G-N53QVZL8TL'\);\s*<\/script>\s*/g,
    "",
  );
  html = html.replace(
    /<script src="https:\/\/www\.google\.com\/recaptcha\/api\.js[^"]*"><\/script>\s*/g,
    "",
  );
  html = html.replace(
    /<script data-cfasync="false" src="\/cdn-cgi\/scripts[^"]*"><\/script>/g,
    "",
  );

  html = html.replace(
    '<link rel="icon" href="/images/fav.webp" type="image/webp">',
    '<link rel="icon" href="/images/fav.webp" type="image/webp">\n  <script src="/static-mode.js"></script>\n  <link rel="stylesheet" href="/static-mode.css">\n  <link rel="stylesheet" href="/mocha-cat-cursor.css">\n  <script src="/mocha-cat-cursor.js" defer></script>',
  );

  html = html.replace(
    /<a class="ns-logo" href="index"[^>]*>[\s\S]*?<\/a>/,
    `<a class="ns-logo" href="/" data-cursor="HOME" aria-label="Replay intro">
            <span class="ns-logo-mark" aria-hidden="true">TI</span>
          </a>`,
  );

  const branding = [
    ["核點 Nudot Studio", "Mocha Cat Studio"],
    ["NUDOT STUDIO", "MOCHA CAT STUDIO"],
    ["NUDOT", "MOCHA CAT"],
    ["NUDOT 核點創意", "Mocha Cat 前端工作室"],
    ["核點創意有限公司", "Mocha Cat Studio"],
    ["NUDOT STUDIO. ALL RIGHTS RESERVED.", "MOCHA CAT STUDIO. ALL RIGHTS RESERVED."],
    ["hello@nudot.com.tw", "zzzzchen.gong@foxmail.com"],
    ["+8869 83 750 522", "+886 912 345 678"],
    ["臺中市北屯區文心路三段447號", "Remote · Frontend Studio"],
    ['href="index"', 'href="/"'],
    ['href="about"', 'href="/"'],
    ['href="work"', 'href="/"'],
    ['href="lab"', 'href="/"'],
    ['href="contact"', 'href="/contact"'],
    ["https://www.instagram.com/nudotlabs", "#"],
    ["https://www.threads.com/@nudotlabs", "#"],
    ["https://www.facebook.com/profile.php?id=61588727983387&locale=zh_TW", "#"],
    ["網站設計", "前端开发"],
    ["品牌識別", "交互设计"],
    ["高階商業視覺圖像生成", "WebGL 体验"],
    ["AI動態影像", "性能优化"],
    ["AI 動態影像", "性能优化"],
    ["ABOUT YOUR NEXT BIG<br>DIGITAL TRANSFORMATION", "ABOUT YOUR NEXT<br>FRONTEND PROJECT"],
    ["VISION | EXPERIENCE | EXECUTION", "CODE | MOTION | EXPERIENCE"],
    ["聯絡我們 Contact｜核點 Nudot Studio", "联系我们 Contact｜Mocha Cat Studio"],
    ["與 核點 Nudot Studio聯繫", "与 Mocha Cat Studio 联系"],
    ['content="https://nudot.com.tw/contact"', 'content="/contact"'],
    ['href="https://nudot.com.tw/contact"', 'href="/contact"'],
    ['action="contact"', 'action="/contact"'],
  ];

  for (const [from, to] of branding) {
    html = html.replaceAll(from, to);
  }

  html = html.replace(
    /<a href="\/cdn-cgi\/l\/email-protection[^"]*">[\s\S]*?<\/a>/,
    '<a href="mailto:zzzzchen.gong@foxmail.com">zzzzchen.gong@foxmail.com</a>',
  );

  html = html.replace(
    `var recaptchaTokenPromise;
        var recaptchaKey = document.body.dataset.recaptchaSiteKey || '';
        if (recaptchaKey && window.grecaptcha) {
          recaptchaTokenPromise = new Promise(function (resolve, reject) {
            window.grecaptcha.ready(function () {
              window.grecaptcha.execute(recaptchaKey, { action: 'contact' })
                .then(resolve)
                .catch(reject);
            });
          });
        } else {
          recaptchaTokenPromise = Promise.reject(new Error('reCAPTCHA 尚未載入或尚未設定'));
        }

        recaptchaTokenPromise
          .then(function (token) {
            var recaptchaInput = document.getElementById('g-recaptcha-response');
            if (!recaptchaInput) throw new Error('reCAPTCHA 欄位不存在');
            recaptchaInput.value = token;
          })
          .then(function () { return fetch(contactEndpoint + '?csrf_refresh', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' }
          }); })
          .then(function (r) {
            if (!r.ok) throw new Error('CSRF HTTP ' + r.status);
            return r.json().catch(function () { throw new Error('CSRF 回應不是 JSON'); });
          })
          .then(function (csrf) {
            var csrfInput = form.querySelector('input[name="csrf_token"]');
            if (csrfInput && csrf.csrf_token) { csrfInput.value = csrf.csrf_token; }
            return fetch(contactEndpoint, {
              method: 'POST',
              credentials: 'same-origin',
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
              },
              body: new FormData(form)
            });
          })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json().catch(function () { throw new Error('POST 回應不是 JSON'); });
          })
          .then(function (data) {
            if (data.ok) {
              form.reset();
              document.querySelectorAll('.budget-offer-btn').forEach(function (b) { b.classList.remove('is-active'); });
              form.querySelectorAll('.valid').forEach(function (f) { f.classList.remove('valid'); });
              servicePriceMap = {};
              var ps = document.getElementById('budgetPriceSection');
              if (ps) { ps.classList.remove('is-visible'); }
              if (priceEl) priceEl.value = '';
              updateSelectedDisplay();
              // 更新驗證碼顯示為後端產生的新一組
              if (data.capA && data.capB) {
                var digits = document.querySelectorAll('.captcha-eq-display .cap-digit');
                if (digits[0]) digits[0].textContent = data.capA;
                if (digits[1]) digits[1].textContent = data.capB;
              }
              openLightbox();
            } else {
              var errEl = form.querySelector('.server-error');
              if (!errEl) {
                errEl = document.createElement('div');
                errEl.className = 'server-error';
                form.insertBefore(errEl, form.firstChild);
              }
              errEl.textContent = data.error || 'An error occurred. ／ 發生錯誤，請稍後再試';
              if (window._lenis && window._lenis.scrollTo) {
                window._lenis.scrollTo(errEl, { offset: -80 });
              } else {
                errEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
              }
            }
          })
          .catch(function (err) {
            var errEl = form.querySelector('.server-error');
            if (!errEl) {
              errEl = document.createElement('div');
              errEl.className = 'server-error';
              form.insertBefore(errEl, form.firstChild);
            }
            errEl.textContent = '送出失敗：' + (err && err.message ? err.message : '未知錯誤');
            errEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
          })`,
    `function getCaptchaExpected() {
          var digits = document.querySelectorAll('.captcha-eq-display .cap-digit');
          var a = parseInt(digits[0] && digits[0].textContent, 10) || 0;
          var b = parseInt(digits[1] && digits[1].textContent, 10) || 0;
          return a + b;
        }
        function refreshCaptcha() {
          var a = Math.floor(Math.random() * 8) + 1;
          var b = Math.floor(Math.random() * 8) + 1;
          var digits = document.querySelectorAll('.captcha-eq-display .cap-digit');
          if (digits[0]) digits[0].textContent = String(a);
          if (digits[1]) digits[1].textContent = String(b);
        }
        refreshCaptcha();

        Promise.resolve()
          .then(function () {
            if (parseInt(captchaEl.value, 10) !== getCaptchaExpected()) {
              showError(captchaEl, 'captcha-error', true);
              throw new Error('驗證碼錯誤');
            }
            return new Promise(function (resolve) { window.setTimeout(resolve, 900); });
          })
          .then(function () {
            form.reset();
            document.querySelectorAll('.budget-offer-btn').forEach(function (b) { b.classList.remove('is-active'); });
            form.querySelectorAll('.valid').forEach(function (f) { f.classList.remove('valid'); });
            servicePriceMap = {};
            var ps = document.getElementById('budgetPriceSection');
            if (ps) ps.classList.remove('is-visible');
            if (priceEl) priceEl.value = '';
            updateSelectedDisplay();
            refreshCaptcha();
            openLightbox();
          })
          .catch(function (err) {
            if (err && err.message === '驗證碼錯誤') return;
            var errEl = form.querySelector('.server-error');
            if (!errEl) {
              errEl = document.createElement('div');
              errEl.className = 'server-error';
              form.insertBefore(errEl, form.firstChild);
            }
            errEl.textContent = '送出失敗，请稍后再试。';
            errEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
          })`,
  );

  html = html.replace(
    `<body class="shared-nav-page page-work-pattern" data-recaptcha-site-key="6Lfe11ItAAAAAPVf27UFyQhUPFHI5J3qGQs3mgGC">`,
    `<body class="shared-nav-page page-work-pattern">`,
  );

  html = html.replace(
    "</head>",
    `  <style>
    #nav_scroll .ns-logo-mark {
      font-family: 'Zalando Sans SemiExpanded', 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.06em;
      line-height: 1;
      color: #fff;
      text-transform: uppercase;
    }
    #nav_scroll_container.is-menu-open #nav_scroll .ns-logo-mark {
      color: var(--ns-menu-text, #171411);
    }
    .contact-page-static #film-grain-canvas { display: none !important; }
  </style>
</head>`,
  );

  html = html.replace(
    `<body class="shared-nav-page page-work-pattern">`,
    `<body class="shared-nav-page page-work-pattern contact-page-static">`,
  );

  html = html.replace(
    /var recaptchaTokenPromise;[\s\S]*?errEl\.scrollIntoView\(\{ behavior: 'auto', block: 'nearest' \}\);\s*\}\)/,
    `function getCaptchaExpected() {
          var digits = document.querySelectorAll('.captcha-eq-display .cap-digit');
          var a = parseInt(digits[0] && digits[0].textContent, 10) || 0;
          var b = parseInt(digits[1] && digits[1].textContent, 10) || 0;
          return a + b;
        }
        function refreshCaptcha() {
          var a = Math.floor(Math.random() * 8) + 1;
          var b = Math.floor(Math.random() * 8) + 1;
          var digits = document.querySelectorAll('.captcha-eq-display .cap-digit');
          if (digits[0]) digits[0].textContent = String(a);
          if (digits[1]) digits[1].textContent = String(b);
        }
        refreshCaptcha();

        Promise.resolve()
          .then(function () {
            if (parseInt(captchaEl.value, 10) !== getCaptchaExpected()) {
              showError(captchaEl, 'captcha-error', true);
              throw new Error('captcha');
            }
            return new Promise(function (resolve) { window.setTimeout(resolve, 900); });
          })
          .then(function () {
            form.reset();
            document.querySelectorAll('.budget-offer-btn').forEach(function (b) { b.classList.remove('is-active'); });
            form.querySelectorAll('.valid').forEach(function (f) { f.classList.remove('valid'); });
            servicePriceMap = {};
            var ps = document.getElementById('budgetPriceSection');
            if (ps) ps.classList.remove('is-visible');
            if (priceEl) priceEl.value = '';
            updateSelectedDisplay();
            refreshCaptcha();
            openLightbox();
          })
          .catch(function (err) {
            if (err && err.message === 'captcha') return;
            var errEl = form.querySelector('.server-error');
            if (!errEl) {
              errEl = document.createElement('div');
              errEl.className = 'server-error';
              form.insertBefore(errEl, form.firstChild);
            }
            errEl.textContent = '送出失败，请稍后再试。';
            errEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
          })`,
  );

  html = html.replace(
    /var priceMap = \{[\s\S]*?\};/,
    `var priceMap = {
        '前端开发': ['¥ 30,000 — 60,000', '¥ 60,000 — 120,000', '¥ 120,000 UP'],
        '交互设计': ['¥ 15,000 — 30,000', '¥ 30,000 — 60,000', '¥ 60,000 UP'],
        'WebGL 体验': ['¥ 20,000 — 50,000', '¥ 50,000 — 100,000', '¥ 100,000 UP'],
        '性能优化': ['¥ 10,000 — 25,000', '¥ 25,000 — 50,000', '¥ 50,000 UP']
      };`,
  );

  return html;
}

export async function setupContact() {
  const sourcePath = path.join(root, "tmp-contact.html");
  if (!fs.existsSync(sourcePath)) {
    const res = await fetch(`${origin}/contact`);
    fs.writeFileSync(sourcePath, await res.text(), "utf8");
  }

  for (const asset of SHARED_ASSETS) {
    await download(asset.url, asset.dest);
    console.log(`Downloaded ${asset.dest}`);
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const html = buildContactHtml(source);
  fs.writeFileSync(path.join(publicDir, "contact.html"), html, "utf8");
  applyOfflineFixes();
  console.log("Wrote public/contact.html");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupContact().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
