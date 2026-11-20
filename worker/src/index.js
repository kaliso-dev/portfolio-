/* ==========================================================================
   KALISO — Worker Cloudflare du portfolio de Sofiene Lamsouni
   Public  : GET  /api/status            état de la forge (allumée / éteinte)
             POST /api/chat              KALISO en conversation (réponse en flux SSE)
             POST /api/forge             KALISO : description ou conversation → plan de bataille + fourchette
             POST /api/tickets           nouveau ticket
             GET  /api/tickets/:id?key=  suivi d'un ticket par le visiteur
   Privé   : /admin (dashboard) et /api/admin/* (jeton ADMIN_TOKEN)
   Le reste : fichiers du site (dist/)
   ========================================================================== */
import ADMIN_HTML from './admin.html';
import { forgePlan, modelLabel, chatStream, chatTransform, neuronsOf } from './kaliso.js';
import { estimer, TARIFS } from './tarifs.js';
import { LANGS, TYPES, BUDGETS, DELAIS, STATUTS } from './constantes.js';

/* --- utilitaires ----------------------------------------------------------- */
const now = () => Math.floor(Date.now() / 1000);
const iso = () => new Date().toISOString();
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');
const oneOf = (v, obj, d) => (typeof v === 'string' && Object.prototype.hasOwnProperty.call(obj, v) ? v : d);
const ALNUM = 'abcdefghijkmnpqrstuvwxyz23456789';
const rid = (n) => { const b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map((x) => ALNUM[x % ALNUM.length]).join(''); };
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers },
});
const fail = (status, error, extra = {}) => json({ ok: false, error, ...extra }, status);

async function readJson(request, max = 16000) {
  const t = await request.text();
  if (t.length > max) throw Object.assign(new Error('requête trop lourde'), { status: 413 });
  try { return JSON.parse(t || '{}'); } catch (e) { throw Object.assign(new Error('JSON invalide'), { status: 400 }); }
}

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const ipOf = (req) => req.headers.get('cf-connecting-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || '0.0.0.0';
// le visiteur n'est jamais stocké en clair : empreinte salée, tronquée
const visitor = async (req, env) => (await sha256hex(ipOf(req) + '|' + (env.HASH_SALT || 'kaliso-sel-du-desert'))).slice(0, 24);

/* --- anti-abus : compteur par fenêtre de temps (D1) ------------------------ */
async function hit(env, key, limit, windowSec) {
  const t = now();
  const w = Math.floor(t / windowSec);
  const row = await env.DB.prepare('INSERT INTO hits (k, n, exp) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n')
    .bind(`${key}:${w}`, (w + 1) * windowSec).first();
  const n = row ? row.n : 1;
  return { ok: n <= limit, n, left: Math.max(0, limit - n), retry: (w + 1) * windowSec - t };
}
// plusieurs compteurs en un seul aller-retour vers la base
async function hitAll(env, specs) {
  const t = now();
  const stmts = specs.map(([k, , win]) => {
    const w = Math.floor(t / win);
    return env.DB.prepare('INSERT INTO hits (k, n, exp) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n').bind(`${k}:${w}`, (w + 1) * win);
  });
  const res = await env.DB.batch(stmts);
  return specs.map(([, lim, win], i) => {
    const w = Math.floor(t / win);
    const n = (res[i] && res[i].results && res[i].results[0] && res[i].results[0].n) || 1;
    return { ok: n <= lim, n, left: Math.max(0, lim - n), retry: (w + 1) * win - t };
  });
}
const peekStmt = (env, key, windowSec) => env.DB.prepare('SELECT n FROM hits WHERE k = ?1').bind(`${key}:${Math.floor(now() / windowSec)}`);
async function peek(env, key, windowSec) {
  const w = Math.floor(now() / windowSec);
  const row = await env.DB.prepare('SELECT n FROM hits WHERE k = ?1').bind(`${key}:${w}`).first();
  return row ? row.n : 0;
}

/* --- CORS (uniquement pour l'API publique) --------------------------------- */
function allowedOrigin(request, env) {
  const o = request.headers.get('origin');
  if (!o) return null;
  if (o === new URL(request.url).origin) return o;
  const list = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  if (list.includes(o)) return o;
  if (env.DEV === '1' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return o;
  return null;
}
function withCors(res, request, env) {
  const o = allowedOrigin(request, env);
  if (!o) return res;
  const r = new Response(res.body, res);
  r.headers.set('access-control-allow-origin', o);
  r.headers.append('vary', 'Origin');
  return r;
}
function preflight(request, env) {
  const o = allowedOrigin(request, env);
  if (!o) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: {
    'access-control-allow-origin': o, 'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin',
  } });
}

/* --- état de la forge ------------------------------------------------------ */
const DEFAULT_STATUS = { lit: true, note: { fr: '', en: '', ar: '' }, updated: null };
async function getStatus(env) {
  const row = await env.DB.prepare("SELECT v FROM settings WHERE k = 'forge'").first();
  if (!row) return DEFAULT_STATUS;
  try { return { ...DEFAULT_STATUS, ...JSON.parse(row.v) }; } catch (e) { return DEFAULT_STATUS; }
}

/* --- KALISO ---------------------------------------------------------------- */
/* --- budget de calcul Workers AI (offre gratuite : 10 000 neurones / jour) ---- */
const AI_DAY = 86400;
async function aiSpent(env) {
  const w = Math.floor(now() / AI_DAY);
  const row = await env.DB.prepare('SELECT n FROM hits WHERE k = ?1').bind(`ai:neurons:${w}`).first();
  return row ? row.n : 0;
}
function aiSpend(env, n) {
  const w = Math.floor(now() / AI_DAY);
  return env.DB.prepare('INSERT INTO hits (k, n, exp) VALUES (?1, ?2, ?3) ON CONFLICT(k) DO UPDATE SET n = n + ?2')
    .bind(`ai:neurons:${w}`, Math.max(1, Math.round(n)), (w + 1) * AI_DAY).run();
}
const aiLeft = async (env) => num(env.AI_NEURONS_DAY, 9000) - (await aiSpent(env));

// conversation envoyée par le navigateur : rôles et longueurs vérifiés
function readConversation(list) {
  if (!Array.isArray(list)) return null;
  const msgs = list.slice(-24).map((m) => ({
    role: m && m.role === 'assistant' ? 'assistant' : 'user',
    content: clean(m && m.content, m && m.role === 'assistant' ? 2400 : 1500),
  })).filter((m) => m.content);
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}
const transcript = (msgs, lang) => msgs.map((m) => `${m.role === 'user' ? (lang === 'en' ? 'Visitor' : 'Visiteur') : 'KALISO'}: ${m.content}`).join('\n\n');

async function postChat(request, env, ctx) {
  const b = await readJson(request, 48000);
  const lang = LANGS.includes(b.lang) ? b.lang : 'fr';
  const msgs = readConversation(b.messages);
  if (!msgs) return fail(400, 'conversation invalide');
  const turns = b.messages.filter((m) => m && m.role !== 'assistant').length;
  if (turns > num(env.CHAT_MAX_TURNS, 14)) return fail(400, 'conversation trop longue', { reason: 'long' });
  if (turns === 1 && msgs[0].content.length < 8) return fail(400, 'description trop courte', { field: 'text' });
  const v = await visitor(request, env);
  for (const r of await hitAll(env, [[`chat:h:${v}`, num(env.CHAT_PER_HOUR, 40), 3600], [`chat:d:${v}`, num(env.CHAT_PER_DAY, 150), 86400]])) {
    if (!r.ok) return fail(429, 'trop de messages', { cold: true, reason: 'rate', retry: r.retry });
  }
  if ((await aiLeft(env)) <= 0) return fail(503, 'quota du jour atteint', { cold: true, reason: 'quota' });
  let s;
  try { s = await chatStream(env, msgs, lang); } catch (e) { return fail(503, 'la forge refroidit', { cold: true, reason: 'ai' }); }
  // le coût est compté quand le flux se termine
  let end; const ended = new Promise((r) => { end = r; });
  ctx.waitUntil(ended.then(([raw, usage]) => aiSpend(env, neuronsOf(s.model, s.msgs, raw, usage))).catch(() => {}));
  const body = s.stream.pipeThrough(chatTransform((raw, usage) => end([raw, usage])));
  return new Response(body, { headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', 'x-model': modelLabel(s.model), 'x-content-type-options': 'nosniff' } });
}

async function postForge(request, env, ctx) {
  const b = await readJson(request, 48000);
  const lang = LANGS.includes(b.lang) ? b.lang : 'fr';
  const msgs = b.messages ? readConversation([...(Array.isArray(b.messages) ? b.messages : []), { role: 'user', content: '.' }]) : null;
  const fromChat = !!(msgs && msgs.length > 1);
  const text = fromChat ? clean(transcript(msgs.slice(0, -1), lang), 20000) : clean(b.text, 1500);
  if (text.length < 12) return fail(400, 'description trop courte', { field: 'text' });
  const v = await visitor(request, env);
  // compteurs du visiteur en un aller-retour ; le compteur global seulement s'il passe (un abuseur ne vide pas le quota)
  for (const r of await hitAll(env, [[`forge:h:${v}`, num(env.FORGE_PER_HOUR, 6), 3600], [`forge:d:${v}`, num(env.FORGE_PER_DAY, 20), 86400]])) {
    if (!r.ok) return fail(429, 'trop de demandes', { cold: true, reason: 'rate', retry: r.retry });
  }
  if ((await aiLeft(env)) <= 0) return fail(503, 'quota du jour atteint', { cold: true, reason: 'quota' });
  const g = await hit(env, 'forge:global', num(env.FORGE_DAILY_CAP, 150), 86400);
  if (!g.ok) return fail(503, 'quota du jour atteint', { cold: true, reason: 'quota', retry: g.retry });

  const t0 = Date.now();
  let plan = null, model = null, err = null, neurons = 0;
  try { ({ plan, model, neurons } = await forgePlan(env, text, lang, fromChat)); } catch (e) { err = String((e && e.message) || e).slice(0, 300); }
  const id = 'F-' + rid(10);
  const estimate = plan && !plan.offtopic ? estimer(plan) : null;
  ctx.waitUntil(env.DB.prepare('INSERT INTO forges (id, created_at, lang, text, plan, estimate, model, ms, ok) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)')
    .bind(id, iso(), lang, text, plan ? JSON.stringify(plan) : JSON.stringify({ error: err }), estimate ? JSON.stringify(estimate) : null, model, Date.now() - t0, plan ? 1 : 0).run());
  ctx.waitUntil(aiSpend(env, neurons || 60).catch(() => {}));
  if (!plan) return fail(503, 'la forge refroidit', { cold: true, reason: 'ai', id });
  return json({ ok: true, id, plan, estimate, model: modelLabel(model), ms: Date.now() - t0, left: g.left });
}

/* --- tickets ----------------------------------------------------------------- */
function ticketId() {
  const d = new Date();
  const ymd = String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
  const hex = [...crypto.getRandomValues(new Uint8Array(2))].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `KAL-${ymd}-${hex}`;
}

async function postTicket(request, env, ctx) {
  const b = await readJson(request);
  if (b.website) return json({ ok: true, id: ticketId(), key: rid(16), status: 'nouveau' }); // pot de miel : les robots croient avoir réussi
  const t = {
    name: clean(b.name, 120),
    email: clean(b.email, 200).toLowerCase(),
    type: oneOf(b.type, TYPES, 'autre'),
    budget: oneOf(b.budget, BUDGETS, 'tbd'),
    deadline: oneOf(b.deadline, DELAIS, 'flex'),
    message: clean(b.message, 5000),
    lang: LANGS.includes(b.lang) ? b.lang : 'fr',
    forge_id: typeof b.forgeId === 'string' && /^F-[a-z0-9]{10}$/.test(b.forgeId) ? b.forgeId : null,
  };
  if (t.name.length < 2) return fail(400, 'nom manquant', { field: 'name' });
  if (!EMAIL.test(t.email)) return fail(400, 'email invalide', { field: 'email' });
  if (t.message.length < 10) return fail(400, 'message trop court', { field: 'message' });
  const v = await visitor(request, env);
  const r = await hit(env, `ticket:h:${v}`, num(env.TICKETS_PER_HOUR, 4), 3600);
  if (!r.ok) return fail(429, 'trop de tickets', { retry: r.retry });
  const priority = t.deadline === 'urgent' ? 'haute' : t.deadline === '1m' ? 'normale' : 'basse';
  const key = rid(16);
  const at = iso();
  let id = null;
  for (let i = 0; i < 4 && !id; i++) {
    const cand = ticketId();
    try {
      await env.DB.prepare(`INSERT INTO tickets (id, access_key, created_at, updated_at, status, type, name, email, budget, deadline, priority, message, lang, source, forge_id)
        VALUES (?1, ?2, ?3, ?3, 'nouveau', ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`)
        .bind(cand, key, at, t.type, t.name, t.email, t.budget, t.deadline, priority, t.message, t.lang, t.forge_id ? 'forge' : 'terminal', t.forge_id).run();
      id = cand;
    } catch (e) {
      if (!/UNIQUE|constraint/i.test(String(e && e.message))) throw e;
    }
  }
  if (!id) return fail(500, 'impossible de créer le ticket');
  if (t.forge_id) ctx.waitUntil(env.DB.prepare('UPDATE forges SET ticket_id = ?1 WHERE id = ?2').bind(id, t.forge_id).run());
  ctx.waitUntil(notify(env, { id, ...t, priority }).catch(() => {}));
  return json({ ok: true, id, key, status: 'nouveau', created: at }, 201);
}

async function getTicket(env, id, key) {
  if (!/^KAL-\d{6}-[0-9A-F]{4}$/.test(id) || !/^[a-z0-9]{16}$/.test(key || '')) return fail(404, 'ticket introuvable');
  const row = await env.DB.prepare('SELECT id, access_key, status, created_at, updated_at, reply FROM tickets WHERE id = ?1').bind(id).first();
  if (!row || row.access_key !== key) return fail(404, 'ticket introuvable');
  return json({ ok: true, id: row.id, status: row.status, created: row.created_at, updated: row.updated_at, reply: row.reply || '' });
}

// notification optionnelle : ntfy.sh (appli gratuite sur téléphone) ou webhook Discord
async function notify(env, t) {
  const u = env.NOTIFY_URL;
  if (!u) return;
  const text = `${t.id} — ${TYPES[t.type]} — ${t.name} <${t.email}>\nBudget : ${BUDGETS[t.budget]} · Délai : ${DELAIS[t.deadline]}\n\n${t.message.slice(0, 600)}`;
  if (/discord(app)?\.com\/api\/webhooks\//.test(u)) {
    await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: '⚔ **Nouveau ticket** ' + text.slice(0, 1800) }) });
  } else {
    await fetch(u, { method: 'POST', headers: { Title: `Nouveau ticket ${t.id}`, Tags: 'crossed_swords', Priority: t.priority === 'haute' ? 'high' : 'default' }, body: text });
  }
}

/* --- administration ------------------------------------------------------------ */
async function isAdmin(request, env) {
  const tok = env.ADMIN_TOKEN;
  if (!tok || tok.length < 12) return false;
  const h = request.headers.get('authorization') || '';
  const given = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!given) return false;
  // comparaison à temps constant des empreintes
  const [a, b] = await Promise.all([sha256hex(given), sha256hex(tok)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const parseRow = (r) => {
  const o = { ...r };
  for (const k of ['plan', 'estimate']) if (typeof o[k] === 'string') { try { o[k] = JSON.parse(o[k]); } catch (e) {} }
  for (const k of ['model', 'forge_model']) if (o[k]) o[k] = modelLabel(o[k]);
  return o;
};

async function admin(request, env, url) {
  const v = await visitor(request, env);
  const p = url.pathname.replace(/^\/api\/admin/, '');
  const m = request.method;
  const DB = env.DB;
  const o = request.headers.get('origin');
  if (o && o !== url.origin) return fail(403, 'origine refusée');
  // mauvais mot de passe : compté ; 10 erreurs par quart d'heure, puis porte close
  if (!(await isAdmin(request, env))) {
    const r = await hit(env, `auth:${v}`, 10, 900);
    if (!r.ok) return fail(429, 'trop de tentatives, réessaie dans 15 minutes');
    return fail(401, env.ADMIN_TOKEN ? 'jeton invalide' : 'ADMIN_TOKEN non configuré (npx wrangler secret put ADMIN_TOKEN)');
  }
  const locked = (row) => row && row.n >= 10;
  const LOCKED = () => fail(429, 'trop de tentatives, réessaie dans 15 minutes');

  // tout le tableau de bord en un seul aller-retour vers la base
  if ((p === '/dashboard' || p === '/overview') && m === 'GET') {
    const w = Math.floor(now() / 86400);
    const r = await DB.batch([
      peekStmt(env, `auth:${v}`, 900),
      DB.prepare("SELECT v FROM settings WHERE k = 'forge'"),
      DB.prepare('SELECT status, COUNT(*) AS n FROM tickets GROUP BY status'),
      DB.prepare("SELECT COUNT(*) AS n FROM tickets WHERE created_at >= date('now')"),
      DB.prepare('SELECT COUNT(*) AS n FROM tickets'),
      DB.prepare("SELECT COUNT(*) AS n, SUM(ok) AS ok FROM forges WHERE created_at >= date('now')"),
      DB.prepare('SELECT COUNT(*) AS n FROM forges'),
      DB.prepare('SELECT n FROM hits WHERE k = ?1').bind(`forge:global:${w}`),
      DB.prepare('SELECT t.*, f.plan, f.estimate, f.model AS forge_model FROM tickets t LEFT JOIN forges f ON f.id = t.forge_id ORDER BY t.created_at DESC LIMIT 300'),
      DB.prepare('SELECT n FROM hits WHERE k = ?1').bind(`ai:neurons:${w}`),
    ]);
    const first = (i) => (r[i].results && r[i].results[0]) || null;
    if (locked(first(0))) return LOCKED();
    let status = DEFAULT_STATUS;
    if (first(1)) { try { status = { ...DEFAULT_STATUS, ...JSON.parse(first(1).v) }; } catch (e) {} }
    const fToday = first(5) || {};
    return json({ ok: true, status, labels: { TYPES, BUDGETS, DELAIS, STATUTS },
      tickets: { total: (first(4) || {}).n || 0, today: (first(3) || {}).n || 0, byStatus: Object.fromEntries((r[2].results || []).map((x) => [x.status, x.n])) },
      forge: { today: fToday.n || 0, okToday: fToday.ok || 0, total: (first(6) || {}).n || 0, cap: num(env.FORGE_DAILY_CAP, 150), used: (first(7) || {}).n || 0, model: modelLabel(env.MODEL), prices: TARIFS.afficher, neurons: (first(9) || {}).n || 0, neuronsCap: num(env.AI_NEURONS_DAY, 9000) },
      list: (r[8].results || []).map(({ access_key, ...x }) => parseRow(x)) });
  }
  if (p === '/forges' && m === 'GET') {
    const r = await DB.batch([peekStmt(env, `auth:${v}`, 900), DB.prepare('SELECT * FROM forges ORDER BY created_at DESC LIMIT 200')]);
    if (locked(r[0].results && r[0].results[0])) return LOCKED();
    return json({ ok: true, forges: (r[1].results || []).map(parseRow) });
  }
  // écritures : on vérifie le verrou avant d'agir
  if (m !== 'GET' && locked(await peekStmt(env, `auth:${v}`, 900).first())) return LOCKED();

  if ((p === '/tickets' || p === '/export') && m === 'GET' && locked(await peekStmt(env, `auth:${v}`, 900).first())) return LOCKED();
  if (p === '/tickets' && m === 'GET') {
    const st = url.searchParams.get('status');
    const q = clean(url.searchParams.get('q') || '', 80);
    const where = [], args = [];
    if (st && STATUTS[st]) { where.push(`status = ?${args.length + 1}`); args.push(st); }
    else if (st !== 'tous') where.push("status != 'archive'");
    if (q) { where.push(`(name LIKE ?${args.length + 1} OR email LIKE ?${args.length + 1} OR message LIKE ?${args.length + 1} OR id LIKE ?${args.length + 1})`); args.push(`%${q}%`); }
    const sql = `SELECT t.*, f.plan, f.estimate, f.model AS forge_model FROM tickets t LEFT JOIN forges f ON f.id = t.forge_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY t.created_at DESC LIMIT 200`;
    const r = await DB.prepare(sql).bind(...args).all();
    return json({ ok: true, tickets: r.results.map(({ access_key, ...x }) => parseRow(x)) });
  }
  let mt = p.match(/^\/tickets\/(KAL-\d{6}-[0-9A-F]{4})$/);
  if (mt && m === 'PATCH') {
    const b = await readJson(request);
    const sets = [], args = [];
    if (b.status !== undefined) { if (!STATUTS[b.status]) return fail(400, 'statut inconnu'); sets.push('status'); args.push(b.status); }
    if (b.note !== undefined) { sets.push('note'); args.push(clean(b.note, 5000)); }
    if (b.reply !== undefined) { sets.push('reply'); args.push(clean(b.reply, 1000)); }
    if (!sets.length) return fail(400, 'rien à modifier');
    const sql = `UPDATE tickets SET ${sets.map((k, i) => `${k} = ?${i + 1}`).join(', ')}, updated_at = ?${sets.length + 1} WHERE id = ?${sets.length + 2}`;
    const r = await DB.prepare(sql).bind(...args, iso(), mt[1]).run();
    if (!r.meta || !r.meta.changes) return fail(404, 'ticket introuvable');
    return json({ ok: true });
  }
  if (mt && m === 'DELETE') {
    await DB.prepare('DELETE FROM tickets WHERE id = ?1').bind(mt[1]).run();
    return json({ ok: true });
  }
  mt = p.match(/^\/forges\/(F-[a-z0-9]{10})$/);
  if (mt && m === 'DELETE') {
    await DB.prepare('DELETE FROM forges WHERE id = ?1').bind(mt[1]).run();
    return json({ ok: true });
  }
  if (p === '/status' && m === 'PUT') {
    const b = await readJson(request);
    const note = {};
    for (const l of LANGS) note[l] = clean(b.note && b.note[l], 140);
    const s = { lit: b.lit !== false, note, updated: iso() };
    await DB.prepare("INSERT INTO settings (k, v) VALUES ('forge', ?1) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(JSON.stringify(s)).run();
    return json({ ok: true, status: s });
  }
  if (p === '/export' && m === 'GET') {
    const r = await DB.prepare('SELECT id, created_at, status, type, name, email, budget, deadline, priority, lang, source, message, note, reply FROM tickets ORDER BY created_at DESC').all();
    const cols = ['id', 'created_at', 'status', 'type', 'name', 'email', 'budget', 'deadline', 'priority', 'lang', 'source', 'message', 'note', 'reply'];
    const cell = (v) => { const s = String(v == null ? '' : v); return /^[=+\-@]/.test(s) ? `"'${s.replace(/"/g, '""')}"` : `"${s.replace(/"/g, '""')}"`; };
    const lab = { status: STATUTS, type: TYPES, budget: BUDGETS, deadline: DELAIS };
    const csv = '﻿' + [cols.join(';'), ...r.results.map((x) => cols.map((c) => cell(lab[c] ? lab[c][x[c]] || x[c] : x[c])).join(';'))].join('\r\n');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="tickets-kaliso-${iso().slice(0, 10)}.csv"`, 'cache-control': 'no-store' } });
  }
  return fail(404, 'route inconnue');
}

function adminPage() {
  const nonce = rid(18);
  return new Response(ADMIN_HTML.replaceAll('__NONCE__', nonce), { headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
    'x-robots-tag': 'noindex, nofollow',
    'referrer-policy': 'no-referrer',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
  } });
}

/* --- routeur ------------------------------------------------------------------ */
async function api(request, env, ctx, url) {
  if (!env.DB) return fail(500, 'base D1 non liée (voir wrangler.toml)');
  const p = url.pathname, m = request.method;
  if (p.startsWith('/api/admin/')) return admin(request, env, url);
  if (p === '/api/status' && m === 'GET') {
    const s = await getStatus(env);
    return json({ ok: true, lit: s.lit, note: s.note, updated: s.updated }, 200, { 'cache-control': 'public, max-age=60' });
  }
  if (p === '/api/chat' && m === 'POST') return postChat(request, env, ctx);
  if (p === '/api/forge' && m === 'POST') return postForge(request, env, ctx);
  if (p === '/api/tickets' && m === 'POST') return postTicket(request, env, ctx);
  const mt = p.match(/^\/api\/tickets\/([A-Z0-9-]+)$/);
  if (mt && m === 'GET') return getTicket(env, mt[1], url.searchParams.get('key'));
  return fail(404, 'route inconnue');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (p === '/admin' || p === '/admin/') return adminPage();
    if (p.startsWith('/admin/')) return Response.redirect(url.origin + '/admin', 302);
    if (p.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return preflight(request, env);
      const t0 = Date.now();
      let res;
      try { res = await api(request, env, ctx, url); }
      catch (e) { console.error(e); res = fail(e && e.status ? e.status : 500, e && e.status ? e.message : 'erreur interne'); }
      // durée côté serveur, visible dans l'onglet Réseau du navigateur
      res = new Response(res.body, res);
      res.headers.set('server-timing', `app;dur=${Date.now() - t0}`);
      return p.startsWith('/api/admin/') ? res : withCors(res, request, env);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Introuvable', { status: 404 });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(env.DB.prepare('DELETE FROM hits WHERE exp < ?1').bind(now()).run());
  },
};
