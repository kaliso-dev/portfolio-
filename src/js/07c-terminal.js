/* ==========================================================================
   TERMINAL — page interactive : commandes, navigation, et génération de ticket
   ========================================================================== */
const TERM_BANNER = [
  ' _  __    _    _     ___ ____   ___  ',
  '| |/ /   / \\  | |   |_ _/ ___| / _ \\ ',
  "| ' /   / _ \\ | |    | |\\___ \\| | | |",
  '| . \\  / ___ \\| |___ | | ___) | |_| |',
  '|_|\\_\\/_/   \\_\\_____|___|____/ \\___/ ',
];
const TICKET_STEPS = [
  { k: 'nom', q: 'Ton nom, ou celui de ta structure', v: (s) => s.length >= 2 || 'au moins 2 caractères' },
  { k: 'email', q: 'Ton email (pour te répondre)', v: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || 'email invalide' },
  { k: 'type', q: 'Quel type de quête ?', opts: ['Site vitrine', 'Site e-commerce', 'Application web / SaaS', 'Application mobile', 'API / back-end', 'Agent IA / automatisation', 'Outil interne / intégration', 'Autre : tout le reste'] },
  { k: 'budget', q: 'Budget estimé', opts: ['< 2 k€', '2 – 5 k€', '5 – 10 k€', '10 k€ et +', 'À définir ensemble'] },
  { k: 'delai', q: 'Délai souhaité', opts: ['Urgent (< 2 semaines)', 'Sous 1 mois', '2 – 3 mois', 'Flexible'] },
  { k: 'message', q: 'Décris ta quête en quelques lignes', v: (s) => s.length >= 10 || 'un peu plus de détails (10 caractères minimum)' },
];
const TERM_PAGES = { index: 'index', '~': 'index', accueil: 'index', projets: 'projets', work: 'projets', 'a-propos': 'a-propos', about: 'a-propos', contact: 'contact' };

function loadTickets() { try { return JSON.parse(localStorage.getItem('kaliso-tickets') || '[]'); } catch (e) { return []; } }
function saveTickets(list) { try { localStorage.setItem('kaliso-tickets', JSON.stringify(list.slice(-12))); } catch (e) {} }

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

// ticket en ASCII (texte brut : sert aussi pour l'email et le .txt)
function ticketText(t, w = 50) {
  const inner = w - 4;
  const pad = (s) => s + ' '.repeat(Math.max(0, inner - s.length));
  const row = (s) => `| ${pad(s.slice(0, inner))} |`;
  const kv = (k, v) => wrapText(v, inner - 11).map((l, i) => row((i ? ' '.repeat(11) : (k + ' '.repeat(11)).slice(0, 11)) + l));
  const hr = '+' + '-'.repeat(w - 2) + '+';
  const st = `[${t.status}]`;
  const lines = [hr, row('TICKET ' + t.id + ' '.repeat(Math.max(1, inner - 7 - t.id.length - st.length)) + st), hr,
    ...kv('client', t.nom), ...kv('email', t.email), ...kv('type', t.type), ...kv('budget', t.budget),
    ...kv('délai', t.delai), ...kv('priorité', t.priorite), ...kv('créé le', t.date), hr,
    ...wrapText(t.message, inner).map(row), hr];
  return lines.join('\n');
}

function PageTerminal() {
  const el = h(`<div class="term-page">
    <section class="term-wrap"><div class="container">
      <h1 class="sr-only">Terminal</h1>
      <div class="term">
        <div class="term-bar"><span class="term-title"><span class="term-dot"></span>visiteur@${esc(SITE.handle)}: ~/terminal</span><span class="term-meta">${esc(SITE.os)} ${esc(SITE.version)} — zsh</span></div>
        <div class="term-out" data-lenis-prevent aria-live="polite"></div>
        <form class="term-line" autocomplete="off">
          <label class="term-ps1" for="term-in"></label>
          <input id="term-in" class="term-in" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" enterkeyhint="send" aria-label="Commande">
        </form>
      </div>
      <div class="term-chips">${['help', 'ticket', 'claude', 'ls', 'whoami', 'theme'].map((c) => `<button type="button" data-run="${c}">${c}</button>`).join('')}</div>
    </div></section>
  </div>`);
  const out = $('.term-out', el), input = $('.term-in', el), ps1 = $('.term-ps1', el), form = $('.term-line', el);
  const page = { key: 'terminal', el, scroll: false, timers: [] };
  const hist = []; let hi = 0;
  let wiz = null;      // assistant de ticket en cours
  let last = null;     // dernier ticket généré
  const PS1 = `visiteur@${SITE.handle}:~$`;
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
  const cmdLink = (c, label = c) => `<button type="button" class="tcmd" data-run="${esc(c)}">${esc(label)}</button>`;
  const cols = () => clamp(Math.floor((out.clientWidth - 32) / (parseFloat(getComputedStyle(out).fontSize) * 0.6)), 34, 64);

  /* --- commandes -------------------------------------------------------------- */
  const CMDS = {
    help: { d: 'cette aide', run() {
      const rows = [['whoami', 'qui suis-je'], ['ls', 'lister les projets'], ['open <projet>', 'ouvrir un projet'], ['cat about.md', 'à propos, en bref'],
        ['ticket', 'ouvrir une quête (devis, mission, question)'], ['claude', 'mon second sabre'], ['status [id]', 'suivre mes tickets'], ['contact', 'email et réseaux'],
        ['theme [couleur]', 'changer la couleur d\'accent'], ['cd <page>', 'index · projets · a-propos · contact'], ['clear', 'effacer l\'écran']];
      print(rows.map(([c, d]) => `  ${cmdLink(c.split(' ')[0] === 'cat' ? 'cat about.md' : c.split(' ')[0], c)}${' '.repeat(Math.max(2, 18 - c.length))}<span class="dim">${esc(d)}</span>`).join('\n'));
      say('  ↑ ↓ historique · Tab complète · Ctrl+C annule', 'dim');
    } },
    whoami: { d: 'qui suis-je', run() {
      print(`<span class="acc">${esc(SITE.name)}</span> — ${esc(SITE.role || 'développeur')} · ${esc(SITE.location || '')}`);
      wrapText(SITE.about.door || SITE.motto || '', cols()).forEach((l) => say(l, 'dim'));
      if (SITE.about.stack) say('stack : ' + SITE.about.stack.slice(0, 9).join(' · '), 'dim');
    } },
    ls: { d: 'lister les projets', run() {
      say(`total ${SITE.projects.length}`, 'dim');
      print(SITE.projects.map((p) => `${cmdLink('open ' + p.slug, (p.slug + (p.ext || '')).padEnd(15))} <span class="dim">${esc(String(p.year || ''))}  ${esc(p.type || '')}</span>`).join('\n'));
      say('→ open <nom> pour ouvrir un projet', 'dim');
    } },
    open: { d: 'ouvrir un projet', run(arg) {
      const q = (arg || '').toLowerCase().replace(/\.\w+$/, '');
      const p = SITE.projects.find((x) => x.slug === q || x.slug.startsWith(q) || (x.name || '').toLowerCase() === q);
      if (!q) return say('usage : open <projet>   (ls pour la liste)', 'err');
      if (!p) return say(`open : projet introuvable : ${arg}`, 'err');
      say(`ouverture de ${p.slug}${p.ext || ''}…`, 'acc');
      page.timers.push(setTimeout(() => go('#projet-' + p.slug), 350));
    } },
    cat: { d: 'lire un fichier', run(arg) {
      if (!arg || !/about/i.test(arg)) return say('cat : fichier introuvable (essaie : cat about.md)', 'err');
      say('# about.md', 'acc');
      wrapText(SITE.about.intro || SITE.motto || '', cols()).forEach((l) => say(l));
      if (SITE.availability) say('dispo : ' + SITE.availability, 'dim');
    } },
    cd: { d: 'changer de page', run(arg) {
      const k = TERM_PAGES[(arg || '~').toLowerCase()];
      if (!k) return say(`cd : page inconnue : ${arg}  (index · projets · a-propos · contact)`, 'err');
      page.timers.push(setTimeout(() => go('#' + k), 200));
    } },
    contact: { d: 'email et réseaux', run() {
      print(`email   <a class="tcmd" href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`);
      (SITE.socials || []).forEach((s) => print(`${esc(s.label.toLowerCase().padEnd(8))}<a class="tcmd" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url.replace(/^https?:\/\//, ''))}</a>`));
      print(`<span class="dim">ou plus simple :</span> ${cmdLink('ticket')}`);
    } },
    ticket: { d: 'ouvrir une demande', run() { startTicket(); } },
    status: { d: 'suivre mes tickets', run(arg) {
      const list = loadTickets();
      if (!list.length) return print(`<span class="dim">aucun ticket pour l'instant —</span> ${cmdLink('ticket')}`);
      const t = arg ? list.find((x) => x.id.toLowerCase() === arg.toLowerCase()) : null;
      if (arg && !t) return say(`status : ticket introuvable : ${arg}`, 'err');
      if (t) { print(esc(ticketText(t, Math.min(cols(), 56))), 'pre'); return; }
      list.slice().reverse().forEach((x) => print(`${cmdLink('status ' + x.id, x.id)}  <span class="acc">[${esc(x.status)}]</span>  <span class="dim">${esc(x.type)} · ${esc(x.date)}</span>`));
    } },
    theme: { d: 'couleur d\'accent', run(arg) {
      if (arg && setAccent(arg.toLowerCase(), true)) return print(`accent → <span class="acc">${esc(ACCENTS[arg.toLowerCase()].label)}</span>`);
      if (arg) say(`theme : couleur inconnue : ${arg}`, 'err');
      print(Object.entries(ACCENTS).map(([k, a]) => `<span style="color:${a.hex}">■</span> ${cmdLink('theme ' + k, k.padEnd(10))} <span class="dim">${esc(a.label)}${k === ACCENT.name ? ' (actuel)' : ''}</span>`).join('\n'));
    } },
    clear: { d: 'effacer', run() { out.innerHTML = ''; } },
    // commandes cachées
    date: { hidden: true, run() { say(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })); } },
    echo: { hidden: true, run(arg) { say(arg || ''); } },
    history: { hidden: true, run() { hist.forEach((c, i) => say(`${String(i + 1).padStart(3)}  ${c}`, 'dim')); } },
    sudo: { hidden: true, run() { say('permission refusée : seul le chevalier détient la clé.', 'err'); } },
    claude: { d: 'mon second sabre', run() {
      print(`<span class="acc">claude</span> <span class="dim">— l'IA d'Anthropic, mon compagnon de forge</span>`);
      wrapText('Je développe avec Claude au quotidien : il écrit vite, propose, explore ; je tiens la lame. Architecture, choix techniques, relecture ligne à ligne, sécurité, finition : tout passe par moi avant de partir en production.', cols()).forEach((l) => say(l));
      wrapText('Le résultat : la cadence d\'une équipe, la cohérence d\'un seul artisan. Sites, apps, API, SaaS, agents IA, automatisations… aucune quête n\'est hors de portée.', cols()).forEach((l) => say(l, 'dim'));
      print(`<span class="dim">prêt ?</span> ${cmdLink('ticket')}`);
    } },
    exit: { hidden: true, run() { say('déconnexion…', 'dim'); page.timers.push(setTimeout(() => go('#index'), 300)); } },
    sound: { hidden: true, run(arg) { if ((arg === 'on') !== Sound.on) Sound.toggle(); say('son : ' + (Sound.on ? 'activé' : 'coupé'), 'dim'); } },
    banner: { hidden: true, run() { printBanner(); } },
  };
  const names = () => Object.keys(CMDS).filter((k) => !CMDS[k].hidden);

  /* --- assistant de ticket ------------------------------------------------- */
  function askStep() {
    const st = TICKET_STEPS[wiz.i];
    print(`<span class="acc">?</span> ${esc(st.q)} <span class="dim">(${wiz.i + 1}/${TICKET_STEPS.length})</span>`);
    if (st.opts) print(st.opts.map((o, j) => `  ${cmdLink(String(j + 1), `${j + 1}) ${o}`)}`).join('\n'));
    setPS(`ticket/${st.k} ›`);
  }
  function startTicket() {
    wiz = { i: 0, data: {}, confirm: false };
    say('nouvelle quête — Ctrl+C ou « annuler » pour rebrousser chemin', 'dim');
    askStep();
  }
  function endTicket(msg) { wiz = null; setPS(PS1); if (msg) say(msg, 'dim'); }
  function wizInput(v) {
    if (/^(annuler|cancel|quit|q)$/i.test(v)) return endTicket('ticket annulé.');
    if (wiz.confirm) {
      if (/^(o|oui|y|yes)$/i.test(v)) return finalize();
      if (/^(n|non|no)$/i.test(v)) return endTicket('ticket abandonné. tape ticket pour recommencer.');
      return say('réponds o (oui) ou n (non)', 'err');
    }
    const st = TICKET_STEPS[wiz.i];
    let val = v.trim();
    if (st.opts) {
      const n = parseInt(val, 10);
      const hit = (n >= 1 && n <= st.opts.length) ? st.opts[n - 1] : st.opts.find((o) => o.toLowerCase().startsWith(val.toLowerCase()) && val.length > 1);
      if (!hit) return say(`choisis un numéro entre 1 et ${st.opts.length}`, 'err');
      val = hit;
    } else {
      const ok = st.v(val);
      if (ok !== true) return say(ok, 'err');
    }
    wiz.data[st.k] = val;
    print(`<span class="dim">  ✓ ${esc(val.length > 60 ? val.slice(0, 57) + '…' : val)}</span>`);
    wiz.i++;
    if (wiz.i < TICKET_STEPS.length) return askStep();
    // récapitulatif
    const d = new Date();
    const id = `KAL-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
    wiz.ticket = { id, status: 'BROUILLON', ...wiz.data,
      priorite: /Urgent/.test(wiz.data.delai) ? 'haute' : /1 mois/.test(wiz.data.delai) ? 'normale' : 'basse',
      date: d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    print(esc(ticketText(wiz.ticket, Math.min(cols(), 56))), 'pre');
    print(`<span class="acc">?</span> Envoyer ce ticket au forgeron ? ${cmdLink('o', '[o]ui')} / ${cmdLink('n', '[n]on')}`);
    wiz.confirm = true;
    setPS('ticket/envoyer ›');
  }
  async function finalize() {
    const t = { ...wiz.ticket, status: 'OUVERT' };
    endTicket();
    last = t;
    const list = loadTickets(); list.push(t); saveTickets(list);
    const txt = ticketText(t, 50);
    const ep = SITE.ticket && SITE.ticket.endpoint;
    if (ep) {
      say('transmission…', 'dim');
      try {
        const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...t, _subject: `[${t.id}] ${t.type} — ${t.nom}`, ticket: txt }) });
        if (!r.ok) throw new Error(r.status);
        print(`<span class="acc">✓ ticket ${esc(t.id)} transmis.</span> réponse sous 48 h à ${esc(t.email)}.`);
        print(`<span class="dim">suivi :</span> ${cmdLink('status ' + t.id)}`);
        return;
      } catch (e) { say('transmission impossible, passage par l\'email.', 'err'); }
    }
    const href = mailtoFor(t, txt);
    print(`<span class="acc">✓ ticket ${esc(t.id)} prêt.</span> ton client mail va s'ouvrir avec la demande préremplie : il ne reste qu'à l'envoyer.`);
    print(`${'  '}<a class="tcmd" href="${esc(href)}">envoyer par email</a>   ${cmdLink('copier')}   ${cmdLink('telecharger')}   ${cmdLink('status ' + t.id, 'suivi')}`);
    try { window.location.href = href; } catch (e) {}
  }
  const mailtoFor = (t, txt) => `mailto:${SITE.email}?subject=${encodeURIComponent(`[${t.id}] ${t.type} — ${t.nom}`)}&body=${encodeURIComponent(txt + '\n\nEnvoyé depuis le terminal de ' + SITE.name)}`;
  CMDS.copier = { hidden: true, async run() {
    if (!last) return say('aucun ticket à copier', 'err');
    try { await navigator.clipboard.writeText(ticketText(last, 50)); say('ticket copié dans le presse-papiers ✓', 'acc'); }
    catch (e) { say('copie impossible ici — sélectionne le ticket à la main', 'err'); }
  } };
  CMDS.telecharger = { hidden: true, async run() {
    if (!last) return say('aucun ticket à télécharger', 'err');
    const filename = `${last.id}.txt`, data = ticketText(last, 50) + '\n';
    // dans la visionneuse d'artefacts claude.ai : passage par la capacité « downloads »
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const dl = await Promise.race([window.claude.use('downloads'), new Promise((r) => setTimeout(() => r(null), 1500))]);
        if (dl) {
          try { await dl.save({ filename, data }); say(`${filename} enregistré`, 'acc'); }
          catch (e) { say('téléchargement annulé', 'dim'); }
          return;
        }
      } catch (e) {}
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ticketText(last, 50) + '\n'], { type: 'text/plain;charset=utf-8' }));
    a.download = `${last.id}.txt`; document.body.appendChild(a); a.click(); a.remove();
    page.timers.push(setTimeout(() => URL.revokeObjectURL(a.href), 4000));
    say(`${last.id}.txt téléchargé`, 'acc');
  } };
  CMDS.envoyer = { hidden: true, run() { if (!last) return say('aucun ticket à envoyer', 'err'); window.location.href = mailtoFor(last, ticketText(last, 50)); } };
  CMDS.mail = CMDS.envoyer;

  /* --- exécution --------------------------------------------------------------- */
  function run(line, echo = true) {
    const v = line.trim();
    if (echo) print(`<span class="acc">${esc(ps1.textContent)}</span> ${esc(v)}`, 'echo');
    if (wiz) return wizInput(v);
    if (!v) return;
    hist.push(v); hi = hist.length;
    const [c, ...rest] = v.split(/\s+/);
    const cmd = CMDS[c.toLowerCase()];
    if (!cmd) return print(`<span class="err">commande introuvable : ${esc(c)}</span> <span class="dim">— tape</span> ${cmdLink('help')}`);
    cmd.run(rest.join(' '));
  }
  function printBanner() {
    print(TERM_BANNER.map(esc).join('\n'), 'banner pre');
  }
  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    let pool;
    if (parts.length <= 1) pool = names();
    else if (parts[0] === 'open') pool = SITE.projects.map((p) => p.slug);
    else if (parts[0] === 'cd') pool = ['index', 'projets', 'a-propos', 'contact'];
    else if (parts[0] === 'theme') pool = Object.keys(ACCENTS);
    else if (parts[0] === 'status') pool = loadTickets().map((t) => t.id);
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
      if (e.key === 'Tab') { e.preventDefault(); if (!wiz) complete(); }
      else if (e.key === 'ArrowUp' && !wiz) { e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; } }
      else if (e.key === 'ArrowDown' && !wiz) { e.preventDefault(); if (hi < hist.length) { hi++; input.value = hist[hi] || ''; } }
      else if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) { e.preventDefault(); print(`<span class="acc">${esc(ps1.textContent)}</span> ${esc(input.value)}^C`, 'echo'); input.value = ''; if (wiz) endTicket('ticket annulé.'); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
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
      print(`<span class="dim">${esc(SITE.os)} ${esc(SITE.version)} — terminal de</span> <span class="acc">${esc(SITE.name)}</span>`);
      print(`tape ${cmdLink('help')} pour la liste des commandes, ${cmdLink('ticket')} pour ouvrir une quête, ou ${cmdLink('claude')} pour savoir comment je travaille.`);
      if (!IS_TOUCH) input.focus({ preventScroll: true });
    }, (delay + 0.5) * 1000));
  };
  page.destroy = () => { page.timers.forEach(clearTimeout); };
  return page;
}
