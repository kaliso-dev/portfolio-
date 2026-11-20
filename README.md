# KALISO — portfolio de Sofiene Lamsouni

Portfolio « KNIGHT.OS » : la mécanique de [zenobasi.com](https://zenobasi.com), une couche développeur façon terminal, et un chevalier du désert rendu en ASCII.

- **Chargement** : une épée ornementée se forge en ASCII, puis tranche l'écran (invite « dégainer » pour lancer la musique).
- **Accueil** : chevalier SDF en temps réel converti en glyphes, mot géant KALISO, fond de soie animé par une vraie simulation de fluide.
- **Transitions** : une lame tranche la page, avec le son d'épée.
- **Pages** : projets (carrousel WebGL) avec études de cas, à propos (arche en texte), contact, et la **forge** (KALISO en mode visuel). Le **terminal** reste accessible depuis la forge (lien discret, `#terminal`).
- **KALISO** (page Forge) : le visiteur discute avec KALISO, un modèle open source (Workers AI) : il pose ses questions, propose plusieurs façons de construire le projet et affine ; ses réponses arrivent mot à mot. Quand le visiteur a fini, « Voir le compte rendu » produit le plan (carrousel + vue d'ensemble), qu'il envoie à Sofiene en ticket. La fourchette de prix vient de ta grille, jamais du modèle (les prix et durées sont filtrés dans la conversation). La commande `forge` du terminal fait un plan en une fois.
- **KALISO sur le web** : il lit le site dont le visiteur donne l'adresse ; avec le secret facultatif `TAVILY_API_KEY`, il peut aussi chercher un nom d'entreprise (voir DEPLOIEMENT.md). Il répond toujours dans la langue du visiteur.
- **Illustrations du compte rendu** : dépose `plan.webp`, `features.webp`, `stack.webp`, `steps.webp`, `range.webp`, `questions.webp` dans `src/assets/forge/` (voir le LISEZ-MOI du dossier) ; sans image, la tuile affiche un grand numéro.
- **Polices** : Fraunces pour les titres, Google Sans Flex pour les textes ; Geist Mono reste pour le terminal et le code.
- **Tickets** : envoyés à ton API, rangés dans ton **dashboard privé** (`/admin`), suivis par le visiteur avec `status`.
- **Forge allumée** : ta disponibilité sur l'accueil, réglée d'un clic dans le dashboard.
- **Verre liquide** (façon iOS 26) : les éléments `.lg` sont transparents ; leur verre (réfraction, reflet, flou) est dessiné dans le fond WebGL. Adapté de [archisvaze/liquid-glass](https://github.com/archisvaze/liquid-glass) (MIT). Repli en verre givré CSS si WebGL2 manque ou si le visiteur demande moins de transparence.
- **Deux langues** : français et anglais, sélecteur dans le menu ou `lang` dans le terminal.

Le site tient dans un seul fichier HTML généré, sans framework : GSAP, Lenis et three.js sont chargés depuis jsDelivr, les polices depuis Google Fonts. L'API est un Worker Cloudflare (`worker/`).

**Mise en ligne : voir [DEPLOIEMENT.md](DEPLOIEMENT.md)** (Cloudflare, gratuit, ~10 minutes).

## Structure

```
src/
  template.html     coquille HTML (nav, menu, écran de chargement, balises d'aperçu)
  style.css         styles
  projets/*.md      ← UNE FICHE PAR PROJET (FR / EN + étude de cas) — gabarit : docs/gabarit-etude-de-cas.md
  js/               modules, concaténés dans l'ordre alphabétique
    00-config.js    ← LE CONTENU : nom, email, couleur, textes, musique, adresse de l'API…
    00b-i18n.js     traductions (interface + textes anglais)
    00c-api.js      appels à l'API (KALISO, tickets, forge allumée)
    01-utils.js     utilitaires, couleur d'accent
    01b-sfx-data.js son d'épée (mp3 en base64)
    02-sound.js     effets sonores (Web Audio)
    02b-music.js    musique d'ambiance
    03-gl.js        fond fluide, transitions WebGL
    04a-knight-sdf.js / 04-knight.js   chevalier SDF → ASCII
    05-covers.js    couvertures de projets générées
    06-slider.js    carrousel WebGL
    07-pages.js     pages
    07b-forge.js    écran de chargement (épée forgée)
    07c-terminal.js page terminal : KALISO, tickets, suivi
    07e-forge-ui.js page forge : barre de chat, chargement, plan en carrousel + grille, ticket, mes quêtes
    08-app.js       routeur, menu, langues, préchargement, démarrage
  assets/           musique d'ambiance, image d'aperçu (og.png)
worker/             API Cloudflare : KALISO, tickets, dashboard (/admin), forge allumée
  src/tarifs.js     ← TA GRILLE TARIFAIRE
  migrations/       tables de la base D1
wrangler.toml       configuration Cloudflare (site + API)
build.py            assemble dist/ (lit aussi src/projets/*.md)
docs/               gabarit des études de cas
netlify.toml        configuration Netlify (variante)
test/               banc de test (Playwright) : captures et scénarios
```

## Développer

```bash
python3 build.py                     # génère dist/
python3 -m http.server -d dist 8080  # puis http://localhost:8080
```

Le contenu se règle dans `src/js/00-config.js` (objet `SITE`) :

- `accent` : `blanc` (#f2f0ea, par défaut), `vert`, `ambre`, `laiton`, `majorelle`, `marrakech`. Les visiteurs peuvent aussi essayer `theme <couleur>` dans le terminal.
- `music` : fichier, volume, début (saut du silence initial), `gate` (invite « dégainer » en fin de chargement).
- `api` : vide = l'API est à la même adresse que le site (tout sur Cloudflare). Sans API joignable, tout se replie : la forge reste « allumée » et les tickets partent par email prérempli.
- Les textes anglais sont dans `src/js/00b-i18n.js` (`SITE_I18N`). Les projets portent leurs propres traductions.

Les projets d'exemple de `src/projets/` sont fictifs (`"exemple": true`) : remplace-les par tes vraies réalisations avec le gabarit `docs/gabarit-etude-de-cas.md`, à donner au Claude de chaque projet.

Pour tester l'API en local : voir la fin de [DEPLOIEMENT.md](DEPLOIEMENT.md).

## Tests

```bash
cd test && npm install && npx playwright install chromium
python3 shoot.py plans/plan_full2.json   # captures dans test/shots/
```

## Crédits

- Musique : « What The Sand Saw », Alex Melodic, Music in the background from https://www.FesliyanStudios.com. Licence gratuite avec crédit, affiché dans le menu ; un don sur leur site donne une licence commerciale sans crédit obligatoire. Pour changer de morceau, remplace le fichier dans `src/assets/audio/` et mets à jour `SITE.music` (`end` et `xfade` règlent la boucle en fondu enchaîné).
- Son d'épée : généré avec ElevenLabs.
- Chevalier, épée, couvertures et motifs : dessinés en code pour ce site.
