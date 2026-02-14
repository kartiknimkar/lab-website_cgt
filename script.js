const canvas = document.getElementById("particle-field");
const ctx = canvas.getContext("2d");

let particles = [];
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function sizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function buildParticles() {
  const count = Math.min(95, Math.floor(window.innerWidth / 12));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.4,
    vx: (Math.random() - 0.5) * 0.55,
    vy: (Math.random() - 0.5) * 0.55
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of particles) {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.max(0, 120 - dist) / 3200;

    p.vx += (dx / dist) * pull;
    p.vy += (dy / dist) * pull;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = window.innerWidth + 10;
    if (p.x > window.innerWidth + 10) p.x = -10;
    if (p.y < -10) p.y = window.innerHeight + 10;
    if (p.y > window.innerHeight + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(95, 221, 190, 0.6)";
    ctx.fill();
  }
  requestAnimationFrame(animateParticles);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function setupParallax() {
  const hero = document.querySelector(".hero");
  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.18;
    hero.style.transform = `translateY(${y}px)`;
  });
}

window.addEventListener("mousemove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

window.addEventListener("touchmove", (event) => {
  if (event.touches[0]) {
    pointer.x = event.touches[0].clientX;
    pointer.y = event.touches[0].clientY;
  }
});

window.addEventListener("resize", () => {
  sizeCanvas();
  buildParticles();
});

sizeCanvas();
buildParticles();
animateParticles();
setupReveal();
setupParallax();
