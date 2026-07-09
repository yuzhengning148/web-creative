import { isInViewport, rafSubscribe, rafUnsubscribe } from './rafHub.js';

/**
 * Scroll-driven horizontal work carousel (slider-cards)
 */
export function createWorkSlider({ isMobile = false } = {}) {
  const el = document.getElementById('slider-cards');
  if (!el) return { start: () => {}, destroy: () => {} };

  const stick = document.getElementById('slider-stick');
  const rail = document.getElementById('slider-rail');
  const cards = rail ? [...rail.querySelectorAll('.sliderCard')] : [];
  const sliderCurrent = document.getElementById('slider-current');
  const sliderProgress = document.getElementById('slider-progress');
  const ctaCard = rail?.querySelector('.workCard--cta') ?? null;
  const ctaMedia = ctaCard?.querySelector('.workCard__media') ?? null;
  const ctaIndex = ctaCard ? cards.indexOf(ctaCard) : -1;
  const offset = Number(el.getAttribute('data-slider-offset')) || 0;

  const LOOP_ID = 'workSlider';

  function render() {
    if (!stick || !rail || !cards.length) return;

    if (!isInViewport(el, 300)) return;

    const sectionRect = el.getBoundingClientRect();
    const stickRect = stick.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const scrollRange = sectionRect.height - stickRect.height;

    if (scrollRange <= 0) return;

    const r = offset * (isMobile ? 0.5 : 1);
    const progress = -sectionRect.top / scrollRange + r;
    const threshold = isMobile ? 0.1 : 0.25;

    el.classList.toggle('scrolled', threshold < progress);
    el.classList.toggle('before', progress < 0);
    el.classList.toggle('after', 1 + r < progress);
    el.classList.toggle('done', 1 < progress);
    el.classList.toggle('inside', 0 < progress && progress < 1 + r);

    const startOffset = (isMobile ? 0.12 : 0.24) * window.innerWidth;
    const translateX = startOffset - railRect.width * progress;
    rail.style.transform = `translate3d(${translateX}px, 0, 0)`;

    const activeIndex = Math.min(
      cards.length - 1,
      Math.max(0, Math.floor(progress * cards.length))
    );

    cards.forEach((card, index) => {
      card.classList.toggle('active', index === activeIndex);
    });

    if (sliderCurrent) {
      sliderCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    if (sliderProgress) {
      sliderProgress.parentElement?.style.setProperty(
        '--work-progress',
        String((activeIndex + 1) / cards.length)
      );
    }

    if (ctaMedia && ctaIndex >= 0) {
      const cardProgress = progress * cards.length - ctaIndex;
      const ctaFill = Math.min(1, Math.max(0, cardProgress));
      ctaMedia.style.setProperty('--cta-fill', String(ctaFill));
    }
  }

  function start() {
    rafSubscribe(LOOP_ID, render);
  }

  function destroy() {
    rafUnsubscribe(LOOP_ID);
  }

  return { start, destroy };
}
