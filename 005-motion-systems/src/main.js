import './styles/hero.css';
import './styles/nav.css';
import './styles/mediaSentence.css';
import './styles/workSlider.css';
import './styles/companyData.css';
import './styles/clientLogos.css';
import './styles/arrowButton.css';
import './styles/callToAction.css';
import './styles/footer.css';
import './styles/preloader.css';
import { initSpanner } from './js/spanner.js';
import { createAnima } from './js/anima.js';
import { createHomeHeader } from './js/homeHeader.js';
import { createPalReveal } from './js/palReveal.js';
import { createWorkSlider } from './js/workSlider.js';
import { createTechStackWheel } from './js/techStackWheel.js';
import { createLooper } from './js/looper.js';
import { createFollow } from './js/follow.js';
import { createNav } from './js/nav.js';
import { createPreloader } from './js/preloader.js';
import { renderContent } from './js/renderContent.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const isMobile = window.matchMedia(
  '(orientation: portrait) and (max-width: 800px), (orientation: landscape) and (max-width: 1200px) and (max-height: 600px)'
).matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lastTime = performance.now();
let lenis = null;
let siteAnima = null;
let modules = null;

function getScrollY() {
  return lenis ? lenis.scroll : window.scrollY;
}

function initLenis() {
  if (prefersReducedMotion) return;
  if (lenis) return;

  lenis = new Lenis({
    duration: 0.6,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function getDelta() {
  const now = performance.now();
  const delta = now - lastTime;
  lastTime = now;
  return delta;
}

function prepareApp() {
  siteAnima = createAnima({ isMobile });
  modules = {
    homeHeader: createHomeHeader(),
    palReveal: createPalReveal({ isMobile, getScrollY }),
    workSlider: createWorkSlider({ isMobile: isMobile || prefersReducedMotion }),
    techStackWheel: createTechStackWheel(),
    looper: createLooper(),
    follow: createFollow({ isMobile, getDelta }),
    nav: createNav(),
  };

  modules.palReveal.init();
  modules.looper.init();
  modules.nav.init();

  document.getElementById('home-header')?.classList.add('from-preloader');
}

function finishApp() {
  initLenis();
  modules?.follow.init();
  modules?.follow.start();
  modules?.looper.start();
  modules?.homeHeader.start();
  modules?.workSlider.start();
  if (!prefersReducedMotion) {
    modules?.techStackWheel.start();
  }
  modules?.palReveal.start();

  requestAnimationFrame(() => {
    siteAnima?.init();
  });

  window.addEventListener('load', () => modules?.palReveal.onResize());
}

function init() {
  renderContent();
  initSpanner();

  const preloader = createPreloader({ onPrepare: prepareApp, onComplete: finishApp });
  preloader.start();
}

init();
