// ========================================
// 冥王神话 · 黄金十二宫 — 影像集
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ---------- 封面入场 ----------
gsap.timeline({ defaults: { ease: "power3.out" } })
  .from(".cover-line", { scaleY: 0, duration: 1.2, transformOrigin: "top" })
  .from(".cover h1", { y: 40, opacity: 0, duration: 1.4 }, "-=0.8")
  .from(".cover-sub", { opacity: 0, duration: 1 }, "-=0.8")
  .from(".cover-note", { opacity: 0, duration: 1.2 }, "-=0.6");

// ---------- 每个展开页：图片 + 文字依次淡入 ----------
const spreads = gsap.utils.toArray(".spread");

spreads.forEach((spread) => {
  const img = spread.querySelector(".spread-image img");
  const caption = spread.querySelector(".spread-caption");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: spread,
      start: "top 75%",
      once: true,
    },
  });

  tl.from(img, { opacity: 0, duration: 1.5, ease: "power2.out" })
    .from(caption, { y: 20, opacity: 0, duration: 1, ease: "power2.out" }, "-=1");
});

// ---------- 图片微幅视差 ----------
gsap.utils.toArray(".spread-image img").forEach((img) => {
  gsap.fromTo(img, {
    y: 30,
  }, {
    y: -30,
    ease: "none",
    scrollTrigger: {
      trigger: img.closest(".spread"),
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
});

// ---------- 末页 ----------
gsap.from(".colophon-line", {
  scaleY: 0,
  duration: 1,
  transformOrigin: "top",
  scrollTrigger: {
    trigger: ".colophon",
    start: "top 80%",
    once: true,
  },
});

gsap.from(".colophon p", {
  y: 20,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".colophon",
    start: "top 70%",
    once: true,
  },
});

// ---------- 启动 ----------
window.addEventListener("load", () => ScrollTrigger.refresh());
