const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("particle-field");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const heroVideo = document.getElementById("hero-video");
const heroMedia = document.querySelector(".hero-media");
const introLoader = document.getElementById("intro-loader");
const loaderProgress = document.getElementById("loader-progress");
const loaderCount = document.getElementById("loader-count");

let proteins = [];
let vesicles = [];
let cells = [];

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};
const ambientEnabled =
  !prefersReducedMotion && canvas && window.getComputedStyle(canvas).display !== "none";

function sizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function buildSceneParticles() {
  const proteinCount = Math.min(120, Math.floor(window.innerWidth / 10));
  proteins = Array.from({ length: proteinCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.8,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));

  const vesicleCount = Math.min(26, Math.floor(window.innerWidth / 65));
  vesicles = Array.from({ length: vesicleCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 7 + 4,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    phase: Math.random() * Math.PI * 2
  }));

  cells = Array.from({ length: 3 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.max(170, Math.min(window.innerWidth, window.innerHeight) * (0.14 + Math.random() * 0.1)),
    phase: Math.random() * Math.PI * 2
  }));
}

function animateBackground() {
  if (!ambientEnabled) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const t = performance.now() * 0.001;

  ctx.clearRect(0, 0, w, h);

  for (const cell of cells) {
    const cx = cell.x + Math.sin(t * 0.18 + cell.phase) * 22;
    const cy = cell.y + Math.cos(t * 0.14 + cell.phase) * 16;

    const membrane = ctx.createRadialGradient(cx, cy, cell.r * 0.28, cx, cy, cell.r);
    membrane.addColorStop(0, "rgba(0, 114, 178, 0.06)");
    membrane.addColorStop(0.7, "rgba(0, 158, 115, 0.03)");
    membrane.addColorStop(1, "rgba(0, 114, 178, 0)");

    ctx.beginPath();
    ctx.arc(cx, cy, cell.r, 0, Math.PI * 2);
    ctx.fillStyle = membrane;
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 114, 178, 0.16)";
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + Math.sin(t * 0.3 + cell.phase) * cell.r * 0.2, cy + Math.cos(t * 0.27 + cell.phase) * cell.r * 0.18, cell.r * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 114, 178, 0.12)";
    ctx.fill();
  }

  for (let i = 0; i < proteins.length; i += 1) {
    const p = proteins[i];

    const dxp = pointer.x - p.x;
    const dyp = pointer.y - p.y;
    const dist = Math.hypot(dxp, dyp) || 1;
    const pull = Math.max(0, 120 - dist) / 4300;

    p.vx += (dxp / dist) * pull;
    p.vy += (dyp / dist) * pull;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -12) p.x = w + 12;
    if (p.x > w + 12) p.x = -12;
    if (p.y < -12) p.y = h + 12;
    if (p.y > h + 12) p.y = -12;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(213, 94, 0, 0.75)";
    ctx.fill();

    for (let j = i + 1; j < proteins.length; j += 1) {
      const q = proteins[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 88) {
        const a = (1 - d / 88) * 0.18;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(230, 159, 0, ${a})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }
  }

  for (const v of vesicles) {
    const dxp = pointer.x - v.x;
    const dyp = pointer.y - v.y;
    const dist = Math.hypot(dxp, dyp) || 1;
    const pull = Math.max(0, 150 - dist) / 7200;

    v.vx += (dxp / dist) * pull;
    v.vy += (dyp / dist) * pull;
    v.vx *= 0.986;
    v.vy *= 0.986;

    v.x += v.vx + Math.sin(t + v.phase) * 0.2;
    v.y += v.vy + Math.cos(t * 1.08 + v.phase) * 0.2;

    if (v.x < -24) v.x = w + 24;
    if (v.x > w + 24) v.x = -24;
    if (v.y < -24) v.y = h + 24;
    if (v.y > h + 24) v.y = -24;

    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 158, 115, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 114, 178, 0.45)";
    ctx.lineWidth = 1.35;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(v.x + v.r * 0.14, v.y - v.r * 0.1, v.r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fill();
  }

  requestAnimationFrame(animateBackground);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        const stagger = entry.target.querySelector(".stagger-group");
        if (stagger) stagger.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  document.querySelectorAll(".stagger-group").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--delay", `${index * 85}ms`);
    });
  });
}

function setupSectionSweep() {
  const sections = document.querySelectorAll("main .section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || prefersReducedMotion) return;
        entry.target.classList.remove("transition-sweep");
        requestAnimationFrame(() => entry.target.classList.add("transition-sweep"));
      });
    },
    { threshold: 0.32 }
  );

  sections.forEach((section) => {
    section.addEventListener("animationend", () => section.classList.remove("transition-sweep"));
    observer.observe(section);
  });
}

function setupTiltCards() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rx = ((y - rect.height / 2) / rect.height) * -7;
      const ry = ((x - rect.width / 2) / rect.width) * 8;

      card.style.transform = `perspective(860px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupMagneticButtons() {
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.11}px, ${y * 0.16}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

function setupPointerTracking() {
  const updatePointer = (x, y) => {
    pointer.x = x;
    pointer.y = y;

    if (cursorGlow) {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  window.addEventListener("mousemove", (event) => updatePointer(event.clientX, event.clientY));
  window.addEventListener("touchmove", (event) => {
    if (event.touches[0]) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
  });
}

function setupHeroVideo() {
  if (!heroVideo || !heroMedia) return;

  const onReady = () => heroMedia.classList.add("has-video");
  heroVideo.addEventListener("loadeddata", onReady, { once: true });
  heroVideo.addEventListener("canplay", onReady, { once: true });

  const tryPlay = async () => {
    try {
      await heroVideo.play();
    } catch {
      // Browser blocked autoplay; fallback overlay remains visible.
    }
  };
  tryPlay();
}

function setupParallaxLayers() {
  const layers = Array.from(document.querySelectorAll(".parallax-layer"));
  if (!layers.length || prefersReducedMotion) return;

  let ticking = false;
  const update = () => {
    const scrollY = window.scrollY;
    for (const layer of layers) {
      const depth = Number(layer.dataset.depth || 0);
      layer.style.transform = `translate3d(0, ${scrollY * depth * 0.5}px, 0)`;
    }
    ticking = false;
  };

  update();
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function runIntroLoader() {
  if (prefersReducedMotion || !introLoader || !loaderProgress || !loaderCount) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("site-ready");
    return;
  }

  let progress = 0;
  const timer = window.setInterval(() => {
    progress += Math.random() * 12 + 7;
    const value = Math.min(100, Math.round(progress));
    loaderProgress.style.width = `${value}%`;
    loaderCount.textContent = `${value}%`;

    if (value >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        introLoader.classList.add("is-hidden");
        document.body.classList.remove("is-loading");
        document.body.classList.add("site-ready");
      }, 340);
    }
  }, 95);
}

window.addEventListener("resize", () => {
  if (!ambientEnabled) return;
  sizeCanvas();
  buildSceneParticles();
});

if (ambientEnabled) {
  sizeCanvas();
  buildSceneParticles();
  animateBackground();
}
setupReveal();
setupSectionSweep();
setupPointerTracking();
setupParallaxLayers();
setupHeroVideo();
runIntroLoader();
