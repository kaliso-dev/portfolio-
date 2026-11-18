/* ==========================================================================
   APP — routeur (hash), menu, preloader, Lenis, transitions
   ========================================================================== */
const App = { page: null, key: null, busy: false, silent: false, lenis: null, bg: null, trans: null };

function parseRoute() {
  const k = decodeURIComponent(location.hash.replace(/^#/, '')) || 'index';
  if (['index', 'projets', 'a-propos', 'contact', 'terminal'].includes(k)) return { key: k };
  if (k.startsWith('projet-')) {
    const i = SITE.projects.findIndex((p) => p.slug === k.slice(7));
    if (i >= 0) return { key: k, project: i };
  }
  return { key: '404' };
}

function createPage(route) {
  switch (route.key) {
    case 'index': return PageIndex();
    case 'projets': return PageWork();
    case 'a-propos': return PageAbout();
    case 'contact': return PageContact();
    case 'terminal': return PageTerminal();
    case '404': return PageNotFound();
    default: return route.project != null ? PageProject(route.project) : PageNotFound();
  }
}

async function mountPage(route) {
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const page = createPage(route);
  $('#app').appendChild(page.el);
  page.ready && page.ready();
  App.key = route.key;
  return page;
}

function setLenis(page) {
  if (!App.lenis) return;
  if (page.scroll && !Menu.open) App.lenis.start(); else App.lenis.stop();
}

function resetScroll() {
  if (App.lenis) App.lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

function updateCurrent() {
  const k = App.key && App.key.startsWith('projet-') ? 'projets' : App.key;
  $$('.menu-link').forEach((a) => {
    if (a.getAttribute('href') === `#${k}`) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const titles = { index: SITE.role, projets: 'Projets', 'a-propos': 'À propos', contact: 'Contact', '404': 'Introuvable' };
  const p = SITE.projects.find((x) => `projet-${x.slug}` === App.key);
  document.title = `${p ? p.name + p.ext : titles[App.key] || ''} — ${SITE.name}`;
}

function setHash(k) {
  const cur = location.hash.replace(/^#/, '') || 'index';
  if (cur === k) return;
  App.silent = true;
  location.hash = k;
}

function buildCutLayer(old) {
  const sy = window.scrollY;
  const layer = document.createElement('div');
  layer.className = 'cut-layer';
  layer.setAttribute('aria-hidden', 'true');
  const srcs = $$('canvas', old.el);
  const halves = [0, 1].map(() => {
    const half = document.createElement('div');
    half.className = 'cut-half';
    const bg = document.createElement('canvas');
    bg.className = 'cut-bg';
    half.appendChild(bg);
    const inner = old.el.cloneNode(true);
    inner.classList.add('cut-inner');
    inner.style.top = (-sy) + 'px';
    $$('[id]', inner).forEach((n) => n.removeAttribute('id'));
    half.appendChild(inner);
    layer.appendChild(half);
    return half;
  });
  // copies directes des canvas (rendu puis drawImage dans la même tâche : rapide, sans encodage)
  const copy = (src, dst) => {
    try {
      if (!src.width || !src.height) return;
      dst.width = src.width; dst.height = src.height;
      dst.getContext('2d').drawImage(src, 0, 0);
    } catch (e) {}
  };
  const clones = halves.map((h) => $$('.cut-inner canvas', h));
  srcs.forEach((c, i) => {
    try { c.__prep && c.__prep(); } catch (e) {}
    clones.forEach((list) => list[i] && copy(c, list[i]));
  });
  try {
    if (App.bg && App.bg.gl) { App.bg.draw(); halves.forEach((h) => copy(App.bg.c, $('.cut-bg', h))); }
  } catch (e) {}
  document.body.appendChild(layer);
  return { layer, halves };
}

async function go(href, { mode = 'transition' } = {}) {
  const target = href.replace(/^#/, '') || 'index';
  if (App.busy) return;
  if (target === App.key && mode !== 'pop') { Menu.close(); return; }
  App.busy = true;
  Menu.close(true);
  // le son d'épée part dès le clic (la coupe démarre dans la foulée)
  if (mode !== 'slider') Sound.play('slash', { dir: App.trans && App.trans.nextDir ? App.trans.nextDir() : 1 });
  const old = App.page;
  try {
    if (mode === 'slider') {
      setHash(target);
      const page = await mountPage(parseRoute());
      App.page = page;
      old.destroy(); old.el.remove();
      resetScroll();
      setLenis(page);
      updateCurrent();
      ScrollTrigger.refresh();
      page.intro(0.05, 'slider');
    } else {
      const cut = !REDUCED ? buildCutLayer(old) : null;
      if (cut) GLHOLD.on = true;
      old.destroy(); old.el.remove();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      resetScroll();
      if (mode !== 'pop') setHash(target);
      const page = await mountPage(parseRoute());
      App.page = page;
      setLenis(page);
      updateCurrent();
      ScrollTrigger.refresh();
      if (cut) {
        const done = App.trans.slashCut(cut.halves, () => page.intro(0.05, 'transition'));
        // les chevaliers de la nouvelle page commencent à se dessiner quand les moitiés tombent
        gsap.delayedCall(0.95, () => { GLHOLD.on = false; });
        await done;
        GLHOLD.on = false;
        cut.layer.remove();
      } else page.intro(0.1, 'transition');
    }
  } catch (e) { console.error(e); GLHOLD.on = false; }
  App.busy = false;
}

/* --- menu ---------------------------------------------------------------- */
const Menu = {
  open: false,
  init() {
    this.nav = $('.nav'); this.btn = $('.menu-toggle'); this.panel = $('#menu-panel');
    this.words = $$('.menu-toggle-word'); this.lines = $$('.menu-line');
    gsap.set(this.words, { y: 0, yPercent: 0 });
    gsap.set(this.words[1], { yPercent: 100 });
    gsap.set(this.lines, { y: 0, yPercent: 100 });
    this.btn.addEventListener('click', () => (this.open ? this.close() : this.show()));
    document.addEventListener('pointerdown', (e) => {
      if (this.open && !this.panel.contains(e.target) && !this.btn.contains(e.target)) this.close();
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.open) { this.close(); this.btn.focus(); } });
    $$('.snd-toggle, .nav-snd').forEach((b) => b.addEventListener('click', () => { Sound.toggle(); Sound.play('select'); }));
    Music.sync();
  },
  show() {
    if (this.open) return;
    this.open = true;
    this.nav.classList.add('is-menu-open');
    this.btn.setAttribute('aria-expanded', 'true');
    this.panel.inert = false;
    Sound.play('menuOpen');
    App.lenis && App.lenis.stop();
    this.tl && this.tl.kill();
    this.tl = gsap.timeline()
      .set(this.panel, { visibility: 'visible' }, 0)
      .to(this.words[0], { yPercent: -100, duration: 0.5, ease: 'power3.out' }, 0)
      .to(this.words[1], { yPercent: 0, duration: 0.5, ease: 'power3.out' }, 0)
      .to(this.panel, { clipPath: 'inset(0% 0% 0% 0% round 0.375rem)', duration: 0.5, ease: 'menuPanel' }, 0)
      .fromTo(this.lines, { yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: 'power3.out', stagger: STAGGER }, 0.2);
  },
  close(silent) {
    if (!this.open) return;
    this.open = false;
    this.btn.setAttribute('aria-expanded', 'false');
    this.panel.inert = true;
    if (!silent) Sound.play('menuClose');
    if (App.page) setLenis(App.page);
    this.tl && this.tl.kill();
    this.tl = gsap.timeline()
      .to(this.words[0], { yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0)
      .to(this.words[1], { yPercent: 100, duration: 0.6, ease: 'power3.out' }, 0)
      .to(this.panel, { clipPath: 'inset(0% 100% 100% 0% round 0.375rem)', duration: 0.45, ease: 'menuPanel' }, 0)
      .call(() => this.nav.classList.remove('is-menu-open'), null, 0.18)
      .set(this.panel, { visibility: 'hidden' }, 0.45)
      .set(this.lines, { yPercent: 100 }, 0.45);
  },
};

/* --- preloader : la lame se forge ------------------------------------------ */
function runPreloader(onReveal) {
  const pre = $('.preloader');
  const cols = $$('.digit-col', pre);
  const counter = $('.preloader-counter', pre);
  const log = $('.preloader-log', pre);
  const T = App.trans;
  $('.pt-os', pre).textContent = `${SITE.os} ${SITE.version} — forge`;
  const forge = new Forge($('canvas.forge', pre));
  // progression : la garde et la poignée se forment, puis la lame avance par bonds (rythme du compteur)
  const st = { hilt: 0, v: 0 };
  const apply = () => {
    forge.f = st.hilt * forge.uBlade + st.v * (1 - forge.uBlade);
    const cp = forge.counterPos();
    gsap.set(counter, { x: cp.x, y: cp.y, xPercent: cp.ax, yPercent: cp.ay });
  };
  const follow = () => apply();
  gsap.ticker.add(follow);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const hops = [[1.5, R(21, 33)], [2.25, R(38, 52)], [3, R(61, 78)], [3.75, 99]];
  const end = 4.5;
  gsap.set(cols, { y: 0, yPercent: 10 });
  gsap.set(counter, { opacity: 0 });
  const tl = gsap.timeline();
  App.preTl = tl;
  tl.to(st, { hilt: 1, duration: 0.9, ease: 'power2.out' }, 0.25)
    .to(counter, { opacity: 1, duration: 0.4 }, 0.6)
    .to(cols, { yPercent: 0, duration: 0.75, ease: 'hop' }, 0.5);
  hops.forEach(([t, n]) => {
    tl.to(st, { v: n >= 99 ? 1 : n / 100, duration: 0.75, ease: 'hop' }, t)
      .to(cols[0], { yPercent: -Math.floor(n / 10) * 10, duration: 0.75, ease: 'hop' }, t)
      .to(cols[1], { yPercent: -(n % 10) * 10, duration: 0.75, ease: 'hop' }, t);
  });
  const lines = [
    [`${SITE.os} ${SITE.version} — démarrage`, ''],
    ['allumage de la forge ....... ', 'ok'],
    ['invocation de claude ....... ', 'ok'],
    ['trempe du cimeterre ........ ', 'ok'],
    ['statut 200 — marhaba', ''],
  ];
  lines.forEach(([txt, ok], i) => {
    tl.call(() => {
      const row = document.createElement('div');
      log.appendChild(row);
      const o = { n: 0 };
      gsap.to(o, { n: txt.length, duration: 0.35, ease: 'none', onUpdate: () => { row.textContent = txt.slice(0, Math.round(o.n)); }, onComplete: () => { if (ok) row.insertAdjacentHTML('beforeend', `<span class="ok">${ok}</span>`); } });
    }, null, 0.4 + i * 0.8);
  });
  // la lame est prête : reflet, le compteur s'efface, l'épée se lève...
  tl.to(forge, { shine: 1.12, duration: 0.6, ease: 'power2.inOut', onStart: () => { forge.shine = -0.06; } }, end)
    .to(cols, { yPercent: -100, duration: 0.6, ease: 'hop', stagger: 0.05 }, end)
    .to(counter, { opacity: 0, duration: 0.4 }, end + 0.2)
    .to(forge, { lift: 1, alpha: 0, duration: 0.32, ease: 'power2.in' }, end + 0.55);
  // pas encore de son autorisé : l'épée attend le visiteur (« dégainer ») pour que musique, coup et ouverture partent ensemble
  tl.call(() => {
    const M = SITE.music;
    const needGate = M && M.src && M.gate && Sound.on && !Music.failed && !(Sound.ctx && Sound.ctx.state === 'running' && Music.playing);
    if (!needGate) return;
    tl.pause();
    const gate = $('.pl-gate', pre), enter = $('.pl-enter', gate), mute = $('.pl-mute', gate);
    gate.hidden = false;
    gsap.fromTo(gate.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
    enter.focus({ preventScroll: true });
    const shine = gsap.to(forge, { shine: 1.12, duration: 1.1, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.4, onRepeat: () => { forge.shine = -0.06; }, onStart: () => { forge.shine = -0.06; } });
    let done = false;
    const go = (withSound) => {
      if (done) return; done = true;
      gsap.ticker.remove(auto);
      window.removeEventListener('keydown', onKey, true);
      shine.kill(); forge.shine = -1;
      if (withSound) { Sound.unlock(); Music.start(2.5); } else if (Sound.on) Sound.toggle(false);
      gsap.to(gate, { opacity: 0, duration: 0.3, onComplete: () => { gate.hidden = true; } });
      tl.resume();
    };
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(true); }
      else if (e.key === 'Escape') { e.preventDefault(); go(false); }
    };
    // si le son démarre entre-temps (geste ailleurs sur la page), l'épée enchaîne d'elle-même
    const auto = () => { if (Music.playing && Sound.ctx && Sound.ctx.state === 'running') go(true); };
    gsap.ticker.add(auto);
    window.addEventListener('keydown', onKey, true);
    enter.addEventListener('click', () => go(true), { once: true });
    mute.addEventListener('click', () => go(false), { once: true });
  }, null, end + 0.5);
  // ... et tranche l'écran de chargement
  tl.call(() => {
    gsap.ticker.remove(follow);
    const halves = [pre, pre.cloneNode(true)];
    halves.forEach((h) => { $$('canvas', h).forEach((c) => c.remove()); });
    halves[1].querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    document.body.appendChild(halves[1]);
    forge.destroy();
    Sound.play('slash', { dir: T && T.nextDir ? T.nextDir() : 1 });
    if (T && T.c) T.c.style.zIndex = '1001';
    gsap.delayedCall(0.95, () => { GLHOLD.on = false; });
    const p = T ? T.slashCut(halves, onReveal) : Promise.resolve(onReveal());
    Promise.resolve(p).then(() => {
      GLHOLD.on = false;
      halves.forEach((h) => h.remove());
      if (T && T.c) T.c.style.zIndex = '';
    });
  }, null, end + 0.85);
}

function revealNav(delay = 0) {
  gsap.fromTo($$('.nav-line'), { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: REDUCED ? 0.01 : 1, ease: 'power4.out', stagger: STAGGER, delay });
  gsap.fromTo('.nav-snd', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: delay + 0.3 });
}

/* --- boot ---------------------------------------------------------------- */
async function boot() {
  window.__app = App; window.__snd = Sound; window.__music = Music;
  Sound.init();
  Music.init();
  $$('[data-site-name]').forEach((n) => { n.textContent = SITE.name; });
  // crédit de la musique (exigé par la licence gratuite de Fesliyan Studios)
  const mc = $('.menu-credit'), M = SITE.music;
  if (mc && M && M.src) mc.innerHTML = `♪ ${esc(M.title)} — ${esc(M.artist)}<br>musique de fond : <a href="${esc(M.creditUrl || '#')}" target="_blank" rel="noopener noreferrer">${esc(M.credit || '')}</a>`;
  document.title = `${SITE.name} — ${SITE.role}`;
  await fontsReady();
  try { await Promise.race([Promise.all([document.fonts.load('500 40px "Geist Mono"'), document.fonts.load('400 80px "Jacquard 24"')]), wait(2000)]); } catch (e) {}
  glyphAtlas();
  App.bg = new SteelBackground($('canvas.background'));
  App.trans = new PageTransition($('canvas.transition'));
  Menu.init();
  [$('.nav-home .nav-line'), $('.nav-cta .nav-line')].forEach(setupRoll);
  if (!IS_TOUCH && !REDUCED && window.Lenis) {
    App.lenis = new Lenis({ duration: isMobile() ? 0.8 : 1.2, smoothWheel: true, touchMultiplier: isMobile() ? 1.5 : 2 });
    App.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => App.lenis.raf(t * 1000));
    // après un gel ponctuel, les animations reprennent où elles étaient au lieu de sauter à la fin
    gsap.ticker.lagSmoothing(300, 33);
  }
  gsap.ticker.add(() => { POINTER.vx *= 0.9; POINTER.vy *= 0.9; });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    e.preventDefault();
    go(href);
  });
  window.addEventListener('hashchange', () => {
    if (App.silent) { App.silent = false; return; }
    const k = location.hash.replace(/^#/, '') || 'index';
    if (k !== App.key) go(k, { mode: 'pop' });
  });
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (App.page) resplit(App.page.el); ScrollTrigger.refresh(); }, 200);
  });

  const route = parseRoute();
  if (route.key === 'projets' || route.project != null) allCovers();
  const nav = $('.nav'), pg = $('.page');
  nav.inert = true; pg.inert = true;
  if (!REDUCED) GLHOLD.on = true;
  App.page = await mountPage(route);
  setLenis(App.page);
  updateCurrent();
  const start = () => {
    nav.inert = false; pg.inert = false;
    revealNav(0);
    App.page.intro(0.1, 'boot');
  };
  if (REDUCED) { $('.preloader').remove(); start(); }
  else runPreloader(start);
  setTimeout(() => { try { allCovers(); } catch (e) {} }, 1200);
}

boot();
