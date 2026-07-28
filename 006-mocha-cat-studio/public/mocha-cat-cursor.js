(function () {
  "use strict";

  if (
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1024px)").matches
  ) {
    return;
  }

  var ring = null;
  var dot = null;
  var lastX = 0;
  var lastY = 0;
  var speed = 0;
  var linkSelectors =
    "a, button, .slide-thumb, .pg-item, [data-cursor], .ns-logo, .budget-offer-btn, .btn-submit";

  function getTarget(node) {
    return node && node.closest ? node.closest(linkSelectors) : null;
  }

  function setSpeed(nextSpeed) {
    speed += (nextSpeed - speed) * 0.22;
    document.documentElement.style.setProperty(
      "--mc-cursor-speed",
      String(Math.min(speed, 36).toFixed(2)),
    );
  }

  function onMove(event) {
    var dx = event.clientX - lastX;
    var dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    setSpeed(Math.hypot(dx, dy));
  }

  function onOver(event) {
    if (!ring) return;
    var el = getTarget(event.target);
    if (!el) return;
    if (getTarget(event.relatedTarget) === el) return;

    ring.classList.add("is-mc-target");
    var mode = (el.dataset.cursor || "link").toLowerCase();
    ring.setAttribute("data-mc-mode", mode);
  }

  function onOut(event) {
    if (!ring) return;
    var el = getTarget(event.target);
    if (!el) return;
    if (getTarget(event.relatedTarget)) return;

    ring.classList.remove("is-mc-target");
    ring.removeAttribute("data-mc-mode");
  }

  function patchTrailStyle() {
    var styleEl = document.getElementById("dynamic-block-style");
    if (!styleEl) return;

    var observer = new MutationObserver(function () {
      if (!styleEl.textContent.includes("mc-trail-patched")) {
        styleEl.textContent = styleEl.textContent.replace(
          ".mouseTracker--01 {",
          ".mouseTracker--01 { /* mc-trail-patched */",
        );
      }
    });

    observer.observe(styleEl, { childList: true, characterData: true, subtree: true });
  }

  function init() {
    function boot() {
      document.documentElement.classList.add("mocha-cat-cursor");
      ring = document.getElementById("cursor-ring");
      dot = document.getElementById("cursor-dot");
      if (!ring && !dot) return;

      document.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, true);
      document.addEventListener("pointerout", onOut, true);
      patchTrailStyle();

      setInterval(function () {
        setSpeed(speed * 0.86);
      }, 32);
    }

    // Don't attach cursor work until loader is gone
    if (window._mochaCatLoaderDismissed || !document.getElementById("mocha-cat-loader")) {
      boot();
    } else {
      document.addEventListener("mocha-cat:loader-dismissed", boot, { once: true });
      window.setTimeout(boot, 4500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
