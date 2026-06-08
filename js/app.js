/* ============================================
   NTVăn portfolio — single bundle
============================================ */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* ----- Single rAF-throttled scroll dispatcher ----- */
  const scrollHandlers = [];
  let scrollTicking = false;
  const onScroll = (fn) => scrollHandlers.push(fn);
  addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      for (let i = 0; i < scrollHandlers.length; i++) scrollHandlers[i](y);
      scrollTicking = false;
    });
  }, { passive: true });

  /* ----- Loader ----- */
  addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('hide'), 1200);
  });

  /* ----- Nav scrolled state ----- */
  const nav = $('#nav');
  if (nav) onScroll(y => nav.classList.toggle('scrolled', y > 60));

  /* ----- Progress bar ----- */
  const prog = $('#progress');
  if (prog) onScroll(y => {
    const max = document.body.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? (y / max * 100) : 0) + '%';
  });

  /* ----- Back to top ----- */
  const btt = $('#back-top');
  if (btt) {
    onScroll(y => btt.classList.toggle('show', y > 300));
    btt.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
    if (scrollY > 300) btt.classList.add('show');
  }

  /* ----- Smooth scroll for in-page anchors ----- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav?.offsetHeight || 0;
      scrollTo({ top: target.getBoundingClientRect().top + scrollY - navH, behavior: 'smooth' });
    });
  });

  /* ----- Hamburger / mobile nav ----- */
  const burger = $('#nav-hamburger');
  const mobileNav = $('#nav-mobile');
  if (burger && mobileNav) {
    const closeMobile = () => {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileNav.classList.toggle('open', isOpen);
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('.nav-mobile-link').forEach(a =>
      a.addEventListener('click', closeMobile)
    );
  }

  /* ----- Reveal animations ----- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains('stagger')) {
        e.target.classList.add('on');
        e.target.querySelectorAll(':scope>*').forEach((c, j) => {
          setTimeout(() => c.style.cssText = 'opacity:1;transform:translateY(0)', j * 90);
        });
      } else {
        setTimeout(() => e.target.classList.add('on'), 100);
      }
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$('.fade-up,.fade-left,.stagger,.gold-line,.slide-left,.slide-right,.scale-in,.clip-wipe,.u-grow')
    .forEach(el => revealObs.observe(el));

  /* ----- Counter animation ----- */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1600, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      countObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  $$('.stats-bar').forEach(el => countObs.observe(el));

  /* ----- Lightbox (proof gallery) ----- */
  const lb = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCap = $('#lightbox-cap');
  const lbClose = $('#lightbox-close');
  if (lb && lbImg) {
    const openLb = (src, cap) => {
      lbImg.src = src;
      lbImg.alt = cap || '';
      lbCap.textContent = cap || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
    };
    $$('.proj-shot').forEach(a => {
      a.addEventListener('click', e => {
        // data-shot rỗng = chưa có ảnh (placeholder) -> không mở
        const src = a.getAttribute('data-shot');
        if (!src) return;
        e.preventDefault();
        openLb(src, a.getAttribute('data-caption'));
      });
    });
    lbClose?.addEventListener('click', closeLb);
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
    });
  }

  /* ----- Parallax (skip if reduced motion) ----- */
  const heroOrb1 = $('.hero-orb-1');
  const heroOrb2 = $('.hero-orb-2');
  const aboutBg = $('.about-bg-text');
  if (!reducedMotion && (heroOrb1 || heroOrb2 || aboutBg)) {
    onScroll(y => {
      if (heroOrb1) heroOrb1.style.transform = `translateY(${y * 0.18}px)`;
      if (heroOrb2) heroOrb2.style.transform = `translateY(${y * -0.12}px)`;
      if (aboutBg) aboutBg.style.transform = `translateY(calc(-50% + ${y * 0.08}px))`;
    });
  }

  /* ----- 3D tilt on service cards (fine pointer only) ----- */
  if (finePointer && !reducedMotion) {
    $$('.svc-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ----- Typewriter on hero eyebrow ----- */
  const eyebrow = $('.eyebrow');
  if (eyebrow && !reducedMotion) {
    const txt = eyebrow.textContent.trim();
    const dot = eyebrow.querySelector('.eyebrow-dot');
    eyebrow.innerHTML = '';
    if (dot) eyebrow.appendChild(dot);
    const span = document.createElement('span');
    eyebrow.appendChild(span);
    let i = 0;
    const typeIt = () => {
      if (i <= txt.length) {
        span.textContent = txt.slice(0, i++);
        setTimeout(typeIt, 55);
      }
    };
    setTimeout(typeIt, 600);
  }

  /* ----- Custom cursor (fine pointer only) ----- */
  const cur = $('#cursor');
  const ring = $('#cursor-ring');
  if (cur && ring && finePointer) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
    $$('a,button,.svc-card,.skill-chip,.why-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '56px'; ring.style.height = '56px';
        ring.style.borderColor = 'rgba(201,168,76,.8)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.borderColor = 'rgba(201,168,76,.5)';
      });
    });
  } else if (cur && ring) {
    cur.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ----- Theme toggle + persistence ----- */
  const themeBtn = $('#theme-toggle');
  let updateParticleColors = null;
  const applyTheme = (light) => {
    document.body.classList.toggle('light', light);
    if (themeBtn) themeBtn.textContent = light ? '🌙' : '☀️';
  };
  // Restore saved theme (default = dark)
  try {
    if (localStorage.getItem('ntv-theme') === 'light') applyTheme(true);
  } catch (_) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const light = !document.body.classList.contains('light');
      applyTheme(light);
      try { localStorage.setItem('ntv-theme', light ? 'light' : 'dark'); } catch (_) {}
      if (updateParticleColors) updateParticleColors();
    });
  }

  /* ----- Particles (golden dust) ----- */
  const partCanvas = $('#particles');
  if (partCanvas && !reducedMotion) {
    const ctx = partCanvas.getContext('2d');
    if (ctx) {
      let W, H, dust = [], sparks = [];
      const COLORS_DARK = [[201,168,76],[226,196,122],[240,216,152],[180,138,50],[210,180,100]];
      const COLORS_LIGHT = [[168,115,42],[140,95,30],[190,140,70],[120,80,20],[160,120,55]];
      let COLORS = document.body.classList.contains('light') ? COLORS_LIGHT : COLORS_DARK;
      const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

      const resize = () => { W = partCanvas.width = innerWidth; H = partCanvas.height = innerHeight; };
      const initDust = () => {
        dust = [];
        const n = Math.min(Math.floor(W * H / 9000), 140);
        for (let i = 0; i < n; i++) {
          dust.push({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 2 + 0.3,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.5 + 0.1),
            alpha: Math.random(),
            alphaDir: Math.random() > 0.5 ? 1 : -1,
            alphaSpeed: Math.random() * 0.008 + 0.003,
            swingAmp: Math.random() * 0.6,
            swingFreq: Math.random() * 0.02 + 0.005,
            swingOff: Math.random() * Math.PI * 2,
            color: randColor(),
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.03 + 0.01,
          });
        }
      };
      const spawnSpark = () => {
        if (sparks.length > 25) return;
        sparks.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.5 + 0.5,
          alpha: 0, phase: 'in',
          speed: Math.random() * 0.04 + 0.02,
          color: randColor(),
        });
      };

      updateParticleColors = () => {
        COLORS = document.body.classList.contains('light') ? COLORS_LIGHT : COLORS_DARK;
        initDust();
      };

      resize(); initDust();
      addEventListener('resize', () => { resize(); initDust(); });
      setInterval(spawnSpark, 300);

      const drawDust = () => {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < dust.length; i++) {
          const p = dust[i];
          p.swingOff += p.swingFreq;
          p.x += p.vx + Math.sin(p.swingOff) * p.swingAmp;
          p.y += p.vy;
          if (p.y < -5) p.y = H + 5;
          if (p.x < -5) p.x = W + 5;
          if (p.x > W + 5) p.x = -5;
          p.alpha += p.alphaDir * p.alphaSpeed;
          if (p.alpha > 0.75) { p.alpha = 0.75; p.alphaDir = -1; }
          if (p.alpha < 0.08) { p.alpha = 0.08; p.alphaDir = 1; }
          p.pulse += p.pulseSpeed;
          const rr = p.r + Math.sin(p.pulse) * p.r * 0.4;
          const [R, G, B] = p.color;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 4);
          grd.addColorStop(0, `rgba(${R},${G},${B},${p.alpha * 0.35})`);
          grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, rr * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},${p.alpha})`;
          ctx.fill();
        }
        sparks = sparks.filter(s => {
          if (s.phase === 'in') {
            s.alpha += s.speed;
            if (s.alpha >= 1) { s.alpha = 1; s.phase = 'hold'; s._hold = 0; }
          } else if (s.phase === 'hold') {
            s._hold++;
            if (s._hold > 12) s.phase = 'out';
          } else {
            s.alpha -= s.speed * 0.7;
            if (s.alpha <= 0) return false;
          }
          const [R, G, B] = s.color;
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.globalAlpha = s.alpha * 0.9;
          ctx.strokeStyle = `rgb(${R},${G},${B})`;
          ctx.lineWidth = 0.5;
          [0, 90].forEach(deg => {
            ctx.save();
            ctx.rotate(deg * Math.PI / 180);
            ctx.beginPath();
            ctx.moveTo(0, -s.r * 4);
            ctx.lineTo(0, s.r * 4);
            ctx.stroke();
            ctx.restore();
          });
          ctx.restore();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},${s.alpha})`;
          ctx.fill();
          return true;
        });
        requestAnimationFrame(drawDust);
      };
      drawDust();
    }
  } else if (partCanvas) {
    partCanvas.style.display = 'none';
  }

  /* ----- Spotlight + metallic shine (fine pointer only, cached rects) ----- */
  const spot = $('#spotlight');
  if (spot && finePointer && !reducedMotion) {
    const sctx = spot.getContext('2d');
    if (sctx) {
      let sW, sH, mouseX = -999, mouseY = -999, smoothX = -999, smoothY = -999;
      const resizeSpot = () => { sW = spot.width = innerWidth; sH = spot.height = innerHeight; };
      resizeSpot();
      document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

      /* Cache target elements + rects; refresh on scroll/resize only */
      let metalEls = [];
      let metalRects = [];
      const cacheMetal = () => {
        metalEls = Array.from(document.querySelectorAll(
          '.svc-card, .skill-chip, .why-item, .stat-item, nav, .avatar-wrap'
        ));
        metalRects = metalEls.map(el => el.getBoundingClientRect());
      };
      cacheMetal();
      onScroll(() => cacheMetal());
      addEventListener('resize', () => { resizeSpot(); cacheMetal(); });

      const applyMetallic = (x, y) => {
        const maxDist = 380;
        for (let i = 0; i < metalEls.length; i++) {
          const r = metalRects[i];
          const el = metalEls[i];
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = x - cx, dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const intensity = 1 - dist / maxDist;
            el.style.setProperty('--mx', ((x - r.left) / r.width * 100).toFixed(1) + '%');
            el.style.setProperty('--my', ((y - r.top) / r.height * 100).toFixed(1) + '%');
            el.style.setProperty('--mi', intensity.toFixed(3));
            if (!el.classList.contains('metal-lit')) el.classList.add('metal-lit');
          } else if (el.classList.contains('metal-lit')) {
            el.classList.remove('metal-lit');
            el.style.removeProperty('--mx');
            el.style.removeProperty('--my');
            el.style.removeProperty('--mi');
          }
        }
      };

      const drawSpotlight = () => {
        if (smoothX === -999) { smoothX = mouseX; smoothY = mouseY; }
        smoothX += (mouseX - smoothX) * 0.1;
        smoothY += (mouseY - smoothY) * 0.1;
        sctx.clearRect(0, 0, sW, sH);
        if (mouseX < 0) { requestAnimationFrame(drawSpotlight); return; }

        const g1 = sctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 320);
        g1.addColorStop(0, 'rgba(201,168,76,0.045)');
        g1.addColorStop(0.4, 'rgba(201,168,76,0.018)');
        g1.addColorStop(1, 'rgba(201,168,76,0)');
        sctx.fillStyle = g1; sctx.fillRect(0, 0, sW, sH);

        const g2 = sctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 80);
        g2.addColorStop(0, 'rgba(240,216,152,0.14)');
        g2.addColorStop(0.3, 'rgba(201,168,76,0.07)');
        g2.addColorStop(1, 'rgba(201,168,76,0)');
        sctx.fillStyle = g2; sctx.fillRect(0, 0, sW, sH);

        const g3 = sctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 28);
        g3.addColorStop(0, 'rgba(255,240,190,0.28)');
        g3.addColorStop(0.5, 'rgba(226,196,122,0.10)');
        g3.addColorStop(1, 'rgba(201,168,76,0)');
        sctx.fillStyle = g3; sctx.fillRect(0, 0, sW, sH);

        sctx.save();
        sctx.translate(smoothX, smoothY);
        sctx.globalAlpha = 0.12;
        sctx.lineWidth = 0.5;
        [0, 45, 90, 135].forEach(deg => {
          const rad = deg * Math.PI / 180, len = 60;
          const lg = sctx.createLinearGradient(
            -Math.cos(rad) * len, -Math.sin(rad) * len,
            Math.cos(rad) * len, Math.sin(rad) * len
          );
          lg.addColorStop(0, 'rgba(240,216,152,0)');
          lg.addColorStop(0.5, 'rgba(240,216,152,0.9)');
          lg.addColorStop(1, 'rgba(240,216,152,0)');
          sctx.beginPath();
          sctx.strokeStyle = lg;
          sctx.moveTo(-Math.cos(rad) * len, -Math.sin(rad) * len);
          sctx.lineTo(Math.cos(rad) * len, Math.sin(rad) * len);
          sctx.stroke();
        });
        sctx.restore();

        applyMetallic(smoothX, smoothY);
        requestAnimationFrame(drawSpotlight);
      };
      drawSpotlight();
    }
  } else if (spot) {
    spot.style.display = 'none';
  }
})();
