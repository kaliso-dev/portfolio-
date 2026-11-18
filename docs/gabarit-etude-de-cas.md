# Gabarit — fiche projet et étude de cas pour le portfolio KALISO

> **À qui s'adresse ce fichier ?** À Claude, dans le dépôt d'un projet de Sofiene Lamsouni.
> Sofiene te donne ce gabarit. Il attend en retour **un seul fichier** : `<slug>.md`, rédigé
> exactement dans le format ci-dessous. Il le déposera dans `src/projets/` de son portfolio
> (dépôt `kaliso-dev/portfolio-`). Le site le lira tel quel, en français, en anglais et en arabe.

---

## 1. Ta mission

1. **Explore le projet** : README, code, historique git (premiers et derniers commits, tags, releases),
   tickets, tests, configuration de déploiement. Repère ce qui a été construit, comment, et ce qui est mesurable.
2. **Pose tes questions à Sofiene** avant d'écrire (une seule liste, courte). Demande-lui ce que le dépôt ne
   peut pas dire : le contexte client, les chiffres de résultat, l'estimation de départ, ce qu'il a décidé seul.
3. **Rédige le fichier `<slug>.md`** au format exact de la section 3, en **français**, puis traduis-le
   en **anglais** et en **arabe**.
4. **Relis avec la check-list** (section 6) et livre le fichier.

## 2. Règles d'or

- **Rien d'inventé.** Chaque chiffre, client ou résultat doit venir du dépôt ou de Sofiene. Si une donnée
  manque, écris `"?"` à sa place et ajoute la question dans ta réponse : Sofiene complètera. Un portfolio
  qui ment une fois ne convainc plus jamais.
- **Confidentialité.** Pas de secret, de clé d'API, d'URL interne, de donnée personnelle ni de nom de client
  sans l'accord explicite de Sofiene. Le code montré doit être anonymisé si besoin.
- **Voix.** Sofiene parle à la première personne (« je »), avec des phrases courtes et concrètes.
  Une touche de vocabulaire de forge et de désert est la bienvenue (quête, forge, lame, trempe, arsenal,
  caravane, médina…), **jamais au détriment de la clarté**. Pas de superlatifs creux (« révolutionnaire »,
  « ultra-performant »), pas d'emoji.
- **Claude et Sofiene, chacun sa part.** La section `claude` dit honnêtement ce que tu (Claude) as accéléré :
  premières versions, tests, documentation, migrations, traductions, prototypes… La section `decisions`
  dit ce que Sofiene a tranché lui-même : architecture, choix techniques, arbitrages, refus, relecture.
  N'exagère ni l'un ni l'autre.
- **Traductions.** L'anglais et l'arabe sont des réécritures naturelles, pas du mot à mot. Arabe : arabe
  standard moderne, clair et sobre ; garde en caractères latins les noms de technologies, de produits et de
  marques (Next.js, Stripe, Claude…). Garde les mêmes chiffres dans les trois langues (en arabe, chiffres
  occidentaux 0-9, comme au Maroc ; tu peux écrire « 12 ألف » pour « 12k »).

## 3. Le format exact du fichier

Le fichier contient, dans cet ordre :

1. un commentaire HTML d'une ligne (facultatif) ;
2. **un bloc ```json** : la fiche projet ;
3. trois sections `# fr`, `# en`, `# ar`, chacune avec quatre sous-sections `## quete`, `## claude`,
   `## decisions`, `## resultats` (ces identifiants ne se traduisent pas) ;
4. une section `# code` avec un seul bloc de code.

### 3.1 La fiche JSON

```json
{
  "slug": "nom-court",
  "name": "NOM",
  "ext": ".app",
  "year": 2026,
  "order": 1,
  "hue": 158,
  "emblem": "key",
  "url": "https://…",
  "repo": "https://github.com/…",
  "stack": ["Next.js", "Stripe", "PostgreSQL"],
  "temps": { "estime": 8, "reel": 6, "unite": "semaines" },
  "fr": {
    "type": "Site e-commerce",
    "services": ["E-commerce", "Paiement en ligne", "Back-office"],
    "description": ["Premier paragraphe…", "Second paragraphe…"],
    "notes": ["Première note…", "Seconde note…"],
    "stats": [["0.8s", "Chargement mobile"], ["+212%", "Ventes en ligne"], ["3", "Langues"], ["1 400", "Produits"]]
  },
  "en": { "type": "…", "services": ["…"], "description": ["…", "…"], "notes": ["…", "…"], "stats": [["…", "…"]] },
  "ar": { "type": "…", "services": ["…"], "description": ["…", "…"], "notes": ["…", "…"], "stats": [["…", "…"]] }
}
```

| Champ | Contenu | Contraintes |
|---|---|---|
| `slug` | identifiant dans l'URL (`#projet-slug`) et nom du fichier | minuscules, chiffres, tirets ; unique |
| `name` | nom affiché en grand | MAJUSCULES, 3 à 10 caractères idéalement (un mot arabe translittéré marche très bien : SOUK, NOUR, BARID…) |
| `ext` | « extension » décorative qui dit la nature du projet | `.app`, `.api`, `.shop`, `.saas`, `.ai`, `.bot`, `.cli`, `.site`, `.tool`… |
| `year` | année de livraison | nombre |
| `order` | position dans l'armurerie (1 = premier) | nombre |
| `hue` | teinte de la couverture générée (0-360) | 20 rouille · 38 or · 48 sable · 158 émeraude · 205 bleu · 268 violet · 355 rouge |
| `emblem` | blason ASCII de la couverture | une valeur parmi `sword`, `tower`, `crown`, `key`, `shield`, `chalice`, `helm` |
| `url`, `repo` | liens publics | `""` si privé : le lien pointera vers le GitHub de Sofiene |
| `stack` | technologies principales | 3 à 6 éléments, noms officiels |
| `temps` | durée estimée au départ vs durée réelle | facultatif ; nombres ; `unite` parmi `heures`, `jours`, `semaines`, `mois` (toujours en français) |
| `type` | nature du projet, en une expression | ≤ 32 caractères |
| `services` | ce que Sofiene a apporté | exactement 3 éléments, ≤ 28 caractères chacun |
| `description` | le pitch du projet | exactement 2 paragraphes, 1 à 3 phrases, ≤ 320 caractères chacun |
| `notes` | deux détails de fabrication marquants | exactement 2, ≤ 220 caractères chacune |
| `stats` | quatre chiffres clés | exactement 4 paires `[valeur, libellé]` ; valeur ≤ 8 caractères, libellé ≤ 28 |

Facultatif : `"cover": "assets/projets/<slug>/cover.jpg"` et `"shots": ["assets/projets/<slug>/1.jpg", …]`
(4 images, format 3:2) si Sofiene fournit de vraies captures ; sinon le site génère des visuels ASCII.

### 3.2 Les quatre sections du récit (dans chaque langue)

| Section | Question à laquelle elle répond | Longueur |
|---|---|---|
| `quete` | Quel était le problème, pour qui, et pourquoi c'était difficile ? | 60 à 120 mots |
| `claude` | Qu'est-ce que Claude a concrètement accéléré ? (liste à tirets bienvenue) | 3 à 5 points, ou 60 à 120 mots |
| `decisions` | Qu'est-ce que Sofiene a décidé lui-même, et pourquoi ? | 60 à 140 mots |
| `resultats` | Qu'est-ce qui a changé, chiffres à l'appui ? | 40 à 100 mots |

Markdown autorisé : paragraphes, listes `- `, `**gras**` (une ou deux fois, pour la phrase-clé),
`*italique*`, `` `code` ``, liens `[texte](https://…)`, sous-titres `### `. Rien d'autre (pas d'image,
pas de tableau, pas de HTML, pas de titre `#` ou `##` supplémentaire).

### 3.3 Le code

Un extrait **réel** et représentatif du projet, 8 à 16 lignes, avec l'étiquette de langage
(` ```ts `, ` ```py `, ` ```go `…). Il apparaît sur la page comme une capture d'éditeur : choisis
le passage le plus parlant (le cœur métier, pas un import). Commentaires en français. Aucun secret.

## 4. Exemple complet (abrégé)

````markdown
<!-- Fiche projet KALISO — SOUK.shop -->

```json
{
  "slug": "souk",
  "name": "SOUK",
  "ext": ".shop",
  "year": 2026,
  "order": 4,
  "hue": 158,
  "emblem": "key",
  "url": "",
  "repo": "",
  "stack": ["Next.js", "Shopify", "Stripe", "Sanity"],
  "temps": { "estime": 8, "reel": 6, "unite": "semaines" },
  "fr": {
    "type": "Site e-commerce",
    "services": ["E-commerce", "Site vitrine", "Paiement en ligne"],
    "description": ["La boutique en ligne d'un atelier de zellige de Fès : chaque carreau photographié, un configurateur de motifs, la livraison partout dans le monde.", "Des pages qui s'affichent avant qu'on ait fini de cligner des yeux, et un back-office pensé pour des artisans."],
    "notes": ["Le configurateur compose le motif en direct, carreau par carreau.", "Chaque traduction a été relue par l'atelier avant publication."],
    "stats": [["0.8s", "Chargement mobile"], ["+212%", "Ventes en ligne"], ["3", "Langues"], ["1 400", "Carreaux"]]
  },
  "en": { "type": "Online shop", "services": ["E-commerce", "Showcase website", "Online payment"], "description": ["…", "…"], "notes": ["…", "…"], "stats": [["0.8s", "Mobile load time"], ["+212%", "Online sales"], ["3", "Languages"], ["1,400", "Tiles"]] },
  "ar": { "type": "متجر إلكتروني", "services": ["التجارة الإلكترونية", "موقع تعريفي", "الدفع الإلكتروني"], "description": ["…", "…"], "notes": ["…", "…"], "stats": [["0.8s", "التحميل على الجوّال"], ["+212%", "المبيعات عبر الإنترنت"], ["3", "لغات"], ["1400", "قطعة"]] }
}
```

# fr

## quete

L'atelier vendait surtout sur place. Les commandes à distance passaient par WhatsApp : photos floues, devis à la main…

## claude

- Les premières versions du configurateur de motifs.
- Les fiches produits en trois langues, à partir des notes de l'atelier.

## decisions

Shopify plutôt qu'une boutique sur mesure : l'atelier devait pouvoir tout gérer seul. Et une règle : **aucune traduction publiée sans relecture humaine**.

## resultats

Des pages chargées en moins d'une seconde sur mobile, des ventes en ligne multipliées par trois en six mois.

# en

## quete

…

## claude

…

## decisions

…

## resultats

…

# ar

## quete

…

## claude

…

## decisions

…

## resultats

…

# code

```tsx
export default async function Carreau({ params }: { params: { slug: string } }) {
  const carreau = await souk.produit(params.slug);
  if (!carreau) notFound();
  return <Motif trame={carreau.motif} couleurs={carreau.couleurs} />;
}
```
````

Un exemple complet et réel du format, en trois langues, se trouve dans le portfolio :
`src/projets/souk.md`.

## 5. Ce que Sofiene fait ensuite

1. Il dépose `<slug>.md` dans `src/projets/` (et ses images éventuelles dans `src/assets/projets/<slug>/`).
2. Il supprime les fiches d'exemple qu'il ne veut plus (`"exemple": true`).
3. Il lance `python3 build.py` : les avertissements (`⚠`) signalent un champ manquant ou une traduction absente.
4. Il pousse sur GitHub : le site se met à jour.

## 6. Check-list avant de livrer

- [ ] Le JSON est valide (guillemets droits `"`, pas de virgule en trop, apostrophes françaises autorisées dans les textes).
- [ ] `fr`, `en` et `ar` contiennent les mêmes champs, dans le même ordre, avec les mêmes chiffres.
- [ ] Exactement 3 `services`, 2 `description`, 2 `notes`, 4 `stats`.
- [ ] `emblem` fait partie de la liste ; `hue` entre 0 et 360 ; `unite` en français.
- [ ] Les trois récits ont leurs quatre sections, identifiants non traduits (`quete`, `claude`, `decisions`, `resultats`).
- [ ] Aucun chiffre inventé : les inconnues sont des `"?"` signalés à Sofiene.
- [ ] Aucun secret, aucune donnée personnelle, aucun client nommé sans accord.
- [ ] L'extrait de code est réel, 8 à 16 lignes, commenté en français.
- [ ] Le nom du fichier est exactement `<slug>.md`.
