/* ==========================================================================
   SOUND — sons synthétisés (Web Audio), aucun fichier
   Chaîne : voix -> (dry + envoi réverbe) -> lowpass doux -> compresseur -> sortie
   select / menuOpen / menuClose / slide / click / slash
   ========================================================================== */
const Sound = {
  ctx: null, out: null, verb: null, pink: null, white: null, on: true, lastSlide: 0,
  init() {
    try { this.on = localStorage.getItem('knight-snd') !== 'off'; } catch (e) {}
    const unlock = () => this.unlock();
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
    });
  },
  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.setup(new AC());
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {}
  },
  setup(c) {
        this.ctx = c;
        const sr = c.sampleRate;
        // sortie : lowpass doux + compresseur, volume global bas
        const comp = c.createDynamicsCompressor();
        comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; lp.Q.value = 0.5;
        const master = c.createGain(); master.gain.value = 0.5;
        lp.connect(comp); comp.connect(master); master.connect(c.destination);
        this.out = lp; this.master = master;
        // réverbe courte générée (petite salle de pierre)
        const len = Math.floor(sr * 1.8);
        const ir = c.createBuffer(2, len, sr);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          let lpS = 0;
          for (let i = 0; i < len; i++) {
            const t = i / sr;
            lpS += (Math.random() * 2 - 1 - lpS) * (0.55 - 0.4 * Math.min(t / 1.8, 1));
            d[i] = lpS * Math.pow(1 - i / len, 2.6) * (t < 0.012 ? t / 0.012 : 1);
          }
        }
        const conv = c.createConvolver(); conv.buffer = ir;
        const wet = c.createGain(); wet.gain.value = 0.32;
        conv.connect(wet); wet.connect(lp);
        this.verb = conv;
        // bruits : rose (souffles) et blanc (transitoires)
        const n = sr * 2;
        this.pink = c.createBuffer(1, n, sr); this.white = c.createBuffer(1, n, sr);
        const P = this.pink.getChannelData(0), W = this.white.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1; W[i] = w;
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
          P[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
        }
        this.loadSamples(c);
  },
  // échantillons embarqués (base64 -> AudioBuffer)
  samples: {},
  loadSamples(c) {
    const decode = (key, b64) => {
      try {
        const bin = atob(b64), u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const ok = (buf) => { if (this.ctx === c) this.samples[key] = buf; };
        const pr = c.decodeAudioData(u8.buffer, ok, () => {});
        if (pr && pr.catch) pr.then(ok).catch(() => {});
      } catch (e) {}
    };
    if (typeof SFX_SWORD_B64 === 'string') decode('sword', SFX_SWORD_B64);
  },
  // lecture d'un échantillon : volume, panoramique (balayage optionnel), petit envoi réverbe
  sample(key, { delay = 0, vol = 0.3, rate = 1, pan0 = 0, pan1 = pan0, panDur = 0.5, send = 0.1 } = {}) {
    const buf = this.samples[key];
    if (!buf) return false;
    const c = this.ctx, t = c.currentTime + 0.005 + delay;
    const src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = c.createGain(); g.gain.value = vol;
    let node = g;
    if (c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan0, t); p.pan.linearRampToValueAtTime(pan1, t + panDur);
      g.connect(p); node = p;
    }
    node.connect(this.master);
    if (send > 0) { const sg = c.createGain(); sg.gain.value = send; node.connect(sg); sg.connect(this.verb); }
    src.connect(g); src.start(t);
    return true;
  },
  toggle(persist = true) {
    this.on = !this.on;
    if (persist) { try { localStorage.setItem('knight-snd', this.on ? 'on' : 'off'); } catch (e) {} }
    if (typeof Music !== 'undefined') { Music.onSound(this.on); Music.sync(); }
    return this.on;
  },

  /* --- briques ------------------------------------------------------------ */
  // bus voix : gain -> panoramique -> sortie (+ envoi réverbe)
  bus(pan = 0, send = 0.2, vol = 1) {
    const c = this.ctx, g = c.createGain();
    g.gain.value = vol;
    let node = g;
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
    node.connect(this.out);
    if (send > 0) { const s = c.createGain(); s.gain.value = send; node.connect(s); s.connect(this.verb); }
    g.panNode = node === g ? null : node;
    return g;
  },
  // enveloppe percussive (attaque linéaire courte, déclin exponentiel)
  perc(param, t, peak, a, d) {
    param.cancelScheduledValues(t);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + a);
    param.setTargetAtTime(0, t + a, d / 4);
  },
  // partiel sinusoïdal
  partial(dest, t, f, peak, a, d, glide = 1) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t);
    if (glide !== 1) o.frequency.exponentialRampToValueAtTime(f * glide, t + d);
    this.perc(g.gain, t, peak, a, d);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + d * 2.6 + 0.05);
  },
  // bruit filtré (balayage de fréquence optionnel)
  noise(dest, t, { buf = 'pink', type = 'bandpass', f0 = 1000, f1 = f0, q = 1, peak = 0.1, a = 0.01, d = 0.2, curve = 'exp' } = {}) {
    const c = this.ctx, s = c.createBufferSource();
    s.buffer = buf === 'white' ? this.white : this.pink;
    s.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + a + d);
    const g = c.createGain();
    if (curve === 'swell') {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    } else this.perc(g.gain, t, peak, a, d);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.6); s.stop(t + a + d * 2.6 + 0.05);
    return f;
  },

  /* --- sons --------------------------------------------------------------- */
  play(name, opts = {}) {
    if (!this.on || !this.ctx || (this.ctx.state !== 'running' && !this.offline)) return;
    try {
      const c = this.ctx, t = c.currentTime + 0.005;
      const rnd = (k) => 1 + (Math.random() * 2 - 1) * k;
      switch (name) {
        case 'select': {
          // « tok » de bois feutré + petit éclat de verre
          const b = this.bus(0, 0.18, 6);
          this.noise(b, t, { buf: 'white', type: 'bandpass', f0: 1900 * rnd(0.04), q: 9, peak: 0.22, a: 0.001, d: 0.045 });
          this.partial(b, t, 620 * rnd(0.02), 0.05, 0.002, 0.07, 0.92);
          this.partial(b, t + 0.004, 2480 * rnd(0.02), 0.012, 0.002, 0.12);
          break;
        }
        case 'menuOpen':
        case 'menuClose': {
          // souffle d'étoffe (rideau) + accord de verre très discret
          const open = name === 'menuOpen';
          const b = this.bus(0, 0.3, 2.2);
          this.noise(b, t, { type: 'lowpass', f0: open ? 260 : 2200, f1: open ? 2200 : 260, q: 0.7, peak: 0.16, a: open ? 0.16 : 0.06, d: open ? 0.22 : 0.3, curve: 'swell' });
          this.noise(b, t + 0.02, { type: 'bandpass', f0: open ? 900 : 3800, f1: open ? 3800 : 900, q: 2.2, peak: 0.035, a: 0.12, d: 0.2, curve: 'swell' });
          const base = open ? 659.25 : 587.33; // mi5 / ré5
          [1, 1.5, 2.0].forEach((r, i) => this.partial(b, t + 0.05 + i * 0.035, base * r, 0.008, 0.02, 0.5));
          break;
        }
        case 'slide': {
          // cran mécanique d'horlogerie
          const now = performance.now();
          if (now - this.lastSlide < 40) return;
          this.lastSlide = now;
          const b = this.bus((Math.random() * 2 - 1) * 0.25, 0.06, 12);
          this.noise(b, t, { buf: 'white', type: 'bandpass', f0: 4200 * rnd(0.08), q: 12, peak: 0.12, a: 0.0006, d: 0.018 });
          this.partial(b, t, 1180 * rnd(0.03), 0.01, 0.001, 0.03);
          break;
        }
        case 'click': {
          // ouverture d'un projet : coup sourd + traîne métallique
          const b = this.bus(0, 0.35, 2.4);
          this.partial(b, t, 92, 0.22, 0.004, 0.32, 0.55);
          this.noise(b, t, { type: 'lowpass', f0: 900, f1: 180, q: 0.8, peak: 0.14, a: 0.003, d: 0.18 });
          this.noise(b, t + 0.01, { buf: 'white', type: 'bandpass', f0: 2600, q: 14, peak: 0.05, a: 0.002, d: 0.06 });
          [1, 2.76, 5.4].forEach((r, i) => this.partial(b, t + 0.012, 520 * r, [0.018, 0.01, 0.005][i], 0.004, 0.9 - i * 0.2));
          break;
        }
        case 'slash': {
          const dir = opts.dir || (Math.random() < 0.5 ? -1 : 1);
          if (typeof Music !== 'undefined') Music.duck();
          // son fourni : pic d'impact (~0,22 s dans le fichier) calé sur le passage de la lame au centre (~0,29 s)
          if (this.sample('sword', { delay: 0, vol: 0.3, rate: rnd(0.025), pan0: -0.35 * dir, pan1: 0.35 * dir, panDur: 0.45, send: 0.12 })) break;
          // repli synthétique si l'échantillon n'est pas encore décodé
          // coup d'épée : souffle qui traverse l'écran + « shing » de lame
          const b = this.bus(0, 0.28, 1.9);
          const sw = this.noise(b, t, { type: 'bandpass', f0: 320, q: 1.6, peak: 0.34, a: 0.26, d: 0.3, curve: 'swell' });
          sw.frequency.exponentialRampToValueAtTime(2600, t + 0.3);
          sw.frequency.exponentialRampToValueAtTime(700, t + 0.62);
          if (b.panNode && b.panNode.pan) { b.panNode.pan.setValueAtTime(-0.7 * dir, t); b.panNode.pan.linearRampToValueAtTime(0.7 * dir, t + 0.55); }
          this.noise(b, t + 0.08, { type: 'highpass', f0: 5200, q: 0.7, peak: 0.05, a: 0.18, d: 0.2, curve: 'swell' });
          // lame : partiels inharmoniques (barre métallique), longue résonance
          const ring = this.bus(0.15 * dir, 0.55, 1.9);
          const tr = t + 0.29, f = 1760 * rnd(0.02);
          this.noise(ring, tr, { buf: 'white', type: 'highpass', f0: 3800, q: 0.9, peak: 0.11, a: 0.002, d: 0.09 });
          [[1, 0.05, 1.3], [2.76, 0.03, 1.0], [5.4, 0.016, 0.7], [8.93, 0.008, 0.45], [1.004, 0.03, 1.4]]
            .forEach(([r, pk, d]) => this.partial(ring, tr, f * r, pk, 0.003, d));
          // légère vibration (battement) sur le fondamental
          this.partial(ring, tr, f * 0.5, 0.01, 0.01, 0.9);
          break;
        }
        default: break;
      }
    } catch (e) {}
  },
};
