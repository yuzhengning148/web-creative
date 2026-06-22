gsap.registerPlugin(ScrollTrigger);

/* ---- WebP 检测 ---- */
function detectWebP() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=";
  });
}

/* ---- 预加载所有图片 ---- */
function preloadImages(paths, onProgress) {
  let loaded = 0;
  const total = paths.length;
  if (!total) {
    onProgress(1);
    return Promise.resolve();
  }
  return Promise.all(
    paths.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded++;
          onProgress(loaded / total);
          resolve();
        };
        img.src = src;
      });
    }),
  );
}

function cfgPath(path) {
  return path.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), CFG);
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value !== undefined) el.textContent = value;
}

function applyThemeColors() {
  const colorVars = {
    bgDeep: "--ink",
    bgMid: "--ink-soft",
    amber: "--ember",
    amberDark: "--ember-deep",
    textWarm: "--paper",
    textDim: "--muted",
  };

  Object.entries(colorVars).forEach(([key, cssVar]) => {
    if (CFG.colors[key]) document.documentElement.style.setProperty(cssVar, CFG.colors[key]);
  });
}

function hydrateCopy() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    const value = cfgPath(el.getAttribute("data-config"));
    if (value !== undefined) el.textContent = value;
  });
}

/* ---- 初始化：加载 → 填充内容 → 启动动画 ---- */
async function init() {
  const loader    = document.getElementById("loader");
  const loaderBar = document.getElementById("loaderBar");
  const loaderText = document.querySelector(".loader-text");
  if (loaderText) loaderText.textContent = CFG.loading.text;
  applyThemeColors();

  // 1. WebP 检测
  CFG._webpSupported = await detectWebP();

  // 2. 预加载
  const allPaths = allAssetPaths();
  await preloadImages(allPaths, (pct) => {
    loaderBar.style.width = (pct * 100).toFixed(0) + "%";
  });

  // 3. 填充图片 src
  document.querySelectorAll("[data-asset]").forEach((el) => {
    const key = el.getAttribute("data-asset");
    const src = asset(key);
    if (src) el.src = src;
  });

  // 4. 填充文案
  hydrateCopy();
  const sc = CFG.screens;
  setText(".intro .line-1", sc.intro.line1);
  setText(".intro .line-2", sc.intro.line2);
  const si = document.querySelector(".spotlight-content-in");
  si.querySelector("h2").textContent = sc.spotlight.before.title;
  si.querySelector("p").textContent  = sc.spotlight.before.text;
  const so = document.querySelector(".spotlight-content-out");
  so.querySelector("h2").textContent = sc.spotlight.after.title;
  so.querySelector("p").textContent  = sc.spotlight.after.text;
  document.querySelector(".outro-title").textContent = sc.outro.title;

  // 5. 隐藏 Loading
  loader.classList.add("hidden");
  setTimeout(() => { loader.style.display = "none"; }, 700);

  // 6. 启动动画
  startAnimations();
}

/* ================================================================
  动画引擎
  ================================================================ */
function startAnimations() {
  const SPOTLIGHT_PIN_H  = 1.65;

  // ---- Lenis ----
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ================================================================
  //  第一屏
  // ================================================================
  const introSasaki  = document.querySelector(".char-intro-sasaki");
  const introTayamaClose = document.querySelector(".char-intro-tayama-close");
  const introLines   = document.querySelectorAll(".intro .line");
  const introSmokeL  = document.querySelector(".smoke-intro-left");
  const introSmokeR  = document.querySelector(".smoke-intro-right");
  const introEmber   = document.querySelector(".ember-intro");
  const heroItems    = document.querySelectorAll(".hero-copy > *");

  gsap.set(introSasaki, { x: -40, opacity: 0 });
  gsap.set(introTayamaClose, { x: 92, opacity: 0, scale: 1.04 });
  gsap.set(heroItems, { y: 24, opacity: 0 });

  ScrollTrigger.create({
    trigger: ".intro",
    start: "top center",
    once: true,
    toggleActions: "play none none none",
    onEnter: () => {
      gsap.to(heroItems, { y: 0, opacity: 1, duration: 0.85, stagger: 0.08, ease: "power4.out", delay: 0.12 });
      gsap.to(introSasaki, { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 });
      gsap.to(introTayamaClose, { x: 0, opacity: 1, scale: 1, duration: 1.15, ease: "power4.out", delay: 0.38 });
      gsap.to(introSasaki, { y: -4, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
      gsap.to(introTayamaClose, { y: -8, scale: 1.012, duration: 4.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
      gsap.to(introLines[0], { opacity: 1, y: 0, duration: 0.9, ease: "power4.out", delay: 0.48 });
      gsap.to(introLines[1], { opacity: 1, y: 0, duration: 0.9, ease: "power4.out", delay: 0.72 });
      if (introSmokeL) gsap.to(introSmokeL, { opacity: 0.2, y: -8, duration: 4, ease: "power1.out", delay: 0.5, repeat: -1, yoyo: true, repeatDelay: 2 });
      if (introSmokeR) gsap.to(introSmokeR, { opacity: 0.16, y: -6, duration: 4.5, ease: "power1.out", delay: 0.7, repeat: -1, yoyo: true, repeatDelay: 2.5 });
      if (introEmber)  gsap.to(introEmber,  { y: -15, opacity: 0.6, duration: 3, ease: "power1.inOut", delay: 0.8, repeat: -1, yoyo: true, repeatDelay: 1 });
    },
  });

  // ================================================================
  //  第二屏
  // ================================================================
  const msgBefore     = document.querySelector(".spotlight-content-in");
  const msgAfter      = document.querySelector(".spotlight-content-out");
  const yamada        = document.querySelector(".char-spotlight-yamada");
  const tayama        = document.querySelector(".char-spotlight-tayama");
  const bgInterior    = document.querySelector(".bg-interior");
  const bgBackdoorFade = document.querySelector(".bg-backdoor-fade");
  const portraitHalo  = document.querySelector(".portrait-halo");
  const portraitYamada = document.querySelector(".portrait-yamada");
  const portraitTayama = document.querySelector(".portrait-tayama");
  const portraitLines = gsap.utils.toArray(".portrait-line");
  const portraitWipe  = document.querySelector(".portrait-wipe");

  gsap.set(yamada, { opacity: 0.52 });
  gsap.set(tayama, { opacity: 0 });
  gsap.set(bgInterior, { opacity: 1 });
  gsap.set(bgBackdoorFade, { opacity: 0 });
  gsap.set(msgBefore, { opacity: 1, y: 0 });
  gsap.set(msgAfter, { opacity: 0, y: 18 });
  gsap.set(portraitHalo, { opacity: 0, scale: 0.92 });
  gsap.set(portraitYamada, { opacity: 0, x: 46, scale: 0.985 });
  gsap.set(portraitTayama, { opacity: 0, x: 52, scale: 1.015 });
  gsap.set(portraitLines, { opacity: 0, y: 18 });
  gsap.set(portraitWipe, { opacity: 0, xPercent: -190 });

  const timeline = gsap.timeline();
  ScrollTrigger.create({
    trigger: ".spotlight",
    start: "top top",
    end: () => `+=${window.innerHeight * SPOTLIGHT_PIN_H}px`,
    pin: true, pinSpacing: true, scrub: 0.75,
    animation: timeline,
  });

  timeline.to(bgInterior, { scale: 1.035, duration: 1.8, ease: "none" }, 0);
  timeline.to(portraitHalo, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.06);
  timeline.to(portraitYamada, { opacity: 1, x: 0, scale: 1, duration: 0.58, ease: "power4.out" }, 0.08);
  timeline.to(portraitLines, { opacity: 0.62, y: 0, duration: 0.42, stagger: 0.08, ease: "power3.out" }, 0.22);
  timeline.to(portraitWipe, { opacity: 1, xPercent: 180, duration: 0.72, ease: "power2.inOut" }, 0.88);
  timeline.to(msgBefore, { opacity: 0, y: -14, duration: 0.18, ease: "power2.in" }, 1.02);
  timeline.to(yamada, { opacity: 0, duration: 0.28, ease: "power2.inOut" }, 1.08);
  timeline.to(tayama, { opacity: 0.5, duration: 0.32, ease: "power2.inOut" }, 1.12);
  timeline.to(portraitYamada, { opacity: 0, x: -28, scale: 1.035, duration: 0.28, ease: "power2.inOut" }, 1.12);
  timeline.to(portraitTayama, { opacity: 1, x: 0, scale: 1, duration: 0.34, ease: "power3.out" }, 1.16);
  timeline.to(bgInterior, { opacity: 0, duration: 0.48, ease: "power2.inOut" }, 1.18);
  timeline.to(bgBackdoorFade, { opacity: 1, duration: 0.48, ease: "power2.inOut" }, 1.18);
  timeline.to(portraitWipe, { opacity: 0, duration: 0.24, ease: "power2.out" }, 1.45);
  timeline.to(portraitLines, { opacity: 0.28, duration: 0.36, ease: "power2.out" }, 1.46);
  timeline.to(msgAfter, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" }, 1.42);
  timeline.to(portraitHalo, { opacity: 0.72, duration: 0.35, ease: "power2.out" }, 1.56);

  gsap.to(tayama, { y: -4, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
  gsap.to(portraitTayama, { y: -7, scale: 1.01, duration: 4.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.3 });

  // ================================================================
  //  第三屏（增强版）
  // ================================================================
  const outCfg    = CFG.screens.outro.anim;
  const outroDuo  = document.querySelector(".char-outro-duo");
  const outroTitle = document.querySelector(".outro-title");
  const outroGlow = document.getElementById("outroGlowCenter");
  const outroSmoke = document.getElementById("outroSmokeImg");
  const outroEmber = document.querySelector(".ember-outro");
  const groundRefl = document.querySelector(".ground-refl");
  const outroCurtain = document.querySelector(".outro-curtain");

  gsap.set(outroDuo, { opacity: 0, scale: 1 });
  gsap.set(outroTitle, { opacity: 0, y: 28 });
  gsap.set(outroGlow, { opacity: 0.5 });
  gsap.set(outroSmoke, { opacity: 0, y: 0 });
  gsap.set(outroEmber, { opacity: 0, y: 0 });
  gsap.set(outroCurtain, { opacity: 0 });

  ScrollTrigger.create({
    trigger: ".outro",
    start: "top center",
    once: true,
    toggleActions: "play none none none",
    onEnter: () => {
      // 背影：极慢推进 scale 1 → 1.035
      gsap.to(outroDuo, {
        opacity: 1, duration: 1.2, ease: "power2.out",
      });
      gsap.to(outroDuo, {
        scale: outCfg.scaleEnd,
        duration: outCfg.scaleDur,
        ease: "linear",
        delay: 1.2,
      });

      gsap.to(outroTitle, {
        opacity: 1, y: 0,
        duration: 1,
        ease: "power4.out",
        delay: outCfg.textDelay,
      });

      gsap.to(outroCurtain, {
        opacity: 1,
        duration: 2.4,
        ease: "power2.out",
        delay: 0.55,
      });

      // 光晕：呼吸
      gsap.to(outroGlow, {
        opacity: 0.5 + outCfg.glowBreath,
        duration: outCfg.breathSpeed,
        repeat: -1, yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });

      // 地面反光
      if (groundRefl) {
        gsap.to(groundRefl, {
          opacity: 0.45, duration: 1.5, ease: "power2.out",
        });
      }

      // 烟雾：从底部缓升
      if (outroSmoke) {
        gsap.to(outroSmoke, {
          opacity: 0.15, y: -30,
          duration: 8,
          ease: "power1.out",
          delay: outCfg.smokeDelay,
          repeat: -1,
          repeatDelay: 3,
        });
      }

      // 火星：少量微浮
      if (outroEmber) {
        gsap.to(outroEmber, {
          opacity: 0.3, y: -15,
          duration: 5,
          ease: "power1.inOut",
          delay: outCfg.smokeDelay + 0.3,
          repeat: -1, yoyo: true,
          repeatDelay: 2,
        });
      }
    },
  });
}

/* ---- 启动 ---- */
document.addEventListener("DOMContentLoaded", init);
