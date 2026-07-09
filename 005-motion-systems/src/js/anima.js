const DELAY_STEP = 50;
const BASE_DELAY = 100;

export function createAnima({ isMobile = false } = {}) {
  const observers = [];

  function getDelay(el) {
    let delay = Number(el.getAttribute('data-anima-delay'));
    if (!delay) delay = isMobile ? 1 : 0;
    if (isMobile && el.classList.contains('smd')) delay = 1;
    return delay * DELAY_STEP + BASE_DELAY;
  }

  function enter(el) {
    if (el.classList.contains('in')) return;
    el.classList.remove('out');
    const ms = getDelay(el);
    setTimeout(() => {
      el.classList.add('in');
    }, ms);
  }

  function run(el) {
    if (el.classList.contains('anima')) {
      enter(el);
    }
    el.querySelectorAll('.anima').forEach((child) => enter(child));
    el.classList.remove('scroll');
  }

  function init() {
    document.querySelectorAll('.entry').forEach(run);

    const scrollEls = document.querySelectorAll('.scroll');

    scrollEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (inView) {
        run(el);
        return;
      }

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                run(entry.target);
                io.unobserve(entry.target);
              }
            });
          },
          {
            threshold: isMobile ? 0 : 0.15,
            rootMargin: isMobile ? `${window.innerHeight * 0.05}px` : '0px',
          }
        );
        io.observe(el);
        observers.push(io);
      } else {
        run(el);
      }
    });
  }

  function destroy() {
    observers.forEach((io) => io.disconnect());
  }

  return { init, destroy, enter, run };
}
