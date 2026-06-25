gsap.registerPlugin(SplitText);

const spotlightSection = document.querySelector(".spotlight");
const marqueeStrip = document.querySelector(".spotlight-marquee");
const marqueeTrack = document.querySelector(".spotlight-marquee-track");
const cursor = document.querySelector(".cursor");

/* ---- Config ---- */
const config = {
  marqueeScrollSpeed: 120,
  stripFollowEase: 0.06,
  stripEdgeInset: 200,
  contentRiseRate: 0.85,
  risenTopGap: 100,
  liftHeadStart: 140,
  wakeStrength: 2.8,
  wakeReach: 130,
  lineSettleEase: 0.08,
};

/* ---- Marquee clone loop ---- */
const sourceItems = Array.from(marqueeTrack.children);
const oneSetWidth = sourceItems.reduce(
  (sum, item) => sum + item.offsetWidth,
  0,
);
const setsNeeded = Math.ceil(window.innerWidth / oneSetWidth) + 1;

for (let copy = 0; copy < setsNeeded; copy++) {
  sourceItems.forEach((item) => marqueeTrack.appendChild(item.cloneNode(true)));
}

gsap.to(marqueeTrack, {
  x: `-=${oneSetWidth}`,
  duration: oneSetWidth / config.marqueeScrollSpeed,
  ease: "none",
  repeat: -1,
  modifiers: {
    x: (x) => `${gsap.utils.wrap(-oneSetWidth, 0, parseFloat(x))}px`,
  },
});

/* ---- Geometry state ---- */
let stripBaseTop = 0;
let stripHeight = 0;
let sectionHeight = 0;
let stripRestCenterY = 0;
let contentTopAtRest = 0;

let stripTargetY = 0;
let stripCurrentY = 0;
let stripPrevY = 0;
let hasPointerMoved = false;

let textLines = [];

function measureGeometry() {
  sectionHeight = spotlightSection.getBoundingClientRect().height;
  stripBaseTop = marqueeStrip.offsetTop;
  stripHeight = marqueeStrip.offsetHeight;

  stripRestCenterY = config.stripEdgeInset;

  let blockTop = Infinity;
  textLines.forEach((line) => {
    let y = 0;
    let node = line.el;
    while (node && node !== spotlightSection) {
      y += node.offsetTop;
      node = node.offsetParent;
    }
    line.restCenterY = y + line.el.offsetHeight / 2;
    blockTop = Math.min(blockTop, line.restCenterY - line.el.offsetHeight / 2);
  });
  contentTopAtRest = isFinite(blockTop) ? blockTop : sectionHeight * 0.4;

  if (!hasPointerMoved) {
    const restY = config.stripEdgeInset - stripBaseTop - stripHeight / 2;
    stripTargetY = restY;
    stripCurrentY = restY;
    stripPrevY = restY;
  }
}

/* ---- Split text into lines ---- */
const splitTargets = gsap.utils.toArray(
  ".spotlight-content-wrapper h1, .spotlight-content-wrapper h3, .spotlight-copy p",
);

splitTargets.forEach((element) => {
  SplitText.create(element, {
    type: "lines",
    linesClass: "line",
    onSplit(instance) {
      textLines = textLines.filter((line) => line.source !== element);
      instance.lines.forEach((lineEl) => {
        textLines.push({
          el: lineEl,
          restCenterY: 0,
          currentY: 0,
          source: element,
        });
      });
      measureGeometry();
    },
  });
});

window.addEventListener("resize", measureGeometry);

/* ---- Mouse move -> marquee follows ---- */
spotlightSection.addEventListener("mousemove", (event) => {
  hasPointerMoved = true;
  const bounds = spotlightSection.getBoundingClientRect();
  const cursorY = event.clientY - bounds.top;

  const wantedY = cursorY - stripBaseTop - stripHeight / 2;
  const highestY = config.stripEdgeInset - stripBaseTop - stripHeight / 2;
  const lowestY =
    sectionHeight - config.stripEdgeInset - stripBaseTop - stripHeight / 2;
  stripTargetY = gsap.utils.clamp(highestY, lowestY, wantedY);
});

/* ---- Custom cursor ---- */
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cursorTargetX = cursorX;
let cursorTargetY = cursorY;

document.addEventListener("mousemove", (e) => {
  cursorTargetX = e.clientX;
  cursorTargetY = e.clientY;
});

/* ---- Hover detection for cursor scale ---- */
document.querySelectorAll("a, button, .spotlight-nav p").forEach((el) => {
  el.style.cursor = "none";
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

/* ---- Tick loop ---- */
gsap.ticker.add(() => {
  /* Marquee strip follow */
  stripCurrentY += (stripTargetY - stripCurrentY) * config.stripFollowEase;
  gsap.set(marqueeStrip, { y: stripCurrentY });

  const stripCenterY = stripBaseTop + stripCurrentY + stripHeight / 2;
  const stripVelocityY = stripCurrentY - stripPrevY;
  stripPrevY = stripCurrentY;

  const descentBelowRest = Math.max(0, stripCenterY - stripRestCenterY);
  const maxRise = Math.max(0, contentTopAtRest - config.risenTopGap);
  const contentRise = -Math.min(
    descentBelowRest * config.contentRiseRate,
    maxRise,
  );

  textLines.forEach((line) => {
    const gapToStrip = line.restCenterY - stripCenterY;
    const reachedLine = stripCenterY + config.liftHeadStart >= line.restCenterY;
    const wakeInfluence = Math.exp(
      -(gapToStrip * gapToStrip) / (2 * config.wakeReach * config.wakeReach),
    );
    const wakeOffset = stripVelocityY * wakeInfluence * config.wakeStrength;
    const lineTarget = (reachedLine ? contentRise : 0) + wakeOffset;

    line.currentY += (lineTarget - line.currentY) * config.lineSettleEase;
    gsap.set(line.el, { y: line.currentY });
  });

  /* Custom cursor follow */
  cursorX += (cursorTargetX - cursorX) * 0.15;
  cursorY += (cursorTargetY - cursorY) * 0.15;
  cursor.style.left = cursorX + "px";
  cursor.style.top = cursorY + "px";
});

/* ---- Entry animation ---- */
gsap.fromTo(
  ".spotlight-content-wrapper > *",
  { opacity: 0, y: 24 },
  {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
    delay: 0.3,
  },
);

gsap.fromTo(
  ".spotlight-nav, .spotlight-footer",
  { opacity: 0 },
  {
    opacity: 1,
    duration: 1,
    ease: "power2.out",
    delay: 0.6,
  },
);

gsap.fromTo(
  ".spotlight-marquee",
  { opacity: 0 },
  {
    opacity: 1,
    duration: 1.4,
    ease: "power2.inOut",
    delay: 0.2,
  },
);
