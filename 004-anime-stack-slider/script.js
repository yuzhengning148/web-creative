import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js";

// === ANIME-THEMED SLIDES (EVA × JJK) ===
const slides = [
    {
        name: "A.T. Field",
        kana: "エーティーフィールド",
        img: "assets/img1.jpg",
    },
    {
        name: "NERV HQ",
        kana: "ネルフ本部",
        img: "assets/img2.jpg",
    },
    {
        name: "Third Impact",
        kana: "サードインパクト",
        img: "assets/img3.jpg",
    },
    {
        name: "Angel Attack",
        kana: "使徒、来襲",
        img: "assets/img4.jpg",
    },
    {
        name: "Beast Mode",
        kana: "暴走モード",
        img: "assets/img5.jpg",
    },
    {
        name: "Domain Expansion",
        kana: "領域展開",
        img: "assets/img6.jpg",
    },
    {
        name: "Hollow Purple",
        kana: "虚式「茈」",
        img: "assets/img7.jpg",
    },
    {
        name: "Black Flash",
        kana: "黒閃",
        img: "assets/img8.jpg",
    },
    {
        name: "Cursed Energy",
        kana: "呪力",
        img: "assets/img9.jpg",
    },
    {
        name: "Infinite Void",
        kana: "無量空処",
        img: "assets/img10.jpg",
    },
];

// === CONFIG ===
const config = {
    minHeight: 1,
    maxHeight: 1.5,
    aspectRatio: 1.5,
    gap: 0.05,
    smoothing: 0.05,
    distortionStrength: 2.5,
    distortionSmoothing: 0.1,
    momentumFriction: 0.95,
    momentumThreshold: 0.001,
    wheelSpeed: 0.01,
    wheelMax: 150,
    dragSpeed: 0.01,
    dragMomentum: 0.01,
    touchSpeed: 0.01,
    touchMomentum: 0.1,
};

// === DOM ELEMENTS ===
const canvas = document.querySelector("canvas");
const titleElement = document.querySelector("p#slide-title");
const counterElement = document.querySelector("p#slide-count");
const kanaElement = document.querySelector("#slide-kana");
const statusSlideElement = document.querySelector("#status-slide");

// === THREE.JS SETUP ===
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color("#07060a");

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 5;

// === UTILS ===
const wrap = (value, range) => ((value % range) + range) % range;
const zeroPad = (n) => String(n).padStart(2, "0");

// === SLIDE GEOMETRY SETUP ===
const totalSlides = slides.length;

const slideHeights = Array.from(
    { length: totalSlides },
    () =>
        config.minHeight + Math.random() * (config.maxHeight - config.minHeight)
);

const slideOffsets = [];
let stackPosition = 0;

for (let i = 0; i < totalSlides; i++) {
    if (i === 0) {
        slideOffsets.push(0);
        stackPosition = slideHeights[0] / 2;
    } else {
        stackPosition += config.gap + slideHeights[i] / 2;
        slideOffsets.push(stackPosition);
        stackPosition += slideHeights[i] / 2;
    }
}

const loopLength = stackPosition + config.gap + slideHeights[0] / 2;
const halfLoop = loopLength / 2;

const meshes = [];
const textureLoader = new THREE.TextureLoader();

for (let i = 0; i < totalSlides; i++) {
    const height = slideHeights[i];
    const width = height * config.aspectRatio;

    const geometry = new THREE.PlaneGeometry(width, height, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: new THREE.Color("#1a1530"),
        transparent: true,
        opacity: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData = {
        originalVertices: [...geometry.attributes.position.array],
        offset: slideOffsets[i],
        name: slides[i].name,
        index: i,
    };

    textureLoader.load(slides[i].img, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;

        // 淡入动画: 纹理加载完成后平滑显示
        const start = performance.now();
        const fadeIn = (time) => {
            const elapsed = (time - start) / 1000;
            const progress = Math.min(1, elapsed / 0.5);
            material.opacity = progress;
            if (progress < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        requestAnimationFrame(fadeIn);

        // 适配宽高比
        const imageAspect = texture.image.width / texture.image.height;
        const planeAspect = width / height;
        const ratio = imageAspect / planeAspect;

        if (ratio > 1) mesh.scale.y = 1 / ratio;
        else mesh.scale.x = ratio;
    });

    scene.add(mesh);
    meshes.push(mesh);
}

// === DISTORTION (velocity-driven card bend) ===
function applyDistortion(mesh, positionY, strength) {
    const positions = mesh.geometry.attributes.position;
    const original = mesh.userData.originalVertices;

    for (let i = 0; i < positions.count; i++) {
        const x = original[i * 3];
        const y = original[i * 3 + 1];

        const distance = Math.sqrt(x * x + (positionY + y) ** 2);
        const falloff = Math.max(0, 1 - distance / 2);
        const bend = Math.pow(Math.sin((falloff * Math.PI) / 2), 1.5);
        positions.setZ(i, bend * strength);
    }

    positions.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
}

// === SCROLL STATE ===
let scrollPosition = 0;
let scrollTarget = 0;
let scrollMomentum = 0;
let isScrolling = false;
let lastFrameTime = 0;

let distortionAmount = 0;
let distortionTarget = 0;
let velocityPeak = 0;
let scrollDirection = 0;
let directionTarget = 0;
const velocityHistory = [0, 0, 0, 0, 0];

let isDragging = false;
let dragStartY = 0;
let dragDelta = 0;
let touchStartY = 0;
let touchLastY = 0;

let activeSlideIndex = -1;

const addDistortionBurst = (amount) => {
    distortionTarget = Math.min(1, distortionTarget + amount);
};

// === INPUT HANDLERS ===

// Mouse Wheel
window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        const clampedDelta =
            Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), config.wheelMax);

        addDistortionBurst(Math.abs(clampedDelta) * 0.001);
        scrollTarget += clampedDelta * config.wheelSpeed;
        isScrolling = true;

        clearTimeout(window._scrollTimeout);
        window._scrollTimeout = setTimeout(() => (isScrolling = false), 150);
    },
    { passive: false }
);

// Touch Start
window.addEventListener(
    "touchstart",
    (e) => {
        touchStartY = touchLastY = e.touches[0].clientY;
        isScrolling = false;
        scrollMomentum = 0;
    },
    { passive: false }
);

// Touch Move
window.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();

        const deltaY = e.touches[0].clientY - touchLastY;
        touchLastY = e.touches[0].clientY;

        addDistortionBurst(Math.abs(deltaY) * 0.02);
        scrollTarget -= deltaY * config.touchSpeed;
        isScrolling = true;
    },
    { passive: false }
);

// Touch End
window.addEventListener("touchend", () => {
    const swipeVelocity = (touchLastY - touchStartY) * 0.005;

    if (Math.abs(swipeVelocity) > 0.5) {
        scrollMomentum = -swipeVelocity * config.touchMomentum;
        addDistortionBurst(Math.abs(swipeVelocity) * 0.45);
        isScrolling = true;
        setTimeout(() => (isScrolling = false), 800);
    }
});

// Mouse Drag
canvas.style.cursor = "grab";

window.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartY = e.clientY;
    dragDelta = 0;
    scrollMomentum = 0;
    canvas.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartY;
    dragStartY = e.clientY;
    dragDelta = deltaY;

    addDistortionBurst(Math.abs(deltaY) * 0.02);
    scrollTarget -= deltaY * config.dragSpeed;
    isScrolling = true;
});

window.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    canvas.style.cursor = "grab";

    if (Math.abs(dragDelta) > 2) {
        scrollMomentum = -dragDelta * config.dragMomentum;
        addDistortionBurst(Math.abs(dragDelta) * 0.005);
        isScrolling = true;
        setTimeout(() => (isScrolling = false), 800);
    }
});

// Keyboard Navigation (Arrow Keys)
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const direction = e.key === "ArrowDown" ? 1 : -1;
        addDistortionBurst(0.3);
        scrollTarget += direction * 0.4;
        isScrolling = true;
        clearTimeout(window._scrollTimeout);
        window._scrollTimeout = setTimeout(() => (isScrolling = false), 400);
    }
});

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === SNAP-TO-SLIDE (magnetic settle after scrolling stops) ===
function snapToNearestSlide() {
    if (isScrolling) return;

    let nearestOffset = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < totalSlides; i++) {
        const offset = slideOffsets[i];
        const dist = Math.abs(wrap(scrollPosition - offset + halfLoop, loopLength) - halfLoop);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearestOffset = offset;
        }
    }

    // Gentle magnetic pull to nearest slide
    const currentWrapped = wrap(scrollPosition, loopLength);
    const targetWrapped = wrap(nearestOffset, loopLength);
    let diff = targetWrapped - currentWrapped;

    if (Math.abs(diff) > loopLength / 2) {
        diff = diff > 0 ? diff - loopLength : diff + loopLength;
    }

    if (Math.abs(diff) > 0.001) {
        scrollTarget += diff * 0.08;
    }
}

// === ANIMATION LOOP ===
function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = lastFrameTime ? (time - lastFrameTime) / 1000 : 0.016;
    lastFrameTime = time;

    const previousScroll = scrollPosition;

    if (isScrolling) {
        scrollTarget += scrollMomentum;
        scrollMomentum *= config.momentumFriction;
        if (Math.abs(scrollMomentum) < config.momentumThreshold) scrollMomentum = 0;
    }

    // Snap after scrolling stops
    if (!isScrolling && Math.abs(scrollMomentum) < config.momentumThreshold) {
        snapToNearestSlide();
    }

    scrollPosition += (scrollTarget - scrollPosition) * config.smoothing;

    const frameDelta = scrollPosition - previousScroll;

    if (Math.abs(frameDelta) > 0.00001) {
        directionTarget = frameDelta > 0 ? 1 : -1;
    }
    scrollDirection += (directionTarget - scrollDirection) * 0.08;

    const velocity = Math.abs(frameDelta) / deltaTime;

    velocityHistory.push(velocity);
    velocityHistory.shift();
    const averageVelocity =
        velocityHistory.reduce((a, b) => a + b) / velocityHistory.length;

    if (averageVelocity > velocityPeak) velocityPeak = averageVelocity;

    const isDecelerating =
        averageVelocity / (velocityPeak + 0.001) < 0.7 && velocityPeak > 0.5;
    velocityPeak *= 0.99;

    if (velocity > 0.05)
        distortionTarget = Math.max(distortionTarget, Math.min(1, velocity * 0.1));

    if (isDecelerating || averageVelocity < 0.2)
        distortionTarget *= isDecelerating ? 0.95 : 0.855;

    distortionAmount +=
        (distortionTarget - distortionAmount) * config.distortionSmoothing;

    const signedDistortion = distortionAmount * scrollDirection;

    let closestDistance = Infinity;
    let closestIndex = 0;

    meshes.forEach((mesh) => {
        const { offset } = mesh.userData;

        let y = -(offset - wrap(scrollPosition, loopLength));
        y = wrap(y + halfLoop, loopLength) - halfLoop;

        mesh.position.y = y;

        if (Math.abs(y) < closestDistance) {
            closestDistance = Math.abs(y);
            closestIndex = mesh.userData.index;
        }

        if (Math.abs(y) < halfLoop + config.maxHeight) {
            applyDistortion(mesh, y, config.distortionStrength * signedDistortion);
        }
    });

    // Update UI when active slide changes
    if (closestIndex !== activeSlideIndex) {
        activeSlideIndex = closestIndex;
        const slide = slides[activeSlideIndex];
        titleElement.textContent = slide.name;
        counterElement.textContent = `${zeroPad(activeSlideIndex + 1)} / ${zeroPad(totalSlides)}`;
        kanaElement.textContent = slide.kana;
        if (statusSlideElement) {
            statusSlideElement.textContent = `CURRENT: ${zeroPad(activeSlideIndex + 1)}`;
        }
    }

    renderer.render(scene, camera);
}

// === BOOT ===
// Initialize first slide display
titleElement.textContent = slides[0].name;
counterElement.textContent = `01 / ${zeroPad(totalSlides)}`;
kanaElement.textContent = slides[0].kana;

animate();
