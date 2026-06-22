// ========================================
// 圣斗士星矢 冥王神话 — 黄金十二宫
// 射手座 · 滚轮缩放 + 光晕 + 粒子爆发
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ---------- 粒子系统 ----------
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.resize();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  // 中心爆发
  burst(amount = 80) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 7;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.006 + Math.random() * 0.02,
        size: 1 + Math.random() * 4,
        color: Math.random() < 0.4
          ? `hsl(${42 + Math.random() * 15}, 100%, ${60 + Math.random() * 40}%)`
          : `hsl(45, 100%, ${70 + Math.random() * 30}%)`,
      });
    }
  }

  // 持续飘散粒子（拉弓蓄力阶段用）
  emit(x, y) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1 - Math.random() * 3,
      life: 0.8,
      decay: 0.015,
      size: 1 + Math.random() * 2,
      color: `hsl(45, 100%, ${70 + Math.random() * 30}%)`,
    });
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.015;
      p.life -= p.decay;
      p.size *= 0.997;
      if (p.life <= 0) return false;
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * 4;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      return true;
    });
  }
}

// ---------- 初始化 ----------
const particleCanvas = document.getElementById("particlesCanvas");
const particleSystem = new ParticleSystem(particleCanvas);

function particlesLoop() {
  particleSystem.update();
  requestAnimationFrame(particlesLoop);
}
particlesLoop();

window.addEventListener("resize", () => particleSystem.resize());

// ---------- 射手座 缩放 + 光晕 + 爆发 ScrollTrigger ----------
const setupSagittarius = () => {
  const section = document.querySelector("#sagittarius");
  if (!section) return;

  const portrait = section.querySelector(".sisyphe-portrait img");
  const aura = section.querySelector(".gold-aura");
  const drawHint = section.querySelector(".draw-hint");
  const constellation = section.querySelector(".constellation");

  // 初始状态
  gsap.set(portrait, { scale: 0.85, filter: "drop-shadow(0 0 10px rgba(255,215,0,0.15))" });
  gsap.set(aura, { scale: 0.5, opacity: 0 });
  gsap.set(constellation, { opacity: 0.15 });

  // 蓄力阶段持续飘散
  let chargeParticles = null;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=400%",
    pin: true,
    anticipatePin: 1,
    scrub: 1.5,
    onEnter: () => {
      // 入场：图片淡入
      gsap.to(portrait, {
        scale: 0.9,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    onUpdate: (self) => {
      const progress = self.progress;

      // 阶段 1: 渐入 (0% - 25%)
      if (progress <= 0.25) {
        const p = progress / 0.25;
        gsap.to(portrait, {
          scale: 0.9 + p * 0.15,
          filter: `drop-shadow(0 0 ${10 + p * 30}px rgba(255,215,0,${0.15 + p * 0.25}))`,
          duration: 0,
          overwrite: true,
        });
        gsap.to(aura, { scale: 0.5 + p * 0.8, opacity: p * 0.5, duration: 0, overwrite: true });
      }

      // 阶段 2: 蓄力 (25% - 65%) — 图片持续放大 + 光晕增强
      if (progress > 0.25 && progress <= 0.65) {
        const p = (progress - 0.25) / 0.4;
        gsap.to(portrait, {
          scale: 1.05 + p * 0.2,
          filter: `drop-shadow(0 0 ${40 + p * 50}px rgba(255,215,0,${0.4 + p * 0.45}))`,
          duration: 0,
          overwrite: true,
        });
        gsap.to(aura, { scale: 1.3 + p * 0.8, opacity: 0.5 + p * 0.4, duration: 0, overwrite: true });
      }

      // 阶段 3: 顶峰 (65% - 75%) — 满弓
      if (progress > 0.65 && progress <= 0.75) {
        const p = (progress - 0.65) / 0.1;
        gsap.to(portrait, {
          scale: 1.25 + p * 0.05,
          filter: `drop-shadow(0 0 ${90 + p * 30}px rgba(255,215,0,${0.85 + p * 0.15}))`,
          duration: 0,
          overwrite: true,
        });
        gsap.to(aura, { scale: 2.1 + p * 0.3, opacity: 0.9 + p * 0.1, duration: 0, overwrite: true });
        // 顶峰蓄力粒子
        const rect = particleCanvas.getBoundingClientRect();
        particleSystem.emit(rect.width / 2 + (Math.random() - 0.5) * 100, rect.height / 2);
      }

      // 阶段 4: 释放爆发！(75% - 82%)
      if (progress > 0.75 && progress <= 0.82 && !self._burstFired) {
        const p = (progress - 0.75) / 0.07;
        self._burstFired = true;

        // 粒子大爆发
        particleSystem.burst(100);

        // 屏幕闪金
        gsap.to(section, {
          backgroundColor: "rgba(255,215,0,0.12)",
          duration: 0.05,
          yoyo: true,
          repeat: 1,
        });

        gsap.to(portrait, {
          scale: 1.35,
          filter: "drop-shadow(0 0 140px rgba(255,215,0,0.9))",
          duration: 0.05,
          overwrite: true,
        });
        gsap.to(aura, { scale: 3, opacity: 1, duration: 0.05, overwrite: true });
      }

      if (progress <= 0.75) {
        self._burstFired = false;
      }

      // 阶段 5: 余韵 (82% - 100%)
      if (progress > 0.82) {
        const p = (progress - 0.82) / 0.18;
        gsap.to(portrait, {
          scale: 1.35 - p * 0.2,
          filter: `drop-shadow(0 0 ${140 - p * 100}px rgba(255,215,0,${0.9 - p * 0.7}))`,
          duration: 0,
          overwrite: true,
        });
        gsap.to(aura, { scale: 3 - p * 1.5, opacity: 1 - p * 0.6, duration: 0, overwrite: true });
        gsap.to(constellation, { opacity: 0.15 + p * 0.45, duration: 0, overwrite: true });
        gsap.to(drawHint, { opacity: 0, duration: 0, overwrite: true });
      }
    },
    onLeave: () => {
      gsap.to(constellation, { opacity: 0.6, duration: 0.3 });
    },
    onEnterBack: () => {
      gsap.to(constellation, { opacity: 0.15, duration: 0.3 });
    },
  });
};

// ---------- 通用章节入场动画 ----------
const setupTempleEntrance = () => {
  const temples = gsap.utils.toArray(".temple:not(#sagittarius):not(.hero)");

  temples.forEach((temple) => {
    const content = temple.querySelector(".temple-content");
    if (!content) return;

    gsap.fromTo(
      content,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: temple,
          start: "top 70%",
          end: "top 30%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
};

// ---------- Hero 入场 ----------
const setupHero = () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      scrub: 0.8,
    },
  })
    .to(".hero .title-main", { y: -30, opacity: 0.3, duration: 1 }, 0)
    .to(".hero .title-sub", { y: -20, opacity: 0.2, duration: 1 }, 0.1)
    .to(".hero .chapter-label", { opacity: 0, duration: 0.5 }, 0)
    .to(".scroll-hint", { opacity: 0, duration: 0.8 }, 0.2);
};

// ---------- 启动 ----------
const boot = async () => {
  if (document.fonts?.ready) await document.fonts.ready;

  setupSagittarius();
  setupTempleEntrance();
  setupHero();

  ScrollTrigger.refresh();
};

window.addEventListener("load", boot);
