/**
 * pageConfig.js
 * 客户可直接修改此文件，无需动 HTML/CSS/JS 结构。
 * 支持 WebP 优先和 PNG fallback。
 */
const CFG = {
  /* ---- 主题色 ---- */
  colors: {
    bgDeep:    "oklch(13% 0.025 265)",
    bgMid:     "oklch(18% 0.035 262)",
    amber:     "oklch(72% 0.15 57)",
    amberDark: "oklch(47% 0.12 38)",
    textWarm:  "oklch(92% 0.035 76)",
    textDim:   "oklch(70% 0.038 74)",
  },

  /* ---- 视觉短片与首屏 ---- */
  product: {
    name: "Backdoor Meet",
    eyebrow: "咖啡色的猫",
    title: "Backdoor Meet",
    subtitle: "ねえ、今日もちゃんと会いに来たよ。",
  },

  /* ---- Loading 页 ---- */
  loading: {
    text: "もう少しだけ、待っててね。",
    barColor: "oklch(72% 0.15 57)",
    bg: "oklch(13% 0.025 265)",
  },

  /* ---- 图片资源 ---- */
  assets: {
    /* 人物 */
    sasaki:       { webp: "assets/characters/tayama-off-duty.webp",     png: "assets/characters/tayama-off-duty.png" },
    tayama:       { webp: "assets/characters/sasaki-office.webp",       png: "assets/characters/sasaki-office.png" },
    yamada:       { webp: "assets/characters/yamada-cashier.webp",      png: "assets/characters/yamada-cashier.png" },
    tayamaCloseup: { webp: "assets/characters/generated/tayama-closeup.webp", png: "assets/characters/generated/tayama-closeup.png" },
    yamadaCloseup: { webp: "assets/characters/generated/yamada-closeup.webp", png: "assets/characters/generated/yamada-closeup.png" },
    duoCloseup:    { webp: "assets/characters/generated/duo-back-closeup.webp", png: "assets/characters/generated/duo-back-closeup.png" },
    /* 背景 */
    bgBackdoor:   { webp: "assets/backgrounds/bg-backdoor-night.webp",  png: "assets/backgrounds/bg-backdoor-night.png" },
    bgInterior:   { webp: "assets/backgrounds/bg-supermarket-interior-blur.webp", png: "assets/backgrounds/bg-supermarket-interior-blur.png" },
    /* 效果 */
    glow:         { webp: "assets/effects/amber-light-glow.webp",       png: "assets/effects/amber-light-glow.png" },
    ember:        { webp: "assets/effects/ember-particles.webp",        png: "assets/effects/ember-particles.png" },
    doorLightOverlay: { webp: "assets/effects/generated/door-light-overlay.png", png: "assets/effects/generated/door-light-overlay.png" },
    glassReflectionOverlay: { webp: "assets/effects/generated/glass-reflection-overlay.png", png: "assets/effects/generated/glass-reflection-overlay.png" },
    smoke1:       { webp: "assets/effects/smoke-wisp-1.webp",           png: "assets/effects/smoke-wisp-1.png" },
    smoke2:       { webp: "assets/effects/smoke-wisp-2.webp",           png: "assets/effects/smoke-wisp-2.png" },
    smoke3:       { webp: "assets/effects/smoke-wisp-3.webp",           png: "assets/effects/smoke-wisp-3.png" },
    /* 前景 */
    boxes:        { webp: "assets/foreground/fg-boxes.webp",            png: "assets/foreground/fg-boxes.png" },
    groundRefl:   { webp: "assets/foreground/ground-reflection.webp",   png: "assets/foreground/ground-reflection.png" },
  },

  /* ---- 三屏内容 ---- */
  screens: {
    intro: {
      line1: "今日もおつかれさま。",
      line2: "一緒に帰ろ？",
    },
    spotlight: {
      before: {
        title: "あれ……？",
        text:  "その笑い方、どこかで見た気がする。",
      },
      after: {
        title: "やっぱり、君だったんだ。",
        text:  "制服の君も、今の君も、どっちも好きだよ。",
      },
    },
    outro: {
      title: "明日も、ここで待ってるね。",
      /* 第三屏动画参数 */
      anim: {
        scaleEnd:    1.05,    // 背影推进终点
        scaleDur:    10,      // 推进时长（秒）
        glowBreath:  0.12,    // 光晕呼吸幅度（opacity 变化量）
        breathSpeed: 5.5,     // 呼吸周期（秒）
        textDelay:   1.05,    // 文字延迟（秒）
        smokeDelay:  0.7,     // 烟雾延迟（秒）
      },
    },
  },

};

/* ---- 工具：根据 WebP 支持返回路径 ---- */
function asset(key) {
  const a = CFG.assets[key];
  if (!a) { console.warn("Unknown asset key:", key); return ""; }
  return CFG._webpSupported ? a.webp : a.png;
}

/* ---- 收集所有图片路径用于预加载 ---- */
function allAssetPaths() {
  return Object.keys(CFG.assets).map(asset).filter(Boolean);
}
