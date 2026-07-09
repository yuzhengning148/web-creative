import { isInViewport, rafSubscribe, rafUnsubscribe } from './rafHub.js';

/**
 * Horizontal logo marquee (mobile logoBanner)
 */
export function createLooper() {
  const loops = [];
  const LOOP_ID = 'looper';
  let lastTime = 0;

  function initRail(el) {
    const speed = Number(el.getAttribute('data-looper-speed')) || -1;
    const logos = [...el.children];

    logos.forEach((logo) => {
      el.appendChild(logo.cloneNode(true));
    });

    loops.push({
      el,
      speed: speed * 0.35,
      offset: 0,
      width: el.scrollWidth / 2,
    });
  }

  function render(now) {
    const delta = lastTime ? (now - lastTime) / 16.67 : 1;
    lastTime = now;

    loops.forEach((loop) => {
      if (!isInViewport(loop.el, 100)) return;

      loop.offset += loop.speed * delta;

      if (loop.offset <= -loop.width) loop.offset += loop.width;
      if (loop.offset > 0) loop.offset -= loop.width;

      loop.el.style.transform = `translate3d(${loop.offset}px, 0, 0)`;
    });
  }

  function start() {
    loops.forEach((loop) => {
      loop.width = loop.el.scrollWidth / 2;
    });
    if (loops.length) {
      rafSubscribe(LOOP_ID, render);
    }
  }

  function init() {
    document.querySelectorAll('[data-looper]').forEach(initRail);
    window.addEventListener('resize', start);
  }

  function destroy() {
    rafUnsubscribe(LOOP_ID);
    window.removeEventListener('resize', start);
  }

  return { init, start, destroy };
}
