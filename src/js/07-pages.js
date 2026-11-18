/* ==========================================================================
   PAGES — index (affiche), projets (slider), projet, à propos, contact, 404
   chaque page : { key, el, scroll, ready(), intro(delay, mode), destroy() }
   ========================================================================== */
const li = (arr) => arr.map((t) => `<li><span>${esc(t)}</span></li>`).join('');

function footerHTML(variant) {
  const y = new Date().getFullYear();
  if (variant === 'simple') {
    const f = SITE.home.footer;
    return `<footer class="footer-pinned footer-simple"><div class="container">
      <p data-copy="lines">${esc(f[0])}</p>
      <p class="footer-label" data-copy="lines">${esc(f[1])}</p>
      <p class="footer-lamp">${lampHTML()}</p>
    </div></footer>`;
  }
  return `<footer class="${variant === 'pinned' ? 'footer-pinned' : ''}"><div class="container">
    <div class="footer-group" data-copy="items"${variant === 'credits' ? ' data-scroll' : ''}><p class="footer-label"><span>${esc(SITE.name)} © ${y}</span></p><p><span>${esc(t('foot.made'))}</span></p></div>
    <div class="footer-group" data-copy="items"${variant === 'credits' ? ' data-scroll' : ''}><p class="footer-label"><span>${esc(t('foot.salam'))}</span></p><p><a href="mailto:${esc(SITE.email)}" data-roll>${esc(SITE.email)}</a></p></div>
    <div class="footer-group" data-copy="items"${variant === 'credits' ? ' data-scroll' : ''}><p class="footer-label"><span>${esc(t('foot.system'))}</span></p><p><span>${esc(SITE.os)} ${esc(SITE.version)}</span></p></div>
  </div></footer>`;
}

/* --- forge allumée : témoin de disponibilité (réglé depuis le dashboard) ---- */
function lampHTML() {
  return `<a class="forge-lamp${FORGE.lit ? ' is-lit' : ''}" href="#terminal" data-lamp aria-live="polite">
    <span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="fl-text"><span class="fl-label">${esc(FORGE.label())}</span><span class="fl-sub">${esc(FORGE.sub())}</span></span>
  </a>`;
}
function bindLamp(root) {
  const lamp = $('[data-lamp]', root);
  if (!lamp) return () => {};
  // un clic : direction le terminal, KALISO prêt à écouter (ou le ticket si la forge est éteinte)
  lamp.addEventListener('click', () => { try { sessionStorage.setItem('kaliso-run', FORGE.lit ? 'forge' : 'ticket'); } catch (e) {} });
  const upd = () => {
    lamp.classList.toggle('is-lit', FORGE.lit);
    $('.fl-label', lamp).textContent = FORGE.label();
    $('.fl-sub', lamp).textContent = FORGE.sub();
  };
  FORGE.subs.add(upd);
  upd();
  FORGE.load();
  return () => FORGE.subs.delete(upd);
}

function revealFooter(el, delay) {
  $$('footer [data-copy]', el).forEach((c, i) => revealCopy(c, delay + i * STAGGER * 2));
}

function scrollReveals(el) {
  $$('[data-copy][data-scroll]', el).forEach((c) => {
    ScrollTrigger.create({ trigger: c, start: 'top 85%', once: true, onEnter: () => revealCopy(c, 0) });
  });
}

function fluidImages(el) {
  $$('.fluid-image:not(.hero)', el).forEach((f) => {
    const img = $('img', f);
    gsap.fromTo(img, { yPercent: -14.2857 }, { yPercent: 14.2857, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* --- INDEX --------------------------------------------------------------- */
function PageIndex() {
  const d = new Date();
  const date = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
  const el = h(`<section class="home">
    <h1 class="sr-only">${esc(SITE.name)}, ${esc(SITE.role)}</h1>
    <div class="model" role="img" aria-label="${esc(t('home.knight'))}"></div>
    <div class="home-top" data-copy="items"><p><span>${date} — ${esc(SITE.os)} ${esc(SITE.version)} — status 200</span></p><p><span>${esc(SITE.motto)}</span></p></div>
    <div class="home-mid" aria-hidden="true">
      <div class="home-labels is-top" data-copy="items"><p><span>${esc(SITE.version)}</span></p><p><span>${esc(SITE.os)}</span></p></div>
      <div class="home-word"><span class="home-dot"></span><h2>${[...SITE.heroWord].map((c) => `<span class="ch-mask"><span class="ch">${esc(c)}</span></span>`).join('')}</h2><span class="home-dot"></span></div>
      <div class="home-labels is-bottom" data-copy="items"><p><span>${esc(SITE.name)}</span></p><p><span>${d.getFullYear()}</span></p></div>
    </div>
    <div class="home-lore is-left"><p data-copy="lines">${esc(SITE.home.loreLeft)}</p></div>
    <div class="home-lore is-right"><p data-copy="lines">${esc(SITE.home.loreRight)}</p></div>
    <div class="home-ornament" aria-hidden="true"><span>*</span><span style="opacity:.4">*</span><span>*</span></div>
    ${footerHTML('simple')}
  </section>`);
  const page = { key: 'index', el, scroll: false, timers: [] };
  page.ready = () => {
    prepCopy(el);
    page.unlamp = bindLamp(el);
    gsap.set($('.forge-lamp', el), { opacity: 0, y: 12 });
    // secret : sept coups sur le chevalier
    let hits = 0, last = 0;
    $('.model', el).addEventListener('pointerdown', () => {
      const n = performance.now();
      hits = n - last < 900 ? hits + 1 : 1; last = n;
      if (hits >= 7) { hits = 0; Seals.find('knight'); if (page.knight && !REDUCED) gsap.fromTo(page.knight, { extraRot: 0 }, { extraRot: Math.PI * 4, duration: 1.6, ease: 'power3.inOut', onComplete: () => { page.knight.extraRot = 0; } }); }
    });
    page.chars = $$('.ch', el);
    page.dots = $$('.home-dot', el);
    gsap.set(page.chars, { yPercent: 110 });
    gsap.set(page.dots, { scale: 0 });
    gsap.set($$('.home-ornament span', el), { yPercent: 120, opacity: 0 });
    page.knight = new KnightASCII($('.model', el), {
      cell: (w) => (w <= 600 ? [4, 7] : [5, 8.5]),
      fill: 0.97, frame: [-1.22, 1.04], width: 1.9, fadeY: 0.02, fadeW: 0.22,
    });
  };
  page.intro = (delay = 0) => {
    page.knight.start(delay + 0.1, 2.5);
    revealCopy($('.home-top', el), delay + 0.8);
    $$('.home-labels', el).forEach((c, i) => revealCopy(c, delay + 1.0 + i * 0.1));
    gsap.to(page.chars, { yPercent: 0, duration: REDUCED ? 0.01 : 1.3, ease: 'power4.out', stagger: 0.05, delay: delay + 0.9 });
    gsap.to(page.dots, { scale: 1, duration: 1, ease: 'power4.out', delay: delay + 1.3 });
    $$('.home-lore [data-copy]', el).forEach((c, i) => revealCopy(c, delay + 1.4 + i * 0.15, { stagger: 0.05 }));
    gsap.to($$('.home-ornament span', el), { yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.08, delay: delay + 1.6 });
    $$('footer [data-copy]', el).forEach((c, i) => revealCopy(c, delay + 1.5 + i * STAGGER));
    gsap.to($('.forge-lamp', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: delay + 1.7 });
  };
  page.destroy = () => { page.timers.forEach(clearTimeout); page.unlamp && page.unlamp(); page.knight && page.knight.destroy(); };
  return page;
}

/* --- PROJETS ------------------------------------------------------------- */
function swapText(p, text, instant) {
  const box = $('.swap', p);
  const cur = box.lastElementChild;
  if (instant || !cur || !cur.textContent) { box.innerHTML = `<span>${esc(text)}</span>`; return; }
  const n = document.createElement('span'); n.textContent = text; box.appendChild(n);
  gsap.fromTo(n, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.out' });
  gsap.to(cur, { yPercent: -100, duration: 0.6, ease: 'power3.out', onComplete: () => cur.remove() });
}

function PageWork() {
  const P = SITE.projects;
  const el = h(`<div class="work">
    <h1 class="sr-only">${esc(t('title.work'))}</h1>
    <nav class="sr-only" aria-label="${esc(t('title.work'))}"><ul>${P.map((p) => `<li><a tabindex="-1" href="#projet-${p.slug}">${esc(p.name + p.ext)}</a></li>`).join('')}</ul></nav>
    <div class="slider" tabindex="0" role="button" aria-label="${esc(t('work.open'))}" aria-describedby="slide-title slide-count"></div>
    <div class="slide-hint" data-copy="items"><p><span>${esc(t('work.hint'))}</span></p></div>
    <div class="slide-info"><div class="container" data-copy="items">
      <p id="slide-title" aria-live="polite"><span class="swap"><span></span></span></p>
      <p><span>${esc(SITE.workLabel)}</span></p>
      <p id="slide-count"><span class="swap"><span></span></span></p>
    </div></div>
  </div>`);
  const page = { key: 'projets', el, scroll: false };
  page.ready = () => {
    prepCopy(el);
    const info = $('.slide-info .container', el);
    page.slider = new WorkSlider($('.slider', el), P, {
      onActive: (i, first) => {
        swapText($('#slide-title', el), P[i].name + P[i].ext, first);
        swapText($('#slide-count', el), `${pad2(i + 1)} / ${pad2(P.length)}`, first);
      },
      onOpen: (p) => go(`#projet-${p.slug}`, { mode: 'slider' }),
      onExpand: () => { hideCopy(info); hideCopy($('.slide-hint', el)); },
      onCollapse: () => { revealCopy(info, 0.2); revealCopy($('.slide-hint', el), 0.3); },
    });
  };
  page.intro = (delay = 0) => {
    page.slider.start(delay);
    revealCopy($('.slide-info .container', el), delay + 1.1);
    revealCopy($('.slide-hint', el), delay + 1.6);
  };
  page.destroy = () => page.slider && page.slider.destroy();
  return page;
}

/* --- PROJET -------------------------------------------------------------- */
// étude de cas (sections écrites dans src/projets/<slug>.md, HTML déjà nettoyé par build.py)
function caseStudyHTML(p) {
  const s = p.story;
  const tm = p.temps;
  if (!s && !tm) return '';
  const lang = p.storyLang || 'fr';
  const sec = (k) => (s && s[k] ? `<div class="case-sec" data-scroll-fade><h3 class="project-label text-small">${esc(t('case.' + k))}</h3><div class="case-body text-large" lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'auto'}">${s[k]}</div></div>` : '');
  let time = '';
  if (tm) {
    const max = Math.max(tm.estime, tm.reel);
    const d = Math.round(((tm.reel - tm.estime) / tm.estime) * 100);
    const verdict = d === 0 ? t('case.onTime') : d < 0 ? t('case.faster', { n: -d }) : t('case.slower', { n: d });
    const bar = (k, v) => `<div class="tb-row"><span class="tb-k">${esc(t('case.' + k))}</span><span class="tb-bar"><i class="tb-fill${k === 'actual' ? ' is-real' : ''}" style="--w:${((v / max) * 100).toFixed(1)}%"></i></span><span class="tb-v">${esc(unit(v, tm.unite))}</span></div>`;
    time = `<div class="case-sec case-time" data-scroll-fade><h3 class="project-label text-small">${esc(t('case.time'))}</h3>
      <div class="time-bars">${bar('estimated', tm.estime)}${bar('actual', tm.reel)}</div>
      <p class="tb-verdict">${esc(verdict)}</p></div>`;
  }
  return `<section class="project-case"><div class="container">
    <h2 class="project-label text-small" data-copy="lines" data-scroll>${esc(t('proj.case'))}</h2>
    <div class="case-grid">${['quete', 'claude', 'decisions', 'resultats'].map(sec).join('')}${time}</div>
  </div></section>`;
}

function PageProject(i) {
  const P = SITE.projects, p = P[i], next = P[(i + 1) % P.length];
  const cover = allCovers()[i];
  const shots = projectShots(p, i);
  const gh = (SITE.socials.find((s) => /github/i.test(s.label)) || SITE.socials[0]).url;
  const frame = (src, alt = '') => `<div class="fluid-image project-frame"><img src="${src}" alt="${esc(alt)}" decoding="async"></div>`;
  const el = h(`<article class="project">
    <section class="project-hero">
      <div class="fluid-image project-image hero"><img src="${cover}" alt="${esc(p.name)} — ${esc(t('proj.cover'))}" decoding="async"></div>
      <div class="container project-title"><h1 data-copy="lines">${esc(p.name + p.ext)}</h1></div>
      <div class="container project-info"><p data-copy="lines">${esc(p.type)}</p><p data-copy="lines">${p.year}</p></div>
    </section>
    <section class="project-overview"><div class="container">
      <div class="project-list"><h2 class="project-label text-small" data-copy="lines" data-scroll>${esc(t('proj.quest'))}</h2><ul data-copy="items" data-scroll>${li(p.services)}</ul></div>
      <div class="project-list"><h2 class="project-label text-small" data-copy="lines" data-scroll>${esc(t('proj.arsenal'))}</h2><ul data-copy="items" data-scroll>${li(p.stack)}</ul></div>
      <div class="project-copy">
        ${p.description.map((t) => `<p class="text-large" data-copy="lines" data-scroll>${esc(t)}</p>`).join('')}
        <ul class="project-links" data-copy="items" data-scroll>
          <li><a href="${esc(p.url || gh)}" target="_blank" rel="noopener noreferrer" data-roll>${esc(t('proj.live'))}</a></li>
          <li><a href="${esc(p.repo || gh)}" target="_blank" rel="noopener noreferrer" data-roll>${esc(t('proj.code'))}</a></li>
        </ul>
      </div>
    </div></section>
    <div class="project-shots"><div class="container">${frame(shots[0], `${p.name} — ${t('proj.shotCode')}`)}</div></div>
    <div class="project-stats"><div class="container">${p.stats.map(([v, l]) => `<div class="project-stat"><p class="text-large" data-copy="lines" data-scroll>${esc(v)}</p><p class="project-label" data-copy="lines" data-scroll>${esc(l)}</p></div>`).join('')}</div></div>
    <div class="project-shots"><div class="container">${frame(shots[1])}${frame(shots[2], `${p.name} — ${t('proj.shotLog')}`)}</div></div>
    <section class="project-notes"><div class="container">
      <h2 class="project-label text-small" data-copy="lines" data-scroll>${esc(t('proj.notes'))}</h2>
      <div class="project-copy">${p.notes.map((t) => `<p class="text-large" data-copy="lines" data-scroll>${esc(t)}</p>`).join('')}</div>
    </div></section>
    <div class="project-shots"><div class="container">${frame(shots[3])}</div></div>
    ${caseStudyHTML(p)}
    <section class="project-next">
      <div class="container" data-copy="items" data-scroll><p class="project-label"><span>${esc(t('proj.next'))}</span></p><h2><a href="#projet-${next.slug}" data-roll>${esc(next.name + next.ext)}</a></h2></div>
      ${footerHTML('credits')}
    </section>
  </article>`);
  const page = { key: `projet-${p.slug}`, el, scroll: true };
  page.ready = () => {
    prepCopy(el);
    $$('[data-roll]', el).forEach(setupRoll);
  };
  page.intro = (delay = 0, mode) => {
    const img = $('.project-hero img', el);
    if (mode !== 'slider' && !REDUCED) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 2, ease: 'power4.out', delay: Math.max(0, delay - 0.3) });
    revealCopy($('.project-title [data-copy]', el), delay + 0.2);
    $$('.project-info [data-copy]', el).forEach((c, k) => revealCopy(c, delay + 0.35 + k * STAGGER));
    page.ctx = gsap.context(() => {
      gsap.to(img, { yPercent: 22, ease: 'none', scrollTrigger: { trigger: $('.project-hero', el), start: 'top top', end: 'bottom top', scrub: true } });
      fluidImages(el);
      scrollReveals(el);
      $$('[data-scroll-fade]', el).forEach((c) => {
        gsap.set(c, { opacity: 0, y: 28 });
        ScrollTrigger.create({ trigger: c, start: 'top 88%', once: true, onEnter: () => {
          gsap.to(c, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
          $$('.tb-fill', c).forEach((f, k) => gsap.fromTo(f, { width: 0 }, { width: getComputedStyle(f).getPropertyValue('--w'), duration: 1.4, ease: 'power3.out', delay: 0.25 + k * 0.2 }));
        } });
      });
    }, el);
  };
  page.destroy = () => page.ctx && page.ctx.revert();
  return page;
}

/* --- À PROPOS ------------------------------------------------------------ */
function buildArch(arch) {
  const probe = document.createElement('span');
  probe.textContent = 'M'.repeat(40);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  arch.appendChild(probe);
  const cw = probe.getBoundingClientRect().width / 40;
  probe.remove();
  const lh = parseFloat(getComputedStyle(arch).lineHeight) || cw * 2.25;
  const ratio = lh / cw;
  // arc outrepassé : cercle prolongé sous son centre, puis piédroits verticaux
  const Ro = clamp(Math.floor((innerHeight * 0.74) / lh / 2.55), 9, 19);
  const Ri = Ro * 0.64, sp = Ro * 0.38, J = Ro * 1.12;
  const text = SITE.about.ring.toUpperCase();
  const nameU = SITE.name.toUpperCase();
  let k = 0;
  const take = (n) => { let out = ''; for (let i = 0; i < n; i++) { out += text[k % text.length]; k++; } return out; };
  const rows = [];
  let doorTop = null;
  const jo = Math.sqrt(Ro * Ro - sp * sp), ji = Math.sqrt(Ri * Ri - sp * sp);
  for (let r = -Ro; r <= Math.ceil(sp + J); r++) {
    const y = r;
    let ow, iw;
    if (y < sp) { ow = Math.sqrt(Math.max(0, Ro * Ro - y * y)); iw = Math.abs(y) < Ri ? Math.sqrt(Ri * Ri - y * y) : 0; }
    else { ow = jo; iw = ji; }
    const oc = Math.round(ow * ratio), ic = Math.round(iw * ratio);
    if (oc < 1) continue;
    if (ic === 0) rows.push(take(oc * 2));
    else { if (doorTop === null) doorTop = rows.length; const seg = Math.max(1, oc - ic); rows.push(take(seg) + ' '.repeat(ic * 2) + take(seg)); }
  }
  const sill = Math.round(jo * ratio) + 3;
  rows.push('='.repeat(sill * 2));
  arch.innerHTML = rows.map((l) => `<span><span>${esc(l).split(esc(nameU)).join(`<b class="hl" style="font-weight:inherit">${esc(nameU)}</b>`)}</span></span>`).join('');
  const springRow = rows.length - 1 - Math.ceil(J) - 1;
  return { lh, cw, rows: rows.length, doorTop, springRow, doorW: Math.round(ji * ratio) * 2 * cw };
}

function PageAbout() {
  const A = SITE.about;
  const el = h(`<div class="about">
    <section class="about-hero"><div class="container">
      <div class="arch-wrap">
        <h1 class="ring arch" aria-label="${esc(SITE.name)}, ${esc(SITE.role)}"></h1>
        <div class="arch-door"><p class="arch-cmd">$ cd /bab <span class="ar" lang="ar">باب</span></p><p class="arch-text">${esc(A.door)}</p></div>
      </div>
      <h2 class="about-intro text-large" data-copy="lines">${esc(A.intro)}</h2>
    </div></section>
    <div class="about-logo"><div class="container"><div class="logo-bust"><div class="knight-host" role="img" aria-label="${esc(t('about.bust'))}"></div></div></div></div>
    <div class="about-portrait"><div class="container"><div class="portrait">
      <div class="knight-host" role="img" aria-label="${esc(t('about.portrait'))}"></div>
      <div class="portrait-meta" data-copy="items" data-scroll><p><span>fig. 01 — ${esc(SITE.os)}</span></p><p><span>${esc(SITE.location)}</span></p></div>
      <div class="portrait-caption">
        <p class="gothic" data-copy="lines" data-scroll>${esc(A.portraitTitle)}</p>
        <div data-copy="items" data-scroll>${A.portraitLines.map((t) => `<p><span>${esc(t)}</span></p>`).join('')}</div>
      </div>
    </div></div></div>
    <section class="about-info"><div class="container">
      <div class="info-list"><h2 class="info-label text-small" data-copy="lines" data-scroll>${esc(t('about.skills'))}</h2><ul data-copy="items" data-scroll>${li(A.skills)}</ul></div>
      <div class="info-list"><h2 class="info-label text-small" data-copy="lines" data-scroll>${esc(t('about.stack'))}</h2><ul data-copy="items" data-scroll>${li(A.stack)}</ul></div>
      <p class="about-copy text-large" data-copy="lines" data-scroll>${esc(A.copy)}</p>
    </div></section>
    <section class="about-credits"><div class="container">
      <h2 class="credits-label text-small" data-copy="lines" data-scroll>${esc(t('about.xp'))}</h2>
      <ul class="credits-list" data-copy="items" data-scroll>${A.experience.map(([y, t]) => `<li><span><span class="yr">${esc(y)}</span>${esc(t)}</span></li>`).join('')}</ul>
      <h2 class="credits-label text-small" data-copy="lines" data-scroll>${esc(t('about.allies'))}</h2>
      <ul class="credits-list" data-copy="items" data-scroll>${li(A.clients)}</ul>
      <div class="logo"><div class="knight-host"></div></div>
    </div></section>
    ${footerHTML('credits')}
  </div>`);
  const page = { key: 'a-propos', el, scroll: true, knights: [] };
  page.ready = () => {
    prepCopy(el);
    $$('[data-roll]', el).forEach(setupRoll);
    const arch = $('.arch', el);
    if (!isMobile()) {
      const g = buildArch(arch);
      page.ringRows = $$(':scope > span > span', arch);
      gsap.set(page.ringRows, { yPercent: 100 });
      const door = $('.arch-door', el);
      door.style.top = ((g.doorTop + 1.5) * g.lh) + 'px';
      door.style.height = ((g.rows - g.doorTop - 3) * g.lh) + 'px';
      door.style.width = Math.max(160, g.doorW * 0.84) + 'px';
      page.doorEls = $$('p', door);
      gsap.set(page.doorEls, { opacity: 0, y: 12 });
    }
    page.bust = new KnightASCII($('.logo-bust .knight-host', el), {
      cell: (w) => (w <= 600 ? [3.5, 6] : [4, 7]), fill: 0.96, frame: [-0.12, 0.86], width: 1.25, tail: 0.42, baseRotY: -0.35, gain: 1.6,
      idle: 0.3, fadeY: 0.05, fadeW: 0.2,
      introSpin: -Math.PI * 2, introScale: 0.5,
    });
    page.knights.push(page.bust);
    page.portrait = new KnightASCII($('.portrait .knight-host', el), {
      cell: (w) => (w <= 600 ? [4.5, 8] : [5.5, 9.5]), fill: 0.95, frame: [-1.55, 0.92], width: 2.0,
      baseRotY: -0.6, idle: 0.1, fadeY: 0.03, fadeW: 0.3, introSpin: 0, introScale: 0.92,
    });
    page.logo = new KnightASCII($('.logo .knight-host', el), {
      cell: [4, 7], fill: 0.95, frame: [-0.62, 0.86], width: 1.2, tail: 0.45, gain: 1.6, spin: 0.45, idle: 0, parallax: [0.12, 0.12],
      fadeY: 0.05, fadeW: 0.2, introSpin: -Math.PI, introScale: 0.6, scan: 0.6,
    });
    page.knights.push(page.portrait, page.logo);
  };
  page.intro = (delay = 0) => {
    if (page.ringRows) {
      gsap.to(page.ringRows, { yPercent: 0, duration: REDUCED ? 0.01 : 1, ease: 'power4.out', stagger: 0.025, delay: delay + 0.1 });
      gsap.to(page.doorEls, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.15, delay: delay + 1.3 });
    }
    revealCopy($('.about-intro', el), delay + 0.2);
    page.ctx = gsap.context(() => {
      scrollReveals(el);
      ScrollTrigger.create({ trigger: $('.logo-bust', el), start: 'top 90%', once: true, onEnter: () => page.bust.start(0, 2.4) });
      ScrollTrigger.create({ trigger: $('.portrait', el), start: 'top 75%', once: true, onEnter: () => page.portrait.start(0, 2.6) });
      ScrollTrigger.create({ trigger: $('.portrait', el), start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (st) => { page.portrait.extraRot = lerp(-0.55, 0.55, st.progress); } });
      ScrollTrigger.create({ trigger: $('.logo', el), start: 'top 85%', once: true, onEnter: () => page.logo.start(0, 2.2) });
    }, el);
  };
  page.destroy = () => { page.ctx && page.ctx.revert(); page.knights.forEach((k) => k.destroy()); };
  return page;
}

/* --- CONTACT ------------------------------------------------------------- */
function PageContact() {
  const C = SITE.contact;
  const el = h(`<div class="contact">
    <section class="inquire-hero"><div class="container">
      <h1 class="sr-only">${esc(t('title.contact'))}</h1>
      <p class="inquire-copy text-large" data-copy="lines">${esc(C.copy)}</p>
      <p class="inquire-note" data-copy="lines">${esc(SITE.email)} — ${esc([t('contact.reply'), t('contact.written')].filter(Boolean).join(' · '))}</p>
      <a class="inquire-forge" href="#terminal" data-forge-cta><span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span>${esc(t('contact.forge'))} <span aria-hidden="true">${RTL ? '←' : '→'}</span></a>
      <ul class="inquire-links" data-copy="items">
        <li><a href="mailto:${esc(SITE.email)}" data-roll>${esc(t('contact.email'))}</a></li>
        ${SITE.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-roll>${esc(s.label)}<span class="sr-only"> ${esc(t('contact.newTab'))}</span></a></li>`).join('')}
        <li><button type="button" class="copy-btn">${esc(t('contact.copy'))}</button></li>
      </ul>
      <div class="inquire-prompt" data-copy="items" dir="ltr"><p><span><span class="usr">${esc(t('term.user'))}@${esc(SITE.handle)}</span>:~$ <span class="typed"></span><span class="cursor"></span></span></p></div>
    </div></section>
    ${footerHTML('pinned')}
  </div>`);
  const page = { key: 'contact', el, scroll: false, timers: [] };
  page.ready = () => {
    prepCopy(el);
    $$('[data-roll]', el).forEach(setupRoll);
    const btn = $('.copy-btn', el);
    btn.addEventListener('click', async () => {
      Sound.play('select');
      try { await navigator.clipboard.writeText(SITE.email); scrambleTo(btn, t('contact.copied'), 0.5); }
      catch (e) { scrambleTo(btn, SITE.email, 0.5); }
      page.timers.push(setTimeout(() => scrambleTo(btn, t('contact.copy'), 0.5), 2200));
    });
    const cta = $('[data-forge-cta]', el);
    cta.addEventListener('click', () => { try { sessionStorage.setItem('kaliso-run', 'forge'); } catch (e) {} });
    gsap.set(cta, { opacity: 0, y: 12 });
  };
  page.intro = (delay = 0) => {
    revealCopy($('.inquire-copy', el), delay + 0.3);
    revealCopy($('.inquire-note', el), delay + 0.375);
    gsap.to($('[data-forge-cta]', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: delay + 0.42 });
    revealCopy($('.inquire-links', el), delay + 0.45);
    revealCopy($('.inquire-prompt', el), delay + 0.6);
    revealFooter(el, delay + 0.75);
    const typed = $('.typed', el);
    let ci = 0;
    const type = (str, i = 0) => {
      if (i <= str.length) { typed.textContent = str.slice(0, i); page.timers.push(setTimeout(() => type(str, i + 1), 45 + Math.random() * 50)); }
      else page.timers.push(setTimeout(() => erase(str.length), 1900));
    };
    const erase = (i) => {
      if (i >= 0) { typed.textContent = typed.textContent.slice(0, i); page.timers.push(setTimeout(() => erase(i - 1), 22)); }
      else { ci = (ci + 1) % C.commands.length; page.timers.push(setTimeout(() => type(C.commands[ci]), 400)); }
    };
    page.timers.push(setTimeout(() => type(C.commands[0]), (delay + 1.4) * 1000));
  };
  page.destroy = () => page.timers.forEach(clearTimeout);
  return page;
}

/* --- 404 ----------------------------------------------------------------- */
function PageNotFound() {
  const el = h(`<div class="nf">
    <section class="not-found"><div class="container">
      <pre class="not-found-ascii" aria-hidden="true">${esc(asciiArt('helm', 40, 20))}</pre>
      <p class="not-found-note" data-copy="lines">${esc(t('nf.note'))}</p>
      <h1 class="not-found-copy" data-copy="lines">${esc(t('nf.copy'))}</h1>
      <ul class="not-found-links" data-copy="items"><li><a href="#index" data-roll>${esc(t('nf.home'))}</a></li><li><a href="#projets" data-roll>${esc(t('nf.work'))}</a></li></ul>
    </div></section>
    ${footerHTML('pinned')}
  </div>`);
  const page = { key: '404', el, scroll: false };
  page.ready = () => { prepCopy(el); $$('[data-roll]', el).forEach(setupRoll); gsap.set($('.not-found-ascii', el), { opacity: 0 }); };
  page.intro = (delay = 0) => {
    gsap.to($('.not-found-ascii', el), { opacity: 1, duration: 1.2, delay });
    revealCopy($('.not-found-note', el), delay + 0.3);
    revealCopy($('.not-found-copy', el), delay + 0.375);
    revealCopy($('.not-found-links', el), delay + 0.45);
    revealFooter(el, delay + 0.6);
    page.timers.push(setTimeout(() => Seals.find('desert'), (delay + 2.2) * 1000));
  };
  page.timers = [];
  page.destroy = () => page.timers.forEach(clearTimeout);
  return page;
}
