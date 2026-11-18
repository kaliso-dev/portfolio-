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
