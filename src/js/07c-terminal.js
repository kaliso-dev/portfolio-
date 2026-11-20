/* ==========================================================================
   TERMINAL — commandes, KALISO (forge), tickets, suivi
   ========================================================================== */
const TERM_BANNER = [
  ' _  __    _    _     ___ ____   ___  ',
  '| |/ /   / \\  | |   |_ _/ ___| / _ \\ ',
  "| ' /   / _ \\ | |    | |\\___ \\| | | |",
  '| . \\  / ___ \\| |___ | | ___) | |_| |',
  '|_|\\_\\/_/   \\_\\_____|___|____/ \\___/ ',
];
const TK_TYPES = ['vitrine', 'ecommerce', 'webapp', 'mobile', 'api', 'ia', 'outil', 'autre'];
const TK_BUDGETS = ['lt2k', '2-5k', '5-10k', '10k+', 'tbd'];
const TK_DELAIS = ['urgent', '1m', '2-3m', 'flex'];
const TERM_PAGES = { index: 'index', '~': 'index', accueil: 'index', home: 'index', projets: 'projets', work: 'projets', 'a-propos': 'a-propos', about: 'a-propos', contact: 'contact' };
const YES = /^(o|oui|y|yes)$/i, NO = /^(n|non|no)$/i, CANCEL = /^(annuler|cancel|quit|q)$/i;
const ARABIC = /[\u0590-\u08FF\uFB50-\uFEFF]/;

// libellé traduit si la clé existe, sinon la valeur brute (anciens tickets)
const lab = (prefix, v) => (UI[prefix + v] ? t(prefix + v) : String(v || ''));
const statusLabel = (s) => (s === 'draft' ? t('tk.draft') : s === 'open' ? t('tk.open') : lab('st.', s).toUpperCase());

function loadTickets() { try { return JSON.parse(localStorage.getItem('kaliso-tickets') || '[]'); } catch (e) { return []; } }
function saveTickets(list) { try { localStorage.setItem('kaliso-tickets', JSON.stringify(list.slice(-12))); } catch (e) {} }
function storeTicket(tk) { const list = loadTickets().filter((x) => x.id !== tk.id); list.push(tk); saveTickets(list); }

function wrapText(str, w) {
  const out = [];
  String(str).split(/\n/).forEach((para) => {
    let line = '';
    para.split(/\s+/).forEach((word) => {
      while (word.length > w) { if (line) { out.push(line); line = ''; } out.push(word.slice(0, w)); word = word.slice(w); }
      if (!word) return;
      if ((line + (line ? ' ' : '') + word).length > w) { out.push(line); line = word; } else line += (line ? ' ' : '') + word;
    });
    out.push(line);
  });
  return out;
}

// ticket en ASCII (texte brut : sert aussi pour l'email et le .txt). L'arabe n'est pas à chasse
// fixe : dans ce cas le cadre reste ouvert à droite pour ne pas mentir sur l'alignement.
function ticketText(tk, w = 50) {
  const inner = w - 4;
  const open = ARABIC.test([tk.nom, tk.message, tk.email].join(' ')) || RTL;
  const pad = (s) => s + ' '.repeat(Math.max(0, inner - s.length));
  const row = (s) => (open ? `| ${s}` : `| ${pad(s.slice(0, inner))} |`);
  const kv = (k, v) => wrapText(v, inner - 11).map((l, i) => row((i ? ' '.repeat(11) : (t('tk.k.' + k) + ' '.repeat(11)).slice(0, 11)) + l));
  const hr = '+' + '-'.repeat(w - 2) + (open ? '-' : '+');
  const st = `[${statusLabel(tk.status)}]`;
  const lines = [hr, row('TICKET ' + tk.id + ' '.repeat(Math.max(1, inner - 7 - tk.id.length - st.length)) + st), hr,
    ...kv('client', tk.nom), ...kv('email', tk.email), ...kv('type', lab('type.', tk.type)), ...kv('budget', lab('budget.', tk.budget)),
    ...kv('delai', lab('delai.', tk.delai)), ...kv('prio', lab('prio.', tk.priorite)), ...kv('date', tk.date), hr,
    ...wrapText(tk.message, inner).map(row), hr];
  return lines.join('\n');
}

function PageTerminal() {
  const el = h(`<div class="term-page">
    <section class="term-wrap"><div class="container">
      <h1 class="sr-only">${esc(t('title.terminal'))}</h1>
      <div class="term" dir="ltr">
        <div class="term-bar"><span class="term-title"><span class="term-dot"></span>${esc(t('term.user'))}@${esc(SITE.handle)}: ~/terminal</span><span class="term-meta">${esc(SITE.os)} ${esc(SITE.version)} — zsh</span></div>
        <div class="term-out" data-lenis-prevent aria-live="polite"></div>
        <form class="term-line" autocomplete="off">
          <label class="term-ps1" for="term-in"></label>
          <input id="term-in" class="term-in" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" enterkeyhint="send" dir="auto" aria-label="${esc(t('term.cmd'))}">
        </form>
      </div>
      <div class="term-chips">${['help', 'forge', 'ticket', 'status', 'claude', 'ls', 'lang'].map((c) => `<button type="button" data-run="${c}">${c}</button>`).join('')}</div>
    </div></section>
  </div>`);
  const out = $('.term-out', el), input = $('.term-in', el), ps1 = $('.term-ps1', el), form = $('.term-line', el);
  const page = { key: 'terminal', el, scroll: false, timers: [] };
  const hist = []; let hi = 0;
  let mode = null;    // null | { kind: 'ticket' | 'forge', ... }
  let last = null;    // dernier ticket
  let draft = Draft.get();   // dernière description donnée à KALISO (et son plan), partagée avec la forge visuelle
  const setDraft = (d) => { draft = d; Draft.set(d); };
  let busy = false;
  const PS1 = `${t('term.user')}@${SITE.handle}:~$`;
  const setPS = (s) => { ps1.textContent = s; };

  /* --- sortie ---------------------------------------------------------------- */
  const scroll = () => { out.scrollTop = out.scrollHeight; };
  const print = (html, cls = '') => {
    const d = document.createElement('div');
    d.className = 'tl ' + cls; d.innerHTML = html;
    out.appendChild(d);
    if (!REDUCED) gsap.from(d, { opacity: 0, y: 6, duration: 0.25, ease: 'power2.out' });
    scroll();
    return d;
  };
  const say = (txt, cls) => print(esc(txt), cls);
  const para = (txt, cls) => wrapText(txt, cols()).forEach((l) => say(l, cls));
  const cmdLink = (c, label = c) => `<button type="button" class="tcmd" data-run="${esc(c)}">${esc(label)}</button>`;
  const cols = () => clamp(Math.floor((out.clientWidth - 48) / (parseFloat(getComputedStyle(out).fontSize) * 0.6)), 34, 96);
  const nf = (n) => Number(n).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-FR');
  const endMode = (msg) => { mode = null; setPS(PS1); if (msg) say(msg, 'dim'); };

  /* --- commandes -------------------------------------------------------------- */
  const CMDS = {
    help: { run() {
      const rows = [['whoami', 'h.whoami'], ['ls', 'h.ls'], ['open <projet>', 'h.open'], ['cat about.md', 'h.cat'], ['forge', 'h.forge'],
        ['ticket', 'h.ticket'], ['status [id]', 'h.status'], ['claude', 'h.claude'], ['contact', 'h.contact'], ['lang [fr|en]', 'h.lang'],
        ['theme [couleur]', 'h.theme'], ['visuel', 'h.visuel'], ['cd <page>', 'h.cd'], ['clear', 'h.clear']];
      print(rows.map(([c, d]) => `  ${cmdLink(c.startsWith('cat') ? 'cat about.md' : c.split(' ')[0], c)}${' '.repeat(Math.max(2, 18 - c.length))}<span class="dim">${esc(t(d))}</span>`).join('\n'));
      say('  ' + t('term.keys'), 'dim');
    } },
    whoami: { run() {
      print(`<span class="acc">${esc(SITE.name)}</span> — ${esc(SITE.role)} · ${esc(SITE.location || '')}`);
      para(SITE.about.door || SITE.motto || '', 'dim');
      if (SITE.about.stack) say(t('term.stack', { x: SITE.about.stack.slice(0, 9).join(' · ') }), 'dim');
    } },
    ls: { run() {
      say(t('term.total', { n: SITE.projects.length }), 'dim');
      print(SITE.projects.map((p) => `${cmdLink('open ' + p.slug, (p.slug + (p.ext || '')).padEnd(15))} <span class="dim">${esc(String(p.year || ''))}  ${esc(p.type || '')}</span>`).join('\n'));
      say(t('term.openHint'), 'dim');
    } },
    open: { run(arg) {
      const q = (arg || '').toLowerCase().replace(/\.\w+$/, '');
      if (!q) return say(t('term.openUsage'), 'err');
      const p = SITE.projects.find((x) => x.slug === q || x.slug.startsWith(q) || (x.name || '').toLowerCase() === q);
      if (!p) return say(t('term.openNf', { x: arg }), 'err');
      say(t('term.opening', { x: p.slug + (p.ext || '') }), 'acc');
      page.timers.push(setTimeout(() => go('#projet-' + p.slug), 350));
    } },
    cat: { run(arg) {
      if (!arg || !/about/i.test(arg)) return say(t('term.catNf'), 'err');
      say('# about.md', 'acc');
      para(SITE.about.intro || SITE.motto || '');
      say(t('term.dispo', { x: `${FORGE.label()} — ${FORGE.sub()}` }), 'dim');
    } },
    cd: { run(arg) {
      const k = TERM_PAGES[(arg || '~').toLowerCase()];
      if (!k) return say(t('term.cdNf', { x: arg }), 'err');
      page.timers.push(setTimeout(() => go('#' + k), 200));
    } },
    contact: { run() {
      print(`email   <a class="tcmd" href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`);
      (SITE.socials || []).forEach((s) => print(`${esc(s.label.toLowerCase().padEnd(8))}<a class="tcmd" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url.replace(/^https?:\/\//, ''))}</a>`));
      print(`<span class="dim">${esc(t('term.orSimpler'))}</span> ${cmdLink('forge')} · ${cmdLink('ticket')}`);
    } },
    forge: { run(arg) { startForge(arg); } },
    ticket: { run() { startTicket(); } },
    status: { run(arg) { status(arg); } },
    theme: { run(arg) {
      const k = (arg || '').toLowerCase();
      if (k && setAccent(k, true)) return print(`accent → <span class="acc">${esc(accentLabel(k))}</span>`);
      if (k) say(t('term.themeNf', { x: arg }), 'err');
      print(Object.entries(ACCENTS).map(([n, a]) => `<span style="color:${a.hex}">■</span> ${cmdLink('theme ' + n, n.padEnd(10))} <span class="dim">${esc(accentLabel(n))}${n === ACCENT.name ? ' ' + esc(t('term.current')) : ''}</span>`).join('\n'));
    } },
    lang: { run(arg) {
      const l = (arg || '').toLowerCase().slice(0, 2);
      if (LANGS.includes(l)) {
        if (l === LANG) return say(t('term.langSet', { x: LANG_NAMES[l] }), 'dim');
        say(t('term.langSet', { x: LANG_NAMES[l] }), 'acc');
        page.timers.push(setTimeout(() => setLang(l), 350));
        return;
      }
      print(LANGS.map((x) => `  ${cmdLink('lang ' + x, ('lang ' + x).padEnd(9))} <span class="dim" lang="${x}">${esc(LANG_NAMES[x])}${x === LANG ? ' ' + esc(t('term.current')) : ''}</span>`).join('\n'));
    } },
    visuel: { run() { page.timers.push(setTimeout(() => go('#forge'), 200)); } },
    claude: { run() {
      print(`<span class="acc">claude</span> <span class="dim">${esc(t('claude.who'))}</span>`);
      para(t('claude.p1'));
      para(t('claude.p2'), 'dim');
      para(t('claude.kaliso'), 'dim');
      print(`<span class="dim">${esc(t('claude.ready'))}</span> ${cmdLink('forge')} · ${cmdLink('ticket')}`);
    } },
    clear: { run() { out.innerHTML = ''; } },
    // commandes cachées
    date: { hidden: true, run() { say(new Date().toLocaleString(LANG, { dateStyle: 'full', timeStyle: 'short' })); } },
    echo: { hidden: true, run(arg) { say(arg || ''); } },
    history: { hidden: true, run() { hist.forEach((c, i) => say(`${String(i + 1).padStart(3)}  ${c}`, 'dim')); } },
    exit: { hidden: true, run() { say(t('term.bye'), 'dim'); page.timers.push(setTimeout(() => go('#index'), 300)); } },
    sound: { hidden: true, run(arg) { if ((arg === 'on') !== Sound.on) Sound.toggle(); say(t(Sound.on ? 'term.soundOn' : 'term.soundOff'), 'dim'); } },
    banner: { hidden: true, run() { printBanner(); } },
  };
  CMDS.kaliso = CMDS.forge; CMDS.gui = CMDS.visuel; CMDS.visual = CMDS.visuel;
  const names = () => Object.keys(CMDS).filter((k) => !CMDS[k].hidden && k !== 'kaliso');

  /* --- KALISO ------------------------------------------------------------------ */
  function startForge(arg) {
    const text = (arg || '').trim().replace(/^["«“]|["»”]$/g, '');
    if (text) return runForge(text);
    mode = { kind: 'forge' };
    print(`<span class="acc">KALISO</span> <span class="dim">— ${esc(t('h.forge'))}</span>`);
    para(t('fg.ask'));
    say(t('fg.privacy'), 'dim');
    setPS('forge ›');
  }
  async function runForge(text) {
    if (text.length < 12) { say(t('fg.short'), 'err'); mode = { kind: 'forge' }; setPS('forge ›'); return; }
    endMode();
    busy = true; input.disabled = true;
    setDraft({ text });
    const heat = t('fg.heat');
    const line = print('', 'dim forge-heat');
    let k = 0;
    const tick = () => {
      k++;
      const n = k % 14;
      const sparks = Array.from({ length: 6 }, () => ' .·\'*'[Math.floor(Math.random() * 5)]).join('');
      line.textContent = `${'▓'.repeat(n)}${'░'.repeat(13 - Math.min(13, n))} ${sparks}  ${heat[Math.min(heat.length - 1, Math.floor(k / 6))]}…`;
      if (k % 4 === 1) Sound.play('select');
    };
    tick();
    const iv = setInterval(tick, 230);
    const t0 = performance.now();
    let r;
    try { r = await API.forge(text); } catch (e) { r = { ok: false, cold: true, reason: 'offline' }; }
    // laisse la braise rougir au moins une seconde (sinon la réponse « tombe » trop sèchement)
    const wait = Math.max(0, 1100 - (performance.now() - t0));
    await new Promise((res) => page.timers.push(setTimeout(res, wait)));
    clearInterval(iv); line.remove();
    busy = false; input.disabled = false;
    if (!IS_TOUCH) input.focus({ preventScroll: true });
    if (!r || !r.ok) return cold(r || {});
    setDraft({ text, plan: r.plan, id: r.id });
    if (r.plan.offtopic) { para(r.plan.summary); say(t('fg.offtopic'), 'dim'); return; }
    showPlan(r);
  }
  function showPlan(r) {
    const p = r.plan, w = cols();
    Sound.play('slash', { dir: 1 });
    print(`<span class="acc">⚔ ${esc(t('fg.plan'))} — ${esc(p.title)}</span>`);
    para(p.summary);
    const head = (k) => print(`<span class="acc">// ${esc(t(k))}</span>`, 'gap');
    head('fg.features'); p.features.forEach((f) => wrapText(f, w - 4).forEach((l, i) => say((i ? '    ' : '  · ') + l)));
    head('fg.stack'); say('  ' + p.stack.join(' · '));
    head('fg.steps'); p.steps.forEach((s, i) => wrapText(`${s.name}${s.detail ? ' — ' + s.detail : ''}`, w - 5).forEach((l, j) => say((j ? '     ' : `  ${i + 1}. `) + l)));
    say(`  ${t('fg.complexity')} ${'▰'.repeat(p.complexity)}${'▱'.repeat(5 - p.complexity)} ${p.complexity}/5`, 'dim');
    if (r.estimate) {
      const e = r.estimate;
      const price = t('fg.price', { a: nf(e.prix[0]), b: nf(e.prix[1]) });
      const weeks = t('fg.weeks', { a: e.semaines[0], b: e.semaines[1] });
      const body = `${price}  ·  ${weeks}`;
      const bw = Math.min(w, Math.max(body.length, t('fg.range').length) + 4);
      if (RTL) {
        print(`<span class="acc">// ${esc(t('fg.range'))}</span>`, 'gap');
        print(`<span class="estimate">${esc(body)}</span>`);
      } else {
        const hr = '+' + '-'.repeat(bw - 2) + '+';
        const row = (s) => `| ${s}${' '.repeat(Math.max(0, bw - 4 - s.length))} |`;
        print(`<span class="acc">${esc([hr, row(t('fg.range')), row(body), hr].join('\n'))}</span>`, 'pre gap');
      }
      para(t('fg.disclaimer'), 'dim');
    }
    if (p.questions && p.questions.length) { head('fg.questions'); p.questions.forEach((q) => wrapText(q, w - 4).forEach((l, i) => say((i ? '    ' : '  ? ') + l))); }
    say(t('fg.credit', { model: r.model || 'open source', s: ((r.ms || 0) / 1000).toFixed(1) }), 'dim gap');
    print(tHtml('fg.next', { ticket: cmdLink('ticket'), forge: cmdLink('forge') }));
  }
  function cold(r) {
    say(t('fg.cold'), 'err');
    say(r.reason === 'rate' ? t('fg.rate', { m: Math.max(1, Math.ceil((r.retry || 600) / 60)) }) : r.reason === 'quota' ? t('fg.quota') : t('fg.down'), 'dim');
    print(tHtml('fg.keep', { ticket: cmdLink('ticket') }));
  }

  /* --- assistant de ticket ------------------------------------------------- */
  function ticketSteps(skip) {
    return [
      { k: 'nom', q: 'tk.name', v: (s) => s.length >= 2 || t('tk.vName') },
      { k: 'email', q: 'tk.email', v: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || t('tk.vEmail') },
      { k: 'type', q: 'tk.type', opts: TK_TYPES, pre: 'type.' },
      { k: 'budget', q: 'tk.budget', opts: TK_BUDGETS, pre: 'budget.' },
      { k: 'delai', q: 'tk.delai', opts: TK_DELAIS, pre: 'delai.' },
      { k: 'message', q: 'tk.message', v: (s) => s.length >= 10 || t('tk.vMsg') },
    ].filter((s) => !skip.includes(s.k));
  }
  function askStep() {
    const st = mode.steps[mode.i];
    print(`<span class="acc">?</span> ${esc(t(st.q))} <span class="dim">(${mode.i + 1}/${mode.steps.length})</span>`);
    if (st.opts) st.opts.forEach((o, j) => print(`  ${cmdLink(String(j + 1), `${j + 1}) ${t(st.pre + o)}`)}`, 'opt'));
    setPS(`ticket/${st.k} ›`);
  }
  function startTicket() {
    const data = {}, skip = [];
    if (draft && draft.text) {
      data.message = draft.text + (draft.plan && !draft.plan.offtopic ? `\n\n— ${t('fg.planOf', { title: draft.plan.title, id: draft.id })}` : '');
      skip.push('message');
      if (draft.plan && !draft.plan.offtopic) { data.type = draft.plan.type; data.forgeId = draft.id; skip.push('type'); }
    }
    mode = { kind: 'ticket', i: 0, data, steps: ticketSteps(skip), confirm: false };
    say(t('tk.new'), 'dim');
    if (data.forgeId) say(t('tk.prefilled'), 'acc');
    askStep();
  }
  function ticketInput(v) {
    if (CANCEL.test(v)) return endMode(t('tk.cancelled'));
    if (mode.confirm) {
      if (YES.test(v)) return finalize();
      if (NO.test(v)) return endMode(t('tk.dropped'));
      return say(t('tk.yn'), 'err');
    }
    const st = mode.steps[mode.i];
    let val = v.trim();
    if (st.opts) {
      const n = parseInt(val, 10);
      const hit = (n >= 1 && n <= st.opts.length) ? st.opts[n - 1] : st.opts.find((o) => val.length > 1 && t(st.pre + o).toLowerCase().startsWith(val.toLowerCase()));
      if (!hit) return say(t('tk.pick', { n: st.opts.length }), 'err');
      mode.data[st.k] = hit;
      print(`<span class="dim">  ✓ ${esc(t(st.pre + hit))}</span>`);
    } else {
      const ok = st.v(val);
      if (ok !== true) return say(ok, 'err');
      mode.data[st.k] = val;
      print(`<span class="dim">  ✓ ${esc(val.length > 60 ? val.slice(0, 57) + '…' : val)}</span>`);
    }
    mode.i++;
    if (mode.i < mode.steps.length) return askStep();
    // récapitulatif
    const d = new Date();
    // le numéro définitif est attribué par la forge (ou tiré au sort si l'envoi passe par l'email)
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const dl = mode.data.delai;
    mode.ticket = { id: `KAL-${ymd}-····`, ymd, status: 'draft', ...mode.data,
      priorite: dl === 'urgent' ? 'haute' : dl === '1m' ? 'normale' : 'basse',
      date: d.toLocaleDateString(LANG) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    print(esc(ticketText(mode.ticket, Math.min(cols(), 56))), 'pre');
    print(`<span class="acc">?</span> ${esc(t('tk.send'))} ${cmdLink(LANG === 'fr' ? 'o' : 'y', t('tk.yes'))} / ${cmdLink('n', t('tk.no'))}`);
    mode.confirm = true;
    setPS('ticket ›');
  }
  async function finalize() {
    const tk = { ...mode.ticket };
    endMode();
    busy = true; input.disabled = true;
    say(t('tk.sending'), 'dim');
    let r = null;
    try {
      r = await API.ticket({ name: tk.nom, email: tk.email, type: tk.type, budget: tk.budget, deadline: tk.delai, lang: LANG, forgeId: tk.forgeId,
        message: tk.message, website: '' });
    } catch (e) { r = null; }
    busy = false; input.disabled = false;
    if (!IS_TOUCH) input.focus({ preventScroll: true });
    if (r && r.ok) {
      Object.assign(tk, { id: r.id, key: r.key, status: r.status || 'nouveau' });
      storeTicket(tk); last = tk; setDraft(null);
      Sound.play('slash', { dir: -1 });
      print(`<span class="acc">${esc(t('tk.sent', { id: tk.id }))}</span> ${esc(t('tk.replyBy', { email: tk.email }))}`);
      print(`<span class="dim">${esc(t('tk.track'))}</span> ${cmdLink('status ' + tk.id)}`);
      return;
    }
    if (r && r.status === 429) { say(r.error || '429', 'err'); }
    // repli : l'email prérempli
    tk.id = `KAL-${tk.ymd}-${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
    tk.status = 'open';
    storeTicket(tk); last = tk;
    if (r && r.status && r.status !== 429) say(t('tk.fail'), 'err');
    const href = mailtoFor(tk, ticketText(tk, 50));
    print(`<span class="acc">${esc(t('tk.ready', { id: tk.id }))}</span>`);
    print(`  <a class="tcmd" href="${esc(href)}">${esc(t('tk.byEmail'))}</a>   ${cmdLink('copier')}   ${cmdLink('telecharger')}   ${cmdLink('status ' + tk.id, t('tk.trackLabel'))}`);
    try { window.location.href = href; } catch (e) {}
  }
  const mailtoFor = (tk, txt) => `mailto:${SITE.email}?subject=${encodeURIComponent(`[${tk.id}] ${lab('type.', tk.type)} — ${tk.nom}`)}&body=${encodeURIComponent(txt + '\n\n' + t('tk.mailFoot', { name: SITE.name }))}`;

  async function status(arg) {
    const list = loadTickets();
    if (!list.length) return print(`<span class="dim">${esc(t('tk.none'))}</span> ${cmdLink('ticket')}`);
    const refresh = async (tk) => {
      if (!tk.key) return tk;
      try { const r = await API.lookup(tk.id, tk.key); if (r.ok) { tk.status = r.status; tk.reply = r.reply || ''; storeTicket(tk); } } catch (e) {}
      return tk;
    };
    if (arg) {
      const tk = list.find((x) => x.id.toLowerCase() === arg.toLowerCase());
      if (!tk) return say(t('tk.nf', { x: arg }), 'err');
      if (tk.key) say(t('tk.checking'), 'dim');
      await refresh(tk);
      print(esc(ticketText(tk, Math.min(cols(), 56))), 'pre');
      if (tk.reply) { print(`<span class="acc">${esc(t('tk.smith'))}</span>`); para(tk.reply); }
      return;
    }
    if (list.some((x) => x.key)) say(t('tk.checking'), 'dim');
    await Promise.all(list.slice(-6).map(refresh));
    list.slice().reverse().forEach((x) => print(`${cmdLink('status ' + x.id, x.id)}  <span class="acc">[${esc(statusLabel(x.status))}]</span>  <span class="dim">${esc(lab('type.', x.type))} · ${esc(x.date)}</span>${x.reply ? ' <span class="acc">✉</span>' : ''}`));
  }
  CMDS.copier = { hidden: true, async run() {
    if (!last) return say(t('tk.noCopy'), 'err');
    try { await navigator.clipboard.writeText(ticketText(last, 50)); say(t('tk.copied'), 'acc'); }
    catch (e) { say(t('tk.copyFail'), 'err'); }
  } };
  CMDS.telecharger = { hidden: true, async run() {
    if (!last) return say(t('tk.noDl'), 'err');
    const filename = `${last.id}.txt`, data = ticketText(last, 50) + '\n';
    // dans la visionneuse d'artefacts claude.ai : passage par la capacité « downloads »
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const dl = await Promise.race([window.claude.use('downloads'), new Promise((r) => setTimeout(() => r(null), 1500))]);
        if (dl) {
          try { await dl.save({ filename, data }); say(t('tk.saved', { f: filename }), 'acc'); }
          catch (e) { say(t('tk.dlCancel'), 'dim'); }
          return;
        }
      } catch (e) {}
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'text/plain;charset=utf-8' }));
    a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    page.timers.push(setTimeout(() => URL.revokeObjectURL(a.href), 4000));
    say(t('tk.downloaded', { f: filename }), 'acc');
  } };
  CMDS.envoyer = { hidden: true, run() { if (!last) return say(t('tk.noSend'), 'err'); window.location.href = mailtoFor(last, ticketText(last, 50)); } };
  CMDS.copy = CMDS.copier; CMDS.download = CMDS.telecharger; CMDS.mail = CMDS.envoyer; CMDS.send = CMDS.envoyer;

  /* --- exécution --------------------------------------------------------------- */
  function run(line, echo = true) {
    if (busy) return;
    const v = line.trim();
    if (echo) print(`<span class="acc">${esc(ps1.textContent)}</span> ${esc(v)}`, 'echo');
    if (mode && mode.kind === 'ticket') return ticketInput(v);
    if (mode && mode.kind === 'forge') {
      if (CANCEL.test(v)) return endMode();
      // une vraie commande tapée par réflexe ? on sort du mode forge et on l'exécute
      const w = v.split(/\s+/);
      if (!(w.length <= 2 && CMDS[w[0].toLowerCase()])) { if (v) runForge(v); return; }
      endMode();
    }
    if (!v) return;
    hist.push(v); hi = hist.length;
    const [c, ...rest] = v.split(/\s+/);
    const cmd = CMDS[c.toLowerCase()];
    if (!cmd) return print(`<span class="err">${esc(t('term.unknown', { x: c }))}</span> <span class="dim">${esc(t('term.typeHelp'))}</span> ${cmdLink('help')}`);
    cmd.run(rest.join(' '));
  }
  function printBanner() { print(TERM_BANNER.map(esc).join('\n'), 'banner pre'); }
  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    let pool;
    if (parts.length <= 1) pool = names();
    else if (parts[0] === 'open') pool = SITE.projects.map((p) => p.slug);
    else if (parts[0] === 'cd') pool = ['index', 'projets', 'a-propos', 'contact'];
    else if (parts[0] === 'theme') pool = Object.keys(ACCENTS);
    else if (parts[0] === 'lang') pool = LANGS;
    else if (parts[0] === 'status') pool = loadTickets().map((x) => x.id);
    else return;
    const cur = parts[parts.length - 1].toLowerCase();
    const hits = pool.filter((x) => x.toLowerCase().startsWith(cur));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + (parts.length === 1 ? ' ' : ''); }
    else if (hits.length > 1) say(hits.join('   '), 'dim');
  }

  page.ready = () => {
    setPS(PS1);
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; run(v); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); if (!mode) complete(); }
      else if (e.key === 'ArrowUp' && !mode) { e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; } }
      else if (e.key === 'ArrowDown' && !mode) { e.preventDefault(); if (hi < hist.length) { hi++; input.value = hist[hi] || ''; } }
      else if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) {
        e.preventDefault();
        print(`<span class="acc">${esc(ps1.textContent)}</span> ${esc(input.value)}^C`, 'echo'); input.value = '';
        if (mode) endMode(mode.kind === 'ticket' ? t('tk.cancelled') : '');
      } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    });
    // clic : commandes cliquables, et focus sur la ligne de saisie
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-run]');
      if (b) { e.preventDefault(); run(b.dataset.run); if (!IS_TOUCH) input.focus(); return; }
      if (e.target.closest('.term') && !e.target.closest('a') && !window.getSelection().toString()) input.focus({ preventScroll: true });
    });
    gsap.set($('.term', el), { opacity: 0, y: 24 });
    gsap.set($$('.term-chips button', el), { opacity: 0, y: 10 });
  };
  page.intro = (delay = 0) => {
    if (page.introduced) return;
    page.introduced = true;
    gsap.to($('.term', el), { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: delay + 0.2 });
    gsap.to($$('.term-chips button', el), { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05, delay: delay + 0.5 });
    page.timers.push(setTimeout(() => {
      printBanner();
      print(`<span class="dim">${esc(SITE.os)} ${esc(SITE.version)} — ${esc(t('term.of'))}</span> <span class="acc">${esc(SITE.name)}</span>`);
      print(tHtml('term.intro', { help: cmdLink('help'), forge: cmdLink('forge'), ticket: cmdLink('ticket') }));
      // arrivée depuis « forge allumée » ou le contact : KALISO écoute déjà
      let auto = null;
      try { auto = sessionStorage.getItem('kaliso-run'); sessionStorage.removeItem('kaliso-run'); } catch (e) {}
      if (auto && /^(forge|ticket|status( KAL-[0-9A-F·-]+)?)$/.test(auto)) run(auto);
      if (!IS_TOUCH) input.focus({ preventScroll: true });
    }, (delay + 0.5) * 1000));
  };
  page.destroy = () => { page.timers.forEach(clearTimeout); };
  return page;
}
