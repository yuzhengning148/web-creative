// ========================================
// 圣斗士星矢 冥王神话 — 黄金十二宫
// GSAP 唯美展示
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ---------- 星空微动 ----------
gsap.to(".stars", {
  backgroundPosition: "0 20px",
  duration: 60,
  repeat: -1,
  yoyo: true,
  ease: "none",
});

// ---------- Hero 入场 ----------
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTl
  .from(".hero-label", { y: 30, opacity: 0, duration: 1 })
  .from(".hero-title", { y: 50, opacity: 0, duration: 1.2 }, "-=0.6")
  .from(".hero-sub", { y: 20, opacity: 0, duration: 1 }, "-=0.8")
  .from(".hero-scroll", { opacity: 0, duration: 1 }, "-=0.5");

// Hero 滚出淡出
gsap.to(".hero", {
  opacity: 0.15,
  ease: "power2.in",
  scrollTrigger: {
    trigger: ".group-portrait",
    start: "top 80%",
    end: "top 30%",
    scrub: true,
  },
});

// ---------- 群像入场 ----------
gsap.from(".group-image", {
  scale: 0.92,
  opacity: 0,
  duration: 1.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".group-portrait",
    start: "top 75%",
    once: true,
  },
});

gsap.from(".group-caption", {
  y: 20,
  opacity: 0,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".group-portrait",
    start: "top 55%",
    once: true,
  },
});

// ---------- 画廊标题 ----------
gsap.from(".gallery-title", {
  y: 40,
  opacity: 0,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".gallery",
    start: "top 80%",
    once: true,
  },
});

// ---------- 卡片逐个入场 ----------
const cards = gsap.utils.toArray(".saint-card");

cards.forEach((card, i) => {
  gsap.from(card, {
    y: 60,
    opacity: 0,
    scale: 0.93,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: card,
      start: "top 88%",
      once: true,
    },
    delay: i * 0.06,
  });
});

// ---------- 尾页入场 ----------
gsap.from(".outro-text", {
  y: 40,
  opacity: 0,
  duration: 1.5,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".outro",
    start: "top 80%",
    once: true,
  },
});

gsap.from(".outro-author", {
  opacity: 0,
  duration: 1,
  delay: 0.5,
  scrollTrigger: {
    trigger: ".outro",
    start: "top 60%",
    once: true,
  },
});

// ---------- 启动 ----------
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
