/* ==========================================================================
   UTILS
   ========================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const pad2 = (n) => String(n).padStart(2, '0');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
const HOVER = matchMedia('(hover: hover)').matches;
const isMobile = () => innerWidth <= 1000;
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
const fontsReady = () => Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(2500)]);

gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create('hop', '0.8,0,0.02,1');
CustomEase.create('menuPanel', '0.77,0,0.175,1');
const STAGGER = 0.075;

function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* --- pointer (global) ---------------------------------------------------- */
const POINTER = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, vx: 0, vy: 0, active: false, t: 0 };
window.addEventListener('pointermove', (e) => {
  const now = performance.now();
  const dt = Math.max(1, now - (POINTER.t || now - 16));
  POINTER.vx = (e.clientX - POINTER.x) / dt;
  POINTER.vy = (e.clientY - POINTER.y) / dt;
  POINTER.x = e.clientX; POINTER.y = e.clientY; POINTER.t = now;
  POINTER.nx = (e.clientX / innerWidth) * 2 - 1;
  POINTER.ny = (e.clientY / innerHeight) * 2 - 1;
  POINTER.active = true;
}, { passive: true });

/* --- glyph atlas (partagé par tous les rendus ASCII) ---------------------- */
const RAMP = ' .:;+*xoX#&$'; // trié par encre réelle (Geist Mono 500)
/* --- couleur d'accent (changeable : commande « theme » du terminal) ------ */
const ACCENTS = {
  zellige: { hex: '#127d5f', label: ['vert zellige', 'zellige green', 'أخضر الزليج'] },
  vert: { hex: '#4ade80', label: ['vert terminal', 'terminal green', 'أخضر الطرفية'] },
  ambre: { hex: '#f2a24a', label: ['ambre de forge', 'forge amber', 'كهرمان الكير'] },
  laiton: { hex: '#d9b46a', label: ['laiton de Fès', 'Fez brass', 'نحاس فاس'] },
  majorelle: { hex: '#7b86ff', label: ['bleu Majorelle', 'Majorelle blue', 'أزرق ماجوريل'] },
  marrakech: { hex: '#ec5b43', label: ['rouge Marrakech', 'Marrakech red', 'أحمر مراكش'] },
  // récompense des sept sceaux (07d-secrets.js)
  or: { hex: '#e3b23c', label: ['or des sept sceaux', 'gold of the seven seals', 'ذهب الأختام السبعة'], secret: true },
};
const accentLabel = (k) => { const l = ACCENTS[k].label; return Array.isArray(l) ? (l[LI] || l[0]) : l; };
const sealsDone = () => { try { return JSON.parse(localStorage.getItem('kaliso-seals') || '[]').length >= 7; } catch (e) { return false; } };
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// variante « texte » : même teinte, éclaircie juste assez pour 4,7:1 de contraste sur le fond
function legibleRgb(rgb, bg = [11, 13, 11], target = 4.7) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a) => (lum(a) + 0.05) / (lum(bg) + 0.05);
  let c = rgb.slice();
  for (let i = 0; i < 40 && ratio(c) < target; i++) c = c.map((v) => Math.min(255, v + (255 - v) * 0.04 + 1.5));
  return c.map(Math.round);
}
const ACCENT = { name: 'zellige', hex: ACCENTS.zellige.hex, rgb: hexRgb(ACCENTS.zellige.hex), text: ACCENTS.zellige.hex, bright: hexRgb(ACCENTS.zellige.hex), subs: new Set() };
function setAccent(name, persist = false) {
  const a = ACCENTS[name];
  if (!a || (a.secret && !sealsDone())) return false;
  ACCENT.name = name; ACCENT.hex = a.hex; ACCENT.rgb = hexRgb(a.hex);
  const tx = legibleRgb(ACCENT.rgb);
  ACCENT.text = `rgb(${tx.join(',')})`;
  ACCENT.bright = legibleRgb(ACCENT.rgb, [11, 13, 11], 7.5);
  const st = document.documentElement.style;
  st.setProperty('--acc', a.hex);
  st.setProperty('--acc-rgb', ACCENT.rgb.join(' '));
  st.setProperty('--acc-text', ACCENT.text);
  if (persist) { try { localStorage.setItem('kaliso-accent2', name); } catch (e) {} }
  ACCENT.subs.forEach((fn) => { try { fn(ACCENT); } catch (e) {} });
  return true;
}
(() => {
  let n = (typeof SITE !== 'undefined' && SITE.accent) || 'zellige';
  try { const saved = localStorage.getItem('kaliso-accent2'); if (saved && ACCENTS[saved] && (!ACCENTS[saved].secret || sealsDone())) n = saved; } catch (e) {}
  try { const q = new URLSearchParams(location.search).get('accent'); if (q && ACCENTS[q]) n = q; } catch (e) {}
  setAccent(n);
})();

// Pendant la coupe d'épée, les nouveaux chevaliers ne dessinent pas encore (évite un gel
// du navigateur au milieu de l'animation, le temps que leur shader compile en arrière-plan).
const GLHOLD = { on: false };
let GLYPH_CANVAS = null;
const GLYPH_CACHE = new Map();
// Atlas des glyphes. Sans argument : grand atlas (48x80) pour les usages mipmappés.
// Avec (cw, ch) : atlas dessiné exactement à la taille d'une cellule en pixels écran -> texte net, sans bavure.
function glyphAtlas(cw = 48, ch = 80) {
  const key = cw + 'x' + ch;
  if (GLYPH_CACHE.has(key)) return GLYPH_CACHE.get(key);
  const c = document.createElement('canvas');
  c.width = cw * RAMP.length; c.height = ch;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff';
  const fs = Math.min(ch * 0.82, cw / 0.6);
  g.font = `500 ${fs < 20 ? fs.toFixed(1) : Math.round(fs)}px "Geist Mono", ui-monospace, monospace`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  [...RAMP].forEach((s, i) => g.fillText(s, i * cw + cw / 2, ch * 0.54));
  GLYPH_CACHE.set(key, c);
  if (cw === 48 && ch === 80) GLYPH_CANVAS = c;
  return c;
}

/* --- GLSL partagé -------------------------------------------------------- */
const GLSL_NOISE = /* glsl */`
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i), hash12(i+vec2(1.0,0.0)), u.x), mix(hash12(i+vec2(0.0,1.0)), hash12(i+vec2(1.0,1.0)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; } return s; }
`;

/* --- split text en lignes masquées --------------------------------------- */
function splitLines(el) {
  if (el._text == null) el._text = el.textContent.replace(/\s+/g, ' ').trim();
  const words = el._text.split(' ');
  el.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
  const spans = $$('.w', el);
  const lines = [];
  let top = null;
  spans.forEach((s) => {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 3) { lines.push([]); top = t; }
    lines[lines.length - 1].push(s.textContent);
  });
  el.innerHTML = lines.map((l) => `<span class="line-mask"><span class="line">${esc(l.join(' '))}</span></span>`).join('');
  return $$('.line', el);
}

function prepCopy(root) {
  $$('[data-copy]', root).forEach((el) => {
    const type = el.dataset.copy;
    el._targets = type === 'lines' ? splitLines(el) : [...el.children].map((c) => c.firstElementChild || c);
    gsap.set(el._targets, { yPercent: 100 });
    el._revealed = false;
    el.style.visibility = 'visible';
  });
}

function revealCopy(el, delay = 0, opts = {}) {
  if (!el || !el._targets) return;
  el._revealed = true;
  return gsap.to(el._targets, { yPercent: 0, duration: REDUCED ? 0.01 : (opts.duration || 1), ease: 'power4.out', stagger: opts.stagger ?? STAGGER, delay: REDUCED ? 0 : delay, overwrite: true });
}

function hideCopy(el, opts = {}) {
  if (!el || !el._targets) return;
  return gsap.to(el._targets, { yPercent: -100, duration: opts.duration || 1, ease: 'power4.out', stagger: opts.stagger ?? STAGGER * 0.5, delay: opts.delay || 0, overwrite: true });
}

function resplit(root) {
  $$('[data-copy="lines"]', root).forEach((el) => {
    if (!el._targets) return;
    el._targets = splitLines(el);
    gsap.set(el._targets, { yPercent: el._revealed ? 0 : 100 });
  });
}

/* --- roll hover (mots dupliqués) ----------------------------------------- */
function setupRoll(a) {
  if (a._roll) return;
  const clone = a.cloneNode(true);
  clone.querySelectorAll('.sr-only').forEach((n) => n.remove());
  const text = clone.textContent.trim();
  const words = text.split(/\s+/);
  const line = (hidden) => `<span class="roll-line"${hidden ? ' aria-hidden="true"' : ''}>${words.map((w) => `<span class="roll-word">${esc(w)}</span>`).join(' ')}</span>`;
  const sr = a.querySelector('.sr-only');
  a.innerHTML = `<span class="roll">${line(false)}${line(true)}</span>` + (sr ? sr.outerHTML : '');
  const [top, bottom] = $$('.roll-line', a).map((l) => $$('.roll-word', l));
  gsap.set(bottom, { yPercent: 100 });
  a._roll = true;
  if (!HOVER || REDUCED) return;
  a.addEventListener('pointerenter', () => {
    gsap.to(top, { yPercent: -100, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
    gsap.to(bottom, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
  });
  a.addEventListener('pointerleave', () => {
    gsap.to(top, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
    gsap.to(bottom, { yPercent: 100, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
  });
}

/* --- scramble (effet terminal) ------------------------------------------- */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#$&X;:.';
function scrambleTo(el, text, duration = 0.6) {
  const from = el.textContent;
  const len = Math.max(from.length, text.length);
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1, duration, ease: 'none',
    onUpdate() {
      let out = '';
      for (let i = 0; i < len; i++) {
        const k = i / len;
        if (o.p > k + 0.25) out += text[i] || '';
        else if (o.p > k) out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
        else out += from[i] || '';
      }
      el.textContent = out;
    },
    onComplete() { el.textContent = text; },
  });
}
