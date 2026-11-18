import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/* ==========================================================================
   CONFIG — remplace tout ce qui suit par tes vraies infos.
   Les projets ci-dessous sont des exemples fictifs (noms, chiffres, textes).
   Pour utiliser une vraie image : ajoute `cover: 'data:image/jpeg;base64,...'`
   (ou un chemin relatif si tu héberges le site toi-même) et `shots: [...]`.
   ========================================================================== */
const SITE = {
  name: 'Sofiene Lamsouni',
  handle: 'lamsouni',
  role: 'Développeur Full-Stack',
  email: 'kaliso.dev@gmail.com',
  accent: 'zellige', // zellige (#127d5f) | vert | ambre | laiton | majorelle | marrakech
  // tickets du terminal : sans endpoint, ils partent par email prérempli.
  // Pour les recevoir automatiquement, mets l'URL d'un service de formulaire (ex. Formspree).
  ticket: { endpoint: '' },
  // musique d'ambiance (fichier dans src/assets/audio) — gate : invite « dégainer » en fin de chargement
  music: { src: 'assets/audio/whirling-dervish.mp3', title: 'Whirling Dervish', artist: 'Omar Faruk Tekbilek', volume: 0.18, start: 2.4, gate: true },
  location: 'Paris — Remote',
  heroWord: 'KALISO',
  os: 'KNIGHT.OS',
  version: 'v1.6',
  motto: 'Le code est mon serment',
  availability: 'Disponible Q1 2027 — places limitées',
  since: 2019,
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { label: 'X', url: 'https://x.com/' },
  ],
  home: {
    footer: ['Développeur / Creative Dev', 'Folio Nº 01', 'Disponible Q1 2027'],
    loreLeft: '$ whoami — développeur full-stack et creative developer. Je forge des interfaces, des API et des expériences WebGL qui tiennent la ligne, du premier commit au dernier pixel.',
    loreRight: '…forgé dans le terminal, chaque projet est une armure : un système robuste à l\'intérieur, une finition obsessionnelle à l\'extérieur. Pas de tendance, pas de raccourci, seulement ce qui dure.',
  },
  workLabel: '$ ls ./projets — 2023 — 2026',
  about: {
    ring: 'Sofiene Lamsouni est un développeur qui forge des interfaces qui tiennent la ligne / du premier commit au dernier pixel / front-end, back-end, WebGL et systèmes / pour des équipes qui exigent autant de rigueur que de goût / pas de tendance, pas de raccourci, seulement ce qui dure / code propre, architecture solide, détails obsessionnels / ',
    door: 'Développeur full-stack et creative developer. Je construis des interfaces, des API et des expériences WebGL — avec la patience d\'un artisan et la rigueur d\'un chevalier.',
    intro: 'Développement indépendant pour des produits qui prennent leur exécution au sérieux. Plus de cinq ans entre front-end, back-end et creative coding, avec une obsession : un travail qui tient sur chaque écran qu\'il touche.',
    portraitTitle: 'Le Serment',
    portraitLines: ['Développeur indépendant depuis 2019', 'Code / Interface / Système'],
    skills: ['Front-end', 'Back-end', 'Creative Coding', 'WebGL / GLSL', 'Design Systems', 'API & Infra', 'DevOps', 'Performance', 'Accessibilité', 'Motion', 'Mobile'],
    stack: ['TypeScript', 'React / Next.js', 'Node.js', 'Go', 'Rust', 'Python', 'Three.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    copy: 'Développeur full-stack et creative developer, avec plus de cinq ans à construire des produits web, des API et des expériences interactives. Je travaille avec des fondateurs, des studios et des équipes produit pour livrer des systèmes rapides, cohérents et faits pour durer. Basé à Paris, disponible en remote, sur recommandation.',
    experience: [
      ['2024 — Auj.', 'Freelance · Creative Developer'],
      ['2022 — 2024', 'Lead Front-end · Studio Nord'],
      ['2020 — 2022', 'Full-Stack · Agence Ligne'],
      ['2019 — 2020', 'Développeur · Startup Héraut'],
    ],
    clients: ['Maison Ferrant', 'Atelier Héraut', 'Studio Nord', 'Banque Lumen', 'Orbis Labs', 'Forge & Co', 'Halcyon', 'Rempart Records', 'Nébula Games', 'Plume Éditions', 'Corvus Data', 'Collectif Vigie'],
  },
  contact: {
    copy: 'Envoie un message court sur ce que tu construis et le rôle à pourvoir. Front-end, full-stack, creative dev, ce que le projet exige. Si le défi est bon et que le calendrier tient, tu auras une réponse sous quelques jours.',
    commands: ['mail --to kaliso.dev@gmail.com', 'cat disponibilites.txt', 'git clone ton-prochain-projet', 'echo "salam" | mail kaliso.dev@gmail.com'],
  },
  projects: [
    {
      slug: 'excalibur', name: 'EXCALIBUR', ext: '.cli', type: 'Outil CLI open-source', year: 2026, hue: 20, emblem: 'sword',
      services: ['Architecture', 'Developer Experience', 'Open Source'],
      stack: ['Rust', 'Tokio', 'Clap', 'GitHub Actions'],
      description: [
        'Un outil en ligne de commande qui provisionne un environnement de développement complet en une seule commande. Pensé comme une lame : rapide, précis, sans fioritures.',
        'Binaire unique, zéro dépendance runtime, configuration déclarative. Le genre d\'outil qu\'on oublie parce qu\'il ne casse jamais.',
      ],
      notes: [
        'Chaque commande a été chronométrée. Tout ce qui dépassait cent millisecondes a été réécrit ou supprimé.',
        'La documentation est générée depuis les tests : si un exemple ne compile pas, la release ne part pas.',
      ],
      stats: [['12k', 'Téléchargements'], ['84ms', 'Démarrage à froid'], ['0', 'Dépendance runtime'], ['46', 'Contributeurs']],
      code: `use excalibur::{Forge, Blade, Edge};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // une seule commande, un environnement complet
    let forge = Forge::open("./armory")?;
    let blade = forge
        .temper(Blade::default())
        .edge(Edge::Keen)
        .await?;

    blade.deploy("production").await?;
    println!("⚔  ready in {}ms", blade.elapsed());
    Ok(())
}`,
    },
    {
      slug: 'bastion', name: 'BASTION', ext: '.api', type: 'API & Infrastructure', year: 2025, hue: 205, emblem: 'tower',
      services: ['Back-end', 'Infrastructure', 'Sécurité'],
      stack: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Terraform'],
      description: [
        'Une API de paiement pensée comme une forteresse : chaque requête traverse trois enceintes avant de toucher la base.',
        'Rate limiting adaptatif, idempotence native, journaux signés. L\'infrastructure entière se reconstruit depuis zéro en onze minutes.',
      ],
      notes: [
        'Les tests de charge tournent chaque nuit contre une copie de la production. Une régression de latence bloque le déploiement du lendemain.',
        'Aucun secret ne vit dans le code. Tout passe par un coffre, avec rotation automatique toutes les vingt-quatre heures.',
      ],
      stats: [['99.98%', 'Disponibilité'], ['38ms', 'Latence p95'], ['2.4M', 'Requêtes / jour'], ['11min', 'Reconstruction totale']],
      code: `package bastion

func (g *Gate) Handle(w http.ResponseWriter, r *http.Request) {
    // trois enceintes avant la base
    if !g.limiter.Allow(r.RemoteAddr) {
        http.Error(w, "too many requests", 429)
        return
    }
    key := r.Header.Get("Idempotency-Key")
    if res, ok := g.cache.Get(key); ok {
        g.replay(w, res)
        return
    }
    g.keep.Serve(w, r.WithContext(signed(r.Context())))
}`,
    },
    {
      slug: 'herald', name: 'HERALD', ext: '.app', type: 'Application mobile', year: 2025, hue: 38, emblem: 'crown',
      services: ['Mobile', 'Product Design', 'Motion'],
      stack: ['React Native', 'Expo', 'Supabase', 'Reanimated'],
      description: [
        'Une application qui annonce les événements d\'une communauté locale avant tout le monde. Notifications intelligentes, carte vivante, zéro bruit.',
        'Chaque interaction a été pensée au pouce : gestes, retours haptiques et transitions à soixante images par seconde sur des appareils d\'entrée de gamme.',
      ],
      notes: [
        'Le prototype a été testé dans la rue, pas en salle. Trois écrans ont été supprimés après la première semaine.',
        'Les animations tournent entièrement sur le thread UI. Le JavaScript ne bloque jamais un geste.',
      ],
      stats: [['4.8', 'Note App Store'], ['60fps', 'Sur entrée de gamme'], ['31k', 'Utilisateurs actifs'], ['3', 'Écrans supprimés']],
      code: `export function HeraldCard({ event }: Props) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));

  return (
    <GestureDetector gesture={tap(pressed)}>
      <Animated.View style={[styles.card, style]}>
        <Crest kind={event.kind} />
        <Text style={styles.title}>{event.title}</Text>
      </Animated.View>
    </GestureDetector>
  );
}`,
    },
    {
      slug: 'sigil', name: 'SIGIL', ext: '.ui', type: 'Design System', year: 2024, hue: 268, emblem: 'shield',
      services: ['Design System', 'Front-end', 'Documentation'],
      stack: ['TypeScript', 'React', 'Storybook', 'Style Dictionary'],
      description: [
        'Un design system pour une suite de cinq produits qui ne se ressemblaient plus. Un seul sceau, des tokens partagés, des composants qui se tiennent.',
        'Thèmes clair et sombre générés depuis la même source, accessibilité testée à chaque commit, documentation vivante.',
      ],
      notes: [
        'L\'audit initial a recensé quarante-deux nuances de gris. Il en reste neuf.',
        'Chaque composant est livré avec ses états d\'erreur et de chargement. Pas d\'exception.',
      ],
      stats: [['86', 'Composants'], ['42 → 9', 'Nuances de gris'], ['5', 'Produits unifiés'], ['AA', 'Contraste WCAG']],
      code: `export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ tone = "neutral", size = "md", loading, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cx(styles.root, styles[tone], styles[size])}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner label="chargement" /> : children}
    </button>
  )
);

Button.displayName = "Sigil.Button";`,
    },
    {
      slug: 'citadel', name: 'CITADEL', ext: '.dash', type: 'Dashboard SaaS', year: 2024, hue: 142, emblem: 'key',
      services: ['Full-Stack', 'Data Viz', 'Product'],
      stack: ['Next.js', 'tRPC', 'Prisma', 'ClickHouse'],
      description: [
        'Un tableau de bord analytique pour des équipes logistiques. Des millions d\'événements, une seule vue qui dit quoi faire maintenant.',
        'Requêtes agrégées côté serveur, graphiques en streaming, filtres qui répondent avant que le doigt quitte la touche.',
      ],
      notes: [
        'La première version affichait trente graphiques. Les utilisateurs en regardaient quatre. La v2 en affiche quatre.',
        'Les requêtes les plus lourdes sont pré-calculées toutes les minutes. L\'interface n\'attend jamais la base.',
      ],
      stats: [['120ms', 'Temps de requête'], ['8M', 'Événements / jour'], ['30 → 4', 'Graphiques'], ['−62%', 'Temps de décision']],
      code: `export const metrics = router({
  overview: protectedProcedure
    .input(z.object({ range: rangeSchema, site: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.ch.query({
        query: OVERVIEW_SQL,
        query_params: { ...input.range, site: input.site },
      });
      return toSeries(await rows.json());
    }),
});`,
    },
    {
      slug: 'grail', name: 'GRAIL', ext: '.ai', type: 'Produit IA', year: 2026, hue: 48, emblem: 'chalice',
      services: ['IA appliquée', 'Back-end', 'Interface'],
      stack: ['Python', 'FastAPI', 'pgvector', 'LLM'],
      description: [
        'Un assistant de recherche documentaire pour des cabinets qui croulent sous les archives. Il retrouve la bonne page, cite sa source et admet quand il ne sait pas.',
        'Recherche hybride, citations vérifiables, interface pensée pour la confiance plutôt que pour l\'effet magique.',
      ],
      notes: [
        'Chaque réponse est liée à un passage exact. Sans source, pas de réponse.',
        'Le jeu d\'évaluation a été écrit avec les utilisateurs finaux avant la première ligne de code.',
      ],
      stats: [['94%', 'Réponses sourcées'], ['1.2M', 'Pages indexées'], ['2.1s', 'Réponse médiane'], ['0', 'Source inventée']],
      code: `@app.post("/ask")
async def ask(q: Question, db: Session = Depends(get_db)) -> Answer:
    passages = await hybrid_search(db, q.text, k=8)
    if not passages:
        return Answer.unknown(q.text)

    draft = await llm.answer(q.text, context=passages)
    cited = verify_citations(draft, passages)
    return Answer(text=cited.text, sources=cited.sources)`,
    },
    {
      slug: 'vigil', name: 'VIGIL', ext: '.ops', type: 'Observabilité', year: 2023, hue: 355, emblem: 'helm',
      services: ['DevOps', 'SRE', 'Outillage'],
      stack: ['Kubernetes', 'Prometheus', 'Grafana', 'Go'],
      description: [
        'Une plateforme de surveillance qui veille la nuit pour que l\'équipe dorme. Alertes triées, contexte joint, plus de faux positifs à trois heures du matin.',
        'Chaque alerte arrive avec ses graphiques, ses derniers déploiements et la personne à réveiller si ça empire.',
      ],
      notes: [
        'Le nombre d\'alertes nocturnes a été divisé par six en un mois, sans rien masquer.',
        'Les tableaux de bord sont versionnés comme du code et relus comme du code.',
      ],
      stats: [['÷6', 'Alertes nocturnes'], ['4min', 'Temps de détection'], ['140', 'Services surveillés'], ['24/7', 'Veille']],
      code: `groups:
  - name: vigil.rules
    rules:
      - alert: LatencyBurn
        expr: |
          histogram_quantile(0.95, sum by (le, svc)
            (rate(http_request_duration_seconds_bucket[5m]))) > 0.4
        for: 10m
        labels: { severity: page }
        annotations:
          summary: "{{ $labels.svc }} brûle son budget de latence"
          runbook: "https://runbooks/latency"`,
    },
  ],
};
