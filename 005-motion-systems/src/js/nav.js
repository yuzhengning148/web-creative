/**
 * Navigation — mobile menu toggle
 */
export function createNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const menuBg = document.querySelector('.nav__menuBg');

  function openMenu() {
    document.documentElement.classList.add('menu-open');
    nav?.classList.add('is-open');
  }

  function closeMenu() {
    document.documentElement.classList.remove('menu-open');
    nav?.classList.remove('is-open');
  }

  function toggleMenu() {
    if (document.documentElement.classList.contains('menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function init() {
    toggle?.addEventListener('click', toggleMenu);
    menuBg?.addEventListener('click', closeMenu);

    nav?.addEventListener('click', (e) => {
      if (e.target.closest('a') && !e.target.closest('.ignore-nav-close')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  return { init, openMenu, closeMenu, toggleMenu };
}
