/* ==========================================================================
   KNIGHT — chevalier 3D (three.js) rendu en glyphes ASCII
   scène -> render target -> passe ASCII (atlas de glyphes)
   ========================================================================== */
const ASCII_FRAG = /* glsl */`
uniform sampler2D tScene; uniform sampler2D tGlyph; uniform float uN;
uniform vec2 uRes; uniform vec2 uCell; uniform float uTime; uniform float uIntro;
uniform float uFadeY; uniform float uFadeW; uniform vec2 uMouse; uniform float uMouseAmt; uniform float uMouseR;
uniform vec3 uColor; uniform vec3 uAccent; uniform float uAlpha; uniform float uScan; uniform float uGain; uniform float uRaw;
uniform float uSharp; uniform float uEdge;
varying vec2 vUv;
${GLSL_NOISE}
void main(){
  if (uRaw > 0.5) { vec4 r = texture2D(tScene, vUv); gl_FragColor = vec4(vec3(r.r) * r.a, 1.0); return; }
  vec2 frag = vUv * uRes;
  vec2 cell = floor(frag / uCell);
  vec2 cuv = (cell + 0.5) * uCell / uRes;
  vec2 o = uCell / uRes * 0.25;
  vec4 s = texture2D(tScene, cuv + vec2(-o.x, -o.y)) + texture2D(tScene, cuv + vec2(o.x, -o.y))
         + texture2D(tScene, cuv + vec2(-o.x, o.y)) + texture2D(tScene, cuv + vec2(o.x, o.y));
  s *= 0.25;
  float A = s.a;
  float L = A > 0.001 ? s.r / A : 0.0;
  // voisins (1 lecture bilinéaire = moyenne de la cellule voisine)
  vec2 cs = uCell / uRes;
  vec4 nL = texture2D(tScene, cuv - vec2(cs.x, 0.0)), nR = texture2D(tScene, cuv + vec2(cs.x, 0.0));
  vec4 nD = texture2D(tScene, cuv - vec2(0.0, cs.y)), nU = texture2D(tScene, cuv + vec2(0.0, cs.y));
  if (A > 0.001) {
    float dC = s.b / A, mC = s.g / A;
    // accentuation locale (unsharp mask) : relief des lamelles, plis, mailles
    // (rayon 2 cellules : on fait ressortir les volumes, pas le grain)
    vec4 f1 = texture2D(tScene, cuv + cs * vec2(-2.0, -2.0)), f2 = texture2D(tScene, cuv + cs * vec2(2.0, -2.0));
    vec4 f3 = texture2D(tScene, cuv + cs * vec2(-2.0, 2.0)), f4 = texture2D(tScene, cuv + cs * vec2(2.0, 2.0));
    float sa = nL.a + nR.a + nD.a + nU.a + f1.a + f2.a + f3.a + f4.a;
    float Lavg = sa > 0.01 ? (nL.r + nR.r + nD.r + nU.r + f1.r + f2.r + f3.r + f4.r) / sa : L;
    L = L + uSharp * (L - Lavg);
    // contour d'occlusion : la cellule est derrière une pièce plus proche -> trait sombre
    float occ = 0.0, med = 0.0;
    vec4 nb[4]; nb[0] = nL; nb[1] = nR; nb[2] = nD; nb[3] = nU;
    for (int i = 0; i < 4; i++) {
      if (nb[i].a > 0.5) {
        float dn = nb[i].b / nb[i].a, mn = nb[i].g / nb[i].a;
        occ = max(occ, smoothstep(0.012, 0.035, dC - dn));
        med = max(med, step(0.03, abs(mn - mC)) * step(dn, dC + 0.004));
      }
    }
    L *= 1.0 - uEdge * max(occ * 0.6, med * 0.22);
  }
  L = pow(clamp(L * uGain, 0.0, 1.0), 0.9);
  float fade = smoothstep(uFadeY, uFadeY + uFadeW, cuv.y);
  float keep = step(hash12(cell * 1.31 + 7.0), fade * 1.08);
  float t = floor(uTime * 12.0);
  float n = fbm(cell * 0.05 + 3.1);
  float front = uIntro * 1.6 - n - (1.0 - cuv.y) * 0.3;
  float vis = step(0.0, front);
  float edge = vis * (1.0 - smoothstep(0.0, 0.1, front)) * step(uIntro, 0.999);
  vec2 md = (frag - uMouse) / uCell.x;
  float m = (1.0 - smoothstep(0.0, uMouseR, length(md * vec2(1.0, uCell.y / uCell.x)))) * uMouseAmt;
  float idx = floor(L * (uN - 1.0) + 0.5);
  if (A < 0.08 || L < 0.045) idx = 0.0;
  else if (idx < 0.5) idx = 1.0;
  float r1 = hash12(cell + t * 0.37);
  if (idx > 0.5 && r1 < 0.012 + m * 0.85) idx = 1.0 + floor(hash12(cell * 1.7 + t) * (uN - 1.0));
  float sy = fract(uTime * 0.06) * 1.5 - 0.25;
  float sb = (1.0 - smoothstep(0.0, 0.018, abs(sy - cuv.y))) * uScan;
  if (idx > 0.5) idx = min(uN - 1.0, idx + floor(sb * 2.0 + 0.5));
  if (edge > 0.0 && A > 0.08) idx = uN - 1.0 - floor(hash12(cell + t) * 3.0);
  vec2 g = fract(frag / uCell);
  float mask = texture2D(tGlyph, vec2((idx + g.x) / uN, g.y)).r;
  float bright = mix(0.24, 1.0, L) * (1.0 + sb * 0.35);
  vec3 col = mix(uColor * bright, uAccent, clamp(edge * 1.5 + m * 0.3, 0.0, 1.0));
  float a = mask * vis * keep * uAlpha;
  gl_FragColor = vec4(col * a, a);
}`;

const KNIGHT_DEFAULTS = {
  cell: [7, 12], fill: 0.95, frame: [-1.25, 0.8], width: 1.9, wind: 1, tail: 1,
  baseRotY: 0, idle: 0.2, parallax: [0.25, 0.4], spin: 0,
  fadeY: 0.0, fadeW: 0.2, mouse: true, scan: 1, gain: 1.5, sharp: 0.65, edge: 1,
  color: [0.914, 0.902, 0.867], accent: null,
  introSpin: -3 * Math.PI, introScale: 0.25,
};

class KnightASCII {
  constructor(host, opts = {}) {
    this.o = Object.assign({}, KNIGHT_DEFAULTS, opts);
    this.host = host;
    this.introP = 0; this.mx = 0; this.my = 0; this.spinY = 0; this.extraRot = 0; this.mouseAmt = 0;
    this.visible = true; this.dead = false;
    this.canvas = document.createElement('canvas');
    host.appendChild(this.canvas);
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    } catch (e) { this.fallback(); return; }
    const r = this.renderer;
    r.setClearColor(0x000000, 0);
    r.autoClear = false;
    const QUAD_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    this.rt = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false });
    this.sdf = new THREE.ShaderMaterial({
      uniforms: {
        uRes: { value: new THREE.Vector2(4, 4) }, uTime: { value: 0 }, uRotY: { value: 0 }, uRotX: { value: 0 }, uScale: { value: 1 },
        uDist: { value: 6 }, uYc: { value: 0 }, uTan: { value: Math.tan(Math.PI / 12) }, uWind: { value: this.o.wind }, uTail: { value: this.o.tail },
      },
      vertexShader: QUAD_VERT, fragmentShader: KNIGHT_SDF, depthTest: false, depthWrite: false,
    });
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.sdf));
    this.glyph = new THREE.CanvasTexture(glyphAtlas());
    this.glyph.minFilter = THREE.LinearMipmapLinearFilter;
    this.glyphKey = '';
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.rt.texture }, tGlyph: { value: this.glyph }, uN: { value: RAMP.length },
        uRes: { value: new THREE.Vector2(1, 1) }, uCell: { value: new THREE.Vector2(14, 24) },
        uTime: { value: 0 }, uIntro: { value: 0 }, uFadeY: { value: this.o.fadeY }, uFadeW: { value: this.o.fadeW },
        uMouse: { value: new THREE.Vector2(-9999, -9999) }, uMouseAmt: { value: 0 }, uMouseR: { value: 9 },
        uColor: { value: new THREE.Vector3(...this.o.color) }, uAccent: { value: new THREE.Vector3(...(this.o.accent || ACCENT.rgb.map((v) => v / 255))) },
        uAlpha: { value: 1 }, uScan: { value: this.o.scan }, uGain: { value: this.o.gain }, uRaw: { value: 0 }, uSharp: { value: this.o.sharp }, uEdge: { value: this.o.edge },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: ASCII_FRAG, depthTest: false, depthWrite: false,
    });
    this.qscene = new THREE.Scene();
    this.qscene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat));
    this.qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.io = new IntersectionObserver((en) => { this.visible = en[0].isIntersecting; }, { rootMargin: '100px' });
    this.io.observe(host);
    this.t0 = performance.now();
    this.tick = () => this.render();
    gsap.ticker.add(this.tick);
    this.onScroll = () => { this.rectDirty = true; };
    this.canvas.__prep = () => this.render(true);
    this.onAccent = (a) => { if (!this.o.accent) this.mat.uniforms.uAccent.value.set(...a.rgb.map((v) => v / 255)); };
    ACCENT.subs.add(this.onAccent);
    // compilation des shaders en arrière-plan (KHR_parallel_shader_compile si dispo)
    this.ready = false;
    const done = () => { this.ready = true; };
    try {
      if (r.compileAsync) {
        // même cible de rendu qu'au dessin, sinon three compile une autre variante du programme
        r.setRenderTarget(this.rt); const p1 = r.compileAsync(this.scene, this.qcam);
        r.setRenderTarget(null); const p2 = r.compileAsync(this.qscene, this.qcam);
        Promise.all([p1, p2]).then(done, done);
      } else done();
    } catch (e) { done(); }
    window.addEventListener('scroll', this.onScroll, { passive: true });
    if (REDUCED) this.introP = 1;
  }
  fallback() {
    this.dead = true;
    const pre = document.createElement('pre');
    pre.className = 'not-found-ascii';
    pre.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center';
    pre.textContent = asciiArt('helm', 46, 26);
    this.host.appendChild(pre);
  }
  resize() {
    if (this.dead) return;
    const w = Math.max(2, this.host.clientWidth), hh = Math.max(2, this.host.clientHeight);
    const dpr = DPR();
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, hh, false);
    const cell = (typeof this.o.cell === 'function') ? this.o.cell(w, hh) : this.o.cell;
    // cellules alignées sur les pixels écran + atlas dessiné à cette taille exacte
    const cpx = [Math.max(3, Math.round(cell[0] * dpr)), Math.max(5, Math.round(cell[1] * dpr))];
    const rw = Math.min(Math.ceil(w * dpr / cpx[0]) * 2, Math.round(w * dpr)), rh = Math.min(Math.ceil(hh * dpr / cpx[1]) * 2, Math.round(hh * dpr));
    this.rt.setSize(rw, rh);
    this.sdf.uniforms.uRes.value.set(w, hh);
    this.mat.uniforms.uRes.value.set(w * dpr, hh * dpr);
    this.mat.uniforms.uCell.value.set(cpx[0], cpx[1]);
    const gk = cpx.join('x');
    if (gk !== this.glyphKey) {
      this.glyphKey = gk;
      const tex = new THREE.CanvasTexture(glyphAtlas(cpx[0], cpx[1]));
      tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      const old = this.glyph; this.glyph = tex; this.mat.uniforms.tGlyph.value = tex;
      if (old) old.dispose();
    }
    const [y0, y1] = this.o.frame;
    const Hf = y1 - y0, yc = (y0 + y1) / 2;
    const tan = Math.tan(Math.PI / 12);
    let dist = (Hf / 2) / tan / this.o.fill;
    dist = Math.max(dist, (this.o.width / 2) / (tan * (w / hh)) / 0.94);
    this.sdf.uniforms.uDist.value = dist;
    this.sdf.uniforms.uYc.value = yc;
    this.rect = this.canvas.getBoundingClientRect();
  }
  start(delay = 0, duration = 2.5) {
    if (this.dead) return;
    if (!this.ready || GLHOLD.on) { this.pending = [delay, duration]; return; }
    this.pending = null;
    if (REDUCED) { this.introP = 1; this.mat.uniforms.uIntro.value = 1; return; }
    gsap.fromTo(this, { introP: 0 }, { introP: 1, duration, delay, ease: 'power3.out' });
    gsap.fromTo(this.mat.uniforms.uIntro, { value: 0 }, { value: 1, duration: duration * 1.1, delay, ease: 'power2.out' });
  }
  render(force) {
    if (this.dead) return;
    if (!force && (!this.ready || GLHOLD.on)) return;
    if (this.pending) this.start(...this.pending);
    if (!this.visible && !force) return;
    const now = performance.now();
    const t = (now - this.t0) / 1000;
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    const o = this.o;
    if (o.mouse) {
      this.mx = damp(this.mx, POINTER.nx, 3.5, dt);
      this.my = damp(this.my, POINTER.ny, 3.5, dt);
    }
    if (o.spin) this.spinY += dt * o.spin;
    const ip = this.introP;
    const ry = o.baseRotY + this.extraRot + this.spinY + Math.sin(t * 0.35) * o.idle + this.mx * o.parallax[1] + (1 - ip) * o.introSpin;
    const rx = this.my * o.parallax[0] * 0.5;
    const su = this.sdf.uniforms;
    su.uRotY.value = ry; su.uRotX.value = rx;
    su.uScale.value = lerp(o.introScale, 1, ip);
    su.uTime.value = REDUCED ? 0 : t;
    const u = this.mat.uniforms;
    u.uTime.value = REDUCED ? 0 : t;
    if (o.mouse && this.rect) {
      if (this.rectDirty) { this.rect = this.canvas.getBoundingClientRect(); this.rectDirty = false; }
      const rc = this.rect;
      u.uMouse.value.set((POINTER.x - rc.left) * this.dpr, (rc.height - (POINTER.y - rc.top)) * this.dpr);
      const sp = Math.hypot(POINTER.vx, POINTER.vy);
      this.mouseAmt = damp(this.mouseAmt, clamp(sp * 0.9, 0, 1), 6, dt);
      u.uMouseAmt.value = REDUCED ? 0 : this.mouseAmt;
    }
    const r = this.renderer;
    r.setRenderTarget(this.rt); r.clear(); r.render(this.scene, this.qcam);
    r.setRenderTarget(null); r.clear(); r.render(this.qscene, this.qcam);
  }
  destroy() {
    if (this.dead && !this.renderer) return;
    this.dead = true;
    gsap.ticker.remove(this.tick);
    ACCENT.subs.delete(this.onAccent);
    window.removeEventListener('scroll', this.onScroll);
    gsap.killTweensOf(this); if (this.mat) gsap.killTweensOf(this.mat.uniforms.uIntro);
    this.ro && this.ro.disconnect(); this.io && this.io.disconnect();
    if (this.renderer) {
      this.scene.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
      this.rt.dispose(); this.glyph.dispose(); this.mat.dispose();
      this.renderer.dispose(); this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.canvas.remove();
  }
}
