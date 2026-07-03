/* Prescient+ — interactions */
(() => {
  "use strict";

  /* Sticky nav state */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* Scroll-reveal */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 6) * 70}ms`;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Animated counters */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.count));
  }

  /* FAQ: close others when one opens */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((o) => o !== item && (o.open = false));
    });
  });

  /* Hero candlesticks — deterministic pattern that follows the trend line */
  const candles = document.getElementById("candles");
  if (candles) {
    const NS = "http://www.w3.org/2000/svg";
    const N = 40;
    const W = 1200 / N;
    // pseudo-random but stable per load
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    // baseline drifts upward, mirroring the hero line (y: ~300 -> ~40)
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = 300 - 255 * t + Math.sin(i * 0.85) * 22;
      const up = rnd() > 0.34; // uptrending session
      const body = 8 + rnd() * 26;
      const wick = body + 10 + rnd() * 18;
      const x = i * W + W / 2;
      const yBody = up ? base - body : base;
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", x); line.setAttribute("x2", x);
      line.setAttribute("y1", base - wick + (up ? 0 : wick - body + (wick - body) / 2));
      line.setAttribute("y2", base + (up ? 8 + rnd() * 8 : wick - body));
      line.setAttribute("class", up ? "w-up" : "w-dn");
      candles.appendChild(line);
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", x - W * 0.28);
      rect.setAttribute("width", W * 0.56);
      rect.setAttribute("y", yBody);
      rect.setAttribute("height", body);
      rect.setAttribute("rx", 1.5);
      rect.setAttribute("class", up ? "c-up" : "c-dn");
      candles.appendChild(rect);
    }
  }

  /* Current year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
