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

/* --- dessin vectoriel (unités de dessin : axe x = 0, y de 0 à 1400) ------- */
const SWORD_H = 1400, SWORD_W = 440;
function swordHalfWidth(y) {
  if (y < 395) return 0;
  if (y < 1080) return 60 - (y - 395) / 685 * 10;
  const t = Math.min(1, (y - 1080) / 315);
  return 50 * Math.pow(1 - t, 0.85);
}
function drawOrnateSword(g) {
  const gray = (v, a = 1) => `rgba(${(v * 255) | 0},${(v * 255) | 0},${(v * 255) | 0},${a})`;
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, v]) => gr.addColorStop(o, gray(v))); return gr; };
  const star8 = (cx, cy, r, rot = 0) => {
    // étoile à 8 branches (khatam) : deux carrés superposés
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = rot + i * Math.PI / 8 - Math.PI / 2, rr = i % 2 ? r * 0.72 : r;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
  };
  const bladePath = (k) => {
    g.beginPath();
    g.moveTo(-swordHalfWidth(396) * k, 395);
    for (let y = 400; y <= 1395; y += 5) g.lineTo(-swordHalfWidth(y) * k, y);
    for (let y = 1395; y >= 400; y -= 5) g.lineTo(swordHalfWidth(y) * k, y);
    g.lineTo(swordHalfWidth(396) * k, 395);
    g.closePath();
  };
  g.lineJoin = 'round'; g.lineCap = 'round';

  /* LAME ---------------------------------------------------------------- */
  bladePath(1); g.fillStyle = lin(-60, 0, 60, 0, [[0, 1], [0.08, 0.95], [0.5, 0.6], [0.92, 0.3], [1, 0.8]]); g.fill();
  bladePath(0.84); g.fillStyle = lin(-50, 0, 50, 0, [[0, 0.82], [0.35, 0.66], [0.5, 0.4], [0.65, 0.3], [1, 0.16]]); g.fill();
  // gorge centrale
  g.beginPath();
  g.moveTo(-15, 520); g.lineTo(-13, 1150); g.lineTo(0, 1250); g.lineTo(13, 1150); g.lineTo(15, 520); g.closePath();
  g.fillStyle = gray(0.14); g.fill();
  g.strokeStyle = gray(0.95); g.lineWidth = 3; g.beginPath(); g.moveTo(-16, 520); g.lineTo(-14, 1150); g.lineTo(0, 1252); g.stroke();
  g.strokeStyle = gray(0.12); g.beginPath(); g.moveTo(16, 520); g.lineTo(14, 1150); g.lineTo(0, 1252); g.stroke();
  // panneau gravé (mandorle sombre) avec entrelacs de zellige
  g.beginPath();
  g.moveTo(0, 520); g.bezierCurveTo(30, 560, 30, 820, 0, 1000); g.bezierCurveTo(-30, 820, -30, 560, 0, 520); g.closePath();
  g.fillStyle = gray(0.06); g.fill();
  g.strokeStyle = gray(1); g.lineWidth = 3.6; g.stroke();
  for (let i = 0; i < 6; i++) {
    const y = 585 + i * 66, s = 1 - i * 0.11;
    star8(0, y, 15 * s, Math.PI / 8); g.strokeStyle = gray(1); g.lineWidth = 4; g.stroke();
    star8(0, y, 6 * s); g.fillStyle = gray(0.92); g.fill();
    // arabesques : boucles en S entre les étoiles
    if (i < 5) {
      g.beginPath(); g.moveTo(0, y + 15 * s);
      g.bezierCurveTo(16 * s, y + 26 * s, 16 * s, y + 40 * s, 0, y + 50 * s);
      g.bezierCurveTo(-16 * s, y + 40 * s, -16 * s, y + 26 * s, 0, y + 15 * s);
      g.strokeStyle = gray(0.9); g.lineWidth = 3.4; g.stroke();
    }
  }
  // ornements le long de la gorge
  [[1045, 5], [1100, 0], [1150, 4], [1185, 3]].forEach(([y, r]) => {
    if (r) { g.beginPath(); g.arc(0, y, r, 0, Math.PI * 2); g.fillStyle = gray(0.95); g.fill(); }
    else { star8(0, y, 10); g.fillStyle = gray(0.95); g.fill(); }
  });
  // reflet spéculaire et fil de lumière
  g.strokeStyle = lin(0, 430, 0, 1320, [[0, 1], [0.6, 0.85], [1, 0.3]]); g.lineWidth = 4;
  g.beginPath(); g.moveTo(-34, 430); g.lineTo(-29, 1100); g.lineTo(-14, 1320); g.stroke();
  // assombrissement vers la pointe
  g.save(); bladePath(1); g.clip();
  const shade = g.createLinearGradient(0, 900, 0, 1400); shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = shade; g.fillRect(-70, 880, 140, 530); g.restore();

  /* CHAPE en arc outrepassé --------------------------------------------- */
  g.beginPath();
  g.moveTo(-50, 378);
  g.bezierCurveTo(-66, 430, -58, 480, 0, 548);
  g.bezierCurveTo(58, 480, 66, 430, 50, 378); g.closePath();
  g.fillStyle = lin(-60, 380, 60, 540, [[0, 0.92], [0.5, 0.62], [1, 0.38]]); g.fill();
  g.strokeStyle = gray(0.12); g.lineWidth = 4; g.stroke();
  g.beginPath(); g.moveTo(-38, 392); g.bezierCurveTo(-50, 435, -44, 472, 0, 522); g.bezierCurveTo(44, 472, 50, 435, 38, 392);
  g.strokeStyle = gray(0.95); g.lineWidth = 2.4; g.stroke();
  star8(0, 446, 20, Math.PI / 8); g.fillStyle = gray(0.95); g.fill(); g.strokeStyle = gray(0.15); g.lineWidth = 3; g.stroke();
  g.beginPath(); g.arc(0, 446, 6, 0, Math.PI * 2); g.fillStyle = gray(0.12); g.fill();
  [[-22, 492], [22, 492], [0, 506]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 3.2, 0, Math.PI * 2); g.fillStyle = gray(0.95); g.fill(); });

  /* GARDE : quillons en croissant, crochets, pointes -------------------- */
  [-1, 1].forEach((sd) => {
    g.save(); g.scale(sd, 1);
    // crochets inférieurs
    g.beginPath(); g.moveTo(46, 396); g.quadraticCurveTo(96, 404, 118, 474); g.quadraticCurveTo(76, 432, 40, 420); g.closePath();
    g.fillStyle = lin(40, 400, 118, 474, [[0, 0.82], [1, 0.45]]); g.fill(); g.strokeStyle = gray(0.12); g.lineWidth = 3; g.stroke();
    // petites pointes supérieures
    g.beginPath(); g.moveTo(34, 352); g.quadraticCurveTo(50, 330, 74, 296); g.quadraticCurveTo(62, 334, 60, 352); g.closePath();
    g.fillStyle = gray(0.86); g.fill(); g.strokeStyle = gray(0.12); g.lineWidth = 2.5; g.stroke();
    // quillon principal en croissant
    g.beginPath(); g.moveTo(52, 349); g.quadraticCurveTo(132, 352, 210, 310); g.quadraticCurveTo(142, 394, 52, 400); g.closePath();
    g.fillStyle = lin(0, 312, 0, 400, [[0, 0.98], [0.45, 0.72], [1, 0.32]]); g.fill();
    g.strokeStyle = gray(0.1); g.lineWidth = 3.5; g.stroke();
    g.beginPath(); g.moveTo(58, 372); g.quadraticCurveTo(136, 372, 198, 322);
    g.strokeStyle = gray(1); g.lineWidth = 2.2; g.stroke();
    // perles sur le quillon
    [[96, 380], [132, 368], [164, 352]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y + 6, 3, 0, Math.PI * 2); g.fillStyle = gray(0.15); g.fill(); });
    g.restore();
  });
  // bloc central + médaillon étoilé
  g.beginPath(); g.roundRect(-58, 344, 116, 58, 10);
  g.fillStyle = lin(0, 344, 0, 402, [[0, 0.95], [1, 0.5]]); g.fill(); g.strokeStyle = gray(0.1); g.lineWidth = 3.5; g.stroke();
  star8(0, 373, 24, Math.PI / 8); g.fillStyle = gray(1); g.fill(); g.strokeStyle = gray(0.15); g.lineWidth = 3; g.stroke();
  star8(0, 373, 11); g.fillStyle = gray(0.25); g.fill();

  /* COLLETS + POIGNÉE gainée -------------------------------------------- */
  g.beginPath(); g.roundRect(-25, 320, 50, 26, 5);
  g.fillStyle = lin(-25, 0, 25, 0, [[0, 0.95], [0.5, 0.7], [1, 0.4]]); g.fill(); g.strokeStyle = gray(0.1); g.lineWidth = 3; g.stroke();
  g.strokeStyle = gray(0.2); g.lineWidth = 2; g.beginPath(); g.moveTo(-23, 333); g.lineTo(23, 333); g.stroke();
  const gw = (y) => 15 + Math.sin((y - 150) / 172 * Math.PI) * 3.5;
  g.beginPath(); g.moveTo(-gw(150), 150);
  for (let y = 150; y <= 322; y += 4) g.lineTo(-gw(y), y);
  for (let y = 322; y >= 150; y -= 4) g.lineTo(gw(y), y);
  g.closePath(); g.fillStyle = lin(-19, 0, 19, 0, [[0, 0.36], [0.4, 0.22], [1, 0.06]]); g.fill();
  for (let y = 158; y < 316; y += 22) {
    const w = gw(y);
    g.strokeStyle = gray(0.85); g.lineWidth = 7; g.beginPath(); g.moveTo(-w, y); g.quadraticCurveTo(0, y + 7, w, y + 4); g.stroke();
    g.strokeStyle = gray(0.02); g.lineWidth = 4; g.beginPath(); g.moveTo(-w, y + 10); g.quadraticCurveTo(0, y + 17, w, y + 14); g.stroke();
  }
  g.beginPath(); g.roundRect(-21, 128, 42, 24, 5);
  g.fillStyle = lin(-21, 0, 21, 0, [[0, 0.95], [0.5, 0.68], [1, 0.38]]); g.fill(); g.strokeStyle = gray(0.1); g.lineWidth = 3; g.stroke();
  [-10, 0, 10].forEach((x) => { g.beginPath(); g.arc(x, 140, 2.6, 0, Math.PI * 2); g.fillStyle = gray(0.15); g.fill(); });

  /* POMMEAU : étoile à 8 branches + fleuron ----------------------------- */
  g.beginPath(); g.moveTo(0, 0); g.lineTo(9, 36); g.lineTo(-9, 36); g.closePath(); g.fillStyle = gray(0.92); g.fill();
  g.strokeStyle = gray(0.1); g.lineWidth = 2.5; g.stroke();
  g.beginPath(); g.roundRect(-12, 118, 24, 12, 4); g.fillStyle = gray(0.6); g.fill();
  star8(0, 80, 48, Math.PI / 8);
  const rg = g.createRadialGradient(-14, 62, 4, 0, 80, 52); rg.addColorStop(0, gray(1)); rg.addColorStop(0.6, gray(0.66)); rg.addColorStop(1, gray(0.36));
  g.fillStyle = rg; g.fill(); g.strokeStyle = gray(0.08); g.lineWidth = 4; g.stroke();
  star8(0, 80, 34, Math.PI / 8); g.strokeStyle = gray(0.25); g.lineWidth = 2.4; g.stroke();
  g.beginPath(); g.arc(0, 80, 18, 0, Math.PI * 2); g.fillStyle = gray(0.22); g.fill();
  star8(0, 80, 12); g.fillStyle = gray(0.95); g.fill();
  g.beginPath(); g.arc(0, 80, 3.5, 0, Math.PI * 2); g.fillStyle = gray(0.1); g.fill();
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
    // pommeau à gauche, pointe à droite (le haut du dessin reçoit la lumière)
    const sc = pw / SWORD_H;
    hg.setTransform(0, sc * k, sc * k, 0, 0, hi.height / 2);
  } else {
    const sc = ph / SWORD_H;
    hg.setTransform(sc * k, 0, 0, sc * k, hi.width / 2, 0);
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
      setFont(clamp(W / 150, 6.5, 11));
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
    this.uBlade = 400 / SWORD_H;
    this.guardHalf = 215 / SWORD_H * this.L;
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
