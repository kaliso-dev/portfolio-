/* ==========================================================================
   WORK SLIDER — anneau de slides (three.js), drag / molette / clavier,
   ressorts, décalage RGB selon la vitesse, brouillard, intro « encre ASCII »,
   clic : la slide s'étend plein écran puis ouvre le projet.
   ========================================================================== */
const SLIDE_VERT = /* glsl */`
uniform vec2 uSize; uniform float uOffset; uniform float uRadius; uniform float uSide; uniform float uCurve;
varying vec2 vUv; varying float vFog; varying vec2 vLocal;
void main(){
  vUv = uv;
  vec3 p = position; p.xy *= uSize;
  vLocal = p.xy;
  float x = p.x + uOffset;
  float th = x / uRadius;
  vec3 curved = vec3(uRadius * sin(th), p.y, uSide * uRadius * (cos(th) - 1.0));
  vec3 pl = vec3(x, p.y, 0.0);
  vec3 pos = mix(pl, curved, uCurve);
  vFog = smoothstep(0.12, 0.95, abs(th)) * uCurve;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const SLIDE_FRAG = /* glsl */`
uniform sampler2D uTex; uniform vec2 uImg; uniform vec2 uSize; uniform float uVel; uniform float uRgb;
uniform vec3 uBg; uniform float uFogStrength; uniform float uIntro; uniform float uIndex; uniform float uAlpha;
uniform float uTime; uniform sampler2D uGlyph; uniform float uN; uniform vec2 uCell;
uniform vec2 uMouse; uniform vec2 uMouseVel; uniform float uRadiusPx; uniform float uDistort; uniform float uCorner;
varying vec2 vUv; varying float vFog; varying vec2 vLocal;
${GLSL_NOISE}
vec2 coverUv(vec2 uv){
  float pa = uSize.x / uSize.y, ia = uImg.x / uImg.y;
  vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 uv = coverUv(vUv);
  vec2 d = gl_FragCoord.xy - uMouse;
  float f = exp(-dot(d, d) / (uRadiusPx * uRadiusPx));
  uv -= uMouseVel * f * uDistort;
  vec2 sh = vec2(uRgb * uVel, 0.0);
  float blur = vFog * 0.02;
  float streak = abs(uVel) * 0.06;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 9; i++) {
    float fi = float(i) / 8.0 - 0.5;
    float an = float(i) * 2.399;
    vec2 o = vec2(fi * streak, 0.0) + blur * vec2(cos(an), sin(an)) * sqrt(float(i) / 8.0);
    col.r += texture2D(uTex, uv + o + sh).r;
    col.g += texture2D(uTex, uv + o).g;
    col.b += texture2D(uTex, uv + o - sh).b;
  }
  col /= 9.0;
  vec2 nuv = vUv * vec2(uSize.x / uSize.y, 1.0);
  float n = fbm(nuv * 2.4 + uIndex * 7.31);
  float front = uIntro * 1.6 - 0.2 - n * 0.9 - (1.0 - vUv.y) * 0.35;
  float inside = step(0.0, front);
  float ringOut = (1.0 - inside) * smoothstep(-0.06, 0.0, front);
  float ringIn = inside * (1.0 - smoothstep(0.0, 0.08, front)) * step(uIntro, 0.999);
  vec2 cell = floor(gl_FragCoord.xy / uCell); vec2 g = fract(gl_FragCoord.xy / uCell);
  float t = floor(uTime * 14.0);
  float gi = 1.0 + floor(hash12(cell + t) * (uN - 1.0));
  float gm = texture2D(uGlyph, vec2((gi + g.x) / uN, g.y)).r;
  vec3 bone = vec3(0.914, 0.902, 0.867);
  col = mix(col, bone * gm, ringIn * 0.85);
  col = mix(col, bone, ringOut);
  col += bone * exp(-abs(front) / 0.004) * 0.6 * step(uIntro, 0.999);
  float alpha = inside + ringOut * gm * 0.85;
  col = mix(col, uBg, vFog * uFogStrength);
  float sd = sdRound(vLocal, uSize * 0.5, uCorner);
  alpha *= (1.0 - smoothstep(-0.003, 0.003, sd)) * uAlpha * (1.0 - vFog * 0.25);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

class WorkSlider {
  constructor(root, projects, { onOpen, onActive, onExpand, onCollapse } = {}) {
    this.root = root; this.projects = projects; this.T = projects.length;
    this.onOpen = onOpen; this.onActive = onActive; this.onExpand = onExpand; this.onCollapse = onCollapse;
    this.x = 0; this.target = 0; this.v = 0; this.velEase = 0; this.pv = 0;
    this.dragging = false; this.expanded = false; this.navigating = false; this.expandP = 0; this.active = -1; this.dead = false;
    this.canvas = document.createElement('canvas'); root.appendChild(this.canvas);
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, premultipliedAlpha: true });
    } catch (e) { this.dead = true; this.fallback(); return; }
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 5);
    this.glyph = new THREE.CanvasTexture(glyphAtlas()); this.glyph.minFilter = THREE.LinearMipmapLinearFilter;
    this.shared = {
      uTime: { value: 0 }, uIntro: { value: REDUCED ? 1 : 0 }, uGlyph: { value: this.glyph }, uN: { value: RAMP.length },
      uCell: { value: new THREE.Vector2(14, 24) }, uMouse: { value: new THREE.Vector2(-9999, -9999) }, uMouseVel: { value: new THREE.Vector2() },
      uRadiusPx: { value: 160 }, uDistort: { value: 0.1 }, uRgb: { value: 0.03 }, uBg: { value: new THREE.Vector3(0.05, 0.058, 0.05) },
      uFogStrength: { value: 0.85 }, uSide: { value: -1 },
    };
    const geo = new THREE.PlaneGeometry(1, 1, 64, 1);
    const blank = new THREE.DataTexture(new Uint8Array([14, 17, 14, 255]), 1, 1); blank.needsUpdate = true;
    const loader = new THREE.TextureLoader();
    this.meshes = projects.map((p, i) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: Object.assign({}, this.shared, {
          uTex: { value: blank }, uImg: { value: new THREE.Vector2(1500, 1000) }, uSize: { value: new THREE.Vector2(1, 1) },
          uOffset: { value: 0 }, uRadius: { value: 8 }, uCurve: { value: 1 }, uVel: { value: 0 }, uIndex: { value: i },
          uAlpha: { value: 1 }, uCorner: { value: 0.03 },
        }),
        vertexShader: SLIDE_VERT, fragmentShader: SLIDE_FRAG,
        transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
      });
      const m = new THREE.Mesh(geo, mat);
      this.scene.add(m);
      loader.load(allCovers()[i], (tex) => {
        if (this.dead) { tex.dispose(); return; }
        tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
        mat.uniforms.uTex.value = tex;
        mat.uniforms.uImg.value.set(tex.image.width, tex.image.height);
      });
      return m;
    });
    this.layout();
    this.onResize = () => this.layout();
    window.addEventListener('resize', this.onResize);
    this.bind();
    this.t0 = performance.now();
    this.tick = () => this.update();
    gsap.ticker.add(this.tick);
    this.canvas.__prep = () => this.update();
  }
  fallback() {
    const ul = document.createElement('ul');
    ul.className = 'inquire-links';
    ul.style.cssText = 'position:fixed;inset:0;flex-direction:column;justify-content:center;align-items:center';
    ul.innerHTML = this.projects.map((p) => `<li><a href="#projet-${p.slug}">${esc(p.name + p.ext)}</a></li>`).join('');
    this.root.appendChild(ul);
  }
  layout() {
    const w = innerWidth, hh = innerHeight;
    this.renderer.setPixelRatio(DPR());
    this.renderer.setSize(w, hh, false);
    this.camera.aspect = w / hh; this.camera.updateProjectionMatrix();
    this.vh = 2 * 5 * Math.tan(THREE.MathUtils.degToRad(22.5));
    this.vw = this.vh * this.camera.aspect;
    const frac = w <= 600 ? 0.55 : w <= 1000 ? 0.5 : 0.65;
    const aspect = w <= 600 ? 2 / 3 : 1.5;
    let sh = this.vh * frac, sw = sh * aspect;
    if (sw > this.vw * 0.75) { sw = this.vw * 0.75; sh = sw / aspect; }
    this.sw = sw; this.sh = sh; this.step = sw * 1.05;
    this.R0 = Math.max(this.vw * 1.05, sw * 1.8);
    this.ppw = hh / this.vh;
    this.corner = 8 / this.ppw;
    const dpr = DPR();
    this.shared.uCell.value.set(8 * dpr, 14 * dpr);
    this.shared.uRadiusPx.value = 150 * dpr;
    this.dpr = dpr;
  }
  bind() {
    const r = this.root;
    this.onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (this.expanded) { this.collapse(); return; }
      this.dragging = true; this.moved = 0;
      this.downX = e.clientX; this.downY = e.clientY;
      this.startTarget = this.target; this.lastX = e.clientX; this.lastT = performance.now(); this.pv = 0;
      r.classList.add('is-dragging');
    };
    this.onMove = (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.downX;
      this.moved = Math.max(this.moved, Math.abs(dx), Math.abs(e.clientY - this.downY));
      const stepPx = this.step * this.ppw;
      this.target = this.startTarget - (dx * 1.3) / stepPx;
      const now = performance.now(), dtm = Math.max(1, now - this.lastT);
      const inst = (-(e.clientX - this.lastX) * 1.3 / stepPx) / (dtm / 1000);
      this.pv = lerp(this.pv, inst, 0.35);
      this.lastX = e.clientX; this.lastT = now;
    };
    this.onUp = (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      r.classList.remove('is-dragging');
      if (this.moved < 6) { this.tap(e); return; }
      if (performance.now() - this.lastT > 90) this.pv = 0;
      this.target = Math.round(this.x + this.pv / 2);
    };
    this.onWheel = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      if (this.expanded) return;
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = clamp(raw * (e.deltaMode === 1 ? 16 : 1), -160, 160) * 1.8;
      this.target += delta / (this.step * this.ppw);
      clearTimeout(this.snapT);
      this.snapT = setTimeout(() => { this.target = Math.round(this.target); }, 150);
    };
    this.onKey = (e) => {
      if (document.querySelector('.nav.is-menu-open')) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); if (!this.expanded) this.target = clamp(Math.round(this.target) + 1, this.x - 4, this.x + 4); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); if (!this.expanded) this.target = clamp(Math.round(this.target) - 1, this.x - 4, this.x + 4); }
      else if (k === 'Enter' || k === ' ') { if (document.activeElement === this.root || document.activeElement === document.body) { e.preventDefault(); this.expand(); } }
      else if (k === 'Escape') this.collapse();
    };
    r.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    r.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKey);
  }
  activeOffset() {
    let d = ((this.active - this.x) % this.T + this.T) % this.T; if (d > this.T / 2) d -= this.T;
    return d;
  }
  centerRect() {
    const w = this.sw * this.ppw, hh = this.sh * this.ppw;
    const cx = innerWidth / 2 + this.activeOffset() * this.step * this.ppw;
    return { left: cx - w / 2, right: cx + w / 2, top: innerHeight / 2 - hh / 2, bottom: innerHeight / 2 + hh / 2 };
  }
  inCenter(x, y) { const r = this.centerRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; }
  tap(e) {
    if (this.inCenter(e.clientX, e.clientY)) { this.expand(); return; }
    const r = this.centerRect();
    if (e.clientX < r.left) this.target = Math.round(this.target) - 1;
    else if (e.clientX > r.right) this.target = Math.round(this.target) + 1;
  }
  settled() { return !this.dragging && Math.abs(this.v) < 0.05 && Math.abs(this.target - this.x) < 0.03; }
  expand() {
    if (this.expanded || this.dead) return;
    this.expanded = true;
    this.target = Math.round(this.x);
    this.root.classList.add('is-expanded'); this.root.classList.remove('is-clickable');
    Sound.play('slash', { dir: 1 });
    this.onExpand && this.onExpand();
    this.expTween = gsap.to(this, {
      expandP: 1, duration: REDUCED ? 0.01 : 1.2, ease: 'power4.inOut',
      onComplete: () => { this.navigating = true; this.onOpen && this.onOpen(this.projects[this.active]); },
    });
  }
  collapse() {
    if (!this.expanded || this.navigating) return;
    this.expTween && this.expTween.kill();
    this.onCollapse && this.onCollapse();
    gsap.to(this, { expandP: 0, duration: 1, ease: 'power4.inOut', onComplete: () => { this.expanded = false; this.root.classList.remove('is-expanded'); } });
  }
  start(delay = 0) {
    if (this.dead || REDUCED) return;
    gsap.fromTo(this.shared.uIntro, { value: 0 }, { value: 1, duration: 5, ease: 'power3.out', delay: 0.75 + delay });
  }
  update() {
    if (this.dead) return;
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    const T = this.T;
    const k = this.dragging ? 45 : 8;
    const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
    for (let s2 = 0; s2 < n; s2++) {
      const acc = k * k * (this.target - this.x) - 2 * k * this.v;
      this.v += acc * h; this.x += this.v * h;
    }
    if (!Number.isFinite(this.x)) { this.x = this.target = Math.round(this.target) || 0; this.v = 0; }
    this.velEase = damp(this.velEase, clamp(this.v / 10, -1, 1), 5, dt);
    const av = Math.abs(this.velEase) * (1 - this.expandP);
    this.camera.position.z = 5 + av * 0.5;
    const R = this.R0 * (1 + av * 0.8);
    const ai = ((Math.round(this.x) % T) + T) % T;
    if (ai !== this.active) {
      const first = this.active === -1;
      this.active = ai;
      if (!first) Sound.play('slide');
      this.onActive && this.onActive(ai, first);
    }
    // pointeur
    const s = this.shared;
    s.uTime.value = (performance.now() - this.t0) / 1000;
    s.uMouse.value.set(POINTER.x * this.dpr, (innerHeight - POINTER.y) * this.dpr);
    const tx = clamp(POINTER.vx * 16 / (this.sw * this.ppw), -0.08, 0.08);
    const ty = clamp(-POINTER.vy * 16 / (this.sh * this.ppw), -0.08, 0.08);
    s.uMouseVel.value.set(damp(s.uMouseVel.value.x, tx * (1 - this.expandP), 6, dt), damp(s.uMouseVel.value.y, ty * (1 - this.expandP), 6, dt));
    const E = this.expandP;
    this.meshes.forEach((m, i) => {
      let d = ((i - this.x) % T + T) % T; if (d > T / 2) d -= T;
      const u = m.material.uniforms;
      const isA = i === this.active;
      const e = isA ? E : 0;
      u.uOffset.value = isA ? lerp(d * this.step, 0, E) : d * this.step * (1 + E * 0.9);
      u.uSize.value.set(lerp(this.sw, this.vw * 1.003, e), lerp(this.sh, this.vh * 1.003, e));
      u.uRadius.value = R;
      u.uCurve.value = 1 - E;
      u.uVel.value = this.velEase * (1 - E);
      u.uAlpha.value = isA ? 1 : 1 - E;
      u.uCorner.value = this.corner * (1 - e);
      m.renderOrder = isA ? 2 : 1;
      m.visible = Math.abs(d * this.step) / R < 1.45;
    });
    if (!this.expanded && !this.dragging && HOVER) {
      const on = this.settled() && this.inCenter(POINTER.x, POINTER.y);
      this.root.classList.toggle('is-clickable', on);
    }
    this.renderer.render(this.scene, this.camera);
  }
  destroy() {
    if (this.renderer == null) return;
    this.dead = true;
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this); gsap.killTweensOf(this.shared.uIntro);
    clearTimeout(this.snapT);
    window.removeEventListener('resize', this.onResize);
    this.root.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.root.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
    this.meshes.forEach((m) => { const t = m.material.uniforms.uTex.value; t && t.dispose(); m.material.dispose(); });
    this.meshes[0] && this.meshes[0].geometry.dispose();
    this.glyph.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer = null;
    this.canvas.remove();
  }
}
