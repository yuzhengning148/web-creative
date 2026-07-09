/**
 * Single shared requestAnimationFrame loop for scroll/motion modules.
 */
const callbacks = new Map();
let rafId = 0;
let lastTime = 0;

function tick(now) {
  const delta = lastTime ? now - lastTime : 0;
  lastTime = now;
  callbacks.forEach((fn) => fn(now, delta));
  rafId = requestAnimationFrame(tick);
}

export function rafSubscribe(id, fn) {
  callbacks.set(id, fn);
  if (!rafId) {
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }
}

export function rafUnsubscribe(id) {
  callbacks.delete(id);
  if (!callbacks.size && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    lastTime = 0;
  }
}

export function isInViewport(el, margin = 200) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.bottom > -margin && rect.top < window.innerHeight + margin;
}
