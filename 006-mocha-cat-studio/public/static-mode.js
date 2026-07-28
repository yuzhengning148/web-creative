(function () {
  "use strict";

  window.__MOCHA_CAT_STATIC__ = true;

  function isLoaderVideo(video) {
    return !!video.closest("#mocha-cat-loader");
  }

  function isCubeFaceVideo(video) {
    if (!video) return false;
    return (
      video.classList.contains("face-media") ||
      !!video.closest(".cube, .mobile-cube-face")
    );
  }

  function freezeCubeFaceVideo(video) {
    if (!video || video.dataset.staticFrozen === "1") return;
    video.dataset.staticFrozen = "1";
    if (!video.getAttribute("poster")) {
      video.setAttribute("poster", "/images/mocha/cube/01.jpg");
    }
    video.autoplay = false;
    video.loop = false;
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
    video.style.removeProperty("display");

    var pause = function () {
      try {
        video.pause();
        if (video.readyState >= 1) video.currentTime = 0;
      } catch (e) {}
    };

    if (video.readyState >= 1) pause();
    else video.addEventListener("loadeddata", pause, { once: true });
    video.addEventListener("play", pause);
    video.addEventListener("playing", pause);
  }

  function freezeDecorativeVideo(video) {
    if (!video || video.dataset.staticFrozen === "1") return;
    video.dataset.staticFrozen = "1";
    video.autoplay = false;
    video.loop = false;
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
    video.style.display = "none";

    var pause = function () {
      try {
        video.pause();
        if (video.readyState >= 1) video.currentTime = 0;
      } catch (e) {}
    };

    if (video.readyState >= 1) pause();
    else video.addEventListener("loadeddata", pause, { once: true });
    video.addEventListener("play", pause);
    video.addEventListener("playing", pause);
  }

  function freezeVideo(video) {
    if (isLoaderVideo(video)) return;
    if (isCubeFaceVideo(video)) freezeCubeFaceVideo(video);
    else freezeDecorativeVideo(video);
  }

  function hydrateCubeFaceImages() {
    document
      .querySelectorAll(
        "#cube img[data-defer-src], .mobile-cube img[data-defer-src]",
      )
      .forEach(function (img) {
        var nextSrc = img.dataset.deferSrc;
        if (!nextSrc) return;
        img.dataset.imageHydrated = "true";
        img.src = nextSrc;
        img.removeAttribute("data-defer-src");
      });
  }

  function prepareCubeFaceVideos() {
    document
      .querySelectorAll(
        "#cube video.face-media, .mobile-cube-face video",
      )
      .forEach(freezeCubeFaceVideo);
  }

  function freezeAllVideos() {
    document.querySelectorAll("video").forEach(freezeVideo);
  }

  function initStaticMode() {
    hydrateCubeFaceImages();
    prepareCubeFaceVideos();
    freezeAllVideos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStaticMode);
  } else {
    initStaticMode();
  }

  document.addEventListener("mocha-cat:activate-scroll-media", function () {
    hydrateCubeFaceImages();
    freezeAllVideos();
  });

  // Debounce + skip during loader — freezing on every DOM mutation fights the intro
  var freezeTimer = 0;
  new MutationObserver(function () {
    if (document.getElementById("mocha-cat-loader") && !window._mochaCatLoaderDismissed) return;
    if (freezeTimer) return;
    freezeTimer = window.setTimeout(function () {
      freezeTimer = 0;
      freezeAllVideos();
    }, 120);
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  function isHomePath() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    return path === "/" || path === "/home.html";
  }

  function bindLogoReplay() {
    document.addEventListener(
      "click",
      function (event) {
        var link = event.target.closest(".ns-logo");
        if (!link) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (isHomePath()) window.location.reload();
        else window.location.href = "/";
      },
      true,
    );
  }

  bindLogoReplay();
})();
