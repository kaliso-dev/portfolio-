/* ==========================================================================
   TA GRILLE TARIFAIRE — c'est elle, et elle seule, qui donne les fourchettes.
   KALISO (le modèle d'IA) ne fixe jamais un prix : il comprend la demande,
   classe le projet, note sa complexité (1 à 5) et les modules nécessaires.
   Le calcul ci-dessous transforme ça en fourchette indicative.

   ⚠ Valeurs de départ À AJUSTER selon tes vrais tarifs avant la mise en ligne.
   Pour ne rien afficher, mets `afficher: false` : KALISO donnera le plan
   sans chiffres et invitera à ouvrir un ticket.
   ========================================================================== */
export const TARIFS = {
  afficher: true,
  devise: 'EUR',
  arrondi: 100, // les montants sont arrondis à la centaine

  // projet « moyen » (complexité 3, sans module) : prix [min, max] et semaines [min, max]
  base: {
    vitrine: { prix: [900, 2200], semaines: [1, 3] },
    ecommerce: { prix: [2500, 6000], semaines: [3, 6] },
    webapp: { prix: [4000, 11000], semaines: [4, 10] },
    mobile: { prix: [5000, 13000], semaines: [5, 12] },
    api: { prix: [2000, 6500], semaines: [2, 6] },
    ia: { prix: [2500, 8000], semaines: [2, 7] },
    outil: { prix: [1500, 5000], semaines: [1, 5] },
    autre: { prix: [1200, 6000], semaines: [1, 6] },
  },

  // multiplicateur selon la complexité notée par KALISO
  complexite: { 1: 0.55, 2: 0.75, 3: 1, 4: 1.4, 5: 1.9 },

  // supplément (en %) par module détecté
  modules: {
    paiement: 0.12,
    auth: 0.08,
    admin: 0.1,
    multilingue: 0.08,
    ia: 0.15,
    'temps-reel': 0.12,
    integrations: 0.1,
    'mobile-natif': 0.2,
    contenu: 0.05,
    '3d': 0.18,
  },
};

const round = (v, step) => Math.max(step, Math.round(v / step) * step);

export function estimer(plan, T = TARIFS) {
  if (!T.afficher || !plan) return null;
  const b = T.base[plan.type] || T.base.autre;
  const kc = T.complexite[plan.complexity] || 1;
  const km = 1 + (plan.modules || []).reduce((s, m) => s + (T.modules[m] || 0), 0);
  const k = kc * km;
  const kt = Math.sqrt(k); // le temps grandit moins vite que le budget
  return {
    devise: T.devise,
    prix: [round(b.prix[0] * k, T.arrondi), round(b.prix[1] * k, T.arrondi)],
    semaines: [Math.max(1, Math.round(b.semaines[0] * kt)), Math.max(1, Math.round(b.semaines[1] * kt))],
  };
}
