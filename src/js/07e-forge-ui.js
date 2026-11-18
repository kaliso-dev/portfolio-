/* ==========================================================================
   FORGE VISUELLE (#forge) — KALISO sans terminal : un champ, un bouton,
   un plan mis en page, et le ticket en formulaire. Partage son brouillon
   avec la commande forge du terminal.
   ========================================================================== */
const FGUI_ANVIL = [
  '        ______        ',
  '   ____/      \\____   ',
  '  /________________\\  ',
  '      \\__________/    ',
  '        |      |      ',
  '     ___|______|___   ',
  '    |______________|  ',
].join('\n');

function PageForge() {
  const el = h(`<div class="fgui">
    <section class="fgui-hero"><div class="container"><div class="fgui-col">
      <p class="fgui-status"><span class="fl-ember" aria-hidden="true"><i></i><i></i><i></i></span><span class="fs-txt"></span></p>
      <p class="fgui-kicker">${esc(t('gui.kicker'))}</p>
      <h1 class="fgui-title">${esc(t('gui.title'))}</h1>
      <p class="fgui-lead">${esc(t('gui.lead'))}</p>
      <form class="fgui-form" novalidate>
        <label class="fgui-label" for="fgui-text">${esc(t('gui.label'))}</label>
        <textarea id="fgui-text" class="fgui-text" rows="4" maxlength="1500" placeholder="${esc(t('gui.placeholder'))}" data-lenis-prevent></textarea>
        <div class="fgui-ex">${t('gui.examples').map((x) => `<button type="button" class="fgui-chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="fgui-bar">
          <span class="fgui-hint">${esc(t('fg.privacy'))}</span>
          <button type="submit" class="fgui-btn is-pri"><span aria-hidden="true">⚒</span> ${esc(t('gui.go'))}</button>
        </div>
        <p class="fgui-err" role="alert"></p>
      </form>
      <a class="fgui-alt" href="#terminal">${esc(t('gui.terminal'))} →</a>
    </div></div></section>
    <section class="fgui-out"><div class="container"><div class="fgui-col fgui-res" aria-live="polite"></div></div></section>
    ${footerHTML()}
  </div>`);
  const page = { key: 'forge', el, scroll: true, timers: [] };
  const res = $('.fgui-res', el), ta = $('.fgui-text', el), form = $('.fgui-form', el), err = $('.fgui-err', form);
  const goBtn = $('button[type=submit]', form);
  let busy = false, draft = Draft.get();
  const nf = (n) => Number(n).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-FR');
  const scrollTo = (target, offset = -96) => {
    if (!target) return;
    if (App.lenis) App.lenis.scrollTo(target, { offset, duration: 1.2 });
    else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  };
  const reveal = (node) => { if (!REDUCED) gsap.from(node.children, { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.07 }); };
  const refresh = () => { try { ScrollTrigger.refresh(); } catch (e) {} };

  /* --- états ------------------------------------------------------------------ */
  function heat() {
    res.innerHTML = `<div class="fgui-heat">
      <div class="fgui-anvil" aria-hidden="true"><pre>${esc(FGUI_ANVIL)}</pre><span class="fgui-sparks">${'<i></i>'.repeat(9)}</span></div>
      <p class="fgui-heat-msg"></p>
      <div class="fgui-progress" aria-hidden="true"><i></i></div>
    </div>`;
    const msgs = t('fg.heat'), msg = $('.fgui-heat-msg', res);
    let k = 0;
    const tick = () => { msg.textContent = msgs[Math.min(msgs.length - 1, k)] + '…'; k++; if (k % 2) Sound.play('select'); };
    tick();
    const iv = setInterval(tick, 1300);
    page.timers.push(iv);
    return () => clearInterval(iv);
  }

  function planHTML(r) {
    const p = r.plan, e = r.estimate, c = p.complexity;
    const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('');
    return `<article class="fgui-plan">
      <header class="fgui-plan-head">
        <p class="fgui-kicker">⚔ ${esc(t('fg.plan'))}</p>
        <h2 class="fgui-plan-title">${esc(p.title)}</h2>
        <div class="fgui-tags"><span class="fgui-tag">${esc(lab('type.', p.type))}</span><span class="fgui-tag">${esc(t('fg.complexity'))} <span class="fgui-meter">${'▰'.repeat(c)}${'▱'.repeat(5 - c)}</span> ${c}/5</span></div>
        <p class="fgui-summary">${esc(p.summary)}</p>
      </header>
      <div class="fgui-grid">
        <section class="fgui-card"><h3 class="fgui-h">${esc(t('fg.features'))}</h3><ul class="fgui-checks">${li(p.features)}</ul></section>
        <section class="fgui-card"><h3 class="fgui-h">${esc(t('fg.stack'))}</h3><div class="fgui-chips">${p.stack.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
          ${p.questions && p.questions.length ? `<h3 class="fgui-h">${esc(t('fg.questions'))}</h3><ul class="fgui-qs">${li(p.questions)}</ul>` : ''}</section>
      </div>
      <section class="fgui-card"><h3 class="fgui-h">${esc(t('fg.steps'))}</h3>
        <ol class="fgui-steps">${p.steps.map((s, i) => `<li><span class="fgui-n">${pad2(i + 1)}</span><b>${esc(s.name)}</b>${s.detail ? `<p>${esc(s.detail)}</p>` : ''}</li>`).join('')}</ol></section>
      ${e ? `<section class="fgui-est"><div><p class="fgui-kicker">${esc(t('fg.range'))}</p><p class="fgui-price">${esc(t('fg.price', { a: nf(e.prix[0]), b: nf(e.prix[1]) }))}</p><p class="fgui-weeks">${esc(t('fg.weeks', { a: e.semaines[0], b: e.semaines[1] }))}</p></div><p class="fgui-disc">${esc(t('fg.disclaimer'))}</p></section>` : ''}
      <div class="fgui-actions"><button type="button" class="fgui-btn is-pri" data-act="send">${esc(t('gui.send'))} →</button><button type="button" class="fgui-btn" data-act="refine">${esc(t('gui.refine'))}</button></div>
      ${r.model ? `<p class="fgui-credit">${esc(t('fg.credit', { model: r.model, s: ((r.ms || 0) / 1000).toFixed(1) }))}</p>` : ''}
    </article>
    <div class="fgui-slot"></div>`;
  }

  function showPlan(r, animate = true) {
    res.innerHTML = planHTML(r);
    if (animate) { reveal($('.fgui-plan', res)); Sound.play('slash', { dir: 1 }); }
    refresh();
  }

  function showCold(r) {
    const why = r.reason === 'rate' ? t('fg.rate', { m: Math.max(1, Math.ceil((r.retry || 600) / 60)) }) : r.reason === 'quota' ? t('fg.quota') : t('fg.down');
    res.innerHTML = `<div class="fgui-cold">
      <p class="fgui-kicker">${esc(t('fg.cold'))}</p>
      <p>${esc(why)}</p>
      <p class="fgui-dim">${esc(t('gui.coldKeep'))}</p>
      <div class="fgui-actions"><button type="button" class="fgui-btn is-pri" data-act="send">${esc(t('gui.sendAnyway'))} →</button></div>
    </div><div class="fgui-slot"></div>`;
    reveal($('.fgui-cold', res));
    refresh();
  }

  function showOfftopic(p) {
    res.innerHTML = `<div class="fgui-off"><p class="fgui-kicker">KALISO</p><p>${esc(p.summary)}</p><p class="fgui-dim">${esc(t('fg.offtopic'))}</p>
      <div class="fgui-actions"><button type="button" class="fgui-btn" data-act="refine">${esc(t('gui.refine'))}</button></div></div>`;
    reveal($('.fgui-off', res));
    refresh();
  }

  async function forge(text) {
    if (busy) return;
    err.textContent = '';
    if (text.length < 12) { err.textContent = t('fg.short'); ta.focus(); return; }
    busy = true; goBtn.disabled = true;
    const stop = heat();
    scrollTo(res);
    const t0 = performance.now();
    let r;
    try { r = await API.forge(text); } catch (e) { r = { ok: false, cold: true, reason: 'offline' }; }
    await new Promise((ok) => page.timers.push(setTimeout(ok, Math.max(0, 1400 - (performance.now() - t0)))));
    stop();
    busy = false; goBtn.disabled = false;
    if (!r || !r.ok) { draft = { text }; Draft.set(draft); showCold(r || {}); return; }
    draft = { text, plan: r.plan, id: r.id, estimate: r.estimate, model: r.model, ms: r.ms };
    Draft.set(draft);
    if (r.plan.offtopic) showOfftopic(r.plan); else showPlan(r);
  }

  /* --- ticket ------------------------------------------------------------------ */
  function ticketHTML() {
    const withPlan = draft && draft.plan && !draft.plan.offtopic;
    const msg = (draft && draft.text ? draft.text : '') + (withPlan ? `\n\n— ${t('fg.planOf', { title: draft.plan.title, id: draft.id })}` : '');
    const type = withPlan ? draft.plan.type : 'autre';
    const opts = (name, keys, pre, sel) => `<div class="fgui-opts">${keys.map((k) => `<label class="fgui-opt"><input type="radio" name="${name}" value="${k}"${k === sel ? ' checked' : ''}><span>${esc(t(pre + k))}</span></label>`).join('')}</div>`;
    return `<form class="fgui-ticket" novalidate>
      <p class="fgui-kicker">✉ ${esc(t('gui.f.title'))}</p>
      <div class="fgui-fields">
        <label class="fgui-field"><span>${esc(t('gui.f.name'))}</span><input name="name" autocomplete="name" maxlength="120" required></label>
        <label class="fgui-field"><span>${esc(t('gui.f.email'))}</span><input name="email" type="email" autocomplete="email" maxlength="200" required></label>
      </div>
      <fieldset class="fgui-fs"><legend>${esc(t('gui.f.type'))}</legend>${opts('type', TK_TYPES, 'type.', type)}</fieldset>
      <fieldset class="fgui-fs"><legend>${esc(t('gui.f.budget'))}</legend>${opts('budget', TK_BUDGETS, 'budget.', 'tbd')}</fieldset>
      <fieldset class="fgui-fs"><legend>${esc(t('gui.f.delai'))}</legend>${opts('delai', TK_DELAIS, 'delai.', 'flex')}</fieldset>
      <label class="fgui-field"><span>${esc(t('gui.f.message'))}</span><textarea name="message" rows="6" maxlength="5000" data-lenis-prevent>${esc(msg)}</textarea></label>
      <div class="fgui-hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="fgui-bar"><span class="fgui-hint">${esc([t('contact.reply'), t('contact.written')].filter(Boolean).join(' · '))}</span><button type="submit" class="fgui-btn is-pri">${esc(t('gui.f.submit'))} →</button></div>
      <p class="fgui-err" role="alert"></p>
    </form>`;
  }

  function openTicket() {
    const slot = $('.fgui-slot', res);
    if (!slot) return;
    if (!slot.firstChild) {
      slot.innerHTML = ticketHTML();
      const f = $('.fgui-ticket', slot);
      f.addEventListener('submit', (e) => { e.preventDefault(); sendTicket(f); });
      reveal(f);
      refresh();
    }
    scrollTo(slot);
    page.timers.push(setTimeout(() => { const n = $('input[name=name]', slot); if (n && !IS_TOUCH) n.focus({ preventScroll: true }); }, 700));
  }

  async function sendTicket(f) {
    const fd = new FormData(f), e = $('.fgui-err', f), btn = $('button[type=submit]', f);
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
    if (r && r.ok) {
      Object.assign(tk, { id: r.id, key: r.key, status: r.status || 'nouveau' });
      storeTicket(tk); Draft.set(null); draft = null;
      Sound.play('slash', { dir: -1 });
      res.innerHTML = `<div class="fgui-done">
        <p class="fgui-kicker">✓ ${esc(t('gui.sentTitle'))}</p>
        <p class="fgui-id">${esc(tk.id)}</p>
        <p>${esc(t('gui.sentBody', { email }))}</p>
        <div class="fgui-actions"><a class="fgui-btn" href="#terminal" data-track="${esc(tk.id)}">${esc(t('gui.track'))} →</a><button type="button" class="fgui-btn" data-act="new">${esc(t('gui.again'))}</button></div>
      </div>`;
      reveal($('.fgui-done', res)); refresh(); scrollTo(res);
      return;
    }
    if (r && r.status === 429) { e.textContent = r.error || '429'; return; }
    if (r && r.status === 400) { e.textContent = r.error || '400'; return; }
    // repli : l'email prérempli
    tk.id = `KAL-${ymd}-${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
    tk.status = 'open';
    storeTicket(tk);
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`[${tk.id}] ${lab('type.', tk.type)} — ${tk.nom}`)}&body=${encodeURIComponent(ticketText(tk, 50) + '\n\n' + t('tk.mailFoot', { name: SITE.name }))}`;
    res.innerHTML = `<div class="fgui-done">
      <p class="fgui-kicker">✓ ${esc(t('gui.mailTitle'))}</p>
      <p class="fgui-id">${esc(tk.id)}</p>
      <p>${esc(t('gui.mailBody'))}</p>
      <div class="fgui-actions"><a class="fgui-btn is-pri" href="${esc(href)}">${esc(t('gui.mailBtn'))} →</a><button type="button" class="fgui-btn" data-act="new">${esc(t('gui.again'))}</button></div>
    </div>`;
    reveal($('.fgui-done', res)); refresh(); scrollTo(res);
    try { window.location.href = href; } catch (x) {}
  }

  /* --- montage -------------------------------------------------------------------- */
  page.ready = () => {
    prepCopy(el);
    $$('[data-roll]', el).forEach(setupRoll);
    form.addEventListener('submit', (e) => { e.preventDefault(); forge(ta.value.trim()); });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); forge(ta.value.trim()); } });
    el.addEventListener('click', (e) => {
      const ex = e.target.closest('[data-ex]');
      if (ex) { ta.value = ex.dataset.ex; ta.focus(); Sound.play('select'); return; }
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'send') openTicket();
        else if (a === 'refine') { scrollTo(form, -140); page.timers.push(setTimeout(() => ta.focus({ preventScroll: true }), 600)); }
        else if (a === 'new') { res.innerHTML = ''; ta.value = ''; Draft.set(null); draft = null; refresh(); scrollTo(el, 0); }
        return;
      }
      const tr = e.target.closest('[data-track]');
      if (tr) { try { sessionStorage.setItem('kaliso-run', 'status ' + tr.dataset.track); } catch (x) {} }
    });
    // disponibilité
    const st = $('.fgui-status', el);
    page.unlamp = (() => {
      const upd = () => { st.classList.toggle('is-lit', FORGE.lit); $('.fs-txt', st).textContent = `${FORGE.label()} — ${FORGE.sub()}`; };
      FORGE.subs.add(upd); upd(); FORGE.load();
      return () => FORGE.subs.delete(upd);
    })();
    // le dernier plan (forgé ici ou dans le terminal) reste affiché
    if (draft && draft.text) ta.value = draft.text;
    if (draft && draft.plan && !draft.plan.offtopic) showPlan({ plan: draft.plan, estimate: draft.estimate, model: draft.model, ms: draft.ms }, false);
    gsap.set($$('.fgui-hero .fgui-col > *', el), { opacity: 0, y: 24 });
  };
  page.intro = (delay = 0) => {
    gsap.to($$('.fgui-hero .fgui-col > *', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', stagger: 0.07, delay: delay + 0.15 });
    revealFooter(el, delay + 0.8);
    if (!IS_TOUCH && !(draft && draft.plan)) page.timers.push(setTimeout(() => ta.focus({ preventScroll: true }), (delay + 0.9) * 1000));
  };
  page.destroy = () => { page.timers.forEach((x) => { clearTimeout(x); clearInterval(x); }); page.unlamp && page.unlamp(); };
  return page;
}
