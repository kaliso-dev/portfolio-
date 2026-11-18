/* ==========================================================================
   COVERS — visuels générés (emblèmes héraldiques en ASCII, captures de code)
   Remplaçables par de vraies images via `cover` / `shots` dans la config.
   ========================================================================== */
const MONO = '"Geist Mono", ui-monospace, monospace';
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

function drawEmblem(g, kind) {
  // repère 100 x 100, y vers le bas ; luminance = éclairage du métal
  const lit = g.createRadialGradient(34, 24, 2, 46, 46, 78);
  lit.addColorStop(0, '#ffffff'); lit.addColorStop(0.3, '#c8c8c8'); lit.addColorStop(0.7, '#5c5c5c'); lit.addColorStop(1, '#262626');
  const dark = 'rgba(0,0,0,0.92)';
  g.fillStyle = lit;
  const P = () => g.beginPath();
  switch (kind) {
    case 'sword': {
      P(); g.arc(50, 8, 5, 0, 7); g.fill();
      g.fillRect(47, 12, 6, 15);
      P(); g.moveTo(22, 26); g.lineTo(78, 26); g.lineTo(74, 32); g.lineTo(26, 32); g.closePath(); g.fill();
      P(); g.moveTo(43.5, 32); g.lineTo(56.5, 32); g.lineTo(55, 86); g.lineTo(50, 97); g.lineTo(45, 86); g.closePath(); g.fill();
      g.fillStyle = dark; g.fillRect(49.1, 35, 1.8, 46);
      g.fillStyle = 'rgba(0,0,0,.5)'; for (let y = 13; y < 26; y += 3) g.fillRect(47, y, 6, 1);
      break;
    }
    case 'shield': {
      P(); g.moveTo(14, 9); g.lineTo(86, 9); g.lineTo(86, 44); g.bezierCurveTo(86, 70, 68, 86, 50, 97); g.bezierCurveTo(32, 86, 14, 70, 14, 44); g.closePath(); g.fill();
      g.strokeStyle = dark; g.lineWidth = 2.4;
      P(); g.moveTo(20, 15); g.lineTo(80, 15); g.lineTo(80, 44); g.bezierCurveTo(80, 66, 65, 80, 50, 89); g.bezierCurveTo(35, 80, 20, 66, 20, 44); g.closePath(); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(20, 15, 30, 28); g.fillRect(50, 43, 30, 30);
      g.fillStyle = '#fff'; g.fillRect(46, 15, 8, 70); g.fillRect(20, 39, 60, 8);
      break;
    }
    case 'tower': {
      g.fillRect(27, 27, 46, 70);
      for (let i = 0; i < 5; i++) g.fillRect(27 + i * 9.6, 13, 6.4, 15);
      g.fillStyle = dark;
      P(); g.moveTo(41, 97); g.lineTo(41, 80); g.arc(50, 80, 9, Math.PI, 0); g.lineTo(59, 97); g.closePath(); g.fill();
      g.fillRect(48, 38, 4, 14); g.fillRect(35, 56, 3, 10); g.fillRect(62, 56, 3, 10);
      g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 34; y < 97; y += 7) g.fillRect(27, y, 46, 0.9);
      break;
    }
    case 'crown': {
      P(); g.moveTo(16, 66); g.lineTo(16, 30); g.lineTo(33, 50); g.lineTo(50, 20); g.lineTo(67, 50); g.lineTo(84, 30); g.lineTo(84, 66); g.closePath(); g.fill();
      g.fillRect(14, 64, 72, 18);
      [[16, 27], [50, 16], [84, 27]].forEach(([x, y]) => { P(); g.arc(x, y, 4.5, 0, 7); g.fill(); });
      g.fillStyle = dark; [30, 50, 70].forEach((x) => { P(); g.arc(x, 73, 3.4, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(14, 64, 72, 1.4); g.fillRect(14, 80.6, 72, 1.4);
      break;
    }
    case 'chalice': {
      P(); g.moveTo(22, 12); g.lineTo(78, 12); g.bezierCurveTo(78, 40, 65, 53, 50, 55); g.bezierCurveTo(35, 53, 22, 40, 22, 12); g.closePath(); g.fill();
      g.fillRect(47, 54, 6, 24);
      P(); g.ellipse(50, 65, 7, 3.4, 0, 0, 7); g.fill();
      P(); g.moveTo(30, 92); g.bezierCurveTo(34, 80, 66, 80, 70, 92); g.closePath(); g.fill();
      g.fillRect(28, 91, 44, 4);
      g.fillStyle = dark; g.fillRect(22, 18, 56, 1.6);
      g.fillStyle = '#fff'; P(); g.arc(50, 34, 4, 0, 7); g.fill();
      break;
    }
    case 'key': {
      P(); g.arc(28, 50, 17, 0, 7); g.arc(28, 50, 8, 0, 7, true); g.fill('evenodd');
      g.fillRect(42, 46.5, 50, 7);
      g.fillRect(80, 53, 5, 15); g.fillRect(71, 53, 4, 10); g.fillRect(88, 53, 4, 8);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(42, 49.4, 50, 1.2);
      break;
    }
    case 'helm':
    default: {
      P(); g.moveTo(24, 96); g.lineTo(24, 42); g.bezierCurveTo(24, 14, 76, 14, 76, 42); g.lineTo(76, 96); g.closePath(); g.fill();
      g.fillStyle = dark; g.fillRect(28, 46, 19.5, 3.6); g.fillRect(52.5, 46, 19.5, 3.6);
      for (let y = 60; y < 84; y += 5) for (let x = 56; x < 72; x += 5) { P(); g.arc(x, y, 1.3, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.fillRect(48.5, 26, 3, 66);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(24, 34, 52, 1.2);
      break;
    }
  }
}

function emblemCanvas(kind, S = 260) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); g.scale(S / 100, S / 100);
  drawEmblem(g, kind);
  return c;
}

function sampleLum(src, cols, rows, crop = [0, 0, 1, 1]) {
  const c = document.createElement('canvas'); c.width = cols; c.height = rows;
  const g = c.getContext('2d', { willReadFrequently: true });
  const [x, y, w, hh] = crop;
  g.drawImage(src, x * src.width, y * src.height, w * src.width, hh * src.height, 0, 0, cols, rows);
  const d = g.getImageData(0, 0, cols, rows).data;
  const out = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) out[i] = ((d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255) * (d[i * 4 + 3] / 255);
  return out;
}

function asciiArt(kind, cols = 48, rows = 26) {
  const L = sampleLum(emblemCanvas(kind), cols, rows);
  let s = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) { const v = L[r * cols + c]; s += v < 0.03 ? ' ' : RAMP[clamp(Math.round(v * (RAMP.length - 1)), 1, RAMP.length - 1)]; }
    s += '\n';
  }
  return s;
}

function drawAscii(g, L, cols, rows, x0, y0, cw, lh, hue, opts = {}) {
  g.textBaseline = 'top';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = L[r * cols + c];
      if (v < 0.03) continue;
      const ch = RAMP[clamp(Math.round(v * (RAMP.length - 1)), 1, RAMP.length - 1)];
      g.fillStyle = v > 0.72 ? `rgba(240,236,226,${0.75 + v * 0.25})` : hsl(hue, opts.sat ?? 55, 42 + v * 48, 0.35 + v * 0.65);
      g.fillText(ch, x0 + c * cw, y0 + r * lh);
    }
  }
}

function grain(g, W, H, amt = 14) {
  const id = g.getImageData(0, 0, W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
}

const CODE_NOISE = ['fn forge(blade: &mut Blade) -> Result<()>', 'const oath = await keep.seal(commit);', 'SELECT * FROM armory WHERE edge = $1;', 'git push origin main --follow-tags', 'export default defineConfig({ ...rampart })', 'if (!gate.allow(req)) return deny(429);', 'kubectl rollout status deploy/vigil', 'for (const sigil of registry) sigil.mount();', 'impl Temper for Steel { fn quench(&self) {} }', '$ npm run build && npm run test -- --watch=false'];

function coverBase(p, W, H, glow = 0.75) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, hsl(p.hue, 32, 9)); gr.addColorStop(1, hsl(p.hue, 28, 3));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  gr = g.createRadialGradient(W * 0.5, H * 0.52, 0, W * 0.5, H * 0.52, H * 0.66);
  gr.addColorStop(0, hsl(p.hue, 70, 30, glow)); gr.addColorStop(1, hsl(p.hue, 70, 10, 0));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return [c, g];
}

function makeCover(p, i) {
  if (p.cover) return p.cover;
  const W = 1500, H = 1000;
  const [c, g] = coverBase(p, W, H);
  g.font = `400 14px ${MONO}`; g.fillStyle = hsl(p.hue, 30, 75, 0.07); g.textBaseline = 'top';
  for (let y = 24, k = i; y < H; y += 26, k++) g.fillText(CODE_NOISE[k % CODE_NOISE.length] + '   ' + CODE_NOISE[(k * 3 + 1) % CODE_NOISE.length], 40 - (k % 5) * 30, y);
  const fs = 13, cw = fs * 0.6, lh = fs * 1.02;
  const rows = Math.floor((H * 0.86) / lh), cols = Math.round(rows * (lh / cw));
  const L = sampleLum(emblemCanvas(p.emblem), cols, rows);
  g.font = `500 ${fs}px ${MONO}`;
  drawAscii(g, L, cols, rows, (W - cols * cw) / 2, (H - rows * lh) / 2, cw, lh, p.hue);
  g.font = `500 15px ${MONO}`; g.fillStyle = 'rgba(240,236,226,.8)'; g.textBaseline = 'alphabetic';
  const mx = 110, my = 150;
  g.fillText(p.name + p.ext, mx, my);
  g.fillStyle = 'rgba(240,236,226,.45)';
  g.fillText(`REF. ${pad2(i + 1)} / ${pad2(SITE.projects.length)}`, mx, my + 22);
  g.textAlign = 'right';
  g.fillStyle = 'rgba(240,236,226,.8)'; g.fillText(`${p.year} — ${p.stack[0].toUpperCase()}`, W - mx, my);
  g.fillStyle = 'rgba(240,236,226,.45)'; g.fillText(p.stack.slice(1, 3).join(' / ').toUpperCase(), W - mx, my + 22);
  g.textAlign = 'left';
  g.fillStyle = 'rgba(240,236,226,.3)'; g.font = `300 22px ${MONO}`;
  [[70, 110], [W - 70, 110], [70, H - 110], [W - 70, H - 110]].forEach(([x, y]) => g.fillText('+', x - 7, y + 8));
  grain(g, W, H);
  return c.toDataURL('image/jpeg', 0.9);
}

/* --- captures « produit » ----------------------------------------------- */
const KW = /\b(use|fn|let|const|async|await|return|if|else|for|func|package|export|import|from|def|class|impl|pub|mut|new|true|false|null|undefined|type|interface|groups|rules|expr|labels)\b/g;
function shotCode(p) {
  const W = 1500, H = 1400;
  const [c, g] = coverBase(p, W, H, 0.45);
  const x0 = 120, y0 = 330, w = W - 240, hh = 740;
  g.fillStyle = 'rgba(8,10,8,.92)'; g.strokeStyle = 'rgba(240,236,226,.12)'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(x0, y0, w, hh, 14); g.fill(); g.stroke();
  g.fillStyle = 'rgba(240,236,226,.06)'; g.beginPath(); g.roundRect(x0, y0, w, 52, [14, 14, 0, 0]); g.fill();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, k) => { g.fillStyle = col; g.globalAlpha = 0.75; g.beginPath(); g.arc(x0 + 30 + k * 22, y0 + 26, 6.5, 0, 7); g.fill(); });
  g.globalAlpha = 1;
  g.font = `400 16px ${MONO}`; g.fillStyle = 'rgba(240,236,226,.5)'; g.textAlign = 'center';
  g.fillText(`~/${p.slug} — ${p.stack[0].toLowerCase()}`, x0 + w / 2, y0 + 32);
  g.textAlign = 'left';
  const lines = p.code.split('\n');
  const fs = 21, lh = 33;
  g.font = `400 ${fs}px ${MONO}`;
  const cw = g.measureText('M').width;
  lines.forEach((ln, k) => {
    const y = y0 + 100 + k * lh;
    g.fillStyle = 'rgba(240,236,226,.22)'; g.fillText(String(k + 1).padStart(2, ' '), x0 + 28, y);
    // coloration simple
    const segs = [];
    const re = /(\/\/.*$|#.*$|"[^"]*"|'[^']*'|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]+\b|\s+|.)/g;
    let m;
    while ((m = re.exec(ln))) segs.push(m[0]);
    let x = x0 + 90;
    segs.forEach((s) => {
      let col = 'rgba(240,236,226,.88)';
      if (/^(\/\/|#)/.test(s)) col = 'rgba(240,236,226,.35)';
      else if (/^["'`]/.test(s)) col = '#e8c27a';
      else if (/^\d/.test(s)) col = hsl(p.hue, 80, 68);
      else if (KW.test(s)) col = ACCENT.text;
      else if (/^[A-Z][A-Za-z]+$/.test(s)) col = hsl(p.hue, 70, 72);
      KW.lastIndex = 0;
      g.fillStyle = col; g.fillText(s, x, y); x += cw * s.length;
    });
  });
  const yc = y0 + 100 + lines.length * lh + 10;
  g.fillStyle = ACCENT.text; g.fillText('➜', x0 + 90, Math.min(yc, y0 + hh - 40));
  g.fillStyle = 'rgba(240,236,226,.6)'; g.fillText(`  ${p.slug} git:(main) ✓`, x0 + 90 + cw, Math.min(yc, y0 + hh - 40));
  grain(g, W, H, 10);
  return c.toDataURL('image/jpeg', 0.9);
}

function shotEmblem(p, i) {
  const W = 1500, H = 1400;
  const [c, g] = coverBase(p, W, H, 0.95);
  const fs = 22, cw = fs * 0.6, lh = fs * 1.02;
  const cols = Math.ceil(W / cw), rows = Math.ceil(H / lh);
  const crop = [[0.18, 0.05, 0.64, 0.42], [0.1, 0.35, 0.8, 0.53], [0.25, 0.3, 0.5, 0.33]][i % 3];
  const L = sampleLum(emblemCanvas(p.emblem, 520), cols, rows, crop);
  g.font = `500 ${fs}px ${MONO}`;
  drawAscii(g, L, cols, rows, 0, 0, cw, lh, p.hue, { sat: 65 });
  grain(g, W, H);
  return c.toDataURL('image/jpeg', 0.9);
}

function shotLog(p) {
  const W = 1500, H = 1400;
  const [c, g] = coverBase(p, W, H, 0.35);
  g.font = `400 18px ${MONO}`; g.textBaseline = 'top';
  const fs = 18, lh = 30;
  const rows = 30;
  const steps = ['resolve deps', 'compile core', 'run tests', 'lint', 'bundle', 'sign artifact', 'push image', 'migrate db', 'warm cache', 'health check', 'route traffic', 'notify'];
  for (let k = 0; k < rows; k++) {
    const y = 250 + k * lh;
    const s = steps[k % steps.length];
    const ms = 12 + ((k * 37) % 180);
    g.fillStyle = 'rgba(240,236,226,.32)'; g.fillText(`[${pad2(9 + (k >> 3))}:${pad2((k * 7) % 60)}:${pad2((k * 13) % 60)}]`, 130, y);
    g.fillStyle = 'rgba(240,236,226,.85)'; g.fillText(`${p.slug}::${s}`.padEnd(30, ' '), 290, y);
    const n = 6 + ((k * 5) % 22);
    g.fillStyle = hsl(p.hue, 70, 62); g.fillText('#'.repeat(n), 640, y);
    g.fillStyle = 'rgba(240,236,226,.15)'; g.fillText('.'.repeat(28 - n), 640 + n * fs * 0.6, y);
    g.fillStyle = 'rgba(240,236,226,.5)'; g.fillText(`${ms}ms`.padStart(7, ' '), 1150, y);
    g.fillStyle = ACCENT.text; g.fillText('OK', 1310, y);
  }
  grain(g, W, H, 10);
  return c.toDataURL('image/jpeg', 0.9);
}

const SHOT_CACHE = new Map();
function projectShots(p, i) {
  if (p.shots) return p.shots;
  if (SHOT_CACHE.has(p.slug)) return SHOT_CACHE.get(p.slug);
  const shots = [shotCode(p), shotEmblem(p, i), shotLog(p), shotEmblem(p, i + 1)];
  SHOT_CACHE.set(p.slug, shots);
  return shots;
}

let COVERS = null;
function allCovers() {
  if (!COVERS) COVERS = SITE.projects.map((p, i) => makeCover(p, i));
  return COVERS;
}
