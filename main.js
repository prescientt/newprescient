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

  /* ---------- hero canvas: reactive dot grid + live price trace ---------- */
  const cv = $('#heroCanvas');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W, H, dpr, mouse = { x: -9999, y: -9999 }, t = 0, trace = [];
    const GAP = 26;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      trace = []; let v = H * .55;
      for (let x = 0; x <= W + 8; x += 8) { v += (Math.random() - .47) * 9; v = Math.max(H * .25, Math.min(H * .7, v)); trace.push(v); }
    };
    resize(); addEventListener('resize', resize);
    const host = cv.parentElement;
    host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const scan = (t * 140) % (W + 400) - 200;
      for (let x = GAP / 2; x < W; x += GAP) {
        for (let y = GAP / 2; y < H; y += GAP) {
          const dx = x - mouse.x, dy = y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
          const m = Math.max(0, 1 - d / 190);
          const s = Math.max(0, 1 - Math.abs(x - scan) / 90) * .5;
          const k = Math.max(m, s);
          const ox = m ? dx / (d + 1) * m * 10 : 0, oy = m ? dy / (d + 1) * m * 10 : 0;
          if (k > .02) { ctx.fillStyle = `rgba(240,185,11,${.15 + k * .85})`; const z = 1.2 + k * 1.8; ctx.fillRect(x + ox - z / 2, y + oy - z / 2, z, z); }
          else { ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.fillRect(x - .6, y - .6, 1.2, 1.2); }
        }
      }
      const n = Math.min(trace.length, Math.floor(t * 60));
      if (n > 1) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) i ? ctx.lineTo(i * 8, trace[i]) : ctx.moveTo(0, trace[0]);
        ctx.strokeStyle = 'rgba(240,185,11,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
        const lx = (n - 1) * 8, ly = trace[n - 1];
        ctx.fillStyle = '#f0b90b'; ctx.fillRect(lx - 3, ly - 3, 6, 6);
        ctx.strokeStyle = 'rgba(240,185,11,.25)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); ctx.setLineDash([]);
      }
      if (n >= trace.length && Math.random() < .5) { trace.shift(); const v = trace[trace.length - 1] + (Math.random() - .48) * 9; trace.push(Math.max(H * .25, Math.min(H * .7, v))); }
      t += .016;
    };
    if (reduce) { t = 99; draw(); }
    else (function loop() { if (visible) draw(); requestAnimationFrame(loop); })();
  }

  /* ---------- NY clock ---------- */
  const clock = $('#clock');
  if (clock) {
    const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }); };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- count-up stats ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function step(now) { const p = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: .5 });
  $$('[data-count]').forEach(c => cio.observe(c));

  /* ---------- eyebrow text scramble ---------- */
  if (!reduce) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#$%';
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; sio.unobserve(e.target);
      const el = e.target, final = el.textContent; let f = 0;
      const id = setInterval(() => {
        el.textContent = final.split('').map((c, i) => (c === ' ' || i < f / 2) ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
        if (++f > final.length * 2) { clearInterval(id); el.textContent = final; }
      }, 28);
    }), { threshold: 1 });
    $$('.eyebrow').forEach(el => sio.observe(el));
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
      if (x >= 0) { const a = x; return `rgb(${Math.round(26 + (240 - 26) * a)},${Math.round(26 + (185 - 26) * a)},${Math.round(26 + (11 - 26) * a)})`; }
      const a = -x; return `rgb(${Math.round(26 + (255 - 26) * a)},${Math.round(26 + (77 - 26) * a)},${Math.round(26 + (77 - 26) * a)})`;
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
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      let net = 0;
      strikes.forEach(k => {
        const v = gammaAt(k, shown); net += v;
        const h = v / 3.4 * (mid - 14), x = xOf(k) - bw * .32;
        const g = ctx.createLinearGradient(0, mid, 0, mid - h);
        if (v >= 0) { g.addColorStop(0, 'rgba(240,185,11,.35)'); g.addColorStop(1, '#f0b90b'); }
        else { g.addColorStop(0, 'rgba(255,77,77,.3)'); g.addColorStop(1, '#ff4d4d'); }
        ctx.fillStyle = g; ctx.fillRect(x, Math.min(mid, mid - h), bw * .64, Math.abs(h));
        if (k % 100 === 0) { ctx.fillStyle = '#555'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(k.toLocaleString(), xOf(k), H - 8); }
      });
      // flip line
      const fx = xOf(5880);
      ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(255,77,77,.7)'; ctx.beginPath(); ctx.moveTo(fx, 10); ctx.lineTo(fx, H - padB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ff4d4d'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'left'; ctx.fillText('γ FLIP', fx + 6, 20);
      // spot
      const sx = xOf(shown);
      const sg = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.08)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 40, 0, 80, H - padB);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx, 4); ctx.lineTo(sx, H - padB); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#fff'; ctx.fillRect(sx - 4, 2, 8, 8);
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
