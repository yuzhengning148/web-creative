gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", "0.8, 0, 0.2, 1");
CustomEase.create("hop2", "0.9, 0, 0.1, 1");

const splitText = (selector, type, className, mask = true) => {
  return SplitText.create(selector, {
    type: type,
    [`${type}Class`]: className,
    ...(mask && { mask: type }),
  });
};

const preloadImages = (selector) => {
  const images = gsap.utils.toArray(`${selector} img`);

  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
    ),
  );
};

const preloaderImgInitRotations = [7.5, -2.5, -10, 12.5, -5, 5];

const initAnimation = () => {
  document.body.classList.add("is-loading");

  splitText(".preloader-header h1", "chars", "char");
  splitText("nav a", "words", "word");
  splitText(".header h1", "chars", "char", false);
  splitText(".hero-footer p", "words", "word");

  gsap.set(".preloader-img", {
    xPercent: -50,
    yPercent: -50,
    scale: 0,
    rotate: (i) => preloaderImgInitRotations[i],
  });

  const tl = gsap.timeline({
    delay: 0.5,
    onComplete: () => {
      document.body.classList.remove("is-loading");
      gsap.set(".preloader", {
        visibility: "hidden",
        pointerEvents: "none",
      });
    },
  });

  tl.to(".preloader-img", {
    scale: 1,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: 1,
    ease: "hop",
    stagger: 0.2,
  });

  tl.to(
    ".preloader-header h1 .char",
    {
      y: "0%",
      duration: 1,
      ease: "hop2",
      stagger: { each: 0.125, from: "random" },
    },
    "0.35",
  );

  tl.to(
    ".preloader-counter p",
    {
      y: "0%",
      duration: 1,
      ease: "hop2",
      onStart: () => {
        const counterEl = document.querySelector(".preloader-counter p");
        const counter = { value: 0 };

        gsap.to(counter, {
          value: 100,
          duration: 2,
          delay: 0.5,
          ease: "power2.inOut",
          onUpdate: () => {
            counterEl.textContent = String(Math.round(counter.value)).padStart(
              3,
              "0",
            );
          },
        });
      },
    },
    "<",
  );

  tl.to(
    ".preloader-counter p",
    {
      y: "-100%",
      duration: 0.75,
      ease: "hop2",
    },
    3.25,
  );

  tl.to(
    ".preloader-header h1 .char",
    {
      y: "-100%",
      duration: 0.75,
      ease: "hop2",
      stagger: { each: 0.125, from: "random" },
    },
    3.25,
  );

  tl.to(
    ".preloader-images .preloader-img",
    {
      scale: 0,
      clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
      duration: 1,
      ease: "hop2",
      stagger: -0.075,
    },
    3.5,
  );

  tl.to(
    ".preloader",
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "hop2",
    },
    4.35,
  );

  tl.to(
    ".header h1 .char",
    {
      y: "0%",
      duration: 1,
      ease: "hop",
      stagger: { each: 0.075, from: "random" },
    },
    4.65,
  );

  tl.to(
    "nav a .word",
    {
      y: "0%",
      duration: 1,
      ease: "hop",
      stagger: 0.075,
    },
    4.75,
  );

  tl.to(
    ".hero-footer p .word",
    {
      y: "0%",
      duration: 1,
      ease: "hop",
      stagger: 0.075,
    },
    4.75,
  );
};

const boot = async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await preloadImages(".preloader-img");
  initAnimation();
};

boot();
