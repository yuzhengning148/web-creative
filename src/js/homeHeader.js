import { rafSubscribe, rafUnsubscribe } from './rafHub.js';

const INTRO_MS = 3500;
const DROP_INTERVAL = 3000;
const DROP_DOM_MS = 1000;
const FIRST_DROP_DELAY = 2400;

export function createHomeHeader() {
  const el = document.getElementById('home-header');
  if (!el) return { start: () => {}, destroy: () => {} };

  let inTime = 0;
  let inited = false;
  let dropTimer = FIRST_DROP_DELAY;
  let dropTimeoutId = 0;
  let subscribed = false;

  function finishDrop(card) {
    card.parentElement.prepend(card);
    card.classList.remove('drop');
    el.classList.remove('dropping');
  }

  function dropCard() {
    if (el.classList.contains('dropping')) return;

    const card = el.querySelector('.homeHeader__mediaCard:last-child');
    if (!card) return;

    el.classList.add('dropping');
    card.classList.add('drop');

    dropTimeoutId = window.setTimeout(() => {
      if (el.classList.contains('dropping')) finishDrop(card);
    }, DROP_DOM_MS);
  }

  function render(_now, delta) {
    if (!el) return;

    if (inTime < INTRO_MS) {
      if (el.classList.contains('in')) inTime += delta;
      return;
    }

    if (!inited) {
      el.classList.add('inited');
      inited = true;
    }

    if (el.classList.contains('dropping')) return;

    dropTimer -= delta;
    if (dropTimer < 0) {
      dropTimer += DROP_INTERVAL;
      dropCard();
    }
  }

  function start() {
    if (subscribed) return;
    subscribed = true;
    rafSubscribe('homeHeader', render);
  }

  function destroy() {
    rafUnsubscribe('homeHeader');
    clearTimeout(dropTimeoutId);
    subscribed = false;
    inited = false;
    inTime = 0;
    dropTimer = FIRST_DROP_DELAY;
  }

  return { start, destroy };
}
