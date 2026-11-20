/* ==========================================================================
   KALISO sur le web
   - lire un site dont le visiteur donne l'adresse (gratuit : le Worker va
     chercher la page et n'en garde que le texte utile)
   - chercher un nom d'entreprise sur le web (facultatif : il faut une clé
     Tavily, offre gratuite de 1 000 recherches par mois → secret TAVILY_API_KEY)
   Tout ce qui revient du web est traité comme des données, jamais comme des
   consignes (voir le prompt de KALISO).
   ========================================================================== */
const TLD = 'com|fr|ma|dz|tn|be|ch|ca|es|de|it|pt|nl|uk|eu|io|dev|net|org|co|app|shop|store|art|studio|design|agency|tech|ai|me|info|biz|xyz|site|online|pro|paris|lyon';
const URL_RX = new RegExp(`\\bhttps?:\\/\\/[^\\s<>"')\\]]+|(?<![@\\w.-])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+(?:${TLD})\\b(?:\\/[^\\s<>"')\\]]*)?`, 'gi');

// la première adresse de site citée dans un message (les emails sont ignorés)
export function findUrl(text) {
  const m = String(text || '').match(URL_RX);
  if (!m) return null;
  let u = m[0].replace(/[.,;:!?»]+$/, '');
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return null;
    const h = url.hostname;
    if (h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':') || /\.(local|internal|lan)$/.test(h)) return null;
    return url.toString();
  } catch (e) { return null; }
}

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch (e) { return ' '; } })
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch (e) { return ' '; } });
const strip = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const meta = (html, name) => {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  const tag = (html.match(re) || [])[0] || '';
  return strip((tag.match(/content=["']([^"']*)["']/i) || [])[1] || '');
};

// lit une page et en tire l'essentiel : titre, description, intertitres, premiers paragraphes
export async function readSite(url, max = 2400) {
  let res;
  try {
    res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; KALISO/1.0; assistant de projet de Sofiene Lamsouni)', accept: 'text/html,application/xhtml+xml', 'accept-language': 'fr,en;q=0.8' },
      signal: AbortSignal.timeout(7000),
    });
  } catch (e) { return null; }
  if (!res.ok || !/html/i.test(res.headers.get('content-type') || '')) return null;
  // on ne lit que le début de la page (≈ 600 Ko)
  const rd = res.body.getReader(), dec = new TextDecoder();
  let html = '';
  while (html.length < 600000) { const { value, done } = await rd.read(); if (done) break; html += dec.decode(value, { stream: true }); }
  try { rd.cancel(); } catch (e) {}
  html = html.replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const title = strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const desc = meta(html, 'description') || meta(html, 'og:description');
  const site = meta(html, 'og:site_name');
  const heads = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((m) => strip(m[1])).filter((x) => x.length > 2 && x.length < 140);
  const paras = [...html.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => strip(m[2])).filter((x) => x.length > 40);
  const seen = new Set();
  const uniq = (arr) => arr.filter((x) => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const parts = [
    title && `Titre : ${title}`,
    site && `Nom : ${site}`,
    desc && `Description : ${desc}`,
    heads.length && `Intertitres : ${uniq(heads).slice(0, 14).join(' | ')}`,
    paras.length && `Texte : ${uniq(paras).slice(0, 12).join(' ')}`,
  ].filter(Boolean);
  const text = parts.join('\n').slice(0, max);
  if (text.length < 40) return null;
  return { kind: 'site', label: new URL(res.url || url).hostname.replace(/^www\./, ''), url: res.url || url, text };
}

// recherche web (Tavily) : les 4 premiers résultats, résumés
export async function webSearch(env, query, max = 2400) {
  if (!env.TAVILY_API_KEY) return null;
  let j;
  try {
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.TAVILY_API_KEY}` },
      body: JSON.stringify({ query, search_depth: 'basic', max_results: 4, include_answer: false }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    j = await r.json();
  } catch (e) { return null; }
  const results = (j && j.results) || [];
  if (!results.length) return null;
  const text = results.map((x) => `- ${strip(x.title)} (${(() => { try { return new URL(x.url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } })()}) : ${strip(x.content).slice(0, 500)}`).join('\n').slice(0, max);
  return { kind: 'search', label: query, url: results[0].url, text, links: results.slice(0, 4).map((x) => x.url) };
}

// ce que le navigateur renvoie à chaque message (sources déjà lues) : vérifié et borné
export function readWeb(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(-4).map((w) => ({
    kind: w && w.kind === 'search' ? 'search' : 'site',
    label: String((w && w.label) || '').slice(0, 120),
    text: String((w && w.text) || '').slice(0, 2400),
  })).filter((w) => w.label && w.text.length > 20);
}
