import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isInViewport, rafSubscribe, rafUnsubscribe } from './rafHub.js';

/**
 * Scroll and pointer driven technical wheel.
 */
export function createTechStackWheel() {
  const section = document.querySelector('.clientLogos');
  const wheel = document.getElementById('tech-wheel');
  const stage = wheel?.querySelector('.techWheel__stage');
  const track = wheel?.querySelector('.techWheel__track');
  const items = track ? [...track.querySelectorAll('.techWheel__item')] : [];
  const activeIndexEl = document.getElementById('tech-active-index');
  const activeNameEl = document.getElementById('tech-active-name');
  const activeNoteEl = document.getElementById('tech-active-note');

  if (!section || !wheel || !stage || !track || !items.length) {
    return { start: () => {}, destroy: () => {} };
  }

  gsap.registerPlugin(ScrollTrigger);

  const LOOP_ID = 'techStackWheel';
  const triggers = [];
  let radius = 0;
  let scrollProgress = 0;
  let rotation = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let isStarted = false;
  let activeIndex = -1;

  const isMobile = window.matchMedia(
    '(orientation: portrait) and (max-width: 800px), (orientation: landscape) and (max-width: 1200px) and (max-height: 600px)'
  ).matches;

  function measure() {
    const rect = stage.getBoundingClientRect();
    radius = Math.min(rect.width, rect.height) * 0.39;
  }

  function setPointer(e) {
    const rect = stage.getBoundingClientRect();
    targetPointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetPointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function resetPointer() {
    targetPointerX = 0;
    targetPointerY = 0;
  }

  function angleDistance(a, b) {
    return Math.abs((((a - b + 180) % 360) + 360) % 360 - 180);
  }

  function updateCenter(index) {
    if (index === activeIndex) return;
    const item = items[index];
    if (!item) return;

    activeIndex = index;
    if (activeIndexEl) activeIndexEl.textContent = String(index + 1).padStart(2, '0');
    if (activeNameEl) activeNameEl.textContent = item.dataset.name || '';
    if (activeNoteEl) activeNoteEl.textContent = item.dataset.note || '';
  }

  function applyWheel() {
    if (!radius) measure();

    const count = items.length;
    const step = 360 / count;
    const focusAngle = 0;
    const baseRotation = 18 - scrollProgress * 292;
    const targetRotation = baseRotation + targetPointerX * 11;
    let nextActive = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    rotation += (targetRotation - rotation) * 0.075;
    pointerX += (targetPointerX - pointerX) * 0.08;
    pointerY += (targetPointerY - pointerY) * 0.08;

    track.style.setProperty('--wheel-rotation', `${rotation.toFixed(3)}deg`);
    track.style.setProperty('--wheel-tilt-x', `${(pointerX * 10).toFixed(3)}px`);
    track.style.setProperty('--wheel-tilt-y', `${(pointerY * 8).toFixed(3)}px`);

    items.forEach((item, index) => {
      const angle = index * step + rotation;
      const distance = angleDistance(angle, focusAngle);
      const rad = (angle * Math.PI) / 180;
      const focus = Math.max(0, 1 - distance / 92);
      const x = Math.cos(rad) * radius + pointerX * 10;
      const y = Math.sin(rad) * radius + pointerY * 8;
      const normalizedAngle = ((angle % 360) + 360) % 360;
      const readableAngle = normalizedAngle > 90 && normalizedAngle < 270 ? angle + 180 : angle;
      const scale = 0.82 + focus * 0.22;
      const opacity = 0.36 + focus * 0.64;
      const blur = Math.max(0, (1 - focus) * 0.45);
      const depth = Math.round(80 + focus * 70);

      if (distance < bestDistance) {
        bestDistance = distance;
        nextActive = index;
      }

      item.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) rotate(${readableAngle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      item.style.opacity = opacity.toFixed(3);
      item.style.filter = `blur(${blur.toFixed(2)}px)`;
      item.style.zIndex = String(depth);
      item.classList.toggle('is-active', distance < 28);
    });

    updateCenter(nextActive);
  }

  function render() {
    if (!isStarted || !isInViewport(section, 320)) return;
    applyWheel();
  }

  function initDesktop() {
    measure();

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate(self) {
        scrollProgress = self.progress;
      },
    });

    triggers.push(st);
    stage.addEventListener('mousemove', setPointer);
    stage.addEventListener('mouseleave', resetPointer);
    rafSubscribe(LOOP_ID, render);
    isStarted = true;
    applyWheel();
  }

  function start() {
    if (isMobile) return;

    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === section) st.kill();
    });

    initDesktop();
    ScrollTrigger.refresh();
  }

  function destroy() {
    isStarted = false;
    triggers.forEach((st) => st.kill());
    triggers.length = 0;
    rafUnsubscribe(LOOP_ID);
    stage.removeEventListener('mousemove', setPointer);
    stage.removeEventListener('mouseleave', resetPointer);
  }

  window.addEventListener('resize', () => {
    if (!isMobile && isStarted) {
      measure();
      ScrollTrigger.refresh();
    }
  });

  return { start, destroy };
}
