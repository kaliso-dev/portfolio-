# Mettre KALISO en ligne — tout sur Cloudflare, gratuitement

Un seul déploiement met en ligne :

- **le site** (le dossier `dist/` généré par `build.py`) ;
- **KALISO**, l'IA de la commande `forge` : un modèle open source servi par Workers AI ;
- **l'API des tickets** et leur base de données (D1) ;
- **ton dashboard privé** : `https://<ton-site>/admin` ;
- **la forge allumée** : ta disponibilité, affichée sur l'accueil et réglée depuis le dashboard.

Tout tient dans l'offre gratuite de Cloudflare. Pour l'IA, Workers AI offre 10 000 « neurones » par jour,
soit environ 150 demandes à KALISO. Au-delà, KALISO répond « la forge refroidit » et propose un ticket :
rien ne casse, et tu ne paies rien.

---

## Ce qu'il te faut

- un compte Cloudflare gratuit : [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) ;
- sur ton ordinateur : **Node.js 20+** et **Python 3** ;
- ce dépôt, cloné : `git clone https://github.com/kaliso-dev/portfolio-.git && cd portfolio-`

Toutes les commandes ci-dessous se tapent dans ce dossier.

## Mise en route (une seule fois, ~10 minutes)

**1. Te connecter à Cloudflare**

```bash
npx wrangler login
```

Une page s'ouvre dans ton navigateur : accepte.

**2. Créer la base de données**

```bash
npx wrangler d1 create kaliso
```

La commande affiche un `database_id` (une suite de lettres et de chiffres). Ouvre `wrangler.toml` et
remplace `REMPLACE-MOI-PAR-L-ID-DONNE-PAR-WRANGLER` par cet identifiant.

**3. Créer les tables**

```bash
npx wrangler d1 migrations apply kaliso --remote
```

**4. Construire et mettre en ligne**

```bash
python3 build.py
npx wrangler deploy
```

À la fin, Wrangler affiche l'adresse du site, du type `https://kaliso.<ton-compte>.workers.dev`.

**5. Choisir le mot de passe du dashboard**

```bash
npx wrangler secret put ADMIN_TOKEN
```

Colle un mot de passe long (au moins 12 caractères, 24 c'est mieux). Pour en générer un :
`openssl rand -base64 24`. Garde-le dans ton gestionnaire de mots de passe.

**6. Vérifier**

- Ouvre le site → menu → **Terminal** → tape `forge`, décris un projet : KALISO doit répondre avec un plan.
- Ouvre `https://<ton-site>/admin`, entre le mot de passe : la demande apparaît dans « demandes à KALISO ».
- Envoie un ticket depuis le terminal : il arrive dans l'onglet « tickets ».
- Dans « forge & réglages », éteins la forge : l'accueil affiche « Forge éteinte » (environ une minute plus tard).

## Au quotidien

| Je veux… | Je fais… |
|---|---|
| voir les nouvelles demandes | `https://<ton-site>/admin` (le nombre de nouveaux tickets s'affiche dans l'onglet du navigateur) |
| répondre à un client | bouton « répondre » (ouvre ton email) ; le message « réponse visible » apparaît aussi au client quand il tape `status` dans le terminal |
| suivre un ticket | change son statut : nouveau → en discussion → devis envoyé → en forge → livré |
| dire si je suis disponible | interrupteur « forge allumée », avec un message court dans les trois langues |
| récupérer tous les tickets | « export CSV » (s'ouvre dans Excel ou Google Sheets) |
| ajouter un projet | voir `docs/gabarit-etude-de-cas.md`, puis `python3 build.py && npx wrangler deploy` |
| changer mes tarifs | `worker/src/tarifs.js`, puis `npx wrangler deploy` |

## Réglages

**Tes tarifs** — `worker/src/tarifs.js`. C'est ta grille, et elle seule, qui calcule les fourchettes
affichées par KALISO. Le modèle ne fixe jamais de prix : il classe le projet, note sa complexité et les
modules nécessaires, puis le code applique ta grille. ⚠ Les valeurs actuelles sont des valeurs de départ :
ajuste-les avant de partager le site. Pour n'afficher aucun chiffre, mets `afficher: false`.

**Le modèle** — `wrangler.toml`, variables `MODEL` (Mistral Small 3.1 : bon en français et en arabe) et
`MODEL_FALLBACK` (Llama 3.1 8B, utilisé si le premier échoue).

**Les garde-fous** — `wrangler.toml` : `FORGE_DAILY_CAP` (demandes par jour, tous visiteurs confondus),
`FORGE_PER_HOUR` et `FORGE_PER_DAY` (par visiteur), `TICKETS_PER_HOUR`. Les visiteurs ne sont jamais
enregistrés en clair : seule une empreinte anonyme sert à compter.

**Être prévenu à chaque ticket** (facultatif) — installe l'appli gratuite [ntfy](https://ntfy.sh) sur ton
téléphone, abonne-toi à un sujet au nom difficile à deviner (ex. `kaliso-7f3k2q9x`), puis :

```bash
npx wrangler secret put NOTIFY_URL
# colle : https://ntfy.sh/kaliso-7f3k2q9x
```

Un webhook Discord fonctionne aussi (colle son adresse à la place).

**Ton propre nom de domaine** (facultatif) — tableau de bord Cloudflare → Workers & Pages → `kaliso` →
Settings → Domains & Routes → Add → Custom domain. Le domaine doit être géré par Cloudflare.

**L'image d'aperçu sur les réseaux** — les réseaux sociaux exigent une adresse complète. Construis avec
l'adresse finale du site :

```bash
SITE_URL=https://ton-domaine.com python3 build.py && npx wrangler deploy
```

## Déployer automatiquement à chaque push (facultatif)

Tableau de bord Cloudflare → Workers & Pages → `kaliso` → Settings → Build → **Connect** ton dépôt GitHub, puis :

- Build command : `python3 build.py`
- Deploy command : `npx wrangler deploy`
- Variable : `SITE_URL` = l'adresse de ton site

Chaque push sur `main` reconstruit et redéploie tout.

## Variante : garder le site sur Netlify

Possible, mais deux adresses à gérer au lieu d'une. Déploie quand même le Worker (étapes 1 à 5), puis :

1. dans `src/js/00-config.js`, mets `api: 'https://kaliso.<ton-compte>.workers.dev'` ;
2. dans `wrangler.toml`, mets `ALLOWED_ORIGINS = "https://<ton-site>.netlify.app"`, puis `npx wrangler deploy` ;
3. pousse sur GitHub : Netlify reconstruit le site.

Le dashboard reste sur l'adresse du Worker : `https://kaliso.<ton-compte>.workers.dev/admin`.

## Si quelque chose coince

| Symptôme | Cause probable |
|---|---|
| KALISO répond toujours « la forge refroidit » | quota du jour atteint, ou Workers AI indisponible : regarde l'onglet « demandes à KALISO » du dashboard (la raison de l'échec y est notée) |
| le dashboard dit « ADMIN_TOKEN non configuré » | étape 5 oubliée |
| « mot de passe incorrect » puis « trop de tentatives » | 10 essais ratés en 15 minutes : patiente un quart d'heure |
| `D1_ERROR: no such table` | étape 3 oubliée |
| les tickets partent par email au lieu d'arriver dans le dashboard | l'API n'est pas joignable depuis le site (site sur Netlify sans `api` ni `ALLOWED_ORIGINS`) |

## Tester sur ton ordinateur

```bash
printf 'ADMIN_TOKEN=un-mot-de-passe-de-test\nDEV=1\n' > .dev.vars
npx wrangler d1 migrations apply kaliso --local
python3 build.py && npx wrangler dev
```

Puis `http://localhost:8787` (site) et `http://localhost:8787/admin` (dashboard). En local, KALISO peut
rester muet (le modèle ne tourne que chez Cloudflare) : c'est normal, tout le reste fonctionne.
