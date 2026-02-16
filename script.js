const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("particle-field");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const hero = document.querySelector(".hero");

let particles = [];
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };

function sizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function buildParticles() {
  const count = Math.min(110, Math.floor(window.innerWidth / 10));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.6,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42
  }));
}

function animateParticles() {
  if (prefersReducedMotion) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];

    const dxPointer = pointer.x - p.x;
    const dyPointer = pointer.y - p.y;
    const pointerDist = Math.hypot(dxPointer, dyPointer) || 1;
    const pointerPull = Math.max(0, 130 - pointerDist) / 3600;

    p.vx += (dxPointer / pointerDist) * pointerPull;
    p.vy += (dyPointer / pointerDist) * pointerPull;
    p.vx *= 0.988;
    p.vy *= 0.988;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -15) p.x = window.innerWidth + 15;
    if (p.x > window.innerWidth + 15) p.x = -15;
    if (p.y < -15) p.y = window.innerHeight + 15;
    if (p.y > window.innerHeight + 15) p.y = -15;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(95, 221, 190, 0.62)";
    ctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 105) {
        const alpha = (1 - dist / 105) * 0.23;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(120, 190, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          const staggerGroup = entry.target.querySelector(".stagger-group");
          if (staggerGroup) staggerGroup.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  document.querySelectorAll(".stagger-group").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--delay", `${index * 90}ms`);
    });
  });
}

function setupTiltCards() {
  const cards = document.querySelectorAll(".tilt-card");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotateX = ((y - cy) / cy) * -5;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupMagneticButtons() {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);

      element.style.transform = `translate(${x * 0.14}px, ${y * 0.2}px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function setupScrollFocus() {
  const sections = document.querySelectorAll("main .section");
  const updateFocus = () => {
    const checkpoint = window.innerHeight * 0.45;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isFocused = rect.top <= checkpoint && rect.bottom >= checkpoint;
      section.classList.toggle("in-focus", isFocused);
    });
  };

  updateFocus();
  window.addEventListener("scroll", updateFocus, { passive: true });
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

  window.addEventListener("mousemove", (event) => {
    pointer.active = true;
    updatePointer(event.clientX, event.clientY);
  });

  window.addEventListener("touchmove", (event) => {
    if (event.touches[0]) {
      updatePointer(event.touches[0].clientX, event.touches[0].clientY);
    }
  });
}

function setupHeroParallax() {
  if (!hero || prefersReducedMotion) return;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY * 0.16;
      hero.style.transform = `translateY(${y}px)`;
    },
    { passive: true }
  );
}

window.addEventListener("resize", () => {
  sizeCanvas();
  buildParticles();
});

sizeCanvas();
buildParticles();
animateParticles();
setupReveal();
setupTiltCards();
setupMagneticButtons();
setupScrollFocus();
setupPointerTracking();
setupHeroParallax();
