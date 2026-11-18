// Libellés partagés par l'API et le dashboard (clés courtes stockées en base)
export const LANGS = ['fr', 'en', 'ar'];

export const TYPES = {
  vitrine: 'Site vitrine',
  ecommerce: 'Site e-commerce',
  webapp: 'Application web / SaaS',
  mobile: 'Application mobile',
  api: 'API / back-end',
  ia: 'Agent IA / automatisation',
  outil: 'Outil interne / intégration',
  autre: 'Autre',
};

export const BUDGETS = {
  lt2k: '< 2 k€',
  '2-5k': '2 – 5 k€',
  '5-10k': '5 – 10 k€',
  '10k+': '10 k€ et +',
  tbd: 'À définir ensemble',
};

export const DELAIS = {
  urgent: 'Urgent (< 2 semaines)',
  '1m': 'Sous 1 mois',
  '2-3m': '2 – 3 mois',
  flex: 'Flexible',
};

export const STATUTS = {
  nouveau: 'Nouveau',
  discussion: 'En discussion',
  devis: 'Devis envoyé',
  forge: 'En forge',
  livre: 'Livré',
  archive: 'Archivé',
};

export const MODULES = ['paiement', 'auth', 'admin', 'multilingue', 'ia', 'temps-reel', 'integrations', 'mobile-natif', 'contenu', '3d'];
