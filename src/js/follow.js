import { isInViewport, rafSubscribe, rafUnsubscribe } from './rafHub.js';

/**
 * Mouse-follow offset for elements with [data-follow]
 */
export function createFollow({ isMobile = false, getDelta = () => 16.67 } = {}) {
  const follows = [];
  const LOOP_ID = 'follow';
  let mouse = { x: 0, y: 0 };
  let clock = 0;

  function getRemPx() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  function getTowards(state) {
    const rect = state.el.getBoundingClientRect();
    const rem = getRemPx();

    return {
      x: mouse.x - (rect.left + rect.width / 2) - (state.diag ? 8 * rem : 0),
      y:
        mouse.y -
        (rect.top + rect.height / 2) -
        (state.diag ? -rem : 0) +
        Math.sin(clock / 750) * rem,
    };
  }

  function jump(state) {
    const towards = getTowards(state);
    state.offset.x += towards.x;
    state.offset.y += towards.y;
  }

  function initOneFollow(el) {
    const selector = el.getAttribute('data-follow');
    if (!selector) return;

    const triggerEl = el.closest(selector) || document.querySelector(selector);
    if (!triggerEl) return;

    const state = {
      el,
      triggerEl,
      mouseInside: false,
      offset: { x: 0, y: 0 },
      rotation: 0,
      t: 0,
      jump: el.hasAttribute('data-follow-jump'),
      diag: el.hasAttribute('data-follow-diag'),
    };

    triggerEl.addEventListener('mouseenter', () => {
      state.mouseInside = true;
      if (state.jump) jump(state);
    });

    triggerEl.addEventListener('mouseleave', () => {
      state.mouseInside = false;
    });

    follows.push(state);
  }

  function needsUpdate() {
    return follows.some(
      (state) =>
        state.mouseInside ||
        Math.abs(state.offset.x) > 0.5 ||
        Math.abs(state.offset.y) > 0.5 ||
        Math.abs(state.rotation) > 0.1
    );
  }

  function render() {
    if (isMobile || !follows.length) return;

    const delta = getDelta() / 16.67;
    clock += getDelta();

    if (!needsUpdate()) return;

    follows.forEach((state) => {
      if (!isInViewport(state.el, 300)) return;

      const { offset } = state;

      if (state.mouseInside) {
        const towards = getTowards(state);
        offset.x += 0.1 * towards.x * delta;
        offset.y += 0.1 * towards.y * delta;
        const n = (towards.x + towards.y) / window.innerWidth;
        state.t += getDelta() * (1 + 50 * n);
        state.rotation = Math.sin(state.t / 1250) * (5 + 50 * n);
      } else if (!state.jump) {
        offset.x += 0.1 * -offset.x * delta;
        offset.y += 0.1 * -offset.y * delta;
        state.rotation += 0.1 * -state.rotation * delta;
      }

      state.el.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${state.rotation}deg)`;
    });
  }

  function init() {
    document.querySelectorAll('[data-follow]').forEach(initOneFollow);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  function start() {
    if (!isMobile) {
      rafSubscribe(LOOP_ID, render);
    }
  }

  function destroy() {
    rafUnsubscribe(LOOP_ID);
  }

  return { init, start, destroy };
}
