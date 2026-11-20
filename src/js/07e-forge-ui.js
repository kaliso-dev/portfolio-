/* ==========================================================================
   LA FORGE (#forge) — une conversation avec KALISO, puis le compte rendu
   1. le visiteur décrit sa quête ; KALISO pose ses questions, propose
      plusieurs voies, affine (réponse en flux, mot à mot)
   2. « Voir le compte rendu » : KALISO rédige le plan à partir de toute la
      discussion → carrousel + vue d'ensemble en grille
   3. le visiteur l'envoie à Sofiene (ticket), ou reprend la discussion
   Verre liquide (classe .lg) : seulement pour les commandes qui flottent sur
   le fond (règle d'Apple) ; le contenu reste sur des cartes classiques.
   ========================================================================== */
const FX_ICON = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5 12 5.5l6 6"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="7.5" width="9" height="9" rx="2" fill="currentColor" stroke="none"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>',
};

// la conversation survit à un rechargement de page (onglet courant seulement)
const Chat = {
  get() { try { return JSON.parse(sessionStorage.getItem('kaliso-chat') || 'null'); } catch (e) { return null; } },
  set(c) { try { if (c) sessionStorage.setItem('kaliso-chat', JSON.stringify(c)); else sessionStorage.removeItem('kaliso-chat'); } catch (e) {} },
};

// markdown très léger (gras, italique, listes) — tout est échappé d'abord
function mdLite(src) {
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<i>$2</i>');
  const out = [];
  let list = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of String(src || '').split('\n')) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^\s*[-•*]\s+(.*)$/))) { if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) { if (list !== 'ol') { close(); out.push(`<ol start="${+m[1] || 1}">`); list = 'ol'; } out.push(`<li>${inline(m[2])}</li>`); }
    else if (!line.trim()) close();
    else { close(); out.push(`<p>${inline(line.replace(/^#+\s*/, ''))}</p>`); }
  }
  close();
  return out.join('');
}

function PageForge() {
  const el = h(`<div class="fx">
    <section class="fx-hero"><div class="container"><div class="fx-col">
      <p class="fx-status"><span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span><span class="fs-txt"></span></p>
      <div class="fx-knight"><div class="knight-host" role="img" aria-label="${esc(t('about.bust'))}"></div></div>
      <p class="fx-kicker">${esc(t('gui.kicker'))}</p>
      <div class="fx-intro"><div>
        <h1 class="fx-hello">${esc(t('gui.hello')).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>')}</h1>
        <p class="fx-lead">${esc(t('gui.lead2'))}</p>
      </div></div>
    </div></div></section>
    <section class="fx-chat"><div class="container"><div class="fx-col">
      <div class="fx-thread" aria-live="polite"></div>
      <div class="fx-bar-row">
        <form class="fx-bar lg" novalidate>
          <button type="button" class="fx-ico" data-act="ideas" aria-label="${esc(t('gui.ideas'))}" aria-expanded="true" aria-controls="fx-ideas">${FX_ICON.plus}</button>
          <textarea class="fx-input" rows="1" maxlength="1500" placeholder="${esc(t('gui.ph'))}" aria-label="${esc(t('gui.label'))}" data-lenis-prevent></textarea>
          <button type="button" class="fx-ico fx-mic" data-act="mic" aria-label="${esc(t('gui.mic'))}" hidden>${FX_ICON.mic}</button>
          <button type="submit" class="fx-send" aria-label="${esc(t('gui.forgeIt'))}" disabled>${FX_ICON.up}</button>
        </form>
        <button type="button" class="fx-x lg" data-act="clear" aria-label="${esc(t('gui.clear'))}" tabindex="-1">${FX_ICON.x}</button>
      </div>
      <div class="fx-ideas" id="fx-ideas"></div>
      <p class="fx-err" role="alert"></p>
      <div class="fx-actions" hidden>
        <button type="button" class="fx-btn lg lg-pro" data-act="report">${esc(t('cv.report'))} <span aria-hidden="true">→</span></button>
        <button type="button" class="fx-link" data-act="restart">${esc(t('cv.restart'))}</button>
      </div>
      <p class="fx-hint">${esc(t('fg.privacy'))}</p>
    </div></div></section>
    <section class="fx-report" hidden><div class="container"><div class="fx-stage"></div></div></section>
    <section class="fx-quests" hidden><div class="container"><div class="fx-wide">
      <p class="fx-kicker">${esc(t('gui.quests'))}</p>
      <p class="fx-sub">${esc(t('gui.questsSub'))}</p>
      <ul class="fx-qlist"></ul>
    </div></div></section>
    ${footerHTML()}
  </div>`);
  const sheet = h(`<div class="fx-sheet" hidden>
    <div class="fx-scrim" data-act="close"></div>
    <div class="fx-panel" role="dialog" aria-modal="true" aria-label="${esc(t('gui.f.title'))}" data-lenis-prevent></div>
  </div>`);
  const page = { key: 'forge', el, scroll: true, timers: [] };
  const bar = $('.fx-bar', el), input = $('.fx-input', el), send = $('.fx-send', el);
  const thread = $('.fx-thread', el), ideas = $('.fx-ideas', el), err = $('.fx-err', el), actions = $('.fx-actions', el);
  const chatSec = $('.fx-chat', el), reportSec = $('.fx-report', el), stage = $('.fx-stage', el), panel = $('.fx-panel', sheet);
  let busy = false, carousel = null, rec = null, abort = null, armed = 0;
  let conv = Chat.get() || { messages: [], chips: [] };
  const save = () => Chat.set(conv.messages.length || conv.plan ? conv : null);
  const nf = (n, d = 0) => Number(n).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: d });
  const kE = (v) => nf(v / 1000, v % 1000 ? 1 : 0);
  // position calculée ici (et Lenis resynchronisé) : quand une section se masque, la page
  // raccourcit d'un coup et Lenis garderait sinon une ancienne position → saut à la fin
  const scrollTo = (target, offset = -90, duration = 1.2) => {
    if (!target) return;
    const y = Math.max(0, window.scrollY + target.getBoundingClientRect().top + offset);
    if (App.lenis) {
      try { App.lenis.resize(); } catch (e) {}
      App.lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      App.lenis.scrollTo(y, { duration, force: true });
    } else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
  };
  const refresh = () => { try { ScrollTrigger.refresh(); } catch (e) {} };
  const fadeIn = (nodes, delay = 0) => { if (!REDUCED) gsap.from(nodes, { opacity: 0, y: 14, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay }); };
  const spin = (v, d = 1.2) => { if (page.knight) gsap.to(page.knight.o, { spin: v, duration: d, ease: 'power2.inOut' }); };

  /* --- barre de saisie -------------------------------------------------------- */
  const grow = () => {
    if (input.offsetParent) { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 180) + 'px'; }
    const has = input.value.trim().length > 0;
    send.disabled = !busy && !has;
    el.classList.toggle('has-text', has);
  };
  input.addEventListener('input', () => { err.textContent = ''; grow(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!busy) say(input.value); }
  });
  bar.addEventListener('submit', (e) => { e.preventDefault(); if (busy && abort) abort.abort(); else say(input.value); });
  const setBusy = (b) => {
    busy = b;
    el.classList.toggle('is-busy', b);
    send.innerHTML = b ? FX_ICON.stop : FX_ICON.up;
    send.setAttribute('aria-label', t(b ? 'cv.stop' : 'gui.forgeIt'));
    $$('[data-act=report], [data-act=restart]', el).forEach((x) => { x.disabled = b; });
    grow();
  };

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

  /* --- le fil de discussion ------------------------------------------------------ */
  const who = () => `<p class="fx-who"><span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span>KALISO</p>`;
  const thinking = () => `<p class="fx-shimmer">${esc(t('cv.think'))}<span class="fx-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>`;
  function addUser(text) {
    const m = h(`<div class="fx-msg is-user"><div class="fx-bubble"></div></div>`);
    $('.fx-bubble', m).textContent = text;
    thread.appendChild(m);
    return m;
  }
  function addKal(text) {
    const m = h(`<div class="fx-msg is-kal">${who()}<div class="fx-md">${text == null ? thinking() : mdLite(text)}</div></div>`);
    thread.appendChild(m);
    return { el: m, md: $('.fx-md', m) };
  }
  function addNote(html) {
    const m = h(`<div class="fx-msg is-kal is-note">${who()}<div class="fx-md">${html}</div></div>`);
    thread.appendChild(m);
    fadeIn(m);
    return m;
  }
  function renderThread() {
    thread.innerHTML = '';
    conv.messages.forEach((m) => (m.role === 'user' ? addUser(m.content) : addKal(m.content)));
  }
  // idées de départ, puis les réponses rapides proposées par KALISO
  function renderIdeas() {
    const list = conv.messages.length ? (conv.chips || []) : t('gui.examples');
    ideas.innerHTML = list.map((x) => `<button type="button" class="fx-chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('');
    ideas.classList.toggle('is-empty', !list.length);
  }
  function syncMode() {
    const chatting = conv.messages.length > 0;
    el.classList.toggle('is-chat', chatting);
    input.placeholder = t(chatting ? 'cv.ph2' : 'gui.ph');
    actions.hidden = !conv.messages.some((m) => m.role === 'assistant');
  }
  // pendant que KALISO écrit : on suit la réponse sans jamais cacher le début du message
  let followRaf = 0;
  function follow(msgEl) {
    if (followRaf) return;
    followRaf = requestAnimationFrame(() => {
      followRaf = 0;
      const b = $('.fx-bar-row', el).getBoundingClientRect(), m = msgEl.getBoundingClientRect();
      const d = Math.min(b.bottom + 28 - innerHeight, m.top - 120);
      if (d > 6) { if (App.lenis) App.lenis.scrollTo(window.scrollY + d, { duration: 0.45 }); else window.scrollBy(0, d); }
    });
  }
  const coldWhy = (r) => (r.reason === 'rate' ? t('fg.rate', { m: Math.max(1, Math.ceil((r.retry || 600) / 60)) }) : r.reason === 'quota' ? t('fg.quota') : t('fg.down'));

  async function say(raw) {
    const text = String(raw || '').trim();
    if (busy || !text) return;
    err.textContent = '';
    if (!conv.messages.length && text.length < 12) { err.textContent = t('fg.short'); input.focus(); return; }
    if (rec) rec.stop();
    $$('.is-note', thread).forEach((n) => n.remove());
    conv.messages.push({ role: 'user', content: text });
    conv.chips = [];
    save();
    input.value = '';
    syncMode(); renderIdeas(); setBusy(true);
    const u = addUser(text);
    fadeIn(u);
    const k = addKal(null);
    fadeIn(k.el, 0.1);
    scrollTo(u, -150, 0.9);
    spin(2.6);
    abort = new AbortController();
    let r, partial = '';
    try {
      r = await API.chat(conv.messages, (full) => { partial = full; k.md.innerHTML = mdLite(full) + '<span class="fx-caret" aria-hidden="true"></span>'; follow(k.el); }, abort.signal);
    } catch (e) { r = { ok: false, reason: e && e.aborted ? 'stop' : 'offline' }; }
    abort = null;
    spin(0.45, 1.6);
    if (r && r.ok) {
      k.md.innerHTML = mdLite(r.text);
      conv.messages.push({ role: 'assistant', content: r.text });
      conv.chips = r.chips || [];
    } else if (r && r.reason === 'stop' && partial.trim()) {
      k.md.innerHTML = mdLite(partial);
      conv.messages.push({ role: 'assistant', content: partial.trim() });
    } else {
      k.el.remove();
      conv.messages.pop();
      if (r && r.reason === 'stop') { u.remove(); input.value = text; }
      else if (r && r.reason === 'long') { u.remove(); input.value = text; addNote(`<p>${esc(t('cv.long'))}</p>`); }
      else if (r && r.status === 400 && !r.cold) { u.remove(); input.value = text; err.textContent = r.error || t('fg.short'); }
      else {
        addNote(`<p>${esc(t('cv.cold', { why: coldWhy(r || {}) }))}</p>
          <div class="fx-note-btns"><button type="button" class="fx-solid" data-act="retry">${esc(t('cv.retry'))}</button><button type="button" class="fx-link" data-act="send">${esc(t('cv.sendDirect'))} →</button></div>`);
        page.retry = () => { u.remove(); say(text); };
      }
    }
    save();
    setBusy(false);
    syncMode(); renderIdeas();
    if (r && r.ok) fadeIn($$('.fx-chip', ideas), 0.1);
    refresh();
    if (!IS_TOUCH) input.focus({ preventScroll: true });
  }

  /* --- chargement du compte rendu : anneau de graduations + phrase animée -------- */
  function loader() {
    const N = 60;
    const ticks = Array.from({ length: N }, (_, i) => `<line x1="0" y1="-70" x2="0" y2="-92" transform="rotate(${i * 6})"/>`).join('');
    stage.innerHTML = `<div class="fx-load" role="status">
      <div class="fx-ring"><svg viewBox="-100 -100 200 200" aria-hidden="true">${ticks}</svg>
        <div class="fx-ring-c"><b class="fx-pct">0%</b><span>${esc(t('gui.loadPct'))}</span></div></div>
      <p class="fx-shimmer">${esc(t('cv.reportLoad'))}<span class="fx-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>
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
      if (!st.done) st.p = 0.95 * (1 - Math.exp(-s / 6));
      step.textContent = steps[Math.min(steps.length - 1, Math.floor(s / 2.4))] + '…';
      paint();
    };
    gsap.ticker.add(tick);
    page.stopLoader = () => gsap.ticker.remove(tick);
    if (!REDUCED) gsap.from($('.fx-load', stage), { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out' });
    return {
      finish: () => new Promise((ok) => {
        st.done = true;
        gsap.to(st, { p: 1, duration: 0.45, ease: 'power2.out', onUpdate: paint, onComplete: () => { gsap.ticker.remove(tick); setTimeout(ok, 180); } });
      }),
    };
  }

  /* --- le compte rendu ------------------------------------------------------------ */
  const SLIDES = ['plan', 'features', 'stack', 'steps', 'range', 'questions'];
  const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const chips = (arr) => `<div class="fc-chips">${(arr || []).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
  const tile = (k, i) => {
    const src = SITE.forgeArt && SITE.forgeArt[k];
    return src
      ? `<div class="fc-tile has-img" aria-hidden="true"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" draggable="false"></div>`
      : `<div class="fc-tile" aria-hidden="true"><span class="fc-big">${pad2(i + 1)}</span></div>`;
  };
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
      ${tile(s.k, i)}
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
  function renderReport(r, animate) {
    const slides = slidesHTML(r);
    stage.innerHTML = `<div class="fx-plan">
      <div class="fx-rhead">
        <button type="button" class="fx-link fx-back" data-act="back"><span aria-hidden="true">←</span> ${esc(t('cv.back'))}</button>
        <p class="fx-kicker">${esc(t('gui.kPlan'))}</p>
        <h2 class="fx-rtitle">${esc(t('cv.reportTitle'))}</h2>
        <p class="fx-rsub">${esc(t('cv.reportSub'))}</p>
      </div>
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
        <button type="button" class="fx-btn lg" data-act="back">${esc(t('cv.back'))}</button>
      </div>
      ${r.model ? `<p class="fx-credit">${esc(t('fg.credit', { model: r.model, s: ((r.ms || 0) / 1000).toFixed(1) }))}</p>` : ''}
      <div class="fx-wide fx-over"><p class="fx-kicker">${esc(t('gui.kOverview'))}</p>${bentoHTML(r)}</div>
    </div>`;
    carousel && carousel.destroy();
    carousel = makeCarousel($('.fc', stage));
    if (animate) {
      Sound.play('slash', { dir: 1 });
      fadeIn([$('.fx-rhead', stage), $('.fc-viewport', stage), $('.fc-controls', stage), $('.fx-cta', stage)]);
    }
    refresh();
  }
  function showView(v) {
    conv.view = v; save();
    const report = v === 'report';
    chatSec.hidden = report;
    reportSec.hidden = !report;
    el.classList.toggle('is-report', report);
    if (!report) grow();
    refresh();
  }
  async function report() {
    if (busy || !conv.messages.some((m) => m.role === 'assistant')) return;
    if (conv.plan && conv.planAt === conv.messages.length) {
      showView('report'); renderReport(conv.plan, true); scrollTo(reportSec, -120, 0.9); return;
    }
    setBusy(true);
    showView('report');
    scrollTo(reportSec, -120, 0.9);
    spin(2.6);
    const L = loader();
    const t0 = performance.now();
    let r;
    try { r = await API.plan(conv.messages); } catch (e) { r = { ok: false, cold: true, reason: 'offline' }; }
    await new Promise((ok) => page.timers.push(setTimeout(ok, Math.max(0, 1400 - (performance.now() - t0)))));
    await L.finish();
    spin(0.45, 1.6);
    setBusy(false);
    if (r && r.ok && r.plan && !r.plan.offtopic) {
      conv.plan = { plan: r.plan, id: r.id, estimate: r.estimate, model: r.model, ms: r.ms };
      conv.planAt = conv.messages.length;
      save();
      const first = conv.messages.find((m) => m.role === 'user');
      Draft.set({ text: first ? first.content : '', ...conv.plan });
      renderReport(conv.plan, true);
      scrollTo(reportSec, -120, 1);
    } else {
      const why = r && r.plan && r.plan.offtopic ? r.plan.summary : coldWhy(r || {});
      stage.innerHTML = `<div class="fx-card"><p class="fx-kicker">${esc(t('fg.cold'))}</p><p>${esc(why)}</p><p class="fx-dim">${esc(t('gui.coldKeep'))}</p>
        <div class="fx-note-btns"><button type="button" class="fx-solid" data-act="send">${esc(t('gui.sendAnyway'))} →</button><button type="button" class="fx-link" data-act="back">${esc(t('cv.back'))}</button></div></div>`;
      fadeIn($('.fx-card', stage));
    }
    refresh();
  }

  /* --- carrousel (glisser, flèches, points, clavier) ------------------------------------- */
  function makeCarousel(root) {
    const vp = $('.fc-viewport', root), track = $('.fc-track', root);
    const slides = $$('.fc-slide', root), dots = $$('.fc-dots button', root), arrows = $$('.fc-arrow', root);
    let i = 0, dragX = null, dx = 0, moved = false;
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
    return { destroy() { ro.disconnect(); gsap.killTweensOf(track); } };
  }

  /* --- feuille du ticket ---------------------------------------------------------------- */
  function sheetForm() {
    const pl = conv.plan;
    const firsts = conv.messages.filter((m) => m.role === 'user').map((m) => m.content);
    const base = firsts.length ? (pl ? firsts[0] : firsts.join('\n\n')) : input.value.trim();
    const msg = base + (pl ? `\n\n— ${t('fg.planOf', { title: pl.plan.title, id: pl.id })}` : '');
    const type = pl ? pl.plan.type : 'autre';
    const opts = (name, keys, pre, sel) => `<div class="fx-opts">${keys.map((k) => `<label class="fx-opt"><input type="radio" name="${name}" value="${k}"${k === sel ? ' checked' : ''}><span>${esc(t(pre + k))}</span></label>`).join('')}</div>`;
    return `<form class="fx-form" novalidate>
      <header class="fx-panel-head"><p class="fx-kicker">${esc(t('gui.f.title'))}</p><button type="button" class="fx-close" data-act="close" aria-label="${esc(t('gui.close'))}">${FX_ICON.x}</button></header>
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
      gsap.fromTo(panel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
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
      forgeId: conv.plan ? conv.plan.id : undefined,
      priorite: dl === 'urgent' ? 'haute' : dl === '1m' ? 'normale' : 'basse',
      date: d.toLocaleDateString(LANG) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = t('gui.sending');
    let r = null;
    try {
      r = await API.ticket({ name, email, type: tk.type, budget: tk.budget, deadline: dl, lang: LANG, forgeId: tk.forgeId, message, website: v('website') });
    } catch (x) { r = null; }
    btn.disabled = false; btn.textContent = label;
    const head = (k) => `<header class="fx-panel-head"><p class="fx-kicker">${esc(t(k))}</p><button type="button" class="fx-close" data-act="close" aria-label="${esc(t('gui.close'))}">${FX_ICON.x}</button></header>`;
    if (r && r.ok) {
      Object.assign(tk, { id: r.id, key: r.key, status: r.status || 'nouveau' });
      storeTicket(tk); Draft.set(null);
      Sound.play('slash', { dir: -1 });
      panel.innerHTML = `<div class="fx-done">${head('gui.sentTitle')}
        <p class="fx-id">${esc(tk.id)}</p><p>${esc(t('gui.sentBody2', { email }))}</p>
        <div><button type="button" class="fx-solid" data-act="quests">${esc(t('gui.seeQuests'))} →</button></div></div>`;
      fadeIn($$('.fx-done > *', panel));
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
    const onClick = (e) => {
      const ex = e.target.closest('[data-ex]');
      if (ex) {
        if (conv.messages.length) { say(ex.dataset.ex); return; }
        input.value = ex.dataset.ex; grow(); input.focus(); Sound.play('select'); return;
      }
      const a = e.target.closest('[data-act]');
      if (!a || a.disabled) return;
      const k = a.dataset.act;
      if (k === 'ideas') { const open = !ideas.classList.toggle('is-closed'); a.setAttribute('aria-expanded', String(open)); Sound.play('select'); }
      else if (k === 'mic') toggleMic();
      else if (k === 'clear') { input.value = ''; grow(); input.focus(); }
      else if (k === 'report') report();
      else if (k === 'retry') { $$('.is-note', thread).forEach((n) => n.remove()); page.retry && page.retry(); }
      else if (k === 'send') openSheet();
      else if (k === 'close') closeSheet();
      else if (k === 'back') { showView('chat'); scrollTo($('.fx-bar-row', el), -(innerHeight * 0.55), 0.9); page.timers.push(setTimeout(() => !IS_TOUCH && input.focus({ preventScroll: true }), 700)); }
      else if (k === 'quests') { closeSheet(); page.timers.push(setTimeout(() => scrollTo($('.fx-quests', el), -120), 380)); }
      else if (k === 'restart') {
        if (Date.now() - armed > 3000) { armed = Date.now(); a.textContent = t('cv.restartAsk'); page.timers.push(setTimeout(() => { a.textContent = t('cv.restart'); }, 3000)); return; }
        armed = 0; a.textContent = t('cv.restart');
        conv = { messages: [], chips: [] }; save(); Draft.set(null);
        thread.innerHTML = ''; carousel && carousel.destroy(); carousel = null; stage.innerHTML = '';
        showView('chat'); syncMode(); renderIdeas();
        scrollTo(el, 0, 0.9);
        page.timers.push(setTimeout(() => !IS_TOUCH && input.focus({ preventScroll: true }), 700));
      }
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
    // un plan forgé dans le terminal (sans conversation) s'affiche directement
    const d = Draft.get();
    if (!conv.messages.length && d && d.plan && !d.plan.offtopic) {
      conv = { messages: [{ role: 'user', content: d.text || d.plan.title }], chips: [], plan: { plan: d.plan, id: d.id, estimate: d.estimate, model: d.model, ms: d.ms }, planAt: 1, view: 'report' };
      save();
    }
    renderThread(); syncMode(); renderIdeas(); grow();
    if (conv.view === 'report' && conv.plan) { showView('report'); renderReport(conv.plan, false); }
    quests();
    gsap.set($$('.fx-hero .fx-col > *:not(.fx-knight), .fx-chat .fx-col > *', el), { opacity: 0, y: 20 });
  };
  page.intro = (delay = 0) => {
    page.knight.start(delay + 0.1, 2.2);
    gsap.to($$('.fx-hero .fx-col > *:not(.fx-knight), .fx-chat .fx-col > *', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', stagger: 0.05, delay: delay + 0.35, clearProps: 'opacity,transform' });
    revealFooter(el, delay + 0.8);
    if (!IS_TOUCH && conv.view !== 'report') page.timers.push(setTimeout(() => input.focus({ preventScroll: true }), (delay + 1.1) * 1000));
  };
  page.destroy = () => {
    page.timers.forEach(clearTimeout);
    window.removeEventListener('keydown', page.onKey);
    if (abort) abort.abort();
    if (rec) try { rec.abort(); } catch (e) {}
    page.stopLoader && page.stopLoader();
    carousel && carousel.destroy();
    page.unlamp && page.unlamp();
    page.knight && page.knight.destroy();
    sheet.remove();
    document.documentElement.classList.remove('fx-modal');
    if (App.lenis) App.lenis.start();
  };
  return page;
}
