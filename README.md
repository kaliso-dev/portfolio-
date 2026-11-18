# KALISO — portfolio de Sofiene Lamsouni

Portfolio « KNIGHT.OS » : la mécanique de [zenobasi.com](https://zenobasi.com), une couche développeur façon terminal, et un chevalier du désert rendu en ASCII.

- **Chargement** : une épée ornementée se forge en ASCII, puis tranche l'écran (invite « dégainer » pour lancer la musique).
- **Accueil** : chevalier SDF en temps réel converti en glyphes, mot géant KALISO, fond de soie animé par une vraie simulation de fluide.
- **Transitions** : une lame tranche la page, avec le son d'épée.
- **Pages** : projets (carrousel WebGL), à propos (arche en texte), contact, et un **terminal** interactif qui génère des tickets de demande.

Tout tient dans un seul fichier HTML généré, sans framework : GSAP, Lenis et three.js sont chargés depuis jsDelivr, les polices depuis Google Fonts.

## Structure

```
src/
  template.html     coquille HTML (nav, menu, écran de chargement)
  style.css         styles
  js/               modules, concaténés dans l'ordre alphabétique
    00-config.js    ← TOUT LE CONTENU : nom, email, couleur, projets, musique, tickets…
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
    07c-terminal.js page terminal + tickets
    08-app.js       routeur, menu, préchargement, démarrage
  assets/audio/     musique d'ambiance
build.py            assemble dist/index.html et copie src/assets
netlify.toml        configuration Netlify
test/               banc de test (Playwright) : captures et scénarios
```

## Développer

```bash
python3 build.py                     # génère dist/
python3 -m http.server -d dist 8080  # puis http://localhost:8080
```

Le contenu se règle dans `src/js/00-config.js` (objet `SITE`) :

- `accent` : `zellige` (#127d5f, par défaut), `vert`, `ambre`, `laiton`, `majorelle`, `marrakech`. Les visiteurs peuvent aussi essayer `theme <couleur>` dans le terminal.
- `music` : fichier, volume, début (saut du silence initial), `gate` (invite « dégainer » en fin de chargement).
- `ticket.endpoint` : vide = les tickets partent par email prérempli ; avec l'URL d'un service de formulaire (Formspree, Getform…), ils arrivent automatiquement.
- `projects` : les projets (actuellement des exemples fictifs). `cover` et `shots` acceptent de vraies images.

## Déployer sur Netlify

1. Sur [app.netlify.com](https://app.netlify.com) : **Add new site → Import an existing project → GitHub**, puis choisir ce dépôt.
2. Les réglages sont lus depuis `netlify.toml` (commande `python3 build.py`, dossier `dist`) : rien à remplir.
3. **Deploy**. Chaque push sur `main` redéploie le site.

## Tests

```bash
cd test && npm install && npx playwright install chromium
python3 shoot.py plans/plan_full2.json   # captures dans test/shots/
```

## Crédits

- Musique : « Whirling Dervish », Omar Faruk Tekbilek. Enregistrement commercial : une licence est nécessaire pour le diffuser sur un site public. Pour changer de morceau, remplace le fichier dans `src/assets/audio/` et mets à jour `SITE.music`.
- Son d'épée : généré avec ElevenLabs.
- Chevalier, épée, couvertures et motifs : dessinés en code pour ce site.
