/* ==========================================================================
   API — KALISO, tickets et forge allumée (Worker Cloudflare, voir worker/)
   Hors ligne (aperçu local, API absente) : tout se replie proprement —
   la forge reste « allumée » par défaut et les tickets partent par email.
   ========================================================================== */
const API = {
  url(p) { return String(SITE.api || '').replace(/\/$/, '') + p; },
  async req(path, opts = {}, ms = 30000) {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(this.url(path), { ...opts, signal: ctl.signal, headers: { accept: 'application/json', ...(opts.body ? { 'content-type': 'application/json' } : {}) } });
      let data = null;
      try { data = await r.json(); } catch (e) {}
      if (!data || typeof data !== 'object') throw Object.assign(new Error('offline'), { offline: true, status: r.status });
      return { status: r.status, ...data };
    } catch (e) {
      if (e && e.offline) throw e;
      throw Object.assign(new Error('offline'), { offline: true, timeout: e && e.name === 'AbortError' });
    } finally { clearTimeout(tm); }
  },
  forge(text) { return this.req('/api/forge', { method: 'POST', body: JSON.stringify({ text, lang: LANG }) }, 50000); },
  // plan à partir de toute la conversation
  plan(messages) { return this.req('/api/forge', { method: 'POST', body: JSON.stringify({ messages, lang: LANG }) }, 60000); },
  // conversation : la réponse de KALISO arrive en flux (SSE) ; onText reçoit chaque morceau
  async chat(messages, onText, signal) {
    const ctl = new AbortController();
    const stop = () => ctl.abort();
    if (signal) signal.addEventListener('abort', stop);
    let tm = setTimeout(stop, 30000);
    try {
      const r = await fetch(this.url('/api/chat'), { method: 'POST', signal: ctl.signal, headers: { accept: 'text/event-stream', 'content-type': 'application/json' }, body: JSON.stringify({ messages, lang: LANG }) });
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('event-stream')) {
        let data = null;
        try { data = await r.json(); } catch (e) {}
        if (!data) throw Object.assign(new Error('offline'), { offline: true, status: r.status });
        return { status: r.status, ...data };
      }
      const rd = r.body.getReader(), dec = new TextDecoder();
      let buf = '', text = '', chips = [];
      for (;;) {
        const { value, done } = await rd.read();
        if (done) break;
        clearTimeout(tm); tm = setTimeout(stop, 30000);
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const ev = buf.slice(0, i); buf = buf.slice(i + 2);
          const line = ev.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;
          let j = null;
          try { j = JSON.parse(line.slice(5)); } catch (e) { continue; }
          if (j.t) { text += j.t; onText && onText(text, j.t); }
          if (j.done) chips = j.chips || [];
          if (j.error) throw Object.assign(new Error(j.error), { offline: true });
        }
      }
      if (!text.trim()) throw Object.assign(new Error('vide'), { offline: true });
      return { ok: true, text: text.trim(), chips, model: r.headers.get('x-model') || '' };
    } catch (e) {
      if (e && e.offline) throw e;
      throw Object.assign(new Error('offline'), { offline: true, aborted: e && e.name === 'AbortError' });
    } finally { clearTimeout(tm); if (signal) signal.removeEventListener('abort', stop); }
  },
  ticket(t) { return this.req('/api/tickets', { method: 'POST', body: JSON.stringify(t) }, 15000); },
  lookup(id, key) { return this.req(`/api/tickets/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`, {}, 8000); },
};

/* --- forge allumée : disponibilité réglée depuis le dashboard ---------------- */
const FORGE = {
  lit: true, note: '', known: false, at: 0, subs: new Set(),
  async load(force) {
    if (!force && Date.now() - this.at < 60000) return this;
    this.at = Date.now();
    try {
      const s = await API.req('/api/status', {}, 6000);
      if (s.ok) { this.lit = !!s.lit; this.note = (s.note && (s.note[LANG] || '')) || ''; this.known = true; }
    } catch (e) { /* hors ligne : on garde la valeur par défaut */ }
    this.subs.forEach((fn) => { try { fn(this); } catch (e) {} });
    return this;
  },
  label() { return t(this.lit ? 'forge.lit' : 'forge.out'); },
  sub() { return this.note || t(this.lit ? 'forge.litSub' : 'forge.outSub'); },
};

/* --- brouillon partagé entre le terminal et la forge visuelle -------------------- */
const Draft = {
  get() { try { return JSON.parse(sessionStorage.getItem('kaliso-draft') || 'null'); } catch (e) { return null; } },
  set(d) { try { if (d) sessionStorage.setItem('kaliso-draft', JSON.stringify(d)); else sessionStorage.removeItem('kaliso-draft'); } catch (e) {} },
};
