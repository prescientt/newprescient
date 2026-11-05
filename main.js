/* Prescient+ — interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------- loader ---------- */
  const loader = $('#loader');
  const finishLoad = () => {
    if (root.classList.contains('is-loaded')) return;
    loader && loader.classList.add('is-done');
    root.classList.add('is-loaded');
  };
  window.addEventListener('load', () => setTimeout(finishLoad, reduce ? 0 : 1100));
  setTimeout(finishLoad, 3500); // safety net if fonts/images hang

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#navBurger'), links = $('#navLinks');
  let lastY = 0;
  const onScroll = () => {
    const sy = scrollY;
    nav.classList.toggle('is-scrolled', sy > 40);
    nav.classList.toggle('is-hidden', sy > 500 && sy > lastY && !links.classList.contains('is-open'));
    lastY = sy;
    const max = document.body.scrollHeight - innerHeight;
    $('#progress').style.transform = `scaleX(${max > 0 ? sy / max : 0})`;
    litWords();
  };
  addEventListener('scroll', onScroll, { passive: true });
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- manifesto: words light up with scroll ---------- */
  const wordBlocks = $$('[data-words]');
  wordBlocks.forEach(p => {
    const wrap = (node, gold) => {
      const out = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) { out.appendChild(document.createTextNode(t)); return; }
        const s = document.createElement('span'); s.className = 'w' + (gold ? ' g' : ''); s.textContent = t; out.appendChild(s);
      });
      return out;
    };
    [...p.childNodes].forEach(n => {
      if (n.nodeType === 3) p.replaceChild(wrap(n, false), n);
      else p.replaceChild(wrap(n, n.classList.contains('g')), n);
    });
  });
  function litWords() {
    wordBlocks.forEach(p => {
      const r = p.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
      const ws = $$('.w', p), n = Math.round(prog * ws.length);
      ws.forEach((w, i) => w.classList.toggle('is-lit', reduce || i < n));
    });
  }
  onScroll();

  /* ---------- cursor + magnetic + tilt ---------- */
  if (fine && !reduce) {
    const c = $('.cursor'), d = $('.cursor-dot');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => { root.classList.add('has-cursor'); mx = e.clientX; my = e.clientY; d.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    (function loop() { cx += (mx - cx) * .16; cy += (my - cy) * .16; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => { if (e.target.closest('a,button,summary,.heat__cell,input,canvas#gexProfile')) c.classList.add('is-hover'); });
    document.addEventListener('mouseout', e => { if (e.target.closest('a,button,summary,.heat__cell,input,canvas#gexProfile')) c.classList.remove('is-hover'); });

    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * .25) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * .35) + 'px');
      });
      b.addEventListener('mouseleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });

    $$('.tilt').forEach(t => {
      t.addEventListener('mousemove', e => {
        const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        t.style.setProperty('--ry', ((px - .5) * 10) + 'deg');
        t.style.setProperty('--rx', ((.5 - py) * 10) + 'deg');
        t.style.setProperty('--mx', px * 100 + '%'); t.style.setProperty('--my', py * 100 + '%');
      });
      t.addEventListener('mouseleave', () => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    });

    $$('.edge-card,.feature').forEach(t => t.addEventListener('mousemove', e => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));

    const scope = $('#scope'), dot = $('#scopeDot');
    if (scope && dot) addEventListener('mousemove', e => {
      const r = scope.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height)));
      dot.setAttribute('transform', `translate(${dx * 90} ${dy * 90})`);
    });
  }

  /* ---------- marquee: duplicate for seamless loop ---------- */
  const mq = $('#marquee'); if (mq) mq.innerHTML += mq.innerHTML;

  /* ---------- hero canvas: gold dust + flowing gamma lines ---------- */
  const cv = $('#heroCanvas');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W, H, dpr, parts = [], mouse = { x: -9999, y: -9999 }, t = 0;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(140, Math.round(W * H / 11000));
      parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: -Math.random() * .3 - .05, r: Math.random() * 1.6 + .3, a: Math.random() * .6 + .2 }));
    };
    resize(); addEventListener('resize', resize);
    cv.parentElement.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // flowing curves
      const lines = 9;
      for (let i = 0; i < lines; i++) {
        const base = H * (.3 + i * .055);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const dx = x - mouse.x, bend = Math.exp(-(dx * dx) / 40000) * (mouse.y > -1 ? (mouse.y - base) * .25 : 0);
          const yv = base + Math.sin(x * .0042 + t * .6 + i * .5) * (22 + i * 3) + Math.sin(x * .011 - t * .9 + i) * 6 + bend;
          x ? ctx.lineTo(x, yv) : ctx.moveTo(x, yv);
        }
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(212,175,95,0)'); g.addColorStop(.5, `rgba(230,199,118,${.05 + i * .012})`); g.addColorStop(1, 'rgba(212,175,95,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.stroke();
      }
      // dust
      for (const p of parts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { const f = (16000 - d2) / 16000 * .9; p.x += dx / Math.sqrt(d2 + 1) * f * 2; p.y += dy / Math.sqrt(d2 + 1) * f * 2; }
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        const tw = .6 + Math.sin(t * 2 + p.x) * .4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(243,220,154,${p.a * tw})`; ctx.fill();
      }
      t += .012;
    };
    if (reduce) draw();
    else (function loop() { if (visible) draw(); requestAnimationFrame(loop); })();
  }

  /* ---------- terminal typing ---------- */
  const term = $('#terminal');
  if (term) {
    const script = [
      ['<span class="t-gold">▲ SPX</span> dealer gamma flips negative below 5,880', 0],
      ['<span class="t-gold">→</span> liquidity thins into the 0DTE put wall', 0],
      ['<span class="t-dim"># why this matters</span>', 0],
      ['hedging flows accelerate moves in both directions', 0],
      ['<span class="t-gold">→</span> plan: fade strength into 5,950 <span class="t-dim">or</span> ride momentum?', 0],
      ['<span class="t-red">✕</span> chasing the breakout without the flip', 0],
      ['<span class="t-gold">✓</span> we walk through the decision together', 0],
    ];
    let started = false;
    const run = async () => {
      for (const [html] of script) {
        const p = document.createElement('p'); term.appendChild(p);
        const tmp = document.createElement('div'); tmp.innerHTML = html;
        const full = tmp.textContent;
        if (reduce) { p.innerHTML = html; continue; }
        for (let i = 1; i <= full.length; i++) { p.textContent = full.slice(0, i); p.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); await new Promise(r => setTimeout(r, 18)); }
        p.innerHTML = html; await new Promise(r => setTimeout(r, 380));
      }
      term.insertAdjacentHTML('beforeend', '<p><span class="caret"></span></p>');
    };
    new IntersectionObserver(([e], o) => { if (e.isIntersecting && !started) { started = true; o.disconnect(); run(); } }, { threshold: .4 }).observe(term);
  }

  /* ---------- sample gamma model (shared by heatmap + profile) ---------- */
  const strikes = [];
  for (let s = 5700; s <= 6100; s += 25) strikes.push(s);
  const gammaAt = (k, spot, decay = 1) => {
    // calls above, puts below; walls at 6000 and 5800, flip near 5880
    const call = 2.6 * Math.exp(-((k - 6000) ** 2) / 4200) + 1.1 * Math.exp(-((k - 5950) ** 2) / 1800);
    const put = 2.2 * Math.exp(-((k - 5800) ** 2) / 4200) + .9 * Math.exp(-((k - 5850) ** 2) / 1600);
    const prox = Math.exp(-((k - spot) ** 2) / 30000);
    return (call - put) * decay * (.55 + prox);
  };

  /* heatmap */
  $$('[data-heatmap]').forEach(box => {
    const grid = $('.heat__grid', box), tip = $('.heat__tip', box);
    const exps = ['0DTE', '1D', '2D', 'Wk', '2Wk', 'Mo', 'Qtr'];
    const ks = strikes.filter((_, i) => i % 2 === 0).reverse();
    const spot = 5900;
    grid.style.setProperty('--cols', exps.length);
    grid.insertAdjacentHTML('beforeend', '<span></span>' + exps.map(e => `<span class="col">${e}</span>`).join(''));
    const color = v => {
      const x = Math.max(-1, Math.min(1, v / 3));
      if (x >= 0) { const a = x; return `rgb(${Math.round(42 + (243 - 42) * a)},${Math.round(33 + (215 - 33) * a)},${Math.round(18 + (140 - 18) * a)})`; }
      const a = -x; return `rgb(${Math.round(42 + (150 - 42) * a)},${Math.round(30 + (52 - 30) * a)},${Math.round(20 + (36 - 20) * a)})`;
    };
    ks.forEach(k => {
      grid.insertAdjacentHTML('beforeend', `<span class="lbl">${k.toLocaleString()}</span>`);
      exps.forEach((e, j) => {
        const v = gammaAt(k, spot, 1.35 - j * .15) + Math.sin(k * .07 + j) * .15;
        const c = document.createElement('span');
        c.className = 'heat__cell' + (k === spot ? ' spot' : '');
        c.style.background = color(v);
        c.dataset.tip = `${k.toLocaleString()} · ${e}<br>Net GEX ${v >= 0 ? '+' : '−'}$${Math.abs(v * .6).toFixed(2)}B<br>${v >= 0 ? 'Dealers long γ · dampening' : 'Dealers short γ · accelerating'}`;
        grid.appendChild(c);
      });
    });
    grid.addEventListener('mousemove', e => {
      const c = e.target.closest('.heat__cell'); if (!c) { tip.classList.remove('is-on'); return; }
      const br = box.getBoundingClientRect(), cr = c.getBoundingClientRect();
      tip.innerHTML = c.dataset.tip; tip.classList.add('is-on');
      let left = cr.left - br.left + cr.width / 2 - tip.offsetWidth / 2;
      left = Math.max(8, Math.min(br.width - tip.offsetWidth - 8, left));
      tip.style.left = left + 'px'; tip.style.top = (cr.top - br.top - tip.offsetHeight - 10) + 'px';
    });
    grid.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
  });

  /* GEX profile */
  const pc = $('#gexProfile');
  if (pc) {
    const ctx = pc.getContext('2d'), range = $('#spotRange');
    const lo = 5700, hi = 6100;
    let spot = lo + (hi - lo) * range.value / 1000, shown = spot;
    const fmt = n => Math.round(n).toLocaleString();
    const draw = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), W = pc.offsetWidth, H = pc.offsetHeight;
      if (pc.width !== W * dpr) { pc.width = W * dpr; pc.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const padB = 28, mid = (H - padB) / 2, bw = W / strikes.length;
      const xOf = k => (k - lo) / (hi - lo) * (W - bw) + bw / 2;
      ctx.strokeStyle = 'rgba(212,175,95,.18)'; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      let net = 0;
      strikes.forEach(k => {
        const v = gammaAt(k, shown); net += v;
        const h = v / 3.4 * (mid - 14), x = xOf(k) - bw * .32;
        const g = ctx.createLinearGradient(0, mid, 0, mid - h);
        if (v >= 0) { g.addColorStop(0, 'rgba(138,106,43,.5)'); g.addColorStop(1, '#f3dc9a'); }
        else { g.addColorStop(0, 'rgba(110,47,34,.5)'); g.addColorStop(1, '#c4704f'); }
        ctx.fillStyle = g; ctx.fillRect(x, Math.min(mid, mid - h), bw * .64, Math.abs(h));
        if (k % 100 === 0) { ctx.fillStyle = '#6d665a'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(k.toLocaleString(), xOf(k), H - 8); }
      });
      // flip line
      const fx = xOf(5880);
      ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(181,101,79,.7)'; ctx.beginPath(); ctx.moveTo(fx, 10); ctx.lineTo(fx, H - padB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#b5654f'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'left'; ctx.fillText('γ FLIP', fx + 6, 20);
      // spot
      const sx = xOf(shown);
      const sg = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0);
      sg.addColorStop(0, 'rgba(243,220,154,0)'); sg.addColorStop(.5, 'rgba(243,220,154,.12)'); sg.addColorStop(1, 'rgba(243,220,154,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 40, 0, 80, H - padB);
      ctx.strokeStyle = '#f3dc9a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx, 4); ctx.lineTo(sx, H - padB); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#f3dc9a'; ctx.beginPath(); ctx.arc(sx, 6, 4, 0, 6.283); ctx.fill();
      // stats
      const longG = shown >= 5880;
      $('#pSpot').textContent = fmt(shown);
      const b = net * .12;
      const gexEl = $('#pGex');
      const nv = longG ? Math.abs(b) + (shown - 5880) / 60 : -(Math.abs(b) * .4 + (5880 - shown) / 50);
      gexEl.textContent = `${nv >= 0 ? '+' : '−'}$${Math.abs(nv).toFixed(1)}B`;
      gexEl.classList.toggle('neg', nv < 0);
      const reg = $('#pRegime');
      reg.textContent = longG ? (Math.abs(shown - 6000) < 40 ? 'Long gamma · pinned at call wall' : 'Long gamma · mean-reverting') : (Math.abs(shown - 5800) < 40 ? 'Short gamma · at put wall' : 'Short gamma · momentum risk');
      reg.classList.toggle('neg', !longG);
    };
    const anim = () => { shown += (spot - shown) * (reduce ? 1 : .15); draw(); if (Math.abs(spot - shown) > .5) requestAnimationFrame(anim); else { shown = spot; draw(); } };
    const setFromX = clientX => { const r = pc.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width)); spot = lo + (hi - lo) * p; range.value = p * 1000; anim(); };
    let dragging = false;
    pc.addEventListener('pointerdown', e => { dragging = true; pc.setPointerCapture(e.pointerId); setFromX(e.clientX); });
    pc.addEventListener('pointermove', e => { if (dragging) setFromX(e.clientX); });
    pc.addEventListener('pointerup', () => { dragging = false; });
    range.addEventListener('input', () => { spot = lo + (hi - lo) * range.value / 1000; anim(); });
    addEventListener('resize', draw);
    draw();
    // gentle auto-sweep until the visitor interacts
    if (!reduce) {
      let auto = true, ph = 0, sweeping = false;
      const stop = () => { auto = false; };
      pc.addEventListener('pointerdown', stop); range.addEventListener('input', stop);
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || sweeping) return;
        sweeping = true;
        (function sweep() { if (!auto) { sweeping = false; return; } ph += .008; spot = 5900 + Math.sin(ph) * 170; range.value = (spot - lo) / (hi - lo) * 1000; shown = spot; draw(); requestAnimationFrame(sweep); })();
      }, { threshold: .5 }).observe(pc);
    }
  }
})();
