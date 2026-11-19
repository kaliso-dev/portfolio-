/* ==========================================================================
   LA FORGE (#forge) — KALISO en mode visuel
   - le mini chevalier ASCII de la page À propos, avatar de KALISO
   - une barre de saisie en verre liquide (façon iOS 26) : idées, dictée, envoi
   - un chargement en anneau, « KALISO forge le plan »
   - le plan en carrousel, puis une vue d'ensemble en grille
   - le ticket dans une feuille, et « mes quêtes » pour suivre ses demandes
   Verre liquide (classe .lg) : uniquement pour les commandes qui flottent
   sur le fond (règle d'Apple) ; le contenu reste sur des cartes classiques.
   ========================================================================== */
const FX_ART = {
  plan: [
    '        ______        ',
    '   ____/      \\____   ',
    '  /________________\\  ',
    '      \\__________/    ',
    '        |      |      ',
    '     ___|______|___   ',
    '    |______________|  ',
  ],
  features: [
    ' .----------------. ',
    ' | [x] ========== | ',
    ' | [x] ======     | ',
    ' | [x] ========   | ',
    ' | [x] ====       | ',
    ' | [ ] =======    | ',
    " '----------------' ",
  ],
  stack: [
    ' \\\\            // ',
    '  \\\\          //  ',
    '   \\\\        //   ',
    '    \\\\  /\\  //    ',
    '     \\\\//\\\\//     ',
    '     //\\\\//\\\\     ',
    '  [##]      [##]  ',
  ],
  steps: [
    '               ___ ',
    '           ___|    ',
    '       ___|        ',
    '   ___|            ',
    '__|                ',
    '                   ',
    ' 01  02  03  04    ',
  ],
  range: [
    '         |         ',
    '    _____|_____    ',
    '   |     |     |   ',
    '  / \\    |    / \\  ',
    ' /___\\   |   /___\\ ',
    '       __|__       ',
    '      |_____|      ',
  ],
  questions: [
    '     .-----.     ',
    '    /  _   \\    ',
    '   |__/ /  /    ',
    '       /  /     ',
    '      |__|      ',
    '       __       ',
    '      (__)      ',
  ],
};
const FX_ICON = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5 12 5.5l6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>',
};

function PageForge() {
  const el = h(`<div class="fx">
    <section class="fx-hero"><div class="container"><div class="fx-col">
      <p class="fx-status"><span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span><span class="fs-txt"></span></p>
      <div class="fx-knight"><div class="knight-host" role="img" aria-label="${esc(t('about.bust'))}"></div></div>
      <p class="fx-kicker">${esc(t('gui.kicker'))}</p>
      <h1 class="fx-hello">${esc(t('gui.hello')).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>')}</h1>
      <p class="fx-lead">${esc(t('gui.lead2'))}</p>
      <div class="fx-bar-row">
        <form class="fx-bar lg" novalidate>
          <button type="button" class="fx-ico" data-act="ideas" aria-label="${esc(t('gui.ideas'))}" aria-expanded="true" aria-controls="fx-ideas">${FX_ICON.plus}</button>
          <textarea class="fx-input" rows="1" maxlength="1500" placeholder="${esc(t('gui.ph'))}" aria-label="${esc(t('gui.label'))}" data-lenis-prevent></textarea>
          <button type="button" class="fx-ico fx-mic" data-act="mic" aria-label="${esc(t('gui.mic'))}" hidden>${FX_ICON.mic}</button>
          <button type="submit" class="fx-send" aria-label="${esc(t('gui.forgeIt'))}" disabled>${FX_ICON.up}</button>
        </form>
        <button type="button" class="fx-x lg" data-act="clear" aria-label="${esc(t('gui.clear'))}" tabindex="-1">${FX_ICON.x}</button>
      </div>
      <div class="fx-ideas" id="fx-ideas">${t('gui.examples').map((x) => `<button type="button" class="fx-chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <p class="fx-err" role="alert"></p>
      <p class="fx-hint">${esc(t('fg.privacy'))}</p>
    </div></div></section>
    <section class="fx-out"><div class="container"><div class="fx-stage" aria-live="polite"></div></div></section>
    <section class="fx-quests" hidden><div class="container"><div class="fx-wide">
      <p class="fx-kicker">${esc(t('gui.quests'))}</p>
      <p class="fx-sub">${esc(t('gui.questsSub'))}</p>
      <ul class="fx-qlist"></ul>
    </div></div></section>
    <p class="fx-term"><a href="#terminal">${esc(t('gui.termLink'))}</a></p>
    ${footerHTML()}
    <div class="fx-sheet" hidden>
      <div class="fx-scrim" data-act="close"></div>
      <div class="fx-panel" role="dialog" aria-modal="true" aria-label="${esc(t('gui.f.title'))}" data-lenis-prevent></div>
    </div>
  </div>`);
  const page = { key: 'forge', el, scroll: true, timers: [] };
  const bar = $('.fx-bar', el), input = $('.fx-input', el), send = $('.fx-send', el), stage = $('.fx-stage', el);
  const err = $('.fx-err', el), ideas = $('.fx-ideas', el), sheet = $('.fx-sheet', el), panel = $('.fx-panel', el);
  let busy = false, draft = Draft.get(), carousel = null, rec = null;
  const nf = (n, d = 0) => Number(n).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: d });
  const kE = (v) => nf(v / 1000, v % 1000 ? 1 : 0);
  const scrollTo = (target, offset = -90) => {
    if (!target) return;
    if (App.lenis) App.lenis.scrollTo(target, { offset, duration: 1.3 });
    else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  };
  const refresh = () => { try { ScrollTrigger.refresh(); } catch (e) {} };
  const appear = (nodes, delay = 0) => { if (!REDUCED) gsap.from(nodes, { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay }); };

  /* --- barre de saisie -------------------------------------------------------- */
  const grow = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    const has = input.value.trim().length > 0;
    send.disabled = busy || !has;
    el.classList.toggle('has-text', has);
  };
  input.addEventListener('input', () => { err.textContent = ''; grow(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); forge(input.value.trim()); }
  });
  bar.addEventListener('submit', (e) => { e.preventDefault(); forge(input.value.trim()); });

  // dictée (Chrome, Edge, Safari) : la voix s'ajoute au texte
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = $('.fx-mic', el);
  if (SR) micBtn.hidden = false;
  function toggleMic() {
    if (rec) { rec.stop(); return; }
    try {
      rec = new SR();
      rec.lang = LANG === 'en' ? 'en-US' : 'fr-FR';
      rec.interimResults = true;
      rec.continuous = true;
      const base = input.value ? input.value.replace(/\s*$/, ' ') : '';
      rec.onresult = (ev) => {
        let txt = '';
        for (let i = 0; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
        input.value = (base + txt).slice(0, 1500); grow();
      };
      rec.onend = () => { rec = null; micBtn.classList.remove('is-on'); micBtn.setAttribute('aria-label', t('gui.mic')); };
      rec.onerror = rec.onend;
      rec.start();
      micBtn.classList.add('is-on'); micBtn.setAttribute('aria-label', t('gui.micStop'));
    } catch (e) { rec = null; }
  }

  /* --- chargement : anneau de graduations + phrase animée ------------------------- */
  function loader() {
    const N = 60;
    const ticks = Array.from({ length: N }, (_, i) => `<line x1="0" y1="-70" x2="0" y2="-92" transform="rotate(${i * 6})"/>`).join('');
    stage.innerHTML = `<div class="fx-load" role="status">
      <div class="fx-ring"><svg viewBox="-100 -100 200 200" aria-hidden="true">${ticks}</svg>
        <div class="fx-ring-c"><b class="fx-pct">0%</b><span>${esc(t('gui.loadPct'))}</span></div></div>
      <p class="fx-shimmer">${esc(t('gui.loadTitle'))}<span class="fx-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>
      <p class="fx-load-sub">${esc(t('gui.loadSub'))}</p>
      <p class="fx-load-step"></p>
    </div>`;
    const lines = $$('.fx-ring line', stage), pct = $('.fx-pct', stage), step = $('.fx-load-step', stage);
    const steps = t('fg.heat');
    const t0 = performance.now();
    const st = { p: 0, done: false };
    const paint = () => {
      const lit = Math.round(st.p * N);
      lines.forEach((l, i) => {
        const head = lit - i;
        l.style.stroke = i < lit ? `rgba(242,240,234,${(0.3 + 0.7 * (1 - Math.min(head, 20) / 20)).toFixed(3)})` : 'rgba(233,230,221,0.12)';
      });
      pct.textContent = Math.round(st.p * 100) + '%';
    };
    const tick = () => {
      const s = (performance.now() - t0) / 1000;
      if (!st.done) st.p = 0.95 * (1 - Math.exp(-s / 5.5));
      step.textContent = steps[Math.min(steps.length - 1, Math.floor(s / 2.4))] + '…';
      paint();
    };
    gsap.ticker.add(tick);
    if (!REDUCED) gsap.from($('.fx-load', stage), { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' });
    return {
      finish: () => new Promise((ok) => {
        st.done = true;
        gsap.to(st, { p: 1, duration: 0.45, ease: 'power2.out', onUpdate: paint, onComplete: () => { gsap.ticker.remove(tick); setTimeout(ok, 180); } });
      }),
      stop: () => gsap.ticker.remove(tick),
    };
  }

  /* --- le plan ----------------------------------------------------------------------- */
  const art = (k) => esc(FX_ART[k].join('\n'));
  const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const chips = (arr) => `<div class="fc-chips">${(arr || []).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
  function figures(r) {
    const e = r.estimate, p = r.plan;
    return {
      budget: e ? t('gui.k', { a: kE(e.prix[0]), b: kE(e.prix[1]) }) : t('gui.onQuote'),
      weeks: e ? t('gui.wk', { a: e.semaines[0], b: e.semaines[1] }) : t('gui.tbd'),
      cx: `${p.complexity}/5`,
    };
  }
  function slidesHTML(r) {
    const p = r.plan, f = figures(r), e = r.estimate, mods = p.modules || [];
    const stat = (v, k) => `<div class="fc-stat"><b>${esc(v)}</b><span>${esc(t(k))}</span></div>`;
    const S = [
      { k: 'plan', title: p.title, body: `<p>${esc(p.summary)}</p>`, stats: [stat(f.budget, 'gui.st.budget'), stat(f.weeks, 'gui.st.weeks'), stat(f.cx, 'gui.st.complexity')] },
      { k: 'features', title: t('gui.tt.features'), body: `<ul class="fc-checks">${li(p.features)}</ul>`, stats: [stat(String(p.features.length), 'gui.st.features')] },
      { k: 'stack', title: t('gui.tt.stack'), body: chips(p.stack) + (mods.length ? `<p class="fc-mods">${mods.map((m) => esc(lab('mod.', m))).join(' · ')}</p>` : ''), stats: [stat(String(p.stack.length), 'gui.st.tools'), stat(String(mods.length), 'gui.st.modules')] },
      { k: 'steps', title: t('gui.tt.steps'), body: `<ol class="fc-steps">${p.steps.map((s) => `<li><b>${esc(s.name)}</b>${s.detail ? `<span>${esc(s.detail)}</span>` : ''}</li>`).join('')}</ol>`, stats: [stat(String(p.steps.length), 'gui.st.phases'), stat(f.weeks, 'gui.st.weeks')] },
      { k: 'range', title: e ? t('fg.price', { a: nf(e.prix[0]), b: nf(e.prix[1]) }) : t('gui.onQuote'), body: `${e ? `<p>${esc(t('fg.weeks', { a: e.semaines[0], b: e.semaines[1] }))}</p>` : ''}<p class="fc-dim">${esc(t('fg.disclaimer'))}</p>`, stats: [stat(f.budget, 'gui.st.budget'), stat(f.cx, 'gui.st.complexity')] },
    ];
    if (p.questions && p.questions.length) S.push({ k: 'questions', title: t('gui.tt.questions'), body: `<ul class="fc-qs">${li(p.questions)}</ul>`, stats: [], cta: true });
    return S.map((s, i) => `<article class="fc-slide" aria-roledescription="${LANG === 'en' ? 'slide' : 'diapositive'}" aria-label="${esc(t('gui.slideOf', { n: i + 1, t: S.length }))}">
      <div class="fc-tile" aria-hidden="true"><pre>${art(s.k)}</pre><span class="fc-num">${pad2(i + 1)}</span></div>
      <div class="fc-body">
        <p class="fc-tag">${esc(t('gui.sl.' + s.k))}</p>
        <h3 class="fc-title">${esc(s.title)}</h3>
        <div class="fc-text" data-lenis-prevent>${s.body}</div>
        ${s.stats.length ? `<div class="fc-stats">${s.stats.join('')}</div>` : ''}
        ${s.cta ? `<div><button type="button" class="fx-solid" data-act="send">${esc(t('gui.send'))} →</button></div>` : ''}
      </div>
    </article>`);
  }
  function bentoHTML(r) {
    const p = r.plan, f = figures(r), mods = p.modules || [];
    const card = (cls, label, inner) => `<div class="fb ${cls}"><p class="fb-k">${esc(label)}</p>${inner}</div>`;
    const seg = Array.from({ length: 5 }, (_, i) => `<i${i < p.complexity ? ' class="on"' : ''}></i>`).join('');
    return `<div class="fx-bento">
      ${card('fb-sum', t('gui.st.summary'), `<h4>${esc(p.title)}</h4><p>${esc(p.summary)}</p>`)}
      ${card('fb-budget', t('gui.st.budget'), `<b class="fb-big">${esc(f.budget)}</b><p class="fb-dim">${esc(t('fg.disclaimer'))}</p>`)}
      ${card('fb-weeks', t('gui.st.weeks'), `<b class="fb-big">${esc(f.weeks)}</b>`)}
      ${card('fb-cx', t('gui.st.complexity'), `<b class="fb-big">${esc(f.cx)}</b><div class="fb-seg">${seg}</div>`)}
      ${card('fb-type', t('gui.st.type'), `<b class="fb-mid">${esc(lab('type.', p.type))}</b><p class="fb-dim">${esc(mods.map((m) => lab('mod.', m)).join(' · ') || t('gui.noMods'))}</p>`)}
      ${card('fb-feat', t('fg.features'), `<ul class="fc-checks">${li(p.features)}</ul>`)}
      ${card('fb-stack', t('fg.stack'), chips(p.stack))}
      ${card('fb-q', t('fg.questions'), p.questions && p.questions.length ? `<ul class="fc-qs">${li(p.questions)}</ul>` : `<p class="fb-dim">—</p>`)}
      ${card('fb-steps', t('fg.steps'), `<ol class="fb-steps">${p.steps.map((s, i) => `<li><span>${pad2(i + 1)}</span><div><b>${esc(s.name)}</b>${s.detail ? `<em>${esc(s.detail)}</em>` : ''}</div></li>`).join('')}</ol>`)}
    </div>`;
  }
  function showPlan(r, animate = true) {
    const slides = slidesHTML(r);
    stage.innerHTML = `<div class="fx-plan">
      <p class="fx-kicker fx-center">${esc(t('gui.kPlan'))}</p>
      <div class="fc" tabindex="0" aria-roledescription="${LANG === 'en' ? 'carousel' : 'carrousel'}" aria-label="${esc(t('gui.carousel'))}">
        <div class="fc-viewport"><div class="fc-track">${slides.join('')}</div></div>
        <div class="fc-controls">
          <button type="button" class="fc-arrow lg" data-dir="-1" aria-label="${esc(t('gui.prev'))}">${FX_ICON.left}</button>
          <div class="fc-dots lg">${slides.map((_, i) => `<button type="button" data-go="${i}" aria-label="${esc(t('gui.slideOf', { n: i + 1, t: slides.length }))}"></button>`).join('')}</div>
          <button type="button" class="fc-arrow lg" data-dir="1" aria-label="${esc(t('gui.next'))}">${FX_ICON.right}</button>
        </div>
      </div>
      <div class="fx-cta">
        <button type="button" class="fx-btn lg lg-pro" data-act="send">${esc(t('gui.send'))} <span aria-hidden="true">→</span></button>
        <button type="button" class="fx-btn lg" data-act="refine">${esc(t('gui.refine'))}</button>
      </div>
      ${r.model ? `<p class="fx-credit">${esc(t('fg.credit', { model: r.model, s: ((r.ms || 0) / 1000).toFixed(1) }))}</p>` : ''}
      <div class="fx-wide fx-over"><p class="fx-kicker">${esc(t('gui.kOverview'))}</p>${bentoHTML(r)}</div>
    </div>`;
    carousel && carousel.destroy();
    carousel = makeCarousel($('.fc', stage));
    if (animate) {
      Sound.play('slash', { dir: 1 });
      scrollTo($('.fx-plan', stage), -60);
      appear([$('.fx-plan > .fx-kicker', stage), $('.fc-viewport', stage), $('.fc-controls', stage), $('.fx-cta', stage)]);
      $$('.fb', stage).forEach((c) => {
        gsap.set(c, { opacity: 0, y: 30 });
        ScrollTrigger.create({ trigger: c, start: 'top 94%', once: true, onEnter: () => gsap.to(c, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }) });
      });
    }
    refresh();
  }

  /* --- carrousel (glisser, flèches, points, clavier) ------------------------------------- */
  function makeCarousel(root) {
    const vp = $('.fc-viewport', root), track = $('.fc-track', root);
    const slides = $$('.fc-slide', root), dots = $$('.fc-dots button', root), arrows = $$('.fc-arrow', root);
    let i = 0, dragX = null, dx = 0;
    const W = () => slides[0].offsetWidth;
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const place = (instant) => {
      const x = vp.clientWidth / 2 - (i * (W() + gap()) + W() / 2) + dx;
      gsap.to(track, { x, duration: instant || REDUCED ? 0 : 0.85, ease: 'expo.out', overwrite: true });
      slides.forEach((s, k) => { const on = k === i; s.classList.toggle('is-on', on); s.setAttribute('aria-hidden', on ? 'false' : 'true'); s.inert = !on; });
      dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
      arrows[0].disabled = i === 0; arrows[1].disabled = i === slides.length - 1;
    };
    const go = (k) => { const n = clamp(k, 0, slides.length - 1); if (n !== i) Sound.play('select'); i = n; place(); };
    const onClick = (e) => {
      const a = e.target.closest('[data-dir]'); if (a) return go(i + +a.dataset.dir);
      const d = e.target.closest('[data-go]'); if (d) return go(+d.dataset.go);
      const s = e.target.closest('.fc-slide'); if (s && !s.classList.contains('is-on') && !moved) go(slides.indexOf(s));
    };
    const onKey = (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); } };
    let moved = false;
    const down = (e) => { if (e.button !== 0 || e.target.closest('button, a')) return; dragX = e.clientX; dx = 0; moved = false; vp.classList.add('is-drag'); };
    const move = (e) => {
      if (dragX == null) return;
      dx = (e.clientX - dragX) * 0.9;
      if (Math.abs(dx) > 6 && !moved) { moved = true; try { vp.setPointerCapture(e.pointerId); } catch (x) {} }
      if (moved) place(true);
    };
    const up = () => {
      if (dragX == null) return;
      const d = dx; dragX = null; dx = 0; vp.classList.remove('is-drag');
      if (Math.abs(d) > 60) go(i + (d < 0 ? 1 : -1)); else place();
      setTimeout(() => { moved = false; }, 0);
    };
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    vp.addEventListener('pointerdown', down);
    vp.addEventListener('pointermove', move);
    vp.addEventListener('pointerup', up);
    vp.addEventListener('pointercancel', up);
    const ro = new ResizeObserver(() => place(true)); ro.observe(vp);
    place(true);
    return { destroy() { ro.disconnect(); gsap.killTweensOf(track); }, go, get index() { return i; } };
  }

  /* --- états ------------------------------------------------------------------------------- */
  function showCold(r) {
    const why = r.reason === 'rate' ? t('fg.rate', { m: Math.max(1, Math.ceil((r.retry || 600) / 60)) }) : r.reason === 'quota' ? t('fg.quota') : t('fg.down');
    stage.innerHTML = `<div class="fx-card fx-cold"><p class="fx-kicker">${esc(t('fg.cold'))}</p><p>${esc(why)}</p><p class="fx-dim">${esc(t('gui.coldKeep'))}</p>
      <div><button type="button" class="fx-solid" data-act="send">${esc(t('gui.sendAnyway'))} →</button></div></div>`;
    appear($('.fx-cold', stage));
    refresh();
  }
  function showOfftopic(p) {
    stage.innerHTML = `<div class="fx-card"><p class="fx-kicker">KALISO</p><p>${esc(p.summary)}</p><p class="fx-dim">${esc(t('fg.offtopic'))}</p></div>`;
    appear($('.fx-card', stage));
    refresh();
  }

  async function forge(text) {
    if (busy) return;
    err.textContent = '';
    if (text.length < 12) { err.textContent = t('fg.short'); input.focus(); return; }
    if (rec) rec.stop();
    busy = true; send.disabled = true; el.classList.add('is-busy'); input.readOnly = true;
    carousel && carousel.destroy(); carousel = null;
    const L = loader();
    scrollTo($('.fx-out', el), -140);
    if (page.knight) gsap.to(page.knight.o, { spin: 2.6, duration: 1.2, ease: 'power2.inOut' });
    const t0 = performance.now();
    let r;
    try { r = await API.forge(text); } catch (e) { r = { ok: false, cold: true, reason: 'offline' }; }
    await new Promise((ok) => page.timers.push(setTimeout(ok, Math.max(0, 1600 - (performance.now() - t0)))));
    await L.finish();
    if (page.knight) gsap.to(page.knight.o, { spin: 0.45, duration: 1.6, ease: 'power2.out' });
    busy = false; el.classList.remove('is-busy'); input.readOnly = false; grow();
    if (!r || !r.ok) { draft = { text }; Draft.set(draft); showCold(r || {}); return; }
    draft = { text, plan: r.plan, id: r.id, estimate: r.estimate, model: r.model, ms: r.ms };
    Draft.set(draft);
    if (r.plan.offtopic) showOfftopic(r.plan); else showPlan(r);
  }

  /* --- feuille du ticket ---------------------------------------------------------------- */
  function sheetForm() {
    const withPlan = draft && draft.plan && !draft.plan.offtopic;
    const msg = (draft && draft.text ? draft.text : input.value.trim()) + (withPlan ? `\n\n— ${t('fg.planOf', { title: draft.plan.title, id: draft.id })}` : '');
    const type = withPlan ? draft.plan.type : 'autre';
    const opts = (name, keys, pre, sel) => `<div class="fx-opts">${keys.map((k) => `<label class="fx-opt"><input type="radio" name="${name}" value="${k}"${k === sel ? ' checked' : ''}><span>${esc(t(pre + k))}</span></label>`).join('')}</div>`;
    return `<form class="fx-form" novalidate>
      <header class="fx-panel-head"><p class="fx-kicker">✉ ${esc(t('gui.f.title'))}</p><button type="button" class="fx-close" data-act="close" aria-label="${esc(t('gui.close'))}">${FX_ICON.x}</button></header>
      <div class="fx-fields">
        <label class="fx-field"><span>${esc(t('gui.f.name'))}</span><input name="name" autocomplete="name" maxlength="120" required></label>
        <label class="fx-field"><span>${esc(t('gui.f.email'))}</span><input name="email" type="email" autocomplete="email" maxlength="200" required></label>
      </div>
      <fieldset class="fx-fs"><legend>${esc(t('gui.f.type'))}</legend>${opts('type', TK_TYPES, 'type.', type)}</fieldset>
      <fieldset class="fx-fs"><legend>${esc(t('gui.f.budget'))}</legend>${opts('budget', TK_BUDGETS, 'budget.', 'tbd')}</fieldset>
      <fieldset class="fx-fs"><legend>${esc(t('gui.f.delai'))}</legend>${opts('delai', TK_DELAIS, 'delai.', 'flex')}</fieldset>
      <label class="fx-field"><span>${esc(t('gui.f.message'))}</span><textarea name="message" rows="5" maxlength="5000">${esc(msg)}</textarea></label>
      <div class="fx-hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="fx-form-foot"><span class="fx-dim">${esc([t('contact.reply'), t('contact.written')].filter(Boolean).join(' · '))}</span><button type="submit" class="fx-solid">${esc(t('gui.f.submit'))} →</button></div>
      <p class="fx-err" role="alert"></p>
    </form>`;
  }
  function openSheet(html) {
    panel.innerHTML = html || sheetForm();
    sheet.hidden = false;
    document.documentElement.classList.add('fx-modal');
    if (App.lenis) App.lenis.stop();
    if (!REDUCED) {
      gsap.fromTo($('.fx-scrim', sheet), { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(panel, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' });
    }
    const f = $('.fx-form', panel);
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); sendTicket(f); });
    page.timers.push(setTimeout(() => { const n = $('input[name=name]', panel) || $('button', panel); if (n && !IS_TOUCH) n.focus(); }, 350));
  }
  function closeSheet() {
    if (sheet.hidden) return;
    const done = () => { sheet.hidden = true; panel.innerHTML = ''; document.documentElement.classList.remove('fx-modal'); if (App.lenis) App.lenis.start(); };
    if (REDUCED) return done();
    gsap.to($('.fx-scrim', sheet), { opacity: 0, duration: 0.3 });
    gsap.to(panel, { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in', onComplete: done });
  }
  async function sendTicket(f) {
    const fd = new FormData(f), e = $('.fx-err', f), btn = $('button[type=submit]', f);
    const v = (k) => String(fd.get(k) || '').trim();
    const name = v('name'), email = v('email'), message = v('message');
    e.textContent = '';
    if (name.length < 2) { e.textContent = t('tk.vName'); return $('input[name=name]', f).focus(); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { e.textContent = t('tk.vEmail'); return $('input[name=email]', f).focus(); }
    if (message.length < 10) { e.textContent = t('tk.vMsg'); return $('textarea', f).focus(); }
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const dl = v('delai');
    const tk = { nom: name, email, type: v('type'), budget: v('budget'), delai: dl, message,
      forgeId: draft && draft.plan && !draft.plan.offtopic ? draft.id : undefined,
      priorite: dl === 'urgent' ? 'haute' : dl === '1m' ? 'normale' : 'basse',
      date: d.toLocaleDateString(LANG) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = t('gui.sending');
    let r = null;
    try {
      r = await API.ticket({ name, email, type: tk.type, budget: tk.budget, deadline: dl, lang: LANG, forgeId: tk.forgeId,
        message: message + (sealsDone() ? '\n\n⚜ 7/7' : ''), website: v('website') });
    } catch (x) { r = null; }
    btn.disabled = false; btn.textContent = label;
    const head = (k) => `<header class="fx-panel-head"><p class="fx-kicker">✓ ${esc(t(k))}</p><button type="button" class="fx-close" data-act="close" aria-label="${esc(t('gui.close'))}">${FX_ICON.x}</button></header>`;
    if (r && r.ok) {
      Object.assign(tk, { id: r.id, key: r.key, status: r.status || 'nouveau' });
      storeTicket(tk); Draft.set(null); draft = null;
      Sound.play('slash', { dir: -1 });
      panel.innerHTML = `<div class="fx-done">${head('gui.sentTitle')}
        <p class="fx-id">${esc(tk.id)}</p><p>${esc(t('gui.sentBody2', { email }))}</p>
        <div><button type="button" class="fx-solid" data-act="quests">${esc(t('gui.seeQuests'))} →</button></div></div>`;
      appear($$('.fx-done > *', panel));
      quests();
      return;
    }
    if (r && (r.status === 429 || r.status === 400)) { e.textContent = r.error || String(r.status); return; }
    // repli : l'email prérempli
    tk.id = `KAL-${ymd}-${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
    tk.status = 'open';
    storeTicket(tk);
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`[${tk.id}] ${lab('type.', tk.type)} — ${tk.nom}`)}&body=${encodeURIComponent(ticketText(tk, 50) + '\n\n' + t('tk.mailFoot', { name: SITE.name }))}`;
    panel.innerHTML = `<div class="fx-done">${head('gui.mailTitle')}
      <p class="fx-id">${esc(tk.id)}</p><p>${esc(t('gui.mailBody'))}</p>
      <div><a class="fx-solid" href="${esc(href)}">${esc(t('gui.mailBtn'))} →</a></div></div>`;
    quests();
    try { window.location.href = href; } catch (x) {}
  }

  /* --- mes quêtes : statut en direct et réponse de Sofiene -------------------------------- */
  async function quests() {
    const list = loadTickets().slice(-6).reverse();
    const box = $('.fx-quests', el), ul = $('.fx-qlist', el);
    if (!list.length) { box.hidden = true; return; }
    const row = (x) => `<li class="fx-q">
      <div class="fx-q-head"><b>${esc(x.id)}</b><span class="fx-badge">${esc(statusLabel(x.status))}</span></div>
      <p class="fx-dim">${esc(lab('type.', x.type))}${x.date ? ' · ' + esc(x.date) : ''}</p>
      ${x.reply ? `<div class="fx-reply"><p class="fb-k">${esc(t('gui.reply'))}</p><p>${esc(x.reply)}</p></div>` : ''}
    </li>`;
    ul.innerHTML = list.map(row).join('');
    box.hidden = false;
    refresh();
    await Promise.all(list.map(async (x) => {
      if (!x.key) return;
      try { const r = await API.lookup(x.id, x.key); if (r && r.ok) { x.status = r.status; x.reply = r.reply || ''; storeTicket(x); } } catch (e) {}
    }));
    if (!el.isConnected) return;
    ul.innerHTML = list.map(row).join('');
    refresh();
  }

  /* --- montage ------------------------------------------------------------------------- */
  page.ready = () => {
    prepCopy(el);
    $$('[data-roll]', el).forEach(setupRoll);
    const onClick = (e) => {
      const ex = e.target.closest('[data-ex]');
      if (ex) { input.value = ex.dataset.ex; grow(); input.focus(); Sound.play('select'); return; }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      const k = a.dataset.act;
      if (k === 'ideas') { const open = !ideas.classList.toggle('is-closed'); a.setAttribute('aria-expanded', String(open)); Sound.play('select'); }
      else if (k === 'mic') toggleMic();
      else if (k === 'clear') { input.value = ''; grow(); input.focus(); }
      else if (k === 'send') openSheet();
      else if (k === 'close') closeSheet();
      else if (k === 'quests') { closeSheet(); page.timers.push(setTimeout(() => scrollTo($('.fx-quests', el), -120), 380)); }
      else if (k === 'refine') { scrollTo($('.fx-hero', el), 0); page.timers.push(setTimeout(() => input.focus({ preventScroll: true }), 900)); }
    };
    el.addEventListener('click', onClick);
    // la feuille vit dans <body> : aucun parent transformé ne décale sa position fixe
    document.body.appendChild(sheet);
    sheet.addEventListener('click', onClick);
    page.onKey = (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); };
    window.addEventListener('keydown', page.onKey);
    // disponibilité
    const st = $('.fx-status', el);
    const upd = () => { st.classList.toggle('is-lit', FORGE.lit); $('.fs-txt', st).textContent = `${FORGE.label()} — ${FORGE.sub()}`; };
    FORGE.subs.add(upd); upd(); FORGE.load();
    page.unlamp = () => FORGE.subs.delete(upd);
    // le mini chevalier de la page À propos, avatar de KALISO
    page.knight = new KnightASCII($('.fx-knight .knight-host', el), {
      cell: (w) => (w <= 600 ? [3.5, 6] : [4, 7]), fill: 0.95, frame: [-0.62, 0.86], width: 1.2, tail: 0.45, gain: 1.6, spin: 0.45, idle: 0,
      parallax: [0.12, 0.12], fadeY: 0.05, fadeW: 0.2, introSpin: -Math.PI, introScale: 0.6, scan: 0.6,
    });
    // le dernier plan (forgé ici ou dans le terminal) reste affiché
    if (draft && draft.text) input.value = draft.text;
    grow();
    if (draft && draft.plan && !draft.plan.offtopic) showPlan({ plan: draft.plan, estimate: draft.estimate, model: draft.model, ms: draft.ms }, false);
    quests();
    gsap.set($$('.fx-hero .fx-col > *:not(.fx-knight)', el), { opacity: 0, y: 26 });
  };
  page.intro = (delay = 0) => {
    page.knight.start(delay + 0.1, 2.2);
    gsap.to($$('.fx-hero .fx-col > *:not(.fx-knight)', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', stagger: 0.06, delay: delay + 0.35, clearProps: 'transform' });
    revealFooter(el, delay + 0.8);
    if (!IS_TOUCH && !(draft && draft.plan)) page.timers.push(setTimeout(() => input.focus({ preventScroll: true }), (delay + 1.1) * 1000));
  };
  page.destroy = () => {
    page.timers.forEach(clearTimeout);
    window.removeEventListener('keydown', page.onKey);
    if (rec) try { rec.abort(); } catch (e) {}
    carousel && carousel.destroy();
    page.unlamp && page.unlamp();
    page.knight && page.knight.destroy();
    sheet.remove();
    document.documentElement.classList.remove('fx-modal');
    if (App.lenis) App.lenis.start();
  };
  return page;
}
