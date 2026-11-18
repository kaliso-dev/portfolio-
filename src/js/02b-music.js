/* ==========================================================================
   MUSIQUE — ambiance en boucle pendant la visite
   Les navigateurs interdisent le son avant une interaction : on tente la lecture
   au chargement, sinon elle démarre au premier clic / touche (ou à l'invite
   « dégainer » de fin de chargement). Fondu d'entrée, boucle en fondu enchaîné
   (deux lectures qui se relaient), baisse pendant les coups d'épée, pause quand
   l'onglet est caché.
   ========================================================================== */
const Music = {
  els: [], cur: 0, gains: [], gain: null, playing: false, failed: false, vol: 0.16, xfading: false,
  init() {
    const m = SITE.music;
    if (!m || !m.src) return;
    this.vol = m.volume != null ? m.volume : 0.16;
    this.loopStart = m.start || 0;
    this.xfade = m.xfade != null ? m.xfade : 3.5;
    this.els = [0, 1].map((i) => {
      const el = new Audio();
      el.preload = i ? 'none' : 'auto';
      el.src = m.src;
      // fichier absent ou illisible : on renonce à la musique (et à l'invite « dégainer »)
      el.addEventListener('error', () => { if (i === 0) { this.failed = true; this.playing = false; this.sync(); } });
      el.addEventListener('timeupdate', () => this.watch(el));
      el.addEventListener('ended', () => { if (this.playing && el === this.els[this.cur] && !this.xfading) this.swap(true); });
      return el;
    });
    document.addEventListener('visibilitychange', () => {
      if (!this.playing) return;
      if (document.hidden) this.els.forEach((el) => el.pause());
      else this.els[this.cur].play().catch(() => {});
    });
    // premier geste du visiteur : la musique démarre
    const first = (e) => {
      const t = e && e.target;
      if (t && t.closest && t.closest('.pl-mute')) return;   // « entrer sans son »
      if (e && e.key === 'Escape') return;
      if (Sound.on) this.start();
    };
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, first, { passive: true }));
    // si le navigateur autorise déjà le son (visiteur habitué), on lance tout de suite
    try {
      Sound.unlock();
      setTimeout(() => { if (Sound.ctx && Sound.ctx.state === 'running' && Sound.on) this.start(); }, 60);
    } catch (e) {}
    this.sync();
  },
  // fin de boucle : SITE.music.end, sinon la durée du fichier
  loopEnd(el) { return Math.min(SITE.music.end || Infinity, el.duration || Infinity); },
  watch(el) {
    if (!this.playing || this.xfading || el !== this.els[this.cur]) return;
    if (el.currentTime >= this.loopEnd(el) - this.xfade) this.swap(false);
  },
  // relais : la lecture suivante repart du début en fondu pendant que l'actuelle s'efface
  swap(hard) {
    const a = this.els[this.cur], ni = 1 - this.cur, b = this.els[ni];
    const ga = this.gains[this.cur], gb = this.gains[ni];
    const t = hard || !ga ? 0.05 : this.xfade;
    this.xfading = true;
    b.preload = 'auto';
    try { b.currentTime = this.loopStart; } catch (e) {}
    const n = Sound.ctx ? Sound.ctx.currentTime : 0;
    if (gb) { gb.gain.cancelScheduledValues(n); gb.gain.setValueAtTime(0, n); gb.gain.linearRampToValueAtTime(1, n + t); }
    if (ga) { ga.gain.cancelScheduledValues(n); ga.gain.setValueAtTime(ga.gain.value, n); ga.gain.linearRampToValueAtTime(0, n + t); }
    b.play().catch(() => {});
    this.cur = ni;
    setTimeout(() => { a.pause(); this.xfading = false; }, t * 1000 + 80);
  },
  // routage Web Audio : deux voies (fondu enchaîné) -> volume musique -> sortie
  graph() {
    const c = Sound.ctx;
    if (this.gain) return true;
    if (!c || !c.createMediaElementSource) return false;
    try {
      const master = c.createGain();
      master.gain.value = 0;
      master.connect(c.destination);
      this.gains = this.els.map((el, i) => {
        const g = c.createGain();
        g.gain.value = i === this.cur ? 1 : 0;
        c.createMediaElementSource(el).connect(g);
        g.connect(master);
        return g;
      });
      this.gain = master;
      return true;
    } catch (e) { this.gain = null; this.gains = []; return false; }
  },
  ramp(v, t) {
    if (this.gain) {
      const n = Sound.ctx.currentTime, g = this.gain.gain;
      g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(v, n + t);
    } else {
      gsap.to(this.els[this.cur], { volume: clamp(v / Math.max(this.vol, 0.01) * 0.35, 0, 1), duration: t, overwrite: true });
    }
  },
  start(fade = 3) {
    const el = this.els[this.cur];
    if (!el || this.failed || this.playing || !Sound.on) return Promise.resolve(this.playing);
    Sound.unlock();
    this.graph();
    if (!this.gain) { el.volume = 0; el.loop = true; }
    if (el.currentTime < this.loopStart) { try { el.currentTime = this.loopStart; } catch (e) {} }
    this.playing = true;
    this.sync();
    // la seconde voie (relais de boucle) se précharge en arrière-plan, depuis le cache du navigateur
    if (!this.preloaded) { this.preloaded = true; setTimeout(() => { const b = this.els[1 - this.cur]; if (b.preload !== 'auto') { b.preload = 'auto'; b.load(); } }, 6000); }
    return Promise.resolve(el.play()).then(() => { this.ramp(this.vol, fade); return true; })
      .catch(() => { this.playing = false; this.sync(); return false; });
  },
  stop(fade = 0.8) {
    if (!this.els.length || !this.playing) return;
    this.playing = false;
    this.ramp(0, fade);
    setTimeout(() => { if (!this.playing) this.els.forEach((el) => el.pause()); }, fade * 1000 + 60);
    this.sync();
  },
  // le coup d'épée passe devant : la musique s'efface un instant
  duck() {
    if (!this.playing || !this.gain) return;
    const n = Sound.ctx.currentTime, g = this.gain.gain, low = this.vol * 0.35;
    g.cancelScheduledValues(n); g.setValueAtTime(g.value, n);
    g.linearRampToValueAtTime(low, n + 0.05); g.setValueAtTime(low, n + 0.5); g.linearRampToValueAtTime(this.vol, n + 1.8);
  },
  onSound(on) { if (on) this.start(1.5); else this.stop(0.6); },
  // boutons son (nav + menu) toujours à jour
  sync() {
    const on = Sound.on;
    $$('.nav-snd').forEach((b) => {
      b.classList.toggle('is-playing', this.playing);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
    });
    $$('.snd-toggle').forEach((b) => { b.textContent = `son : ${on ? 'on' : 'off'}`; b.setAttribute('aria-pressed', String(on)); });
  },
};
