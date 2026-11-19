/* ==========================================================================
   RAW WEBGL2 — fond « acier liquide » + transition de page « encre ASCII »
   ========================================================================== */
const FS_VERT = `#version 300 es
void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

function glProgram(gl, fsSrc) {
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const v = sh(gl.VERTEX_SHADER, FS_VERT), f = sh(gl.FRAGMENT_SHADER, fsSrc);
  if (!v || !f) return null;
  const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const name = info.name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}


/* --- Verre liquide (façon iOS 26) -------------------------------------------
   Adapté de archisvaze/liquid-glass (MIT, © 2026 Archis Vaze), version WebGL.
   Les éléments .lg du DOM sont transparents : leur verre est dessiné ici, dans le
   fond, en réfractant la soie. Réglages : épaisseur 37, biseau 60, IOR 3,
   flou 5,5, spéculaire 0,45, teinte 8 %, ombre 0,5 ; reflet asymétrique
   (lumière en haut à gauche) et légère dispersion sur les bords, plus proches d'Apple. */
const GLASS = { thick: 37, bezel: 60, ior: 3.0, blur: 5.5, spec: 0.45, tint: 0.08, shadow: 0.5, max: 16 };
const GLASS_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSilk;
uniform vec2 uRes; uniform float uDpr; uniform int uN;
uniform vec4 uR[16]; uniform vec4 uP[16];
uniform float uThick; uniform float uBezel; uniform float uIOR; uniform float uBlur; uniform float uSpec; uniform float uTint; uniform float uShadow;
out vec4 o;
float sdRR(vec2 p, vec2 h, float r){ vec2 q = abs(p) - h + r; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; }
float surf(float t){ float s = 1.0 - t; return pow(1.0 - s * s * s * s, 0.25); }
vec3 bg(vec2 css){ vec2 R = uRes / uDpr; vec2 uv = vec2(css.x, R.y - css.y) / R; return texture(uSilk, clamp(uv, vec2(0.001), vec2(0.999))).rgb; }
const vec2 PD[12] = vec2[12](vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621), vec2(0.962, -0.195), vec2(0.473, -0.480),
  vec2(0.519, 0.767), vec2(0.185, -0.893), vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598));
vec3 blurBg(vec2 css, float r){ if (r < 0.5) return bg(css); vec3 s = vec3(0.0); for (int i = 0; i < 12; i++) s += bg(css + PD[i] * r); return s / 12.0; }
void main(){
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec3 col = bg(css);
  float sh = 0.0; int hit = -1; float hsd = 1e9;
  for (int i = 0; i < 16; i++) {
    if (i >= uN) break;
    vec2 p = css - uR[i].xy;
    float sd = sdRR(p, uR[i].zw, uP[i].x);
    if (sd < hsd) { hsd = sd; hit = i; }
    float ds = max(sdRR(p - vec2(0.0, 6.0), uR[i].zw, uP[i].x), 0.0);
    sh = max(sh, uShadow * uP[i].y * exp(-ds * ds / 700.0) * 0.55);
  }
  col *= 1.0 - sh;
  if (hit >= 0 && hsd < 1.0) {
    vec2 p = css - uR[hit].xy; vec2 hs = uR[hit].zw; float r = uP[hit].x;
    float a = uP[hit].y, hov = uP[hit].z, pro = uP[hit].w;
    float d = -hsd;
    float bez = max(1.0, min(uBezel, min(r, min(hs.x, hs.y)) - 1.0));
    float t = clamp(d / bez, 0.0, 1.0);
    float h = surf(t), h2 = surf(min(t + 0.001, 1.0));
    float slope = atan((h2 - h) / 0.001 * (uThick / bez));
    float thR = asin(clamp(sin(slope) / uIOR, -1.0, 1.0));
    float disp = h * uThick * (tan(slope) - tan(thR));
    vec2 g = vec2(sdRR(p + vec2(0.5, 0.0), hs, r) - hsd, sdRR(p + vec2(0.0, 0.5), hs, r) - hsd);
    g = normalize(g + vec2(1e-6));
    vec2 off = -g * disp;
    vec3 c = vec3(blurBg(css + off * 0.95, uBlur).r, blurBg(css + off, uBlur).g, blurBg(css + off * 1.05, uBlur).b);
    vec2 L = normalize(vec2(-0.55, -0.83));
    float rimF = 1.0 - smoothstep(0.0, bez * 0.4, d);
    float spec = pow(max(dot(g, L), 0.0) * rimF, 1.5) + 0.45 * pow(max(dot(g, -L), 0.0) * rimF, 2.0);
    c += vec3(spec * uSpec * (1.0 + 0.7 * hov));
    float inner = 1.0 - smoothstep(0.0, bez * 0.6, d);
    c *= mix(1.0, 0.7, inner * 0.3);
    float rim = smoothstep(0.0, 2.0, d) * (1.0 - smoothstep(2.0, 5.0, d));
    c += vec3(rim * 0.15 * uSpec);
    c = mix(c, vec3(1.0), uTint + hov * 0.045);
    c = mix(c, vec3(0.955, 0.948, 0.93), pro * 0.86);
    col = mix(col, c, smoothstep(0.0, 1.5, d) * a);
  }
  o = vec4(col, 1.0);
}`;

/* --- Fond : surface métallique sombre qui réagit au curseur ---------------- */
const BG_FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec4 uTrail[24];
uniform vec3 uAmb; uniform vec3 uKey; uniform vec3 uRim; uniform float uExposure; uniform float uGrain;
uniform sampler2D uVel; uniform float uFluid; uniform float uWarp;
out vec4 o;
float H(vec2 p){
  float t = uTime * 0.07;
  vec2 q = p;
  q += 0.55 * vec2(sin(p.y * 1.7 + t * 1.3), cos(p.x * 1.3 - t));
  q += 0.32 * vec2(sin(q.y * 2.9 - t * 1.7 + 1.3), cos(q.x * 2.3 + t * 1.1 + 0.7));
  return sin(q.x * 1.6 + q.y * 0.9 + t) * 0.6 + cos(-q.x * 0.8 + q.y * 2.2 - t * 0.7) * 0.4;
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 w = vec2(0.0);
  if (uFluid > 0.5) {
    vec2 uvF = gl_FragCoord.xy / uRes; vec2 tx = 3.0 / uRes;
    vec2 vel = texture(uVel, uvF).xy * 0.4
      + (texture(uVel, uvF + vec2(tx.x, 0.0)).xy + texture(uVel, uvF - vec2(tx.x, 0.0)).xy
       + texture(uVel, uvF + vec2(0.0, tx.y)).xy + texture(uVel, uvF - vec2(0.0, tx.y)).xy) * 0.15;
    w = vel * uWarp;
  } else {
    for (int i = 0; i < 24; i++) { vec4 tr = uTrail[i]; vec2 d = p - tr.xy; w += tr.zw * exp(-dot(d, d) * 22.0); }
    w *= 2.5;
  }
  vec2 P = p * 1.05 + w;
  float e = 0.01;
  float h0 = H(P), hx = H(P + vec2(e, 0.0)), hy = H(P + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h0) / e * 0.6, -(hy - h0) / e * 0.6, 1.0));
  vec3 L1 = normalize(vec3(-0.6, 0.7, 0.4));
  vec3 L2 = normalize(vec3(0.75, -0.4, 0.35));
  float key = pow(0.5 + 0.5 * dot(n, L1), 3.0);
  float rim = pow(0.5 + 0.5 * dot(n, L2), 5.0);
  vec3 col = uAmb * 0.55 + uKey * key * 1.05 + uRim * rim * 0.35;
  col *= uExposure;
  col *= mix(0.55, 1.0, smoothstep(1.25, 0.15, length(p)));
  float g = hash12(gl_FragCoord.xy + fract(uTime * 0.37) * 391.0);
  col += (g - 0.5) * uGrain;
  o = vec4(col, 1.0);
}`;


/* --- Simulation de fluide (Navier-Stokes, GPU) -------------------------- */
const FL_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform vec2 uTexel;
out vec4 o;
`;
const FL_SPLAT = FL_HEAD + `uniform sampler2D uTarget; uniform float uAspect; uniform vec2 uPoint; uniform vec3 uColor; uniform float uRadius;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel; vec2 p = uv - uPoint; p.x *= uAspect;
  o = vec4(texture(uTarget, uv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.0); }`;
const FL_ADVECT = FL_HEAD + `uniform sampler2D uVel; uniform sampler2D uSrc; uniform float uDt; uniform float uDiss;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel; vec2 c = uv - uDt * texture(uVel, uv).xy * uTexel;
  o = vec4(uDiss * texture(uSrc, c).xyz, 1.0); }`;
const FL_CURL = FL_HEAD + `uniform sampler2D uVel;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel;
  float L = texture(uVel, uv - vec2(uTexel.x, 0.0)).y, R = texture(uVel, uv + vec2(uTexel.x, 0.0)).y;
  float T = texture(uVel, uv + vec2(0.0, uTexel.y)).x, B = texture(uVel, uv - vec2(0.0, uTexel.y)).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }`;
const FL_VORT = FL_HEAD + `uniform sampler2D uVel; uniform sampler2D uCurl; uniform float uCurlK; uniform float uDt;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel;
  float L = texture(uCurl, uv - vec2(uTexel.x, 0.0)).x, R = texture(uCurl, uv + vec2(uTexel.x, 0.0)).x;
  float T = texture(uCurl, uv + vec2(0.0, uTexel.y)).x, B = texture(uCurl, uv - vec2(0.0, uTexel.y)).x;
  float C = texture(uCurl, uv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 0.0001; f *= uCurlK * C; f.y *= -1.0;
  vec2 v = texture(uVel, uv).xy + f * uDt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0); }`;
const FL_DIV = FL_HEAD + `uniform sampler2D uVel;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel; vec2 C = texture(uVel, uv).xy;
  float L = texture(uVel, uv - vec2(uTexel.x, 0.0)).x, R = texture(uVel, uv + vec2(uTexel.x, 0.0)).x;
  float T = texture(uVel, uv + vec2(0.0, uTexel.y)).y, B = texture(uVel, uv - vec2(0.0, uTexel.y)).y;
  if (uv.x - uTexel.x < 0.0) L = -C.x; if (uv.x + uTexel.x > 1.0) R = -C.x;
  if (uv.y + uTexel.y > 1.0) T = -C.y; if (uv.y - uTexel.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`;
const FL_CLEAR = FL_HEAD + `uniform sampler2D uTex; uniform float uValue;
void main(){ o = uValue * texture(uTex, gl_FragCoord.xy * uTexel); }`;
const FL_JACOBI = FL_HEAD + `uniform sampler2D uP; uniform sampler2D uDiv;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel;
  float L = texture(uP, uv - vec2(uTexel.x, 0.0)).x, R = texture(uP, uv + vec2(uTexel.x, 0.0)).x;
  float T = texture(uP, uv + vec2(0.0, uTexel.y)).x, B = texture(uP, uv - vec2(0.0, uTexel.y)).x;
  o = vec4((L + R + B + T - texture(uDiv, uv).x) * 0.25, 0.0, 0.0, 1.0); }`;
const FL_GRAD = FL_HEAD + `uniform sampler2D uP; uniform sampler2D uVel;
void main(){ vec2 uv = gl_FragCoord.xy * uTexel;
  float L = texture(uP, uv - vec2(uTexel.x, 0.0)).x, R = texture(uP, uv + vec2(uTexel.x, 0.0)).x;
  float T = texture(uP, uv + vec2(0.0, uTexel.y)).x, B = texture(uP, uv - vec2(0.0, uTexel.y)).x;
  o = vec4(texture(uVel, uv).xy - vec2(R - L, T - B), 0.0, 1.0); }`;

class Fluid {
  constructor(gl) {
    this.gl = gl; this.ok = false;
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;
    const P = (src) => glProgram(gl, src);
    this.p = { splat: P(FL_SPLAT), advect: P(FL_ADVECT), curl: P(FL_CURL), vort: P(FL_VORT), div: P(FL_DIV), clear: P(FL_CLEAR), jacobi: P(FL_JACOBI), grad: P(FL_GRAD) };
    if (Object.values(this.p).some((x) => !x)) return;
    this.resize();
    if (!this.vel) return;
    this.ok = true;
    this.last = null;
  }
  fbo(w, h) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    const okFb = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return okFb ? { tex, fb, w, h } : null;
  }
  pair(w, h) { const a = this.fbo(w, h), b = this.fbo(w, h); return a && b ? { r: a, w: b, swap() { const t = this.r; this.r = this.w; this.w = t; } } : null; }
  resize() {
    const asp = innerWidth / innerHeight;
    const base = IS_TOUCH ? 96 : 128;
    const w = Math.round(asp >= 1 ? base * asp : base), h = Math.round(asp >= 1 ? base : base / asp);
    if (this.vel && this.w === w && this.h === h) return;
    this.w = w; this.h = h;
    this.vel = this.pair(w, h); this.pres = this.pair(w, h);
    this.divT = this.fbo(w, h); this.curlT = this.fbo(w, h);
    if (!this.vel || !this.pres || !this.divT || !this.curlT) this.vel = null;
  }
  run(prog, target, uniforms) {
    const gl = this.gl;
    gl.useProgram(prog.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
    gl.viewport(0, 0, target.w, target.h);
    gl.uniform2f(prog.u.uTexel, 1 / target.w, 1 / target.h);
    let unit = 0;
    for (const [k, v] of Object.entries(uniforms)) {
      const loc = prog.u[k]; if (loc == null) continue;
      if (v && v.tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(loc, unit); unit++; }
      else if (Array.isArray(v)) { v.length === 2 ? gl.uniform2fv(loc, v) : gl.uniform3fv(loc, v); }
      else gl.uniform1f(loc, v);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  step(dt) {
    if (!this.ok) return;
    const { p } = this;
    // impulsion du curseur
    const x = POINTER.x / innerWidth, y = 1 - POINTER.y / innerHeight;
    if (this.last) {
      const dx = x - this.last[0], dy = y - this.last[1];
      if (Math.abs(dx) + Math.abs(dy) > 0.0002) {
        this.run(p.splat, this.vel.w, { uTarget: this.vel.r, uAspect: innerWidth / innerHeight, uPoint: [x, y], uColor: [dx * 5200, dy * 5200, 0], uRadius: 0.0022 });
        this.vel.swap();
      }
    }
    this.last = [x, y];
    this.run(p.curl, this.curlT, { uVel: this.vel.r });
    this.run(p.vort, this.vel.w, { uVel: this.vel.r, uCurl: this.curlT, uCurlK: 6, uDt: dt });
    this.vel.swap();
    this.run(p.div, this.divT, { uVel: this.vel.r });
    this.run(p.clear, this.pres.w, { uTex: this.pres.r, uValue: 0.8 });
    this.pres.swap();
    for (let i = 0; i < 18; i++) { this.run(p.jacobi, this.pres.w, { uP: this.pres.r, uDiv: this.divT }); this.pres.swap(); }
    this.run(p.grad, this.vel.w, { uP: this.pres.r, uVel: this.vel.r });
    this.vel.swap();
    this.run(p.advect, this.vel.w, { uVel: this.vel.r, uSrc: this.vel.r, uDt: dt, uDiss: Math.pow(0.98, dt * 60) });
    this.vel.swap();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}

class SteelBackground {
  constructor(canvas) {
    this.c = canvas;
    this.gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    this.trail = new Float32Array(24 * 4);
    this.ti = 0; this.last = { x: POINTER.x, y: POINTER.y };
    if (!this.gl) return;
    const src = BG_FRAG.replace('out vec4 o;', 'out vec4 o;\n' + GLSL_NOISE);
    this.prog = glProgram(this.gl, src);
    if (!this.prog) { this.gl = null; return; }
    try { if (!REDUCED) this.fluid = new Fluid(this.gl); } catch (e) { this.fluid = null; }
    // verre liquide : désactivé si le visiteur demande moins de transparence (repli CSS opaque)
    const lessGlass = window.matchMedia && matchMedia('(prefers-reduced-transparency: reduce)').matches;
    this.glass = lessGlass ? null : glProgram(this.gl, GLASS_FRAG);
    if (this.glass) document.documentElement.classList.add('lg-on');
    this.gR = new Float32Array(GLASS.max * 4); this.gP = new Float32Array(GLASS.max * 4);
    this.glassOn = false;
    this.resize();
    window.addEventListener('resize', () => { this.resize(); this.fluid && this.fluid.ok && this.fluid.resize(); });
    this.t0 = performance.now();
    this.tickFn = () => this.draw();
    gsap.ticker.add(this.tickFn);
  }
  resize() {
    if (!this.gl) return;
    const s = (IS_TOUCH ? 0.35 : 0.5) * DPR();
    this.sw = Math.max(2, Math.round(innerWidth * s));
    this.sh = Math.max(2, Math.round(innerHeight * s));
    this.size();
  }
  // sans verre : la soie va droit à l'écran en basse résolution ; avec verre : la soie passe
  // par une texture et l'écran est composé en pleine résolution (arêtes nettes)
  size() {
    const k = this.glassOn ? Math.min(DPR(), IS_TOUCH ? 1.5 : 2) : 0;
    const w = k ? Math.round(innerWidth * k) : this.sw, h = k ? Math.round(innerHeight * k) : this.sh;
    if (this.c.width !== w || this.c.height !== h) { this.c.width = w; this.c.height = h; }
    if (this.glassOn) this.silkTarget();
  }
  silkTarget() {
    const gl = this.gl;
    if (this.silk && this.silk.w === this.sw && this.silk.h === this.sh) return;
    if (this.silk) { gl.deleteTexture(this.silk.tex); gl.deleteFramebuffer(this.silk.fb); }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.sw, this.sh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.silk = { tex, fb, w: this.sw, h: this.sh };
  }
  // les éléments .lg visibles de la page vivante (pas les copies d'une coupe en cours)
  collectGlass() {
    if (!this.glass) return 0;
    const W = innerWidth, H = innerHeight;
    let n = 0;
    for (const el of document.querySelectorAll('.lg')) {
      if (n >= GLASS.max) break;
      if (el.closest('.cut-layer')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < -40 || r.top > H + 40 || r.right < -40 || r.left > W + 40) continue;
      let a = 1;
      for (let x = el, d = 0; x && x !== document.body && d < 10; x = x.parentElement, d++) {
        const cs = getComputedStyle(x);
        if (cs.display === 'none' || cs.visibility === 'hidden') { a = 0; break; }
        a *= +cs.opacity;
        if (a < 0.01) break;
      }
      if (a < 0.01) continue;
      const cr = getComputedStyle(el).borderTopLeftRadius;
      let rad = parseFloat(cr) || 0;
      if (cr.endsWith('%')) rad = Math.min(r.width, r.height) * rad / 100;
      rad = Math.min(rad, r.width / 2, r.height / 2);
      el._lgH = lerp(el._lgH || 0, el.matches(':hover') && !el.disabled ? 1 : 0, 0.18);
      this.gR.set([r.left + r.width / 2, r.top + r.height / 2, r.width / 2, r.height / 2], n * 4);
      this.gP.set([rad, a, el._lgH, el.classList.contains('lg-pro') ? 1 : 0], n * 4);
      n++;
    }
    return n;
  }
  draw() {
    const gl = this.gl; if (!gl) return;
    // trail : on pousse un point quand le curseur bouge, puis tout décroît
    const dx = POINTER.x - this.last.x, dy = POINTER.y - this.last.y;
    const H = innerHeight;
    for (let i = 0; i < 24; i++) { this.trail[i * 4 + 2] *= 0.955; this.trail[i * 4 + 3] *= 0.955; }
    if (Math.abs(dx) + Math.abs(dy) > 0.5) {
      const k = this.ti++ % 24;
      this.trail[k * 4] = (POINTER.x - innerWidth / 2) / H;
      this.trail[k * 4 + 1] = (H / 2 - POINTER.y) / H;
      this.trail[k * 4 + 2] = clamp(dx / H, -0.08, 0.08) * 0.5;
      this.trail[k * 4 + 3] = clamp(-dy / H, -0.08, 0.08) * 0.5;
      this.last.x = POINTER.x; this.last.y = POINTER.y;
    }
    const now = performance.now();
    const dt = clamp((now - (this.lt || now - 16)) / 1000, 0.008, 0.033);
    this.lt = now;
    const fl = this.fluid && this.fluid.ok;
    if (fl) this.fluid.step(dt);
    const nGlass = this.collectGlass();
    if ((nGlass > 0) !== this.glassOn) { this.glassOn = nGlass > 0; this.size(); }
    const { p, u } = this.prog;
    const sw = this.glassOn ? this.sw : this.c.width, sh = this.glassOn ? this.sh : this.c.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glassOn ? this.silk.fb : null);
    gl.viewport(0, 0, sw, sh);
    gl.useProgram(p);
    gl.uniform2f(u.uRes, sw, sh);
    gl.uniform1f(u.uFluid, fl ? 1 : 0);
    gl.uniform1f(u.uWarp, 0.0024);
    if (fl) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.fluid.vel.r.tex); gl.uniform1i(u.uVel, 0); }
    gl.uniform1f(u.uTime, REDUCED ? 40 : (performance.now() - this.t0) / 1000);
    gl.uniform4fv(u.uTrail, this.trail);
    gl.uniform3f(u.uAmb, 0.062, 0.070, 0.062);
    gl.uniform3f(u.uKey, 0.20, 0.215, 0.20);
    gl.uniform3f(u.uRim, 0.30, 0.31, 0.295);
    gl.uniform1f(u.uExposure, 1.3);
    gl.uniform1f(u.uGrain, 0.035);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (this.glassOn) this.drawGlass(nGlass);
  }
  drawGlass(n) {
    const gl = this.gl, { p, u } = this.glass;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.c.width, this.c.height);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.silk.tex);
    gl.uniform1i(u.uSilk, 0);
    gl.uniform2f(u.uRes, this.c.width, this.c.height);
    gl.uniform1f(u.uDpr, this.c.width / innerWidth);
    gl.uniform1i(u.uN, n);
    gl.uniform4fv(u.uR, this.gR);
    gl.uniform4fv(u.uP, this.gP);
    gl.uniform1f(u.uThick, GLASS.thick); gl.uniform1f(u.uBezel, GLASS.bezel); gl.uniform1f(u.uIOR, GLASS.ior);
    gl.uniform1f(u.uBlur, GLASS.blur); gl.uniform1f(u.uSpec, GLASS.spec); gl.uniform1f(u.uTint, GLASS.tint); gl.uniform1f(u.uShadow, GLASS.shadow);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

/* --- Transition : front d'encre bruité, frange de glyphes ASCII ---------- */
const TR_FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uP; uniform float uTime; uniform sampler2D uGlyph; uniform float uN; uniform vec2 uCell; uniform float uGrain;
out vec4 o;
__NOISE__
uniform float uMaxR;
float fbm3(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s / 0.875; }
float field(vec2 uv){
  vec2 c = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float r = length(c);
  vec2 dir = c / max(r, 1e-4);
  float n = fbm3(dir * 1.5 + vec2(uTime * 0.06, -uTime * 0.04) + uP * 0.5);
  float n2 = fbm3(c * 2.0 + 3.0 + uTime * 0.03);
  return r * (1.0 + (n - 0.5) * 0.75) + (n2 - 0.5) * 0.05;
}
float dist(vec2 uv){
  float rr = field(uv);
  float ph = uP < 1.0 ? uP : uP - 1.0;
  float R = ph * uMaxR;
  return uP < 1.0 ? (R - rr) : (rr - R);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float d = dist(uv);
  float dr = dist(uv + vec2(0.004, 0.0));
  float db = dist(uv - vec2(0.004, 0.0));
  float cov = step(0.0, d);
  float core = exp(-abs(d) / 0.003);
  float mid = exp(-abs(d) / 0.042);
  vec3 bone = vec3(0.914, 0.902, 0.867);
  vec3 bg = vec3(0.043, 0.051, 0.043);
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 g = fract(gl_FragCoord.xy / uCell);
  float cd = dist((cell + 0.5) * uCell / uRes);
  float band = (1.0 - step(0.0, cd)) * smoothstep(-0.075, 0.0, cd);
  float t = floor(uTime * 16.0);
  float gi = 1.0 + floor(hash12(cell + t * 0.13) * (uN - 1.0));
  float gm = texture(uGlyph, vec2((gi + g.x) / uN, g.y)).r;
  float glyph = gm * band * step(hash12(cell * 0.71 + t), 0.7);
  vec3 col = bg + (hash12(gl_FragCoord.xy + t) - 0.5) * uGrain * 0.08;
  float a = cov;
  vec3 edge = vec3(exp(-abs(dr) / 0.003), core, exp(-abs(db) / 0.003));
  col += edge * bone * 1.1 + mid * 0.14 * bone;
  a = max(a, max(max(edge.r, edge.b), max(core, mid * 0.45)));
  col = mix(col, bone, glyph * (1.0 - cov));
  a = max(a, glyph * 0.95);
  a = max(a, exp(-abs(d) / 0.25) * 0.28 * (1.0 - cov));
  o = vec4(col * a, a);
}`;


/* --- Découpe à l'épée : lame ASCII qui traverse, entaille lumineuse, étincelles */
const SLASH_FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform float uP; uniform float uGlow; uniform float uTime;
uniform vec2 uC; uniform float uAng; uniform sampler2D uGlyph; uniform float uN; uniform vec2 uCell;
out vec4 o;
__NOISE__
// cimeterre (kilij) : la pointe file sur la ligne de coupe, la lame s'incurve vers la poignée
float scimC(float u, float bl, float S){
  float t = -u / bl;
  if (t <= 0.0) return 0.0;
  if (t <= 1.0) return 0.17 * S * t * t;
  return 0.17 * S + 0.34 * S * (t - 1.0);
}
float sdSword(vec2 q, float S){
  float u = q.x, bl = S;
  float t = -u / bl;
  float c = scimC(u, bl, S);
  float dc = (t > 0.0 && t < 1.0) ? 0.34 * S * t / bl : (t >= 1.0 ? 0.34 * S / bl : 0.0);
  float kk = inversesqrt(1.0 + dc * dc);
  float vv = q.y - c;
  // lame : tranchant côté convexe (-v), dos avec yelman et faux tranchant vers la pointe
  float tip = smoothstep(0.0, 0.11, t);
  float we = S * (0.02 + 0.012 * t) * tip;
  float ws = t < 0.3 ? 0.046 * S * smoothstep(0.0, 0.3, t) : (t < 0.36 ? 0.046 * S : mix(0.046 * S, 0.019 * S, smoothstep(0.36, 0.4, t)));
  float blade = (vv < 0.0 ? -vv - we : vv - ws) * kk;
  blade = max(blade, max(u, -u - bl));
  // encoche de l'épaulement du yelman
  blade = max(blade, -(length(vec2((t - 0.36) * bl, vv - 0.046 * S)) - 0.008 * S));
  // garde à boules
  float gu = u + bl;
  float guard = max(abs(gu) - 0.011 * S, abs(vv) - 0.085 * S);
  guard = min(guard, length(vec2(gu, abs(vv) - 0.095 * S)) - 0.016 * S);
  // poignée en crosse et pommeau recourbé (vers le tranchant)
  float gt = clamp((-gu - 0.012 * S) / (0.19 * S), 0.0, 1.0);
  float gv = vv + 0.05 * S * gt * gt;
  float grip = max(abs(-gu - 0.105 * S) - 0.094 * S, abs(gv) - 0.017 * S);
  float pom = length(vec2(-gu - 0.215 * S, vv + 0.068 * S)) - 0.03 * S;
  pom = min(pom, length(vec2(-gu - 0.235 * S, vv + 0.1 * S)) - 0.018 * S);
  return min(min(blade, guard), min(grip, pom));
}
void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 d = vec2(cos(uAng), sin(uAng)); vec2 n = vec2(-d.y, d.x);
  vec2 rel = fc - uC;
  float u = dot(rel, d), v = dot(rel, n);
  float Dg = length(uRes) * 0.5;
  float S = 0.4 * max(uRes.x, uRes.y);
  float tipU = mix(-Dg - 0.05 * S, Dg + S * 1.35, uP);
  float behind = step(u, tipU);
  float core = exp(-abs(v) / (1.1 * uDpr)) * behind * uGlow;
  float glow = exp(-abs(v) / (12.0 * uDpr)) * behind * uGlow * 0.45;
  float vr = dot(rel + vec2(2.5 * uDpr, 0.0), n), vb = dot(rel - vec2(2.5 * uDpr, 0.0), n);
  vec3 fringe = vec3(exp(-abs(vr) / (1.6 * uDpr)), core, exp(-abs(vb) / (1.6 * uDpr))) * behind * uGlow;
  vec2 cell = floor(fc / uCell); vec2 g = fract(fc / uCell);
  vec2 crel = (cell + 0.5) * uCell - uC;
  float cu = dot(crel, d), cv = dot(crel, n);
  float t = floor(uTime * 18.0);
  float zone = exp(-abs(cv) / (24.0 * uDpr)) * step(cu, tipU) * uGlow;
  float spark = step(hash12(cell + t * 0.31), zone * 0.5);
  float gi = 1.0 + floor(hash12(cell * 1.3 + t) * (uN - 1.0));
  float gm = texture(uGlyph, vec2((gi + g.x) / uN, g.y)).r * spark;
  vec2 sq = vec2(cu - tipU, cv);
  float swp = sdSword(vec2(u - tipU, v), S);
  float inside = step(swp, 0.0);
  float si = 4.0 + floor(hash12(cell + t) * (uN - 4.0));
  float gl = texture(uGlyph, vec2((si + g.x) / uN, g.y)).r;
  float sm = inside * (0.55 + 0.45 * gl);
  float outline = exp(-abs(swp) / (1.3 * uDpr));
  float swr = sdSword(vec2(u - tipU + 2.0 * uDpr, v), S), swb = sdSword(vec2(u - tipU - 2.0 * uDpr, v), S);
  vec3 sfr = vec3(exp(-abs(swr) / (1.4 * uDpr)), outline, exp(-abs(swb) / (1.4 * uDpr)));
  float streak = 0.0;
  for (int k = 1; k < 4; k++) {
    float fk = float(k);
    streak = max(streak, step(sdSword(sq + vec2(fk * uCell.x * 1.6, 0.0), S), 0.0) * (1.0 - fk / 4.0));
  }
  float sti = 2.0 + floor(hash12(cell + t * 0.7) * 3.0);
  float st = texture(uGlyph, vec2((sti + g.x) / uN, g.y)).r * streak * (1.0 - inside) * 0.65;
  vec3 bone = vec3(0.914, 0.902, 0.867);
  vec3 col = bone * (glow + gm * 0.85 + sm + st) + fringe * 1.2 + sfr * 1.3;
  float a = clamp(max(max(core, glow), max(gm * 0.85, max(sm * 0.96, st))) + max(max(fringe.r, fringe.b) * 0.7, max(sfr.g, max(sfr.r, sfr.b))), 0.0, 1.0);
  o = vec4(min(col, vec3(a)), a);
}`;

class PageTransition {
  constructor(canvas) {
    this.c = canvas; this.p = 0;
    this.gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    if (!this.gl) { this.fallback(); return; }
    this.prog = glProgram(this.gl, TR_FRAG.replace('__NOISE__', GLSL_NOISE));
    if (!this.prog) { this.gl = null; this.fallback(); return; }
    const gl = this.gl;
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, glyphAtlas());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.slashProg = glProgram(gl, SLASH_FRAG.replace('__NOISE__', GLSL_NOISE));
    this.t0 = performance.now();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  drawSlash() {
    const gl = this.gl; if (!gl || !this.slashProg) return;
    const { p, u } = this.slashProg;
    gl.viewport(0, 0, this.c.width, this.c.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(u.uGlyph, 0);
    gl.uniform1f(u.uN, RAMP.length);
    gl.uniform2f(u.uRes, this.c.width, this.c.height);
    gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform2f(u.uCell, 8 * this.dpr, 14 * this.dpr);
    gl.uniform1f(u.uP, this.sp);
    gl.uniform1f(u.uGlow, this.glow);
    gl.uniform2f(u.uC, this.c.width / 2, this.c.height / 2);
    gl.uniform1f(u.uAng, this.ang);
    gl.uniform1f(u.uTime, (performance.now() - this.t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // halves : deux calques (clones de l'ancienne page) ; onMid : monter l'intro de la nouvelle page
  nextDir() { return this.flip ? -1 : 1; }
  slashCut(halves, onMid) {
    const W = innerWidth, H = innerHeight;
    this.flip = !this.flip;
    const a = (this.flip ? 1 : -1) * (0.3 + Math.random() * 0.18);
    const dir = this.flip ? 1 : -1;
    const dx = Math.cos(a) * dir, dy = Math.sin(a) * dir;
    const nx = -dy, ny = dx;
    const L = Math.hypot(W, H) * 1.5, cx = W / 2, cy = H / 2;
    const P = (x, y) => `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    const p1 = [cx - dx * L, cy - dy * L], p2 = [cx + dx * L, cy + dy * L];
    const poly = (s) => `polygon(${P(...p1)}, ${P(...p2)}, ${P(p2[0] + nx * L * s, p2[1] + ny * L * s)}, ${P(p1[0] + nx * L * s, p1[1] + ny * L * s)})`;
    halves[0].style.clipPath = poly(1);
    halves[1].style.clipPath = poly(-1);
    this.ang = Math.atan2(-dy, dx);
    this.sp = 0; this.glow = 1;
    const gl = !!(this.gl && this.slashProg);
    if (gl) { this.c.classList.add('is-active'); this.drawSlash(); }
    const draw = () => gl && this.drawSlash();
    const tl = gsap.timeline({ onUpdate: draw });
    this.lastTl = tl;
    // la lame passe au centre vers 0,23 s : c'est là que tombe l'impact du son d'épée
    tl.to(this, { sp: 1, duration: 0.46, ease: 'power2.inOut' }, 0);
    tl.to(halves[0], { x: -dx * 18, y: -dy * 18, duration: 0.22, ease: 'power2.out' }, 0.36);
    tl.to(halves[1], { x: dx * 18, y: dy * 18, duration: 0.22, ease: 'power2.out' }, 0.36);
    tl.to(halves[0], { x: nx * H * 1.05 - dx * 90, y: ny * H * 1.05 - dy * 90, rotation: -5 * dir, duration: 0.95, ease: 'power3.in' }, 0.54);
    tl.to(halves[1], { x: -nx * H * 1.05 + dx * 90, y: -ny * H * 1.05 + dy * 90, rotation: 5 * dir, duration: 0.95, ease: 'power3.in' }, 0.54);
    tl.to(this, { glow: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
    tl.call(() => onMid && onMid(), null, 0.64);
    return tl.then(() => { if (gl) this.hide(); });
  }
  fallback() {
    this.div = document.createElement('div');
    Object.assign(this.div.style, { position: 'fixed', inset: '0', background: 'var(--bg)', zIndex: 100, opacity: 0, pointerEvents: 'none' });
    document.body.appendChild(this.div);
  }
  resize() {
    if (!this.gl) return;
    this.dpr = Math.min(DPR(), 1.5);
    this.c.width = Math.round(innerWidth * this.dpr);
    this.c.height = Math.round(innerHeight * this.dpr);
  }
  draw() {
    const gl = this.gl; if (!gl) return;
    const { p, u } = this.prog;
    gl.viewport(0, 0, this.c.width, this.c.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(u.uGlyph, 0);
    gl.uniform1f(u.uN, RAMP.length);
    gl.uniform2f(u.uRes, this.c.width, this.c.height);
    gl.uniform2f(u.uCell, 8 * this.dpr, 14 * this.dpr);
    gl.uniform1f(u.uP, this.p);
    gl.uniform1f(u.uMaxR, 0.5 * Math.hypot(this.c.width / this.c.height, 1) * 1.55 + 0.08);
    gl.uniform1f(u.uGrain, isMobile() ? 0.375 : 0.5);
    gl.uniform1f(u.uTime, (performance.now() - this.t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  hide() {
    if (!this.gl) return;
    this.c.classList.remove('is-active');
    const gl = this.gl; gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  }
  cover(duration = 1) {
    if (!this.gl) return gsap.to(this.div, { opacity: 1, duration: duration * 0.6, ease: 'power2.inOut' }).then();
    this.c.classList.add('is-active');
    this.p = 0; this.draw();
    return gsap.to(this, { p: 1, duration, ease: 'power3.inOut', onUpdate: () => this.draw() }).then();
  }
  reveal(duration = 1) {
    if (!this.gl) return gsap.to(this.div, { opacity: 0, duration: duration * 0.6, ease: 'power2.inOut' }).then();
    this.p = 1; this.draw();
    return gsap.to(this, {
      p: 2, duration, ease: 'power3.inOut', onUpdate: () => this.draw(),
      onComplete: () => { this.c.classList.remove('is-active'); const gl = this.gl; gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); },
    }).then();
  }
}
