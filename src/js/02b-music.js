/* ==========================================================================
   MUSIQUE — ambiance en boucle pendant la visite
   Les navigateurs interdisent le son avant une interaction : on tente la lecture
   au chargement, sinon elle démarre au premier clic / touche (ou à l'invite
   « dégainer » de fin de chargement). Fondu d'entrée, baisse pendant les coups
   d'épée, pause quand l'onglet est caché.
   ========================================================================== */
const Music = {
  el: null, node: null, gain: null, playing: false, vol: 0.18,
  init() {
    const m = SITE.music;
    if (!m || !m.src) return;
    this.vol = m.volume != null ? m.volume : 0.18;
    const el = (this.el = new Audio());
    el.preload = 'auto';
    el.src = m.src;
    el.volume = 1;
    // boucle « propre » : on saute le silence du début à chaque tour
    el.addEventListener('ended', () => { if (this.playing) { el.currentTime = m.start || 0; el.play().catch(() => {}); } });
    document.addEventListener('visibilitychange', () => {
      if (!this.playing) return;
      if (document.hidden) el.pause(); else el.play().catch(() => {});
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
  // routage Web Audio (indispensable pour régler le volume sur iOS)
  graph() {
    const c = Sound.ctx;
    if (this.node) return true;
    if (!c || !c.createMediaElementSource) return false;
    try {
      this.node = c.createMediaElementSource(this.el);
      this.gain = c.createGain();
      this.gain.gain.value = 0;
      this.node.connect(this.gain);
      this.gain.connect(c.destination);
      return true;
    } catch (e) { return false; }
  },
  ramp(v, t) {
    if (this.gain) {
      const n = Sound.ctx.currentTime, g = this.gain.gain;
      g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(v, n + t);
    } else gsap.to(this.el, { volume: clamp(v / Math.max(this.vol, 0.01) * 0.35, 0, 1), duration: t, overwrite: true });
  },
  start(fade = 3) {
    if (!this.el || this.playing || !Sound.on) return Promise.resolve(this.playing);
    Sound.unlock();
    this.graph();
    if (!this.gain) this.el.volume = 0;
    if (this.el.currentTime < (SITE.music.start || 0)) { try { this.el.currentTime = SITE.music.start || 0; } catch (e) {} }
    this.playing = true;
    this.sync();
    return Promise.resolve(this.el.play()).then(() => { this.ramp(this.vol, fade); return true; })
      .catch(() => { this.playing = false; this.sync(); return false; });
  },
  stop(fade = 0.8) {
    if (!this.el || !this.playing) return;
    this.playing = false;
    this.ramp(0, fade);
    setTimeout(() => { if (!this.playing) this.el.pause(); }, fade * 1000 + 60);
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
