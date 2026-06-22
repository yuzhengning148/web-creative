// ========================================
// 圣斗士星矢 冥王神话 — 黄金十二宫
// 射手座 · 拉弓交互
// ========================================

gsap.registerPlugin(ScrollTrigger);

// ---------- 粒子系统 ----------
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.isBursting = false;
    this.resize();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  burst(x, y) {
    const count = 60;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.025,
        size: 1 + Math.random() * 3,
        color: Math.random() < 0.3
          ? `hsl(${45 + Math.random() * 15}, 100%, ${60 + Math.random() * 40}%)`
          : `hsl(${45}, 100%, ${70 + Math.random() * 30}%)`,
      });
    }
    this.isBursting = true;
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // 微重力
      p.life -= p.decay;
      p.size *= 0.995;

      if (p.life <= 0) return false;

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * 3;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      return true;
    });

    if (this.particles.length === 0) this.isBursting = false;
  }
}

// ---------- 初始化粒子 ----------
const particleCanvas = document.getElementById("particlesCanvas");
const particleSystem = new ParticleSystem(particleCanvas);

function particlesLoop() {
  particleSystem.update();
  requestAnimationFrame(particlesLoop);
}
particlesLoop();

window.addEventListener("resize", () => particleSystem.resize());

// ---------- 射手座拉弓 ScrollTrigger ----------
const setupSagittarius = () => {
  const section = document.querySelector("#sagittarius");
  if (!section) return;

  const bow = section.querySelector(".bow");
  // const bowLimbs = section.querySelector(".bow-limbs");
  const bowstring = section.querySelector(".bowstring");
  const arrow = section.querySelector(".arrow");
  const arrowShaft = section.querySelector(".arrow-shaft");
  const drawHint = section.querySelector(".draw-hint");
  const constellation = section.querySelector(".constellation");

  // 弓初始状态
  gsap.set(bow, { transformOrigin: "50% 80%" });
  gsap.set(arrow, { transformOrigin: "50% 100%" });
  gsap.set(bowstring, { attr: { x1: 55, y1: 65, x2: 55, y2: 205 } });

  // 箭头初始 — 搭在弓弦上
  gsap.set(arrow, {
    y: 80,
    x: -30,
    rotation: -30,
  });

  // 创建主时间线
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=400%",       // 滚动 4 倍视口高度来完整体验
      scrub: 1.5,
      pin: true,
      anticipatePin: 1,
      onEnter: () => {
        // 弓出现动画
        gsap.to(".bow-limbs", {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        // 重置
        gsap.set(".bow-limbs", { strokeDashoffset: 500 });
      },
    },
  });

  // 阶段 1: 拉弓 (0% - 60%)
  tl.to(bowstring, {
    attr: { x1: 85, y1: 70, x2: 95, y2: 190 },
    duration: 0.6,
    ease: "power2.inOut",
  }, 0)
  .to(arrow, {
    x: -80,
    y: 60,
    rotation: -35,
    duration: 0.6,
    ease: "power2.inOut",
  }, 0)
  .to(".bow-limbs", {
    stroke: "#ffec8b",
    strokeWidth: 5,
    duration: 0.6,
    ease: "power2.inOut",
  }, 0)
  // 弓身弯曲加剧
  .to(bow, {
    scaleX: 1.15,
    scaleY: 0.9,
    duration: 0.6,
    ease: "power2.inOut",
  }, 0);

  // 阶段 2: 满弓蓄力 (60% - 75%)
  tl.to(bowstring, {
    attr: { x1: 95, y1: 85, x2: 100, y2: 175 },
    duration: 0.15,
    ease: "power1.in",
  })
  .to(arrow, {
    x: -100,
    y: 50,
    rotation: -38,
    duration: 0.15,
    ease: "power1.in",
  }, "<")
  .to(bow, {
    scaleX: 1.22,
    scaleY: 0.85,
    duration: 0.15,
    ease: "power1.in",
  }, "<");

  // 阶段 3: 释放！(75% - 85%)
  tl.to(arrow, {
    y: -400,
    x: 200,
    rotation: 20,
    opacity: 0,
    duration: 0.1,
    ease: "power3.out",
    onStart: () => {
      // 粒子爆发
      const rect = particleCanvas.getBoundingClientRect();
      const cx = rect.width * 0.4;
      const cy = rect.height * 0.45;
      particleSystem.burst(cx, cy);

      // 闪烁
      gsap.to(section, {
        backgroundColor: "rgba(255,215,0,0.08)",
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    },
  })
  .to(bowstring, {
    attr: { x1: 55, y1: 65, x2: 55, y2: 205 },
    duration: 0.08,
    ease: "power4.out",
  }, "<")
  .to(bow, {
    scaleX: 1,
    scaleY: 1,
    duration: 0.1,
    ease: "elastic.out(1, 0.4)",
  }, "<")
  .to(".bow-limbs", {
    stroke: "url(#goldGradient)",
    strokeWidth: 4,
    duration: 0.15,
  }, "<")
  .to(constellation, {
    opacity: 1,
    duration: 0.2,
  }, "<");

  // 阶段 4: 余韵 (85% - 100%)
  tl.to(drawHint, {
    opacity: 0,
    duration: 0.15,
  })
  .to(constellation, {
    opacity: 0.3,
    duration: 0.15,
  })
  .to(".constellation line", {
    opacity: 0.15,
    duration: 0.15,
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

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      scrub: 0.8,
    },
  });

  tl.to(".hero .title-main", { y: -30, opacity: 0.3, duration: 1 }, 0)
    .to(".hero .title-sub", { y: -20, opacity: 0.2, duration: 1 }, 0.1)
    .to(".hero .chapter-label", { opacity: 0, duration: 0.5 }, 0)
    .to(".scroll-hint", { opacity: 0, duration: 0.8 }, 0.2);
};

// ---------- 弓弦闪烁（待拉弓状态下微微脉冲） ----------
const setupBowIdlePulse = () => {
  const bowstring = document.querySelector("#sagittarius .bowstring");
  if (!bowstring) return;

  // 微弱的脉冲提示
  gsap.to("#sagittarius .arrow", {
    y: "+=3",
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
};

// ---------- 启动 ----------
const boot = async () => {
  if (document.fonts?.ready) await document.fonts.ready;

  setupSagittarius();
  setupTempleEntrance();
  setupHero();
  setupBowIdlePulse();

  // ScrollTrigger 初始化后刷新
  ScrollTrigger.refresh();
};

window.addEventListener("load", boot);
