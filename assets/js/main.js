(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Cursor + magnetic buttons ---------- */
  if (fine && !reduce) {
    const cursor = $('.cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on'); });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    const loop = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a, button, summary, label').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-big'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-big'));
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Hero sound wave ---------- */
  const canvas = $('.hero__wave');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, energy = 0.35, mouseX = 0.5;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { mouseX = e.clientX / window.innerWidth; energy = Math.min(1, energy + 0.04); }, { passive: true });
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const bars = Math.floor(w / 9);
      for (let i = 0; i < bars; i++) {
        const p = i / bars;
        const near = Math.exp(-Math.pow((p - mouseX) * 4, 2));
        const n = Math.sin(i * 0.35 + t * 0.002) * 0.5 + Math.sin(i * 0.11 - t * 0.0013) * 0.5;
        const bh = Math.max(2, (Math.abs(n) * 0.6 + near * energy) * h * 0.85);
        ctx.fillStyle = `rgba(254, 145, 23, ${0.18 + near * 0.6})`;
        ctx.fillRect(i * 9, h - bh, 4, bh);
      }
      energy += (0.35 - energy) * 0.02;
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Tabs ---------- */
  const tabs = $$('.tab');
  const pill = $('.tabs__pill');
  const movePill = (tab) => { pill.style.left = tab.offsetLeft + 'px'; pill.style.width = tab.offsetWidth + 'px'; };
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    movePill(tab);
    if (hasGsap && !reduce) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      gsap.fromTo(panel.querySelectorAll('.panel__lead > *, .perks li'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'power3.out' });
    }
  };
  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
  movePill($('.tab.is-active'));
  window.addEventListener('resize', () => movePill($('.tab.is-active')));
  document.fonts && document.fonts.ready.then(() => movePill($('.tab.is-active')));

  /* ---------- CTAs preselect form role ---------- */
  $$('[data-role]').forEach((a) => a.addEventListener('click', () => {
    const radio = document.getElementById('perfil-' + a.dataset.role);
    if (radio) radio.checked = true;
  }));

  /* ---------- Form ---------- */
  const form = $('#form-lista');
  const msg = $('.form__msg', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = form.nome, email = form.email;
    nome.setAttribute('aria-invalid', String(!nome.value.trim()));
    email.setAttribute('aria-invalid', String(!email.validity.valid || !email.value));
    if (!nome.value.trim()) { msg.textContent = 'Coloca teu nome pra gente saber quem é.'; nome.focus(); return; }
    if (!email.validity.valid || !email.value) { msg.textContent = 'Esse e-mail parece incompleto. Confere e tenta de novo.'; email.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      // TODO: conectar o destino dos leads (planilha, Mailchimp, etc.) em data-endpoint.
      msg.textContent = 'Anotado! (prévia: o envio ainda não está conectado)';
      form.reset();
      return;
    }
    msg.textContent = 'Enviando…';
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
      msg.textContent = 'Pronto! Você tá na lista. Avisamos assim que abrir.';
      form.reset();
    } catch {
      msg.textContent = 'Não conseguimos enviar agora. Tenta de novo em alguns minutos.';
    }
  });

  /* ---------- Count up ---------- */
  const fmt = new Intl.NumberFormat('pt-BR');
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduce || !hasGsap) { el.textContent = fmt.format(end); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt.format(Math.round(o.v)); } });
  };

  if (!hasGsap || reduce) { $$('[data-count]').forEach(countUp); return; }

  /* ---------- GSAP motion ---------- */
  gsap.registerPlugin(window.ScrollTrigger);
  const ST = window.ScrollTrigger;

  // Hero intro
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.hero__title .w', { yPercent: 110, rotate: 4, duration: 1.3, stagger: .09 })
    .from('.eyebrow', { y: 20, opacity: 0, duration: .8 }, '<.2')
    .from('.hero__lead, .hero__ctas', { y: 30, opacity: 0, duration: 1, stagger: .1 }, '<.2')
    .from('.phone', { y: 120, rotate: 8, opacity: 0, duration: 1.5 }, '<-.4')
    .from('.float', { scale: 0, opacity: 0, duration: .8, stagger: .15, ease: 'back.out(2)' }, '-=.8')
    .from('.spark__line', { strokeDasharray: 400, strokeDashoffset: 400, duration: 1.6, ease: 'power2.inOut' }, '-=1')
    .add(() => $$('.phone [data-count]').forEach(countUp), '<');

  // Phone follows pointer
  if (fine) {
    const phone = $('.phone');
    const qx = gsap.quickTo(phone, 'rotationY', { duration: .8, ease: 'power3' });
    const qy = gsap.quickTo(phone, 'rotationX', { duration: .8, ease: 'power3' });
    gsap.set('.hero__device', { perspective: 900 });
    $('.hero').addEventListener('pointermove', (e) => {
      qx((e.clientX / window.innerWidth - .5) * 18);
      qy(-(e.clientY / window.innerHeight - .5) * 14);
    });
  }

  // Hero parallax on scroll
  gsap.to('.hero__copy', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__device', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Marquee speeds up with scroll velocity
  const track = $('.marquee__track');
  ST.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 400, 6);
      track.style.animationDuration = 28 / (1 + v) + 's';
    },
  });

  // Manifesto: words light up as you scroll
  const man = $('[data-scrub]');
  man.innerHTML = man.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w} </span>`).join('');
  gsap.fromTo(man.querySelectorAll('.word'), { opacity: .12 }, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: man, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  // "InSound" in the manifesto goes orange
  man.querySelectorAll('.word').forEach((w) => { if (/InSound/.test(w.textContent)) w.style.color = 'var(--orange-deep)'; });

  // Generic reveals
  $$('.section-head, .reveal, .about__motives article, .member, .faq details, .join__copy, .form').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // Stat counter
  $$('.stat [data-count]').forEach((el) => ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => countUp(el) }));

  // Como funciona: horizontal scroll on desktop
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const trackEl = $('.how__track');
    const distance = () => Math.max(0, trackEl.scrollWidth - trackEl.clientWidth);
    gsap.to(trackEl, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: '.how', start: 'top top', end: () => '+=' + distance() * 1.2, pin: true, scrub: 1, invalidateOnRefresh: true },
    });
  });
  mm.add('(max-width: 960px)', () => {
    $$('.step').forEach((el) => gsap.from(el, { x: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  });

  // Quote & big title wipe
  gsap.from('.about__quote', { clipPath: 'inset(0 100% 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.about__quote', start: 'top 80%' } });
  gsap.from('.join__title', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.join', start: 'top 75%' } });

  // Footer wordmark slides in
  gsap.fromTo('.footer__big', { xPercent: 12 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', () => ST.refresh());
})();
