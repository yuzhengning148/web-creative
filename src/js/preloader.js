const CARD_COUNT = 8;
const FAN_ROTATIONS = [12, 6, 0, -5, -10];
const FAN_SCALES = [0.84, 0.88, 0.93, 0.97, 1];
const SNAP_DURATION = 0.82;
const HERO_REVEAL_AT = 0.72;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getRemPx() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

export function createPreloader({ onPrepare, onComplete } = {}) {
  const root = document.getElementById('preloader');
  const burst = document.getElementById('preloader-burst');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!root || !burst) {
    onPrepare?.();
    onComplete?.();
    return { start: () => onComplete?.() };
  }

  const cards = [];
  let rafId = 0;
  let phase = 'idle';
  let phaseStart = 0;
  let heroAnchor = { x: 0, y: 0, w: 0, h: 0 };
  let heroPrepared = false;
  let handoffDone = false;

  function clearTransitionFade() {
    const fade = document.querySelector('.transition-fade');
    if (!fade) return;
    fade.style.transition = 'none';
    fade.style.opacity = '0';
  }

  function prepareHero() {
    if (heroPrepared) return;
    heroPrepared = true;
    onPrepare?.();
    clearTransitionFade();
    root.style.backgroundColor = 'transparent';
    document.documentElement.classList.remove('is-preloading');
    document.documentElement.classList.remove('is-animating');
  }

  function handoffToHero() {
    if (handoffDone) return;
    handoffDone = true;

    const homeHeaderEl = document.getElementById('home-header');
    finish();
    measureHero();
    homeHeaderEl?.classList.add('is-ready');
    onComplete?.();
  }

  function getPosters() {
    const hero = [...document.querySelectorAll('.homeHeader__mediaCard')].map(
      (card) => card.innerHTML
    );
    const list = [];

    for (let i = 0; i < CARD_COUNT; i += 1) {
      list.push(hero[i % hero.length] || '');
    }

    return list;
  }

  function syncCardSize() {
    if (!heroAnchor.w || !heroAnchor.h) return;
    cards.forEach((card) => {
      card.w = heroAnchor.w;
      card.h = heroAnchor.h;
      card.el.style.width = `${card.w}px`;
      card.el.style.height = `${card.h}px`;
    });
  }

  function measureHero() {
    const el = document.querySelector('.homeHeader__mediaCards');
    if (!el) return;

    const rect = el.getBoundingClientRect();
    heroAnchor = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  }

  function buildCards() {
    const posters = getPosters();
    const rem = getRemPx();
    const isMobile = window.matchMedia(
      '(orientation: portrait) and (max-width: 800px), (orientation: landscape) and (max-width: 1200px) and (max-height: 600px)'
    ).matches;
    const cardW = (isMobile ? 18 : 34) * rem;
    const cardH = (isMobile ? 27 : 50) * rem;

    burst.innerHTML = '';

    posters.forEach((src, i) => {
      const el = document.createElement('div');
      el.className = 'preloader__card';
      el.style.width = `${cardW}px`;
      el.style.height = `${cardH}px`;

      const graphic = document.createElement('div');
      graphic.className = 'preloader__graphic';
      graphic.innerHTML = src;
      el.appendChild(graphic);
      burst.appendChild(el);

      const angle = (i / CARD_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
      const dist = window.innerWidth * (0.24 + Math.random() * 0.24);

      cards.push({
        el,
        w: cardW,
        h: cardH,
        isHero: i < 5,
        heroIndex: i < 5 ? i : -1,
        x: 0,
        y: 0,
        rot: 0,
        scale: 0.3,
        opacity: 0,
        explode: {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.65,
          rot: (Math.random() - 0.5) * 80,
          scale: 0.74 + Math.random() * 0.34,
        },
        snap: {
          x: 0,
          y: 0,
          rot: 0,
          scale: 1,
          opacity: 1,
        },
      });
    });

    cards.forEach((card) => {
      if (card.isHero) {
        const idx = card.heroIndex;
        card.snap.rot = FAN_ROTATIONS[idx];
        card.snap.scale = FAN_SCALES[idx];
        card.snap.opacity = 1;
      } else {
        card.snap.opacity = 0;
        card.snap.scale = 0.2;
      }
    });
  }

  function applyCard(card) {
    const tx = heroAnchor.x - card.w / 2 + card.x;
    const ty = heroAnchor.y - card.h / 2 + card.y;
    card.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${card.rot}deg) scale(${card.scale})`;
    card.el.style.opacity = String(card.opacity);
    card.el.style.zIndex = card.isHero ? String(10 + card.heroIndex) : String(Math.round(card.opacity * 5));
  }

  function setPhase(next) {
    if (phase === next) return;
    phase = next;
    phaseStart = performance.now();
  }

  function update() {
    const now = performance.now();
    const t = (now - phaseStart) / 1000;

    if (phase === 'cluster') {
      const p = easeOutCubic(Math.min(t / 0.25, 1));
      cards.forEach((card) => {
        card.x = 0;
        card.y = 0;
        card.rot = lerp(-12, 0, p);
        card.scale = lerp(0.15, 0.55, p);
        card.opacity = p;
        applyCard(card);
      });

      if (t >= 0.25) setPhase('explode');
    } else if (phase === 'explode') {
      const p = easeOutCubic(Math.min(t / 0.48, 1));
      cards.forEach((card) => {
        card.x = lerp(0, card.explode.x, p);
        card.y = lerp(0, card.explode.y, p);
        card.rot = lerp(0, card.explode.rot, p);
        card.scale = lerp(0.55, card.explode.scale, p);
        card.opacity = 1;
        applyCard(card);
      });

      if (t >= 0.48) setPhase('snap');
    } else if (phase === 'snap') {
      const p = easeInOutCubic(Math.min(t / SNAP_DURATION, 1));
      cards.forEach((card) => {
        card.x = lerp(card.explode.x, card.snap.x, p);
        card.y = lerp(card.explode.y, card.snap.y, p);
        card.rot = lerp(card.explode.rot, card.snap.rot, p);
        card.scale = lerp(card.explode.scale, card.snap.scale, p);
        if (card.isHero) {
          card.opacity = card.heroIndex === 4 ? 1 : lerp(1, 0, p);
        } else {
          card.opacity = lerp(1, 0, p);
        }
        applyCard(card);
      });

      if (p >= HERO_REVEAL_AT) prepareHero();

      if (t >= SNAP_DURATION) {
        handoffToHero();
        return;
      }
    }

    rafId = requestAnimationFrame(update);
  }

  function finish() {
    cancelAnimationFrame(rafId);
    root.classList.add('is-exiting');
    root.remove();
  }

  function waitForReady() {
    const minDelay = new Promise((r) => setTimeout(r, 170));
    const fonts = document.fonts?.ready ?? Promise.resolve();

    return Promise.all([minDelay, fonts]);
  }

  function start() {
    document.documentElement.classList.add('is-preloading');

    if (reduceMotion) {
      waitForReady().then(() => {
        prepareHero();
        handoffToHero();
      });
      return;
    }

    measureHero();
    syncCardSize();
    buildCards();
    cards.forEach(applyCard);

    waitForReady().then(() => {
      measureHero();
      syncCardSize();
      cards.forEach(applyCard);
      setPhase('cluster');
      rafId = requestAnimationFrame(update);
    });
  }

  window.addEventListener('resize', measureHero);

  return { start, destroy: () => cancelAnimationFrame(rafId) };
}
