/* ==========================================================================
   FORGE — écran de chargement
   Une épée ornementée (dessin original : pommeau en étoile à 8 branches, poignée
   gainée, garde en croissant, chape en arc outrepassé, lame gravée d'entrelacs
   de zellige) est dessinée en vectoriel, convertie en glyphes ASCII, puis forgée
   du pommeau à la pointe : c'est la barre de progression. À 100 %, elle tranche l'écran.
   ========================================================================== */
const FORGE_BONE = [233, 230, 221], FORGE_WHITE = [255, 255, 255];
const FORGE_HOT = '#&$X%@';
const FORGE_SPARK = "*+'.`,:";
const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rgbs = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/* --- dessin vectoriel : cimeterre (unités de dessin, la lame descend en +y) -
   Lame courbe de type kilij : élargissement (yelman) et faux tranchant vers la
   pointe, dos ajouré d'arabesques (vrais vides), gorge, garde à boules et
   chapes, poignée gainée à bagues d'acier, pommeau recourbé et dragonne.       */
const SCIM = (() => {
  const L = 980, Y0 = 396, N = 260;
  const P = [];
  let x = 0, y = Y0;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const th = 0.66 * Math.pow(s, 1.65);              // la courbe se creuse vers la pointe
    P.push({ s, x, y, tx: -Math.sin(th), ty: Math.cos(th), nx: Math.cos(th), ny: Math.sin(th) });
    x += -Math.sin(th) * L / N; y += Math.cos(th) * L / N;
  }
  // demi-largeurs : côté tranchant (convexe, +n) et côté dos (concave, -n)
  const edge = (s) => {
    const e = 44 + 34 * Math.pow(Math.min(s, 0.86), 1.5);
    return s < 0.86 ? e : e * Math.pow(Math.max(0, 1 - (s - 0.86) / 0.14), 1.25);
  };
  const back = (s) => {
    if (s < 0.6) return 36;
    if (s < 0.635) return 36 + (s - 0.6) / 0.035 * 52;   // épaulement du yelman
    if (s < 0.74) return 88;
    return 88 * Math.max(0, 1 - (s - 0.74) / 0.26);       // faux tranchant jusqu'à la pointe
  };
  const at = (s) => {
    const f = Math.max(0, Math.min(N, s * N)), i = Math.min(N - 1, Math.floor(f)), k = f - i;
    const a = P[i], b = P[i + 1];
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, nx: a.nx + (b.nx - a.nx) * k, ny: a.ny + (b.ny - a.ny) * k };
  };
  const off = (s, d) => { const p = at(s); return [p.x + p.nx * d, p.y + p.ny * d]; };
  const E = P.map((p) => off(p.s, edge(p.s))), B = P.map((p) => off(p.s, -back(p.s)));
  // encombrement (lame + monture + dragonne)
  let xmin = -96, xmax = 196, ymin = 76, ymax = 0;
  [...E, ...B].forEach(([px, py]) => { xmin = Math.min(xmin, px); xmax = Math.max(xmax, px); ymax = Math.max(ymax, py); });
  return { L, Y0, P, edge, back, at, off, E, B, xmin: xmin - 8, xmax: xmax + 8, ymin, ymax: ymax + 8 };
})();
const SWORD_H = SCIM.ymax - SCIM.ymin, SWORD_W = SCIM.xmax - SCIM.xmin, SWORD_XC = (SCIM.xmin + SCIM.xmax) / 2;

function drawOrnateSword(g) {
  const S = SCIM;
  const gray = (v, a = 1) => `rgba(${(v * 255) | 0},${(v * 255) | 0},${(v * 255) | 0},${a})`;
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, v]) => gr.addColorStop(o, gray(v))); return gr; };
  const star8 = (cx, cy, r, rot = 0) => {
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = rot + i * Math.PI / 8 - Math.PI / 2, rr = i % 2 ? r * 0.72 : r;
      i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g.closePath();
  };
  // chemin entre deux décalages (d0 -> d1) le long de la lame, de s0 à s1
  const band = (s0, s1, d0, d1) => {
    g.beginPath();
    const n = Math.max(8, Math.round((s1 - s0) * 200));
    for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; const [x, y] = S.off(s, d0(s)); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let i = n; i >= 0; i--) { const s = s0 + (s1 - s0) * i / n; const [x, y] = S.off(s, d1(s)); g.lineTo(x, y); }
    g.closePath();
  };
  const curve = (s0, s1, d) => {
    g.beginPath();
    const n = Math.max(8, Math.round((s1 - s0) * 240));
    for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; const [x, y] = S.off(s, d(s)); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  };
  g.lineJoin = 'round'; g.lineCap = 'round';

  /* LAME ------------------------------------------------------------------ */
  // silhouette
  g.beginPath(); S.E.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); for (let i = S.B.length - 1; i >= 0; i--) g.lineTo(S.B[i][0], S.B[i][1]); g.closePath();
  g.fillStyle = gray(0.5); g.fill();
  g.save(); g.clip();
  // méplat : clair côté tranchant, plus sombre vers le dos
  band(0, 1, (s) => S.edge(s), (s) => S.edge(s) * 0.1); g.fillStyle = gray(0.72); g.fill();
  band(0, 1, (s) => S.edge(s) * 0.1, (s) => -S.back(s)); g.fillStyle = gray(0.44); g.fill();
  // biseau du tranchant (fil de lumière) et ombre portée vers le dos
  band(0, 1, (s) => S.edge(s), (s) => S.edge(s) - 13); g.fillStyle = gray(0.96); g.fill();
  band(0, 1, (s) => S.edge(s) - 13, (s) => S.edge(s) - 17); g.fillStyle = gray(0.3); g.fill();
  // gorge le long du tranchant
  band(0.03, 0.58, (s) => S.edge(s) * 0.68 + 4, (s) => S.edge(s) * 0.68 - 4); g.fillStyle = gray(0.12); g.fill();
  curve(0.03, 0.58, (s) => S.edge(s) * 0.68 + 5); g.strokeStyle = gray(1); g.lineWidth = 2.6; g.stroke();
  // reflet spéculaire sur le méplat
  curve(0.05, 0.84, (s) => S.edge(s) * 0.86); g.strokeStyle = gray(1, 0.9); g.lineWidth = 3.4; g.stroke();
  // faux tranchant du yelman (biseau sur le dos, vers la pointe)
  band(0.74, 1, (s) => -S.back(s), (s) => -S.back(s) + 12); g.fillStyle = gray(0.9); g.fill();
  g.restore();
  // contour net de la lame
  g.beginPath(); S.E.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); for (let i = S.B.length - 1; i >= 0; i--) g.lineTo(S.B[i][0], S.B[i][1]); g.closePath();
  g.strokeStyle = gray(0.08); g.lineWidth = 3; g.stroke();

  /* AJOUR : on évide une bande le long du dos, puis on y redessine un
     entrelacs d'arabesques en métal (les vides restent transparents)     */
  const inner = (s) => -S.back(s) + 9;                                   // rail du dos
  const depth = (s) => -S.back(s) + 0.66 * (S.back(s) + S.edge(s));
  const s0 = 0.07, s1 = 0.9;
  g.save();
  g.globalCompositeOperation = 'destination-out';
  band(s0, s1, inner, depth); g.fillStyle = '#000'; g.fill();
  g.restore();
  // repères dans la bande : u le long (unités), v en travers (0 = rail du dos, 1 = rail intérieur)
  const bp = (s, v) => S.off(s, inner(s) + (depth(s) - inner(s)) * v);
  const sOf = (u) => u / S.L;
  const poly = (fn, a, b, n) => { g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = fn(a + (b - a) * i / n); i ? g.lineTo(x, y) : g.moveTo(x, y); } };
  g.save();
  band(s0, s1, inner, depth); g.clip();
  g.strokeStyle = gray(0.9); g.fillStyle = gray(0.9);
  // rails (cadre de l'ajour)
  curve(s0, s1, inner); g.lineWidth = 7; g.stroke();
  curve(s0, s1, depth); g.lineWidth = 6; g.stroke();
  // deux tiges entrelacées (en opposition de phase) : une chaîne de médaillons
  const U0 = s0 * S.L, U1 = s1 * S.L, per = 92, amp = 0.36;
  const vine = (ph) => (u) => bp(sOf(u), 0.5 + amp * Math.sin((u - U0) / per * Math.PI * 2 + ph));
  [0, Math.PI].forEach((ph) => { poly(vine(ph), U0, U1, 900); g.lineWidth = 6.5; g.stroke(); });
  // volute : spirale dans l'espace de la bande (centre uc/vc, rayons ru en unités, rv en fraction)
  const volute = (uc, vc, ru, rv, a0, sense) => {
    poly((t) => {
      const a = a0 + sense * t * Math.PI * 2.1, r = 1 - 0.8 * t;
      return bp(sOf(uc + Math.cos(a) * ru * r), vc + Math.sin(a) * rv * r);
    }, 0, 1, 60);
    g.lineWidth = 4.6; g.stroke();
    const a = a0 + sense * Math.PI * 2.1, [x, y] = bp(sOf(uc + Math.cos(a) * ru * 0.2), vc + Math.sin(a) * rv * 0.2);
    g.beginPath(); g.arc(x, y, 3.6, 0, Math.PI * 2); g.fill();
  };
  for (let k = 0, u = U0; u <= U1 + 1; k++, u = U0 + k * per / 2) {
    // croisement des tiges : rosace (anneau + bouton)
    const sN = sOf(Math.min(u, U1 - 2)), [cx, cy] = bp(sN, 0.5);
    const rr = Math.max(6, Math.min(13, (depth(sN) - inner(sN)) * 0.16));
    g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.lineWidth = 4; g.stroke();
    g.beginPath(); g.arc(cx, cy, rr * 0.38, 0, Math.PI * 2); g.fill();
    // médaillon suivant : deux volutes affrontées, accrochées à chaque tige
    const uc = u + per / 4;
    if (uc > U1 - per * 0.2) continue;
    volute(uc - per * 0.07, 0.5 - 0.13, per * 0.13, 0.17, Math.PI * 0.9, 1);
    volute(uc + per * 0.07, 0.5 + 0.13, per * 0.13, 0.17, -Math.PI * 0.1, 1);
    // petites feuilles entre les crêtes et les rails
    const up = k % 2 === 0;
    const [fx, fy] = bp(sOf(uc), up ? 0.06 : 0.94);
    const [gx2, gy2] = bp(sOf(uc + per * 0.12), up ? 0.1 : 0.9);
    g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo((fx + gx2) / 2 + 3, (fy + gy2) / 2 - 3, gx2, gy2); g.lineWidth = 4; g.stroke();
  }
  // grande étoile à 8 branches au cœur du yelman
  { const sm = 0.79, [cx, cy] = bp(sm, 0.5), r = (depth(sm) - inner(sm)) * 0.3;
    star8(cx, cy, r, Math.PI / 8); g.lineWidth = 5; g.stroke(); star8(cx, cy, r * 0.55); g.lineWidth = 3.4; g.stroke();
    g.beginPath(); g.arc(cx, cy, r * 0.18, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // liseré sombre autour de l'ajour (lisibilité)
  curve(s0, s1, depth); g.strokeStyle = gray(0.1); g.lineWidth = 2.4; g.stroke();
  // épaulement du yelman : petite encoche
  { const [x, y] = S.off(0.6, -S.back(0.6) - 2); g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore(); }
  // poinçon du forgeron près du talon
  { const [x, y] = S.off(0.035, S.edge(0.035) * 0.15); star8(x, y, 11, Math.PI / 8); g.strokeStyle = gray(0.98); g.lineWidth = 2.6; g.stroke(); }

  /* GARDE : traverse à boules + chapes (langues) ------------------------- */
  // chape basse, posée sur la lame
  g.beginPath(); g.moveTo(-26, 392); g.lineTo(26, 392); g.quadraticCurveTo(24, 440, 0, 486); g.quadraticCurveTo(-24, 440, -26, 392); g.closePath();
  g.fillStyle = lin(-26, 392, 26, 486, [[0, 0.95], [1, 0.45]]); g.fill(); g.strokeStyle = gray(0.08); g.lineWidth = 3; g.stroke();
  star8(0, 426, 13, Math.PI / 8); g.fillStyle = gray(1); g.fill(); g.strokeStyle = gray(0.15); g.lineWidth = 2.2; g.stroke();
  g.beginPath(); g.arc(0, 426, 3.5, 0, Math.PI * 2); g.fillStyle = gray(0.12); g.fill();
  // chape haute, sur la poignée
  g.beginPath(); g.moveTo(-22, 376); g.lineTo(22, 376); g.quadraticCurveTo(20, 344, 4, 318); g.lineTo(-4, 318); g.quadraticCurveTo(-20, 344, -22, 376); g.closePath();
  g.fillStyle = lin(-22, 376, 22, 318, [[0, 0.9], [1, 0.5]]); g.fill(); g.strokeStyle = gray(0.08); g.lineWidth = 2.6; g.stroke();
  // traverse
  g.beginPath(); g.roundRect(-80, 374, 160, 22, 9);
  g.fillStyle = lin(0, 374, 0, 396, [[0, 1], [0.5, 0.7], [1, 0.34]]); g.fill(); g.strokeStyle = gray(0.08); g.lineWidth = 3; g.stroke();
  [-1, 1].forEach((sd) => {
    g.beginPath(); g.arc(sd * 88, 385, 13, 0, Math.PI * 2);
    const rg = g.createRadialGradient(sd * 88 - 4, 380, 2, sd * 88, 385, 14); rg.addColorStop(0, gray(1)); rg.addColorStop(1, gray(0.42));
    g.fillStyle = rg; g.fill(); g.strokeStyle = gray(0.08); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.arc(sd * 66, 385, 4, 0, Math.PI * 2); g.fillStyle = gray(0.15); g.fill();
  });

  /* POIGNÉE : gainage sombre, bagues d'acier en biais, cordage fin -------- */
  const gx = (y) => 12 * Math.pow((374 - y) / 230, 2);             // la poignée s'incline vers le tranchant
  const gw = (y) => 17 - 2.5 * Math.sin((374 - y) / 230 * Math.PI) + Math.max(0, (180 - y) / 30) * 3;
  g.beginPath();
  for (let y = 374; y >= 140; y -= 4) g.lineTo(gx(y) - gw(y), y);
  for (let y = 140; y <= 374; y += 4) g.lineTo(gx(y) + gw(y), y);
  g.closePath();
  g.fillStyle = lin(-20, 0, 30, 0, [[0, 0.3], [0.45, 0.16], [1, 0.05]]); g.fill();
  g.save(); g.clip();
  for (let y = 360; y > 150; y -= 8) {                              // cordage
    g.strokeStyle = gray(0.34); g.lineWidth = 2; g.beginPath(); g.moveTo(gx(y) - 22, y + 5); g.lineTo(gx(y) + 22, y - 3); g.stroke();
  }
  [338, 286, 234, 184].forEach((y) => {                               // bagues d'acier
    g.beginPath(); g.moveTo(gx(y) - 24, y + 9); g.lineTo(gx(y) + 24, y - 5); g.lineTo(gx(y) + 24, y - 19); g.lineTo(gx(y) - 24, y - 5); g.closePath();
    g.fillStyle = lin(gx(y) - 24, 0, gx(y) + 24, 0, [[0, 1], [0.5, 0.78], [1, 0.42]]); g.fill();
  });
  g.restore();
  g.beginPath();
  for (let y = 374; y >= 140; y -= 4) g.lineTo(gx(y) - gw(y), y);
  for (let y = 140; y <= 374; y += 4) g.lineTo(gx(y) + gw(y), y);
  g.closePath(); g.strokeStyle = gray(0.06); g.lineWidth = 3; g.stroke();

  /* POMMEAU recourbé (crosse « tête d'oiseau ») -------------------------- */
  g.beginPath();
  g.moveTo(gx(150) - 20, 150);
  g.quadraticCurveTo(-14, 100, 22, 86);
  g.quadraticCurveTo(58, 74, 76, 104);
  g.quadraticCurveTo(84, 122, 66, 132);
  g.quadraticCurveTo(46, 124, 38, 140);
  g.lineTo(gx(150) + 22, 152);
  g.closePath();
  g.fillStyle = lin(-10, 86, 70, 140, [[0, 1], [0.5, 0.74], [1, 0.36]]); g.fill();
  g.strokeStyle = gray(0.06); g.lineWidth = 3.5; g.stroke();
  g.beginPath(); g.moveTo(0, 116); g.quadraticCurveTo(30, 96, 62, 106); g.strokeStyle = gray(1); g.lineWidth = 2.4; g.stroke();
  star8(30, 112, 9, Math.PI / 8); g.fillStyle = gray(0.2); g.fill();
  g.beginPath(); g.arc(66, 118, 5, 0, Math.PI * 2); g.fillStyle = gray(0.1); g.fill();   // œillet de la dragonne

  /* DRAGONNE : cordon tressé et gland à franges -------------------------- */
  g.beginPath(); g.moveTo(66, 118); g.bezierCurveTo(110, 120, 126, 150, 150, 168);
  g.strokeStyle = gray(0.62); g.lineWidth = 6; g.stroke();
  g.strokeStyle = gray(0.2); g.lineWidth = 2; g.setLineDash([5, 6]); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.ellipse(156, 174, 11, 9, 0.7, 0, Math.PI * 2); g.fillStyle = gray(0.88); g.fill(); g.strokeStyle = gray(0.1); g.lineWidth = 2.4; g.stroke();
  for (let i = -4; i <= 4; i++) {
    g.beginPath(); g.moveTo(160 + i * 2, 180 + Math.abs(i)); g.quadraticCurveTo(170 + i * 4, 205, 172 + i * 5.5, 236 - Math.abs(i) * 2);
    g.strokeStyle = gray(i % 2 ? 0.5 : 0.82); g.lineWidth = 2.6; g.stroke();
  }
}

/* --- conversion en grille ASCII ------------------------------------------ */
// densité par luminance, et glyphes de contour (- / | \) là où l'image a un bord net
function swordToCells(cols, rows, cw, lh, horiz) {
  const S = 3; // échantillons par cellule et par axe
  const k = 2; // suréchantillonnage du dessin
  const pw = cols * cw, ph = rows * lh;
  const hi = document.createElement('canvas');
  hi.width = Math.ceil(pw * k); hi.height = Math.ceil(ph * k);
  const hg = hi.getContext('2d');
  if (horiz) {
    // pommeau à gauche, pointe à droite : la courbe remonte, le tranchant regarde vers le bas
    const sc = pw / SWORD_H;
    hg.setTransform(0, sc * k, sc * k, 0, -SCIM.ymin * sc * k, hi.height / 2 - SWORD_XC * sc * k);
  } else {
    const sc = ph / SWORD_H;
    hg.setTransform(sc * k, 0, 0, sc * k, hi.width / 2 - SWORD_XC * sc * k, -SCIM.ymin * sc * k);
  }
  drawOrnateSword(hg);
  const lo = document.createElement('canvas');
  lo.width = cols * S; lo.height = rows * S;
  const lg = lo.getContext('2d');
  lg.imageSmoothingEnabled = true; lg.imageSmoothingQuality = 'high';
  lg.drawImage(hi, 0, 0, lo.width, lo.height);
  const px = lg.getImageData(0, 0, lo.width, lo.height).data;
  const A = new Float32Array(cols * rows), L = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let sa = 0, sl = 0;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const o = ((r * S + j) * lo.width + c * S + i) * 4, a = px[o + 3] / 255;
      sa += a; sl += (px[o] / 255) * a;
    }
    A[r * cols + c] = sa / (S * S); L[r * cols + c] = sa > 0.001 ? sl / sa : 0;
  }
  const V = (c, r) => (c < 0 || r < 0 || c >= cols || r >= rows) ? 0 : L[r * cols + c] * A[r * cols + c];
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = A[r * cols + c];
    if (a < 0.14) continue;
    const l = L[r * cols + c];
    // gradient de Sobel (en unités physiques : les cellules sont plus hautes que larges)
    const gx = (V(c + 1, r - 1) + 2 * V(c + 1, r) + V(c + 1, r + 1) - V(c - 1, r - 1) - 2 * V(c - 1, r) - V(c - 1, r + 1)) / cw;
    const gy = (V(c - 1, r + 1) + 2 * V(c, r + 1) + V(c + 1, r + 1) - V(c - 1, r - 1) - 2 * V(c, r - 1) - V(c + 1, r - 1)) / lh;
    const mag = Math.hypot(gx, gy) * lh;
    let ch;
    if ((a < 0.55 && mag > 0.3) || mag > 2.4) {
      // orientation du bord (perpendiculaire au gradient), axe y vers le bas
      let phi = (Math.atan2(gy, gx) * 180 / Math.PI + 90 + 360) % 180;
      ch = phi < 22.5 || phi >= 157.5 ? '-' : phi < 67.5 ? '\\' : phi < 112.5 ? '|' : '/';
    } else {
      const idx = Math.max(1, Math.round(Math.pow(l, 1.1) * (RAMP.length - 1)));
      ch = RAMP[idx];
    }
    const edge = ch === '-' || ch === '|' || ch === '/' || ch === '\\';
    cells.push({ c, r, ch, l: Math.min(1, edge ? Math.max(l, 0.55) : l) });
  }
  return cells;
}

class Forge {
  constructor(canvas) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.f = 0;          // front de forge (0 = fleuron du pommeau, 1 = pointe)
    this.lastF = 0;
    this.shine = -1;     // reflet final le long de l'épée
    this.alpha = 1;
    this.lift = 0;       // l'épée se lève avant de trancher
    this.sparks = [];
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.tick = () => this.draw();
    gsap.ticker.add(this.tick);
  }
  get acc() { return ACCENT.bright || ACCENT.rgb; }
  get halo() { return ACCENT.rgb; }
  resize() {
    const dpr = Math.min(DPR(), 2), W = innerWidth, H = innerHeight;
    Object.assign(this, { dpr, W, H });
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    const horiz = this.horiz = W > H * 1.05;
    const g = this.g;
    const setFont = (lh) => {
      this.lh = lh; this.fs = lh * 0.94;
      this.font = `600 ${this.fs.toFixed(2)}px "Geist Mono", ui-monospace, monospace`;
      g.font = this.font;
      this.cw = g.measureText('M').width || this.fs * 0.6;
    };
    if (horiz) {
      // épée couchée : la longueur suit la largeur de l'écran
      const Lp = Math.min(W * 0.86, H * 0.86 / (SWORD_W / SWORD_H) );
      setFont(clamp(W / 172, 6, 11));
      this.cols = Math.floor(Lp / this.cw);
      this.rows = Math.ceil(SWORD_W / SWORD_H * this.cols * this.cw / this.lh) + 1;
      this.L = this.cols * this.cw;
      this.x0 = Math.round(W / 2 - this.L / 2);
      this.y0 = Math.round(H * 0.47 - this.rows * this.lh / 2);
    } else {
      const mobile = W < 700;
      const Hs = H * (mobile ? 0.7 : 0.86);
      setFont(clamp(Hs / 104, 6, 10));
      this.rows = Math.floor(Hs / this.lh);
      this.cols = Math.ceil(SWORD_W * (this.rows * this.lh / SWORD_H) / this.cw) + 2;
      this.L = this.rows * this.lh;
      this.x0 = Math.round(W / 2 - this.cols * this.cw / 2);
      this.y0 = Math.round(H * (mobile ? 0.1 : 0.07));
    }
    this.cells = swordToCells(this.cols, this.rows, this.cw, this.lh, horiz);
    // tranches perpendiculaires à l'axe de l'épée (la forge avance tranche par tranche)
    this.nS = horiz ? this.cols : this.rows;
    this.slices = Array.from({ length: this.nS }, () => []);
    this.cells.forEach((cl) => { cl.s = horiz ? cl.c : cl.r; cl.u = cl.s / (this.nS - 1); this.slices[cl.s].push(cl); });
    this.uBlade = (SCIM.Y0 - SCIM.ymin) / SWORD_H;
    this.guardHalf = 130 / SWORD_H * this.L;
    this.bakeAll();
  }
  cellX(cl) { return this.x0 + (cl.c + 0.5) * this.cw; }
  cellY(cl) { return this.y0 + (cl.r + 0.5) * this.lh; }
  finalColor(cl) { return mix3([0, 0, 0], FORGE_BONE, clamp(0.16 + 1.0 * Math.pow(cl.l, 0.85), 0, 1)); }
  layer() {
    const cv = document.createElement('canvas');
    cv.width = this.c.width; cv.height = this.c.height;
    const g = cv.getContext('2d');
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.font = this.font; g.textAlign = 'center'; g.textBaseline = 'middle';
    return { cv, g };
  }
  // calques précalculés : silhouette fantôme, et épée forgée (remplie au fil du refroidissement)
  bakeAll() {
    this.ghost = this.layer();
    this.cells.forEach((cl) => { this.ghost.g.fillStyle = rgbs(FORGE_BONE, 0.05 + 0.07 * cl.l); this.ghost.g.fillText(cl.ch, this.cellX(cl), this.cellY(cl)); });
    this.bake = this.layer();
    this.baked = 0;
  }
  bakeUpTo(n) {
    for (let i = this.baked; i < Math.min(n, this.nS); i++) {
      this.slices[i].forEach((cl) => { this.bake.g.fillStyle = rgbs(this.finalColor(cl), 0.96); this.bake.g.fillText(cl.ch, this.cellX(cl), this.cellY(cl)); });
    }
    this.baked = Math.max(this.baked, Math.min(n, this.nS));
  }
  // position du front le long de l'axe (x si couchée, y si debout)
  frontPos() { return (this.horiz ? this.x0 : this.y0) + (this.f * (this.nS - 1) + 0.5) * (this.horiz ? this.cw : this.lh); }
  frontSlice() { return Math.round(this.f * (this.nS - 1)); }
  emit(n, hot) {
    const sl = this.slices[clamp(this.frontSlice(), 0, this.nS - 1)];
    if (!sl || !sl.length) return;
    for (let i = 0; i < n; i++) {
      const cl = sl[(Math.random() * sl.length) | 0];
      const side = this.horiz ? 1 : (this.cellX(cl) < this.W / 2 ? -1 : 1);
      this.sparks.push({
        x: this.cellX(cl), y: this.cellY(cl),
        vx: this.horiz ? -60 + Math.random() * 260 : side * (40 + Math.random() * 200), vy: -40 - Math.random() * 230,
        life: 0, max: 0.4 + Math.random() * 0.7,
        ch: FORGE_SPARK[(Math.random() * FORGE_SPARK.length) | 0], hot: hot && Math.random() < 0.75,
      });
    }
    if (this.sparks.length > 260) this.sparks.splice(0, this.sparks.length - 260);
  }
  draw() {
    const { g, dpr, W, H, lh } = this;
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    const ACC = this.acc;
    const HOT = 0.02, COOL = 0.11;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const df = this.f - this.lastF; this.lastF = this.f;
    const fp = this.frontPos(), fs = this.frontSlice();
    const live = this.alpha > 0.5 && this.f > 0.003 && this.f < 0.999;
    if (live) {
      if (df > 0) this.emit(Math.min(18, Math.round(df * this.nS * 0.8)), true);
      if (Math.random() < 0.22) this.emit(1, true);
    }
    const cx = this.horiz ? fp : W / 2, cy = this.horiz ? this.y0 + this.rows * lh / 2 : fp;
    if (this.alpha > 0.02 && this.f > 0.003 && this.f < 0.999) {
      const r = this.guardHalf * 1.2;
      const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      const HA = this.halo;
      grd.addColorStop(0, rgbs(HA, 0.3 * this.alpha)); grd.addColorStop(0.4, rgbs(HA, 0.1 * this.alpha)); grd.addColorStop(1, rgbs(HA, 0));
      g.fillStyle = grd; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    this.bakeUpTo(Math.floor((this.f - HOT - COOL) * (this.nS - 1)));
    const ly = -this.lift * lh * (this.horiz ? 10 : 8);
    const T = () => g.setTransform(dpr, 0, 0, dpr, 0, ly * dpr);
    const I = () => g.setTransform(1, 0, 0, 1, 0, ly * dpr);
    g.save();
    g.globalAlpha = this.alpha;
    // silhouette fantôme au-delà du front
    const step = this.horiz ? this.cw : lh;
    g.save(); T(); g.beginPath();
    if (this.horiz) g.rect(fp + step * 0.5, 0, W, H + lh * 12); else g.rect(0, fp + step * 0.5, W, H + lh * 12);
    g.clip(); I(); g.drawImage(this.ghost.cv, 0, 0); g.restore();
    // épée forgée
    g.save(); I(); g.drawImage(this.bake.cv, 0, 0); g.restore();
    T();
    // bande vivante : métal en fusion puis refroidissement
    g.font = this.font; g.textAlign = 'center'; g.textBaseline = 'middle';
    const s1 = Math.min(this.nS - 1, fs + 3);
    for (let i = this.baked; i <= s1; i++) {
      for (const cl of this.slices[i]) {
        const d = this.f - cl.u;
        let ch = cl.ch, col, a, glow = 0;
        if (d < 0) { const k = clamp(1 + d / 0.02, 0, 1); col = mix3(FORGE_BONE, ACC, k); a = 0.07 + k * 0.35; }
        else if (d < HOT) { const k = d / HOT; ch = FORGE_HOT[(Math.random() * FORGE_HOT.length) | 0]; col = mix3(FORGE_WHITE, ACC, k); a = 1; glow = 1 - k * 0.5; }
        else { const k = clamp((d - HOT) / COOL, 0, 1); col = mix3(ACC, this.finalColor(cl), k); a = 0.96; glow = (1 - k) * 0.4; }
        g.fillStyle = rgbs(col, a);
        if (glow > 0.08) { g.shadowColor = rgbs(ACC, (glow * 0.9).toFixed(2)); g.shadowBlur = 12 * glow; } else g.shadowBlur = 0;
        g.fillText(ch, this.cellX(cl), this.cellY(cl));
      }
    }
    g.shadowBlur = 0;
    // reflet final qui parcourt l'épée
    if (this.shine > -0.5) {
      const a0 = Math.max(0, Math.floor((this.shine - 0.06) * (this.nS - 1))), a1 = Math.min(this.nS - 1, Math.ceil((this.shine + 0.06) * (this.nS - 1)));
      for (let i = a0; i <= a1; i++) for (const cl of this.slices[i]) {
        const sh = Math.exp(-Math.pow((cl.u - this.shine) / 0.025, 2));
        if (sh < 0.05) continue;
        g.fillStyle = rgbs(mix3(this.finalColor(cl), FORGE_WHITE, sh), 0.96);
        g.shadowColor = rgbs(ACC, (sh * 0.7).toFixed(2)); g.shadowBlur = 14 * sh;
        g.fillText(cl.ch, this.cellX(cl), this.cellY(cl));
      }
      g.shadowBlur = 0;
    }
    // repère de progression : trait pointillé du front vers le compteur
    if (live) {
      const cp = this.counterPos();
      g.strokeStyle = rgbs(ACC, 0.35); g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath();
      if (this.horiz) { g.moveTo(fp, this.y0 - lh * 0.2); g.lineTo(fp, cp.y + lh * 0.6); }
      else { const sl = this.slices[fs] || []; const xr = sl.reduce((m, cl) => Math.max(m, this.cellX(cl)), W / 2) + this.cw * 1.5; g.moveTo(xr, fp); g.lineTo(cp.x - this.cw, fp); }
      g.stroke(); g.setLineDash([]);
    }
    g.restore();
    // étincelles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.life += dt;
      if (sp.life > sp.max) { this.sparks.splice(i, 1); continue; }
      sp.vy += 520 * dt; sp.vx *= 0.985;
      sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      const k = 1 - sp.life / sp.max;
      g.fillStyle = rgbs(sp.hot ? mix3(FORGE_BONE, ACC, k) : FORGE_BONE, (k * this.alpha).toFixed(2));
      g.fillText(sp.ch, sp.x, sp.y);
    }
  }
  counterPos() {
    return this.horiz
      ? { x: this.frontPos(), y: this.y0 - this.lh * 3.2, ax: -50, ay: -50 }
      : { x: this.W / 2 + this.guardHalf + this.cw * 4, y: this.frontPos(), ax: 0, ay: -50 };
  }
  destroy() {
    gsap.ticker.remove(this.tick);
    window.removeEventListener('resize', this.onResize);
  }
}
