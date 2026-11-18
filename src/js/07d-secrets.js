/* ==========================================================================
   SECRETS — sept sceaux cachés dans le site. Les briser tous ouvre le trésor
   (accent « or », et la marque ⚜ 7/7 sur les tickets envoyés ensuite).
   ========================================================================== */
const SEALS = ['konami', 'salam', 'knight', 'duel', 'desert', 'console', 'polyglot'];
const Seals = {
  got: new Set(), langs: new Set(),
  load() {
    try {
      this.got = new Set(JSON.parse(localStorage.getItem('kaliso-seals') || '[]').filter((x) => SEALS.includes(x)));
      this.langs = new Set(JSON.parse(localStorage.getItem('kaliso-langs') || '[]').filter((x) => LANGS.includes(x)));
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem('kaliso-seals', JSON.stringify([...this.got]));
      localStorage.setItem('kaliso-langs', JSON.stringify([...this.langs]));
    } catch (e) {}
  },
  has(id) { return this.got.has(id); },
  count() { return this.got.size; },
  all() { return this.got.size >= SEALS.length; },
  find(id) {
    if (!SEALS.includes(id) || this.got.has(id)) return false;
    this.got.add(id);
    this.save();
    Sound.play('select');
    this.toast(t('seal.found', { n: this.got.size, t: SEALS.length, name: t('seal.' + id) }), this.all() ? '' : t('seal.more'));
    if (this.all()) setTimeout(() => this.toast(t('seal.all'), '', true), 4200);
    return true;
  },
  // le polyglotte : avoir visité le site dans les trois langues
  lang(l) { this.langs.add(LANG); this.langs.add(l); this.save(); },
  toast(msg, sub, big) {
    const n = document.createElement('div');
    n.className = 'seal-toast' + (big ? ' is-big' : '');
    n.setAttribute('role', 'status');
    n.innerHTML = `<span class="st-glyph" aria-hidden="true">⟐</span><span class="st-txt"><b></b>${sub ? '<small></small>' : ''}</span>`;
    n.querySelector('b').textContent = msg;
    if (sub) n.querySelector('small').textContent = sub;
    document.body.appendChild(n);
    const tl = gsap.timeline({ onComplete: () => n.remove() });
    tl.fromTo(n, { opacity: 0, y: 24, xPercent: -50 }, { opacity: 1, y: 0, xPercent: -50, duration: 0.6, ease: 'power3.out' })
      .fromTo(n.querySelector('.st-glyph'), { rotation: -180, scale: 0.4 }, { rotation: 0, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 0)
      .to(n, { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' }, big ? 7 : 4.2);
  },
  konami() {
    this.find('konami');
    // l'accent parcourt toute la palette, puis revient
    const back = ACCENT.name;
    const keys = Object.keys(ACCENTS).filter((k) => !ACCENTS[k].secret);
    keys.concat([back]).forEach((k, i) => setTimeout(() => setAccent(k), i * 150));
  },
  init() {
    this.load();
    this.langs.add(LANG);
    this.save();
    if (this.langs.size >= LANGS.length) setTimeout(() => this.find('polyglot'), 6500);
    const K = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let ki = 0, buf = '';
    window.addEventListener('keydown', (e) => {
      ki = e.code === K[ki] ? ki + 1 : (e.code === K[0] ? 1 : 0);
      if (ki === K.length) { ki = 0; this.konami(); }
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-8);
      if (buf.endsWith('salam')) { buf = ''; this.find('salam'); }
    });
    window.kaliso = {
      sceau: () => (this.find('console') ? '⟐' : '⟐ ' + this.count() + '/' + SEALS.length),
      sceaux: () => `${this.count()}/${SEALS.length}`,
    };
    try { console.log('%c KALISO %c ' + t('seal.console.log'), 'background:#127d5f;color:#fff;font-weight:bold;padding:2px 6px;border-radius:2px', 'color:inherit'); } catch (e) {}
  },
};
