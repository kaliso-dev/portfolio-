import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/* ==========================================================================
   CONFIG — le contenu du site (en français ; traductions EN / AR dans 00b-i18n.js).
   Les expériences et clients ci-dessous sont des EXEMPLES fictifs, tout comme
   les projets de src/projets/ : remplace-les par tes vraies réalisations.
   ========================================================================== */
const SITE = {
  name: 'Sofiene Lamsouni',
  handle: 'lamsouni',
  role: 'Développeur · sites, apps, API & IA',
  email: 'kaliso.dev@gmail.com',
  accent: 'blanc', // blanc (par défaut) | vert | ambre | laiton | majorelle | marrakech
  // API Cloudflare (KALISO, tickets, forge allumée). '' = même adresse que le site (tout sur Cloudflare).
  // Si le site reste sur Netlify : mets l'adresse du Worker, ex. 'https://kaliso.ton-compte.workers.dev'
  api: '',
  // musique d'ambiance (fichier dans src/assets/audio) — gate : invite « dégainer » en fin de chargement
  // « What The Sand Saw » — Alex Melodic, FesliyanStudios.com (crédit obligatoire sans licence commerciale)
  music: {
    src: 'assets/audio/what-the-sand-saw.mp3', title: 'What The Sand Saw', artist: 'Alex Melodic',
    credit: 'FesliyanStudios.com', creditUrl: 'https://www.fesliyanstudios.com',
    volume: 0.16, start: 0, end: 192, xfade: 3.5, gate: true,
  },
  location: 'Remote — partout où la quête m\'appelle',
  heroWord: 'KALISO',
  os: 'KNIGHT.OS',
  version: 'v1.7',
  motto: 'Forgé avec Claude, trempé à la main',
  since: 2019,
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { label: 'X', url: 'https://x.com/' },
  ],
  home: {
    footer: ['Développeur × Claude', 'Toutes quêtes · toutes tailles'],
    loreLeft: '$ whoami — développeur qui forge avec Claude, l\'IA d\'Anthropic. Sites, apps, API, SaaS, agents IA, automatisations, outils internes : quel que soit le projet, je le mène de l\'idée à la mise en ligne.',
    loreRight: '…dans ma forge, Claude frappe vite et je tiens la lame : architecture, choix, relecture, finition. La cadence d\'une caravane entière, l\'exigence d\'un artisan. Aucune quête trop petite, aucune trop lourde.',
  },
  workLabel: '$ ls ./armurerie — 2023 — 2026',
  about: {
    ring: 'Sofiene Lamsouni forge avec Claude / sites, apps, API, SaaS, agents IA, automatisations / n\'importe quel projet, de l\'idée à la mise en ligne / la vitesse de l\'IA, l\'exigence de l\'artisan / chaque lame trempée, chaque ligne relue / pas de niche, pas de limite, seulement ce qui tient / ',
    door: 'Développeur augmenté par Claude. Je forge des sites, des applications, des API, des outils et des agents IA, quelle que soit la taille de la quête, avec la patience d\'un artisan et la rigueur d\'un fāris.',
    intro: 'Je ne me range dans aucune case. La vitrine d\'un artisan, une API de paiement, une app mobile, un SaaS, un agent IA ou le script qui rend trois heures par jour à une équipe : si ça se code, je le forge. Claude est mon second sabre : il accélère, je décide, je relis, je livre.',
    portraitTitle: 'Le Serment',
    portraitLines: ['Développeur × Claude', 'Site · App · API · IA · Outil'],
    skills: ['Sites vitrines', 'E-commerce', 'Applications web', 'Apps mobiles', 'API & back-end', 'SaaS', 'Agents IA', 'Automatisations', 'Outils internes', 'Intégrations', 'WebGL & 3D', 'DevOps & mise en ligne'],
    stack: ['Claude (Anthropic)', 'TypeScript', 'React / Next.js', 'Node.js', 'Python', 'Go', 'React Native', 'PostgreSQL', 'Three.js', 'Docker', 'AWS · Vercel · Netlify'],
    copy: 'Je travaille avec Claude comme un forgeron avec son soufflet : il attise, j\'oriente chaque coup. Résultat : des projets livrés plus vite, sans rien céder sur l\'architecture, la sécurité ni la finition. Fondateurs, artisans, studios, PME, équipes produit : apportez la quête, je forge l\'arme. En remote, partout.',
    experience: [
      ['2024 — Auj.', 'Forge indépendante · Développeur × Claude'],
      ['2022 — 2024', 'Lead développeur · Atelier Médina'],
      ['2020 — 2022', 'Full-Stack · Agence Caravane'],
      ['2019 — 2020', 'Développeur · Startup Oasis'],
    ],
    clients: ['Maison Zellige', 'Atelier de Fès', 'Caravane Studio', 'Banque Atlas', 'Oasis Labs', 'Souk & Co', 'Ksar Records', 'Nour Éditions', 'Médina Games', 'Sahara Data', 'Collectif Bab', 'Riad Hôtels'],
  },
  contact: {
    copy: 'Une quête en tête ? Site, app, API, SaaS, agent IA, automatisation, refonte ou simple idée griffonnée sur un coin de table : décris-la en quelques lignes, ou ouvre un ticket dans le terminal. Réponse sous 48 h, avec un plan de bataille.',
    commands: ['ticket --nouvelle-quete', 'forge "une boutique pour mon atelier"', 'mail --to kaliso.dev@gmail.com', 'echo "salam" | mail kaliso.dev@gmail.com'],
  },
  // les projets vivent dans src/projets/*.md (une fiche par projet, en FR / EN / AR) :
  // build.py les lit et les injecte ici. Gabarit pour le Claude de chaque projet : docs/gabarit-etude-de-cas.md
  // illustrations des diapos du compte rendu (remplies par build.py depuis src/assets/forge/)
  forgeArt: /*__FORGE_ART__*/{},
  projects: /*__PROJETS__*/[],
};
