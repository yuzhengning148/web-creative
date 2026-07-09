/**
 * Parallax + scroll word reveal (pal-reveal) — desktop mediaSentence
 */
import { isInViewport, rafSubscribe, rafUnsubscribe } from './rafHub.js';

export function createPalReveal({ isMobile = false, getScrollY = () => window.scrollY } = {}) {
  const pals = [];
  const LOOP_ID = 'palReveal';
  let center = 0;

  function initReveal(el, move) {
    let html = el.innerHTML;
    el.innerHTML = '';

    html = html
      .replaceAll(' class', '¥class')
      .replaceAll(' src', '¥src')
      .replaceAll('</p>', '</p> ')
      .replaceAll('</picture>', '</picture> ')
      .replaceAll('&nbsp;', '');

    const tokens = html.split(' ');
    const words = [];
    let totalLength = 0;
    let currentP = null;
    let inPicture = false;
    let inWindow = false;
    let pictureBuffer = '';

    tokens.forEach((raw) => {
      let token = raw;
      if (!token || token === '\n') return;

      let charLen = token
        .replaceAll('<strong>', '')
        .replaceAll('</strong>', '')
        .replaceAll('<i>', '')
        .replaceAll('</i>', '')
        .replaceAll('<p>', '')
        .replaceAll('</p>', '')
        .length;

      let className = '';

      if (token.includes('<p>')) {
        token = token.replaceAll('<p>', '');
        currentP = document.createElement('p');
        el.appendChild(currentP);
      }
      if (token.includes('</p>')) {
        token = token.replaceAll('</p>', '');
      }

      if (token.includes('class="window"') || token.includes("class='window'")) {
        inWindow = true;
        pictureBuffer = '';
      }
      if (token.includes('<picture>')) {
        inPicture = true;
        pictureBuffer = '';
      }

      token = token.replaceAll('¥class', ' class').replaceAll('¥src', ' src');
      let content = `${token} `;

      if (inWindow || inPicture) {
        pictureBuffer += content;
        if (token.includes('</span>') || token.includes('</picture>')) {
          inWindow = false;
          inPicture = false;
          content = pictureBuffer;
          charLen = 10;
          pictureBuffer = '';
          className = 'm';
        } else {
          return;
        }
      }

      const span = document.createElement('span');
      span.innerHTML = content;
      if (className) span.className = className;
      if (currentP) currentP.appendChild(span);
      else el.appendChild(span);

      words.push({ el: span, offset: totalLength, in: false });
      totalLength += charLen + 1;
    });

    move.words = words;
    move.totalLength = totalLength;
    move.runOnMobile = true;
  }

  function getOffset(pal) {
    const rect = pal.el.getBoundingClientRect();
    pal.offset = rect.top + getScrollY() + rect.height * pal.ratio;
  }

  function initEl(el) {
    const pal = { el, offset: 0, ratio: 0.5, moves: [] };

    el.querySelectorAll('[data-pal]').forEach((target) => {
      const move = {
        el: target,
        speed: Number(target.getAttribute('data-pal')) || 1,
        xSpeed: Number(target.getAttribute('data-pal-x')) || Number(target.getAttribute('data-pal')) || 1,
        rotateSpeed: Number(target.getAttribute('data-pal-rotate')) || Number(target.getAttribute('data-pal')) || 1,
        push: Number(target.getAttribute('data-pal-push')) || 0,
        offset: 0,
        lerpMove: 0,
        lerp: Number(target.getAttribute('data-pal-lerp')) || 0,
        rotate: target.classList.contains('pal-rotate'),
        moveX: target.classList.contains('pal-moveX'),
        moveY: target.classList.contains('pal-moveY'),
        scale: target.classList.contains('pal-scale'),
        opacity: target.classList.contains('pal-opacity'),
        clamp: target.classList.contains('pal-clamp'),
        reveal: target.classList.contains('pal-reveal'),
        reverseClamp: target.classList.contains('pal-reverse-clamp'),
        runOnMobile: target.classList.contains('pal-mobile'),
        mobileSpeed: Number(target.getAttribute('data-pal-mobile')) || Number(target.getAttribute('data-pal')) || 1,
        mobileOnly: target.classList.contains('pal-mobile-only'),
        words: [],
        totalLength: 0,
      };

      pal.moves.push(move);
      if (move.reveal) initReveal(target, move);
    });

    getOffset(pal);
    setTimeout(() => getOffset(pal), 0);
    pals.push(pal);

    if (!isMobile) renderOne(pal);
  }

  function renderOne(pal) {
    if (!isInViewport(pal.el, 400)) return;

    const d = center - pal.offset;
    let f = (d / window.innerWidth) * 10;
    const baseF = f;

    pal.moves.forEach((move) => {
      f = baseF;
      if (move.lerp) {
        move.lerpMove += (f - move.lerpMove) / move.lerp;
        f = move.lerpMove;
      }

      const useMobile = isMobile && move.runOnMobile;
      const skipDesktop = isMobile && move.mobileOnly === false && !move.runOnMobile;
      if (isMobile ? !useMobile && !move.mobileOnly : move.mobileOnly) return;
      if (skipDesktop) return;

      const speed = isMobile ? move.mobileSpeed : move.speed;
      const n = speed * (f + move.push);
      let x = (n * move.xSpeed) / speed;
      let rot = move.rotateSpeed * (f + move.push);
      let transform = '';

      let y = n;
      if (move.clamp) {
        y = Math.min(y, 0);
        x = Math.min(x, 0);
        rot = Math.min(rot, 0);
      }
      if (move.reverseClamp) {
        y = Math.max(y, 0);
        x = Math.max(x, 0);
        rot = Math.max(rot, 0);
      }

      if (move.moveY) transform += ` translateY(${y}rem)`;
      if (move.moveX) transform += ` translateX(${x}rem)`;
      if (move.rotate) transform += ` rotate(${rot}deg)`;

      if (move.opacity) {
        const opacity = Math.max(0, Math.min(1, n));
        move.el.style.opacity = String(opacity);
      }

      if (move.reveal) {
        const progress = speed * (f + move.push);
        move.words.forEach((word) => {
          const threshold = progress * move.totalLength - word.offset;
          if (threshold < 0 && word.in) {
            word.el.classList.remove('in');
            word.in = false;
          }
          if (threshold > 1 && !word.in) {
            word.el.classList.add('in');
            word.in = true;
          }
        });
      }

      if (transform) move.el.style.transform = transform.trim();
    });
  }

  function render() {
    if (isMobile) return;
    center = getScrollY() + window.innerHeight / 2;
    pals.forEach(renderOne);
  }

  function init() {
    document.querySelectorAll('.pal').forEach(initEl);
  }

  function start() {
    if (!isMobile) rafSubscribe(LOOP_ID, render);
  }

  function onResize() {
    pals.forEach(getOffset);
  }

  function destroy() {
    rafUnsubscribe(LOOP_ID);
    window.removeEventListener('resize', onResize);
  }

  window.addEventListener('resize', onResize);

  return { init, start, destroy, onResize };
}
