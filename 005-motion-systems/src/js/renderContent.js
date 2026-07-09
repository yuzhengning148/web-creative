import { abilities, motionProjects, techStack } from './contentData.js';

function twoDigit(index) {
  return String(index + 1).padStart(2, '0');
}

function renderProjectGraphic(project) {
  const graphics = {
    signal: `
      <path class="workGraphic__signal" d="M86 604C190 358 356 270 520 366S626 518 704 162"></path>
      <rect class="workGraphic__signalBlock" x="632" y="142" width="42" height="42"></rect>
    `,
    grid: `
      <path class="workGraphic__signal" d="M84 520C204 420 328 430 438 348S600 206 692 244"></path>
      <rect class="workGraphic__signalBlock" x="640" y="222" width="38" height="38"></rect>
    `,
    offset: `
      <path class="workGraphic__blue" d="M116 560L258 414L414 458L646 248"></path>
      <rect class="workGraphic__blueBlock" x="632" y="230" width="40" height="40"></rect>
    `,
    pulse: `
      <circle class="workGraphic__rings" cx="382" cy="360" r="214"></circle>
      <rect class="workGraphic__signalBlock" x="520" y="336" width="44" height="44"></rect>
    `,
    trace: `
      <path class="workGraphic__signal workGraphic__dash" d="M90 602C172 246 346 182 470 316S570 568 704 126"></path>
      <rect class="workGraphic__signalBlock" x="682" y="104" width="38" height="38"></rect>
    `,
    loop: `
      <path class="workGraphic__blue" d="M168 236C306 96 532 108 588 252S488 526 306 486S122 288 260 244"></path>
      <rect class="workGraphic__blueBlock" x="540" y="272" width="38" height="38"></rect>
    `,
    frame: `
      <rect class="workGraphic__frame" x="150" y="138" width="426" height="382"></rect>
      <rect class="workGraphic__blueBlock" x="552" y="496" width="40" height="40"></rect>
    `,
  };

  return `
    <div class="workGraphic workGraphic--${project.visual}" aria-hidden="true">
      <svg viewBox="0 0 760 720" preserveAspectRatio="none">
        <rect class="workGraphic__paper" width="760" height="720"></rect>
        ${graphics[project.visual] || graphics.grid}
        <text class="workGraphic__badge" x="62" y="92">${project.number}</text>
        <text class="workGraphic__tag" x="62" y="126">${project.title}</text>
      </svg>
    </div>
  `;
}

function renderProjects() {
  const rail = document.getElementById('slider-rail');
  if (!rail) return;

  rail.innerHTML = motionProjects
    .map(
      (project) => `
        <div class="workCard sliderCard">
          <div class="workCard__media">
            <img src="${project.image}" class="media img" alt="${project.alt}" loading="lazy" decoding="async" />
            ${renderProjectGraphic(project)}
          </div>
          <div class="workCard__content">
            <p class="subheading">${project.number} / ${project.title}</p>
            <h3 class="workCard__heading h0"><p>${project.title}</p></h3>
            <p class="workCard__copy">${project.text}</p>
          </div>
        </div>
      `
    )
    .join('');
}

function renderAbilities() {
  const list = document.getElementById('ability-list');
  if (!list) return;

  list.innerHTML = abilities
    .map((item) => `<li><strong>${item.name}</strong><span>${item.note}</span></li>`)
    .join('');
}

function renderTechStack() {
  const track = document.getElementById('tech-stack-track');
  const mobileRail = document.getElementById('tech-stack-mobile');
  const notes = {
    Vite: 'Fast local build rhythm.',
    JavaScript: 'Interaction logic and state.',
    GSAP: 'Timeline control for motion.',
    ScrollTrigger: 'Scroll mapped to intent.',
    Lenis: 'Smooth reading velocity.',
    IntersectionObserver: 'Visibility as a signal.',
    requestAnimationFrame: 'One loop for live motion.',
    'Responsive Images': 'Sharp assets per viewport.',
    'Web Performance': 'Motion without drag.',
  };

  if (track) {
    track.innerHTML = techStack
      .map(
        (name, index) => {
          const modifiers = [
            name === 'GSAP' ? 'techWheel__item--signal' : '',
            name === 'requestAnimationFrame' ? 'techWheel__item--cobalt' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `
          <div class="techWheel__item ${modifiers}" data-name="${name}" data-note="${notes[name]}">
            <span class="techWheel__node" aria-hidden="true"></span>
            <span class="techWheel__index">${twoDigit(index)}</span>
            <span class="techWheel__name">${name}</span>
          </div>
        `;
        }
      )
      .join('');
  }

  if (mobileRail) {
    mobileRail.innerHTML = techStack
      .map((name) => `<span class="techWheelMobile__item">${name}</span>`)
      .join('');
  }
}

export function renderContent() {
  renderProjects();
  renderAbilities();
  renderTechStack();
}
