import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/* ==========================================================================
   CONFIG — tout le contenu du site est ici.
   Les projets, chiffres, clients et expériences ci-dessous sont des EXEMPLES
   fictifs : remplace-les par tes vraies réalisations.
   Pour une vraie image : ajoute `cover: 'data:image/jpeg;base64,...'`
   (ou un chemin relatif, le site étant hébergé) et `shots: [...]`.
   ========================================================================== */
const SITE = {
  name: 'Sofiene Lamsouni',
  handle: 'lamsouni',
  role: 'Développeur · sites, apps, API & IA',
  email: 'kaliso.dev@gmail.com',
  accent: 'zellige', // zellige (#127d5f) | vert | ambre | laiton | majorelle | marrakech
  // tickets du terminal : sans endpoint, ils partent par email prérempli.
  // Pour les recevoir automatiquement, mets l'URL d'un service de formulaire (ex. Formspree).
  ticket: { endpoint: '' },
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
  version: 'v1.6',
  motto: 'Forgé avec Claude, trempé à la main',
  availability: 'Ouvert aux nouvelles quêtes',
  since: 2019,
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { label: 'X', url: 'https://x.com/' },
  ],
  home: {
    footer: ['Développeur × Claude', 'Toutes quêtes · toutes tailles', 'Ouvert aux nouvelles quêtes'],
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
    commands: ['ticket --nouvelle-quete', 'mail --to kaliso.dev@gmail.com', 'git clone ta-prochaine-quete', 'echo "salam" | mail kaliso.dev@gmail.com'],
  },
  projects: [
    {
      slug: 'saif', name: 'SAIF', ext: '.cli', type: 'Outil en ligne de commande', year: 2026, hue: 20, emblem: 'sword',
      services: ['Architecture', 'Expérience développeur', 'Open source'],
      stack: ['Rust', 'Tokio', 'Clap', 'GitHub Actions'],
      description: [
        'Saif, le sabre : un outil en ligne de commande qui monte un environnement de développement complet en une seule frappe. Rapide, précis, sans fioritures.',
        'Binaire unique, zéro dépendance, configuration déclarative. Le genre d\'arme qu\'on oublie au fourreau parce qu\'elle ne casse jamais.',
      ],
      notes: [
        'Chaque commande a été chronométrée : tout ce qui dépassait cent millisecondes a été retrempé ou supprimé.',
        'Claude a rédigé la première documentation à partir des tests ; chaque exemple est compilé avant que la release ne parte.',
      ],
      stats: [['12k', 'Téléchargements'], ['84ms', 'Démarrage à froid'], ['0', 'Dépendance'], ['46', 'Contributeurs']],
      code: `use saif::{Forge, Lame, Fil};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // une seule frappe, un environnement complet
    let forge = Forge::ouvrir("./armurerie")?;
    let lame = forge
        .tremper(Lame::cimeterre())
        .aiguiser(Fil::Rasoir)
        .await?;

    lame.deployer("production").await?;
    println!("⚔  prête en {}ms", lame.duree());
    Ok(())
}`,
    },
    {
      slug: 'qalaa', name: 'QALAA', ext: '.api', type: 'API de paiement & infrastructure', year: 2025, hue: 205, emblem: 'tower',
      services: ['Back-end', 'Infrastructure', 'Sécurité'],
      stack: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Terraform'],
      description: [
        'Une API de paiement bâtie comme une qal\'a, une citadelle : chaque requête franchit trois remparts avant de toucher la base.',
        'Limitation de débit adaptative, idempotence native, journaux signés. Toute l\'infrastructure se rebâtit depuis le sable en onze minutes.',
      ],
      notes: [
        'Les tests de charge tournent chaque nuit contre une copie de la production : une régression de latence bloque le déploiement du lendemain.',
        'Aucun secret ne dort dans le code. Tout passe par un coffre, avec rotation automatique toutes les vingt-quatre heures.',
      ],
      stats: [['99.98%', 'Disponibilité'], ['38ms', 'Latence p95'], ['2.4M', 'Requêtes / jour'], ['11min', 'Reconstruction totale']],
      code: `package qalaa

func (g *Gate) Handle(w http.ResponseWriter, r *http.Request) {
    // trois remparts avant la base
    if !g.limiter.Allow(r.RemoteAddr) {
        http.Error(w, "trop de requêtes", 429)
        return
    }
    key := r.Header.Get("Idempotency-Key")
    if res, ok := g.cache.Get(key); ok {
        g.replay(w, res)
        return
    }
    g.donjon.Serve(w, r.WithContext(signed(r.Context())))
}`,
    },
    {
      slug: 'barid', name: 'BARID', ext: '.app', type: 'Application mobile', year: 2025, hue: 38, emblem: 'crown',
      services: ['Mobile', 'Design produit', 'Animation'],
      stack: ['React Native', 'Expo', 'Supabase', 'Reanimated'],
      description: [
        'Barid, le messager : une app qui annonce les événements d\'une communauté locale avant tout le monde. Notifications justes, carte vivante, zéro bruit.',
        'Chaque geste a été pensé au pouce : retours haptiques et transitions à soixante images par seconde, même sur des téléphones d\'entrée de gamme.',
      ],
      notes: [
        'Le prototype a été testé dans la rue, pas en salle. Trois écrans ont disparu après la première semaine.',
        'Les animations tournent entièrement sur le fil d\'interface : le JavaScript ne bloque jamais un geste.',
      ],
      stats: [['4.8', 'Note App Store'], ['60fps', 'Sur entrée de gamme'], ['31k', 'Utilisateurs actifs'], ['3', 'Écrans supprimés']],
      code: `export function MessageDuBarid({ evenement }: Props) {
  const presse = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - presse.value * 0.04 }],
  }));

  return (
    <GestureDetector gesture={toucher(presse)}>
      <Animated.View style={[styles.carte, style]}>
        <Sceau type={evenement.type} />
        <Text style={styles.titre}>{evenement.titre}</Text>
      </Animated.View>
    </GestureDetector>
  );
}`,
    },
    {
      slug: 'souk', name: 'SOUK', ext: '.shop', type: 'Site e-commerce', year: 2026, hue: 158, emblem: 'key',
      services: ['E-commerce', 'Site vitrine', 'Paiement en ligne'],
      stack: ['Next.js', 'Shopify', 'Stripe', 'Sanity'],
      description: [
        'La boutique en ligne d\'un atelier de zellige de Fès : chaque carreau photographié, un configurateur de motifs, la livraison partout dans le monde.',
        'Des pages qui s\'affichent avant qu\'on ait fini de cligner des yeux, un tunnel d\'achat en trois étapes et un back-office pensé pour des artisans, pas pour des développeurs.',
      ],
      notes: [
        'Le configurateur compose le motif en direct, carreau par carreau, comme le maâlem à l\'atelier.',
        'Claude a préparé les fiches produits en trois langues ; chaque traduction a été relue par l\'atelier avant publication.',
      ],
      stats: [['0.8s', 'Chargement mobile'], ['+212%', 'Ventes en ligne'], ['3', 'Langues'], ['1 400', 'Carreaux au catalogue']],
      code: `export default async function Carreau({ params }: { params: { slug: string } }) {
  const carreau = await souk.produit(params.slug);
  if (!carreau) notFound();

  return (
    <Atelier>
      <Motif trame={carreau.motif} couleurs={carreau.couleurs} />
      <Prix montant={carreau.prix} devise="MAD" />
      <AjouterAuPanier id={carreau.id} />
    </Atelier>
  );
}`,
    },
    {
      slug: 'medina', name: 'MEDINA', ext: '.saas', type: 'Application web SaaS', year: 2024, hue: 268, emblem: 'shield',
      services: ['Full-stack', 'Visualisation de données', 'Produit'],
      stack: ['Next.js', 'tRPC', 'Prisma', 'ClickHouse'],
      description: [
        'Un SaaS logistique où des millions d\'événements se croisent comme les ruelles d\'une médina, et une seule vue qui dit quoi faire maintenant.',
        'Requêtes agrégées côté serveur, graphiques en flux continu, filtres qui répondent avant que le doigt quitte la touche.',
      ],
      notes: [
        'La première version affichait trente graphiques ; les équipes en regardaient quatre. La deuxième en affiche quatre.',
        'Les requêtes les plus lourdes sont précalculées chaque minute : l\'interface n\'attend jamais la base.',
      ],
      stats: [['120ms', 'Temps de requête'], ['8M', 'Événements / jour'], ['30 → 4', 'Graphiques'], ['−62%', 'Temps de décision']],
      code: `export const medina = router({
  ruelles: protectedProcedure
    .input(z.object({ periode: periodeSchema, entrepot: z.string() }))
    .query(async ({ ctx, input }) => {
      const lignes = await ctx.ch.query({
        query: VUE_GENERALE_SQL,
        query_params: { ...input.periode, entrepot: input.entrepot },
      });
      return enSeries(await lignes.json());
    }),
});`,
    },
    {
      slug: 'nour', name: 'NOUR', ext: '.ai', type: 'Agent IA', year: 2026, hue: 48, emblem: 'chalice',
      services: ['IA appliquée', 'Agents', 'Back-end'],
      stack: ['Python', 'FastAPI', 'pgvector', 'API Claude'],
      description: [
        'Nour, la lumière : un agent de recherche pour des cabinets ensevelis sous les archives. Il retrouve la bonne page, cite sa source et admet quand il ne sait pas.',
        'Recherche hybride, citations vérifiables, propulsé par l\'API Claude, avec une interface pensée pour la confiance plutôt que pour l\'effet magique.',
      ],
      notes: [
        'Chaque réponse est liée à un passage exact. Sans source, pas de réponse.',
        'Le jeu d\'évaluation a été écrit avec les utilisateurs finaux avant la première ligne de code.',
      ],
      stats: [['94%', 'Réponses sourcées'], ['1.2M', 'Pages indexées'], ['2.1s', 'Réponse médiane'], ['0', 'Source inventée']],
      code: `@app.post("/demander")
async def demander(q: Question, db: Session = Depends(get_db)) -> Reponse:
    passages = await recherche_hybride(db, q.texte, k=8)
    if not passages:
        return Reponse.inconnue(q.texte)

    brouillon = await claude.repondre(q.texte, contexte=passages)
    cite = verifier_citations(brouillon, passages)
    return Reponse(texte=cite.texte, sources=cite.sources)`,
    },
    {
      slug: 'assas', name: 'ASSAS', ext: '.bot', type: 'Automatisations & intégrations', year: 2025, hue: 355, emblem: 'helm',
      services: ['Automatisation', 'Intégrations', 'Outils internes'],
      stack: ['Node.js', 'n8n', 'API Claude', 'Webhooks'],
      description: [
        'Assas, le veilleur de nuit : des automatisations qui travaillent pendant que l\'équipe dort. Factures rapprochées, contacts qualifiés, rapports envoyés à l\'aube.',
        'Une trentaine de flux branchés sur les outils déjà en place (CRM, compta, Slack, tableurs), sans changer les habitudes de personne.',
      ],
      notes: [
        'Les tâches répétitives de l\'équipe sont passées de onze heures à quarante minutes par semaine.',
        'Chaque flux a un journal lisible et un bouton « rejouer » : quand ça casse, on voit où, on corrige, on relance.',
      ],
      stats: [['−94%', 'Tâches manuelles'], ['31', 'Flux actifs'], ['6', 'Outils connectés'], ['24/7', 'Veille']],
      code: `// chaque nuit, le veilleur fait sa ronde
export default ronde("0 5 * * *", async () => {
  const factures = await compta.nonRapprochees();
  for (const f of factures) {
    const paiement = await banque.chercher(f.montant, f.reference);
    if (paiement) await compta.rapprocher(f.id, paiement.id);
  }
  const resume = await claude.resumer(factures, { ton: "bref" });
  await slack.poster("#finances", \`☾ Ronde terminée — \${resume}\`);
});`,
    },
  ],
};
