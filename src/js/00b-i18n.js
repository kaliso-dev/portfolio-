/* ==========================================================================
   LANGUES — français (base) et anglais
   UI : chaque clé → [fr, en]. Contenu : SITE_I18N.en remplace les champs
   de SITE (00-config.js) ; les projets portent leurs propres traductions
   (src/projets/*.md).
   ========================================================================== */
const LANGS = ['fr', 'en'];
const LANG_NAMES = { fr: 'Français', en: 'English' };
const LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) { localStorage.setItem('kaliso-lang', q); return q; }
    const s = localStorage.getItem('kaliso-lang');
    if (LANGS.includes(s)) return s;
  } catch (e) {}
  const n = (navigator.languages || [navigator.language || 'fr']).map((x) => String(x).slice(0, 2).toLowerCase());
  return n.find((x) => LANGS.includes(x)) || 'fr';
})();
const LI = LANGS.indexOf(LANG);
const RTL = false;

const UI = {
  // navigation, menu, son
  'nav.menu': ['Menu', 'Menu'],
  'nav.close': ['Fermer', 'Close'],
  'nav.contact': ['Contact', 'Contact'],
  'nav.main': ['Principale', 'Main'],
  'menu.index': ['Index', 'Index'],
  'menu.work': ['Projets', 'Work'],
  'menu.about': ['À propos', 'About'],
  'menu.contact': ['Contact', 'Contact'],
  'menu.terminal': ['Terminal', 'Terminal'],
  'menu.lang': ['langue', 'language'],
  'snd.on': ['son : on', 'sound: on'],
  'snd.off': ['son : off', 'sound: off'],
  'snd.mute': ['Couper le son', 'Mute'],
  'snd.unmute': ['Activer le son', 'Unmute'],
  'music.credit': ['musique de fond :', 'background music:'],
  'noscript': ['Activez JavaScript pour voir ce portfolio.', 'Enable JavaScript to see this portfolio.'],
  // chargement
  'gate.key': ['[ Entrée ]', '[ Enter ]'],
  'gate.draw': ['dégainer', 'draw the blade'],
  'gate.sound': ['♪ avec le son', '♪ with sound'],
  'gate.mute': ['entrer sans son', 'enter without sound'],
  'pre.os': ['forge', 'forge'],
  'pre.boot': ['démarrage', 'booting'],
  'pre.forge': ['allumage de la forge', 'lighting the forge'],
  'pre.claude': ['invocation de claude', 'summoning claude'],
  'pre.temper': ['trempe du cimeterre', 'tempering the scimitar'],
  'pre.ready': ['statut 200 — marhaba', 'status 200 — marhaba'],
  // titres
  'title.work': ['Projets', 'Work'],
  'title.about': ['À propos', 'About'],
  'title.contact': ['Contact', 'Contact'],
  'title.terminal': ['Terminal', 'Terminal'],
  'title.404': ['Introuvable', 'Not found'],
  // pied de page
  'foot.made': ['Forgé à la main, avec Claude', 'Hand-forged, with Claude'],
  'foot.salam': ['Dire salam', 'Say salam'],
  'foot.system': ['Système', 'System'],
  // forge allumée
  'forge.lit': ['Forge allumée', 'Forge lit'],
  'forge.litSub': ['ouvert aux nouvelles quêtes', 'open to new quests'],
  'forge.out': ['Forge éteinte', 'Forge cold'],
  'forge.outSub': ['carnet plein pour le moment', 'fully booked for now'],
  'forge.cta': ['décrire ma quête →', 'describe my quest →'],
  // accueil, projets
  'home.knight': ['Chevalier en ASCII animé', 'Animated ASCII knight'],
  'work.hint': ['[ glisser · molette · ← → · entrée ]', '[ drag · scroll · ← → · enter ]'],
  'work.open': ['Ouvrir le projet', 'Open the project'],
  'proj.cover': ['visuel principal', 'main visual'],
  'proj.quest': ['// la quête', '// the quest'],
  'proj.arsenal': ['// l\'arsenal', '// the arsenal'],
  'proj.live': ['Voir le live ↗', 'See it live ↗'],
  'proj.code': ['Code source ↗', 'Source code ↗'],
  'proj.shotCode': ['code', 'code'],
  'proj.shotLog': ['journal de déploiement', 'deployment log'],
  'proj.notes': ['$ cat notes.md', '$ cat notes.md'],
  'proj.case': ['$ cat etude-de-cas.md', '$ cat case-study.md'],
  'proj.next': ['Quête suivante', 'Next quest'],
  'case.quete': ['La quête', 'The quest'],
  'case.claude': ['Ce que Claude a accéléré', 'What Claude accelerated'],
  'case.decisions': ['Ce que j\'ai décidé', 'What I decided'],
  'case.resultats': ['Résultats', 'Results'],
  'case.time': ['Temps : estimé vs réel', 'Time: estimated vs actual'],
  'case.estimated': ['estimé', 'estimated'],
  'case.actual': ['réel', 'actual'],
  'case.faster': ['{n} % plus rapide que prévu', '{n}% faster than planned'],
  'case.slower': ['{n} % plus long que prévu', '{n}% longer than planned'],
  'case.onTime': ['pile dans les temps', 'right on time'],
  // à propos
  'about.bust': ['Buste du chevalier en ASCII', 'ASCII bust of the knight'],
  'about.portrait': ['Chevalier en ASCII, vue de trois quarts', 'ASCII knight, three-quarter view'],
  'about.skills': ['$ ls ./savoir-faire', '$ ls ./skills'],
  'about.stack': ['$ ls ./arsenal', '$ ls ./arsenal'],
  'about.xp': ['$ cat campagnes.log', '$ cat campaigns.log'],
  'about.allies': ['$ ls ./allies', '$ ls ./allies'],
  // contact
  'contact.email': ['Email', 'Email'],
  'contact.newTab': ['(nouvel onglet)', '(new tab)'],
  'contact.copy': ['Copier l\'email', 'Copy email'],
  'contact.copied': ['Copié ✓', 'Copied ✓'],
  'contact.forge': ['Décrire ma quête à KALISO', 'Describe my quest to KALISO'],
  'contact.reply': ['Réponse sous 48 h', 'Reply within 48 h'],
  'contact.written': ['', 'Everything happens in writing (email or ticket)'],
  // 404
  'nf.note': ['Erreur 404 — piste perdue dans le désert', 'Error 404 — trail lost in the desert'],
  'nf.copy': ['Cette page s\'est perdue dans les sables, ou n\'a jamais existé.', 'This page got lost in the sands, or never existed.'],
  'nf.home': ['Retour au campement', 'Back to camp'],
  'nf.work': ['Voir l\'armurerie', 'See the armoury'],
  // terminal
  'term.cmd': ['Commande', 'Command'],
  'term.user': ['visiteur', 'visitor'],
  'term.keys': ['↑ ↓ historique · Tab complète · Ctrl+C annule', '↑ ↓ history · Tab completes · Ctrl+C cancels'],
  'h.whoami': ['qui suis-je', 'who am I'],
  'h.ls': ['lister les projets', 'list the projects'],
  'h.open': ['ouvrir un projet', 'open a project'],
  'h.cat': ['à propos, en bref', 'about, in short'],
  'h.forge': ['décrire ta quête à KALISO (IA)', 'describe your quest to KALISO (AI)'],
  'h.ticket': ['ouvrir une quête (devis, mission, question)', 'open a quest (quote, mission, question)'],
  'h.claude': ['mon second sabre', 'my second sabre'],
  'h.status': ['suivre mes tickets', 'track my tickets'],
  'h.contact': ['email et réseaux', 'email and socials'],
  'h.lang': ['changer de langue', 'change language'],
  'h.theme': ['changer la couleur d\'accent', 'change the accent colour'],
  'h.cd': ['index · projets · a-propos · contact', 'index · projets · a-propos · contact'],
  'h.clear': ['effacer l\'écran', 'clear the screen'],
  'h.duel': ['défier le chevalier', 'challenge the knight'],
  'term.salam': ['wa alaykoum salam, voyageur. que ta route soit douce.', 'wa alaykum salam, traveller. may your road be gentle.'],
  'term.total': ['total {n}', 'total {n}'],
  'term.openHint': ['→ open <nom> pour ouvrir un projet', '→ open <name> to open a project'],
  'term.openUsage': ['usage : open <projet>   (ls pour la liste)', 'usage: open <project>   (ls for the list)'],
  'term.openNf': ['open : projet introuvable : {x}', 'open: project not found: {x}'],
  'term.opening': ['ouverture de {x}…', 'opening {x}…'],
  'term.catNf': ['cat : fichier introuvable (essaie : cat about.md)', 'cat: file not found (try: cat about.md)'],
  'term.cdNf': ['cd : page inconnue : {x}  (index · projets · a-propos · contact)', 'cd: unknown page: {x}  (index · projets · a-propos · contact)'],
  'term.orSimpler': ['ou plus simple :', 'or simpler:'],
  'term.unknown': ['commande introuvable : {x}', 'command not found: {x}'],
  'term.typeHelp': ['— tape', '— type'],
  'term.themeNf': ['theme : couleur inconnue : {x}', 'theme: unknown colour: {x}'],
  'term.current': ['(actuel)', '(current)'],
  'term.langSet': ['langue → {x}', 'language → {x}'],
  'term.sudo': ['permission refusée : seul le chevalier détient la clé.', 'permission denied: only the knight holds the key.'],
  'term.bye': ['déconnexion…', 'logging out…'],
  'term.soundOn': ['son : activé', 'sound: on'],
  'term.soundOff': ['son : coupé', 'sound: off'],
  'term.of': ['terminal de', 'terminal of'],
  'term.intro': ['tape {help} pour la liste des commandes, {forge} pour décrire ta quête à KALISO, ou {ticket} pour l’envoyer directement.', 'type {help} for the list of commands, {forge} to describe your quest to KALISO, or {ticket} to send it straight away.'],
  'term.dispo': ['dispo : {x}', 'availability: {x}'],
  'term.stack': ['stack : {x}', 'stack: {x}'],
  'claude.who': ['— l\'IA d\'Anthropic, mon compagnon de forge', '— Anthropic\'s AI, my forge companion'],
  'claude.p1': ['Je développe avec Claude au quotidien : il écrit vite, propose, explore ; je tiens la lame. Architecture, choix techniques, relecture ligne à ligne, sécurité, finition : tout passe par moi avant de partir en production.', 'I develop with Claude every day: it writes fast, suggests, explores; I hold the blade. Architecture, technical choices, line-by-line review, security, finish: everything goes through me before it reaches production.'],
  'claude.p2': ['Le résultat : la cadence d\'une équipe, la cohérence d\'un seul artisan. Sites, apps, API, SaaS, agents IA, automatisations… aucune quête n\'est hors de portée.', 'The result: the pace of a team, the consistency of a single craftsman. Websites, apps, APIs, SaaS, AI agents, automations… no quest is out of reach.'],
  'claude.kaliso': ['(KALISO, l\'assistant de la commande forge, est un autre modèle : open source, sur Cloudflare.)', '(KALISO, the assistant behind the forge command, is a different model: open source, on Cloudflare.)'],
  'claude.ready': ['prêt ?', 'ready?'],
  // tickets
  'tk.name': ['Ton nom, ou celui de ta structure', 'Your name, or your company\'s'],
  'tk.email': ['Ton email (pour te répondre)', 'Your email (so I can reply)'],
  'tk.type': ['Quel type de quête ?', 'What kind of quest?'],
  'tk.budget': ['Budget estimé', 'Estimated budget'],
  'tk.delai': ['Délai souhaité', 'Desired timeline'],
  'tk.message': ['Décris ta quête en quelques lignes', 'Describe your quest in a few lines'],
  'tk.vName': ['au moins 2 caractères', 'at least 2 characters'],
  'tk.vEmail': ['email invalide', 'invalid email'],
  'tk.vMsg': ['un peu plus de détails (10 caractères minimum)', 'a bit more detail (10 characters minimum)'],
  'tk.new': ['nouvelle quête — Ctrl+C ou « annuler » pour rebrousser chemin', 'new quest — Ctrl+C or “cancel” to turn back'],
  'tk.prefilled': ['quête préremplie avec le plan de KALISO ✓', 'quest pre-filled with KALISO\'s plan ✓'],
  'tk.cancelled': ['ticket annulé.', 'ticket cancelled.'],
  'tk.dropped': ['ticket abandonné. tape ticket pour recommencer.', 'ticket dropped. type ticket to start again.'],
  'tk.yn': ['réponds o (oui) ou n (non)', 'answer y (yes) or n (no)'],
  'tk.pick': ['choisis un numéro entre 1 et {n}', 'pick a number between 1 and {n}'],
  'tk.send': ['Envoyer ce ticket au forgeron ?', 'Send this ticket to the smith?'],
  'tk.yes': ['[o]ui', '[y]es'],
  'tk.no': ['[n]on', '[n]o'],
  'tk.sending': ['transmission à la forge…', 'sending to the forge…'],
  'tk.sent': ['✓ ticket {id} transmis.', '✓ ticket {id} sent.'],
  'tk.replyBy': ['réponse sous 48 h à {email}.', 'reply within 48 h at {email}.'],
  'tk.track': ['suivi :', 'track it:'],
  'tk.fail': ['transmission impossible, passage par l\'email.', 'could not send it, switching to email.'],
  'tk.ready': ['✓ ticket {id} prêt. ton client mail va s\'ouvrir avec la demande préremplie : il ne reste qu\'à l\'envoyer.', '✓ ticket {id} ready. your mail app will open with the request pre-filled: just hit send.'],
  'tk.byEmail': ['envoyer par email', 'send by email'],
  'tk.trackLabel': ['suivi', 'track'],
  'tk.none': ['aucun ticket pour l\'instant —', 'no tickets yet —'],
  'tk.nf': ['status : ticket introuvable : {x}', 'status: ticket not found: {x}'],
  'tk.checking': ['vérification auprès de la forge…', 'checking with the forge…'],
  'tk.smith': ['message du forgeron :', 'message from the smith:'],
  'tk.noCopy': ['aucun ticket à copier', 'no ticket to copy'],
  'tk.copied': ['ticket copié dans le presse-papiers ✓', 'ticket copied to the clipboard ✓'],
  'tk.copyFail': ['copie impossible ici — sélectionne le ticket à la main', 'cannot copy here — select the ticket by hand'],
  'tk.noDl': ['aucun ticket à télécharger', 'no ticket to download'],
  'tk.saved': ['{f} enregistré', '{f} saved'],
  'tk.dlCancel': ['téléchargement annulé', 'download cancelled'],
  'tk.downloaded': ['{f} téléchargé', '{f} downloaded'],
  'tk.noSend': ['aucun ticket à envoyer', 'no ticket to send'],
  'tk.mailFoot': ['Envoyé depuis le terminal de {name}', 'Sent from {name}\'s terminal'],
  'tk.k.client': ['client', 'client'],
  'tk.k.email': ['email', 'email'],
  'tk.k.type': ['type', 'type'],
  'tk.k.budget': ['budget', 'budget'],
  'tk.k.delai': ['délai', 'timeline'],
  'tk.k.prio': ['priorité', 'priority'],
  'tk.k.date': ['créé le', 'created'],
  'tk.draft': ['BROUILLON', 'DRAFT'],
  'tk.open': ['OUVERT', 'OPEN'],
  'prio.haute': ['haute', 'high'],
  'prio.normale': ['normale', 'normal'],
  'prio.basse': ['basse', 'low'],
  'st.nouveau': ['nouveau', 'new'],
  'st.discussion': ['en discussion', 'in discussion'],
  'st.devis': ['devis envoyé', 'quote sent'],
  'st.forge': ['en forge', 'in the forge'],
  'st.livre': ['livré', 'delivered'],
  'st.archive': ['archivé', 'archived'],
  'type.vitrine': ['Site vitrine', 'Showcase website'],
  'type.ecommerce': ['Site e-commerce', 'Online shop'],
  'type.webapp': ['Application web / SaaS', 'Web app / SaaS'],
  'type.mobile': ['Application mobile', 'Mobile app'],
  'type.api': ['API / back-end', 'API / back-end'],
  'type.ia': ['Agent IA / automatisation', 'AI agent / automation'],
  'type.outil': ['Outil interne / intégration', 'Internal tool / integration'],
  'type.autre': ['Autre : tout le reste', 'Other: anything else'],
  'budget.lt2k': ['< 2 k€', '< €2k'],
  'budget.2-5k': ['2 – 5 k€', '€2k – €5k'],
  'budget.5-10k': ['5 – 10 k€', '€5k – €10k'],
  'budget.10k+': ['10 k€ et +', '€10k +'],
  'budget.tbd': ['À définir ensemble', 'To be defined together'],
  'delai.urgent': ['Urgent (< 2 semaines)', 'Urgent (< 2 weeks)'],
  'delai.1m': ['Sous 1 mois', 'Within a month'],
  'delai.2-3m': ['2 – 3 mois', '2 – 3 months'],
  'delai.flex': ['Flexible', 'Flexible'],
  // KALISO
  'fg.ask': ['Décris ta quête en une ou deux phrases : ce que tu veux construire, pour qui, et ce qui compte le plus.', 'Describe your quest in a sentence or two: what you want to build, for whom, and what matters most.'],
  'fg.privacy': ['ta description est transmise à KALISO et lisible par Sofiene : n’y mets rien de confidentiel.', 'your description is sent to KALISO and readable by Sofiene: don\'t include anything confidential.'],
  'fg.short': ['un peu plus de détails, que KALISO ait de quoi forger (12 caractères minimum)', 'a bit more detail, so KALISO has something to forge (12 characters minimum)'],
  'fg.heat': [['KALISO attise la braise', 'le métal rougit', 'premières frappes', 'la lame prend forme', 'trempe en cours'], ['KALISO stokes the embers', 'the metal glows', 'first strikes', 'the blade takes shape', 'quenching']],
  'fg.plan': ['plan de bataille', 'battle plan'],
  'fg.features': ['fonctionnalités', 'features'],
  'fg.stack': ['arsenal', 'stack'],
  'fg.steps': ['étapes', 'steps'],
  'fg.questions': ['questions du forgeron', 'the smith\'s questions'],
  'fg.complexity': ['complexité', 'complexity'],
  'fg.range': ['fourchette indicative', 'indicative range'],
  'fg.price': ['{a} – {b} €', '€{a} – €{b}'],
  'fg.weeks': ['{a} à {b} semaines', '{a} to {b} weeks'],
  'fg.disclaimer': ['calculée sur la grille de Sofiene, à confirmer après échange : KALISO ne fixe aucun prix.', 'computed from Sofiene\'s own pricing grid, to be confirmed once we talk: KALISO never sets prices.'],
  'fg.next': ['envoyer ce plan à Sofiene : {ticket} · affiner : {forge}', 'send this plan to Sofiene: {ticket} · refine it: {forge}'],
  'fg.credit': ['KALISO — modèle open source ({model}) sur Cloudflare · {s} s', 'KALISO — open-source model ({model}) on Cloudflare · {s} s'],
  'fg.cold': ['la forge refroidit…', 'the forge is cooling down…'],
  'fg.rate': ['trop de coups de marteau d’un coup : réessaie dans {m} min.', 'too many hammer strikes at once: try again in {m} min.'],
  'fg.quota': ['KALISO a assez forgé pour aujourd\'hui.', 'KALISO has forged enough for today.'],
  'fg.down': ['KALISO ne répond pas pour le moment.', 'KALISO is not answering right now.'],
  'fg.keep': ['ta description est gardée : ouvre un {ticket}, elle sera déjà dedans.', 'your description is kept: open a {ticket}, it\'ll already be in it.'],
  'fg.offtopic': ['décris un projet numérique (site, app, API, outil, IA…) et KALISO forgera un plan.', 'describe a digital project (website, app, API, tool, AI…) and KALISO will forge a plan.'],
  'fg.planOf': ['plan de KALISO : {title} ({id})', 'KALISO\'s plan: {title} ({id})'],
  // forge visuelle
  'menu.forge': ['Forge', 'Forge'],
  'title.forge': ['La forge', 'The forge'],
  'gui.visual': ['mode visuel', 'visual mode'],
  'gui.kicker': ["// KALISO — l'esprit de la forge", '// KALISO — the spirit of the forge'],
  'gui.title': ['Décris ta quête, KALISO forge le plan.', 'Describe your quest, KALISO forges the plan.'],
  'gui.lead': ['En quelques secondes : les fonctionnalités, les outils, les étapes et une fourchette indicative. Si le plan te parle, envoie-le à Sofiene en un clic.', 'In a few seconds: the features, the tools, the steps and an indicative range. If the plan speaks to you, send it to Sofiene in one click.'],
  'gui.label': ['Ta quête', 'Your quest'],
  'gui.placeholder': ['Ex. : une boutique en ligne pour mes bijoux en argent, livraison en Europe, paiement par carte…', 'E.g.: an online shop for my silver jewellery, shipping across Europe, card payments…'],
  'gui.examples': [['Une boutique en ligne pour mon atelier', 'Une app de réservation pour mon salon', 'Un agent IA qui répond aux emails de mes clients'], ['An online shop for my workshop', 'A booking app for my salon', 'An AI agent that answers my customer emails']],
  'gui.go': ['Forger le plan', 'Forge the plan'],
  'gui.terminal': ['Je préfère le terminal', 'I prefer the terminal'],
  'gui.send': ['Envoyer ce plan à Sofiene', 'Send this plan to Sofiene'],
  'gui.sendAnyway': ['Envoyer ma demande à Sofiene', 'Send my request to Sofiene'],
  'gui.refine': ['Affiner la description', 'Refine the description'],
  'gui.again': ['Nouvelle quête', 'New quest'],
  'gui.coldKeep': ['Ta description est gardée : envoie-la telle quelle, Sofiene te répondra lui-même.', 'Your description is kept: send it as is, Sofiene will answer you himself.'],
  'gui.f.title': ['Envoyer à Sofiene', 'Send to Sofiene'],
  'gui.f.name': ['Nom ou structure', 'Name or company'],
  'gui.f.email': ['Email', 'Email'],
  'gui.f.type': ['Type de quête', 'Kind of quest'],
  'gui.f.budget': ['Budget', 'Budget'],
  'gui.f.delai': ['Délai', 'Timeline'],
  'gui.f.message': ['Ta demande', 'Your request'],
  'gui.f.submit': ['Envoyer le ticket', 'Send the ticket'],
  'gui.sending': ['Transmission…', 'Sending…'],
  'gui.sentTitle': ['Ticket transmis', 'Ticket sent'],
  'gui.sentBody': ['Sofiene te répond sous 48 h à {email}. Garde ce numéro pour suivre ta demande.', 'Sofiene will reply within 48 h at {email}. Keep this number to track your request.'],
  'gui.track': ['Suivre dans le terminal', 'Track it in the terminal'],
  'gui.mailTitle': ['Ticket prêt', 'Ticket ready'],
  'gui.mailBody': ["La forge n'a pas pu le transmettre : ton client mail s'ouvre avec la demande préremplie, il ne reste qu'à l'envoyer.", "The forge couldn't send it: your mail app opens with the request pre-filled, just hit send."],
  'gui.mailBtn': ["Ouvrir l'email", 'Open the email'],
  'h.visuel': ['ouvrir la forge en mode visuel', 'open the forge in visual mode'],
  // forge visuelle v2
  'gui.hello': ['Que forge-t-on aujourd’hui ?', 'What shall we forge today?'],
  'gui.lead2': ['Décris ta quête en quelques mots. KALISO en tire un plan : fonctionnalités, outils, étapes et une fourchette indicative.', 'Describe your quest in a few words. KALISO turns it into a plan: features, tools, steps and an indicative range.'],
  'gui.ph': ['Décris ta quête…', 'Describe your quest…'],
  'gui.ideas': ['Idées de quêtes', 'Quest ideas'],
  'gui.mic': ['Dicter', 'Dictate'],
  'gui.micStop': ['Arrêter la dictée', 'Stop dictation'],
  'gui.forgeIt': ['Forger le plan', 'Forge the plan'],
  'gui.clear': ['Effacer', 'Clear'],
  'gui.termLink': ['›_ le terminal, pour les curieux', '›_ the terminal, for the curious'],
  'gui.loadTitle': ['KALISO forge le plan', 'KALISO is forging the plan'],
  'gui.loadSub': ['Patiente un instant : ça prend en général 5 à 15 secondes.', 'Hold on: it usually takes 5 to 15 seconds.'],
  'gui.loadPct': ['forge', 'forging'],
  'gui.kPlan': ['// plan de bataille', '// battle plan'],
  'gui.kOverview': ['// vue d’ensemble', '// overview'],
  'gui.sl.plan': ['Le plan', 'The plan'],
  'gui.sl.features': ['Fonctionnalités', 'Features'],
  'gui.sl.stack': ['Arsenal', 'Stack'],
  'gui.sl.steps': ['Étapes', 'Steps'],
  'gui.sl.range': ['Fourchette', 'Range'],
  'gui.sl.questions': ['Questions', 'Questions'],
  'gui.tt.features': ['Ce que la forge va bâtir', 'What the forge will build'],
  'gui.tt.stack': ['Les outils choisis', 'The chosen tools'],
  'gui.tt.steps': ['Le chemin, étape par étape', 'The road, step by step'],
  'gui.tt.range': ['Une première fourchette', 'A first estimate'],
  'gui.tt.questions': ['Ce que Sofiene te demandera', 'What Sofiene will ask you'],
  'gui.st.budget': ['budget indicatif', 'indicative budget'],
  'gui.st.weeks': ['délai estimé', 'estimated time'],
  'gui.st.complexity': ['complexité', 'complexity'],
  'gui.st.features': ['fonctionnalités', 'features'],
  'gui.st.tools': ['outils', 'tools'],
  'gui.st.phases': ['étapes', 'phases'],
  'gui.st.modules': ['modules', 'modules'],
  'gui.st.type': ['type de projet', 'project type'],
  'gui.st.summary': ['résumé', 'summary'],
  'gui.k': ['{a}–{b} k€', '€{a}–{b}k'],
  'gui.wk': ['{a}–{b} sem.', '{a}–{b} wks'],
  'gui.onQuote': ['sur devis', 'on quote'],
  'gui.tbd': ['à définir', 'to be defined'],
  'gui.prev': ['Précédent', 'Previous'],
  'gui.next': ['Suivant', 'Next'],
  'gui.slideOf': ['{n} sur {t}', '{n} of {t}'],
  'gui.goSlide': ['Aller à : {x}', 'Go to: {x}'],
  'gui.carousel': ['Plan de bataille', 'Battle plan'],
  'gui.noMods': ['aucun module particulier', 'no special module'],
  'gui.quests': ['// mes quêtes', '// my quests'],
  'gui.questsSub': ['Les demandes envoyées depuis ce navigateur, et la réponse de Sofiene.', 'Requests sent from this browser, and Sofiene’s reply.'],
  'gui.reply': ['réponse de Sofiene', 'Sofiene’s reply'],
  'gui.close': ['Fermer', 'Close'],
  'gui.seeQuests': ['Voir mes quêtes', 'See my quests'],
  'gui.sentBody2': ['Sofiene te répond sous 48 h à {email}. Tu suivras ta demande en bas de cette page, dans « mes quêtes ».', 'Sofiene will reply within 48 h at {email}. You can follow your request at the bottom of this page, under “my quests”.'],
  'mod.paiement': ['paiement', 'payments'],
  'mod.auth': ['comptes & connexion', 'accounts & login'],
  'mod.admin': ['back-office', 'admin panel'],
  'mod.multilingue': ['multilingue', 'multilingual'],
  'mod.ia': ['IA', 'AI'],
  'mod.temps-reel': ['temps réel', 'real time'],
  'mod.integrations': ['intégrations', 'integrations'],
  'mod.mobile-natif': ['mobile natif', 'native mobile'],
  'mod.contenu': ['gestion de contenu', 'content management'],
  'mod.3d': ['3D', '3D'],
  // secrets
  'seal.found': ['Sceau {n}/{t} brisé — {name}', 'Seal {n}/{t} broken — {name}'],
  'seal.all': ['Les sept sceaux sont brisés. Le trésor t’attend : tape tresor dans le terminal.', 'The seven seals are broken. The treasure awaits: type tresor in the terminal.'],
  'seal.more': ['sceaux → terminal', 'sceaux → terminal'],
  'seal.progress': ['{n}/{t} sceaux brisés', '{n}/{t} seals broken'],
  'seal.konami': ['le code des anciens', 'the elders\' code'],
  'seal.salam': ['le salut', 'the greeting'],
  'seal.knight': ['le chevalier éveillé', 'the knight awakened'],
  'seal.duel': ['la victoire en duel', 'the duel won'],
  'seal.desert': ['le voyageur égaré', 'the lost traveller'],
  'seal.console': ['le regard du forgeron', 'the smith\'s eye'],
  'seal.polyglot': ['le polyglotte', 'the polyglot'],
  'hint.konami': ['↑ ↑ ↓ ↓ …', '↑ ↑ ↓ ↓ …'],
  'hint.salam': ['la politesse d’abord', 'manners first'],
  'hint.knight': ['réveille le chevalier, sept fois', 'wake the knight, seven times'],
  'hint.duel': ['croise le fer', 'cross swords'],
  'hint.desert': ['perds-toi', 'get lost'],
  'hint.console': ['regarde sous le capot', 'look under the hood'],
  'hint.polyglot': ['parle toutes les langues de la forge', 'speak every tongue of the forge'],
  'seal.console.log': ['Tu lis le code ? Le forgeron aussi. Tape kaliso.sceau() pour briser un sceau.', 'Reading the code? So does the smith. Type kaliso.sceau() to break a seal.'],
  'treasure.locked': ['le coffre est scellé : {n}/{t} sceaux. tape sceaux pour les indices.', 'the chest is sealed: {n}/{t} seals. type sceaux for hints.'],
  'treasure.open': ['Le coffre s’ouvre. Tu as débloqué l’accent or (theme or), et tes prochains tickets porteront la marque des sept sceaux : le forgeron saura que tu es des nôtres.', 'The chest opens. You unlocked the gold accent (theme or), and your next tickets will bear the mark of the seven seals: the smith will know you are one of us.'],
  // duel
  'duel.intro': ['Le chevalier te défie. Trois touches pour gagner. Choisis : 1) estoc · 2) taille · 3) parade', 'The knight challenges you. First to three hits wins. Choose: 1) thrust · 2) slash · 3) parry'],
  'duel.rules': ['l’estoc perce la taille, la taille brise la parade, la parade dévie l’estoc.', 'the thrust pierces the slash, the slash breaks the parry, the parry deflects the thrust.'],
  'duel.moves': [['estoc', 'taille', 'parade'], ['thrust', 'slash', 'parry']],
  'duel.vs': ['toi : {a}  ·  chevalier : {b}', 'you: {a}  ·  knight: {b}'],
  'duel.hit': ['touché ! point pour toi.', 'hit! a point for you.'],
  'duel.hurt': ['le chevalier te touche.', 'the knight hits you.'],
  'duel.tie': ['les lames se croisent : égalité.', 'blades cross: a tie.'],
  'duel.score': ['score {a} – {b}', 'score {a} – {b}'],
  'duel.win': ['victoire ! le chevalier pose un genou à terre.', 'victory! the knight takes a knee.'],
  'duel.lose': ['défaite… le chevalier rengaine. revanche : duel', 'defeat… the knight sheathes his blade. rematch: duel'],
  'duel.pick': ['1, 2 ou 3 (ou « fuir »)', '1, 2 or 3 (or “flee”)'],
  'duel.flee': ['tu rengaines. le chevalier hoche la tête.', 'you sheathe your blade. the knight nods.'],
  // langues
  'lang.switch': ['Changer de langue', 'Change language'],
  // unités de temps (études de cas)
  'u.heures': [['heure', 'heures'], ['hour', 'hours']],
  'u.jours': [['jour', 'jours'], ['day', 'days']],
  'u.semaines': [['semaine', 'semaines'], ['week', 'weeks']],
  'u.mois': [['mois', 'mois'], ['month', 'months']],
};

const _missing = new Set();
function t(key, vars) {
  const e = UI[key];
  let s = e ? (e[LI] != null && e[LI] !== '' ? e[LI] : e[0]) : key;
  if (!e && !_missing.has(key)) { _missing.add(key); console.warn('[i18n] clé manquante :', key); }
  if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
// version HTML : le texte est échappé, puis les {jetons} reçoivent du HTML déjà sûr
function tHtml(key, html = {}) {
  const raw = t(key);
  const escd = String(raw).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return escd.replace(/\{(\w+)\}/g, (m, k) => (html[k] != null ? html[k] : m));
}
// « 6 semaines », « 6 weeks »
function unit(n, u) {
  const f = t('u.' + u);
  if (!Array.isArray(f)) return `${n} ${u}`;
  return `${n} ${n > 1 ? f[1] : f[0]}`;
}

/* --- contenu traduit ------------------------------------------------------- */
const SITE_I18N = {
  en: {
    role: 'Developer · websites, apps, APIs & AI',
    location: 'Remote — wherever the quest calls me',
    motto: 'Forged with Claude, tempered by hand',
    home: {
      footer: ['Developer × Claude', 'Every quest · every size'],
      loreLeft: "$ whoami — a developer who forges with Claude, Anthropic's AI. Websites, apps, APIs, SaaS, AI agents, automations, internal tools: whatever the project, I take it from idea to launch.",
      loreRight: '…in my forge, Claude strikes fast and I hold the blade: architecture, choices, review, finish. The pace of a whole caravan, the standards of a single craftsman. No quest too small, none too heavy.',
    },
    workLabel: '$ ls ./armoury — 2023 — 2026',
    about: {
      ring: 'Sofiene Lamsouni forges with Claude / websites, apps, APIs, SaaS, AI agents, automations / any project, from idea to launch / the speed of AI, the standards of a craftsman / every blade tempered, every line reviewed / no niche, no limit, only what holds / ',
      door: "A developer augmented by Claude. I forge websites, applications, APIs, tools and AI agents, whatever the size of the quest, with a craftsman's patience and a fāris's rigour.",
      intro: "I don't fit in any box. A craftsman's showcase site, a payment API, a mobile app, a SaaS, an AI agent or the script that gives a team three hours a day back: if it can be coded, I forge it. Claude is my second sabre: it accelerates, I decide, I review, I deliver.",
      portraitTitle: 'The Oath',
      portraitLines: ['Developer × Claude', 'Site · App · API · AI · Tool'],
      skills: ['Showcase websites', 'E-commerce', 'Web applications', 'Mobile apps', 'APIs & back-end', 'SaaS', 'AI agents', 'Automations', 'Internal tools', 'Integrations', 'WebGL & 3D', 'DevOps & deployment'],
      copy: "I work with Claude the way a smith works with his bellows: it stokes the fire, I guide every strike. The result: projects delivered faster, without giving an inch on architecture, security or finish. Founders, craftsmen, studios, small businesses, product teams: bring the quest, I'll forge the weapon. Remote, anywhere.",
      experience: [['2024 — Now', 'Independent forge · Developer × Claude'], ['2022 — 2024', 'Lead developer · Atelier Médina'], ['2020 — 2022', 'Full-stack · Agence Caravane'], ['2019 — 2020', 'Developer · Startup Oasis']],
    },
    contact: {
      copy: 'A quest in mind? Website, app, API, SaaS, AI agent, automation, redesign, or just an idea scribbled on a napkin: describe it in a few lines, or open a ticket in the terminal. Reply within 48 hours, with a battle plan.',
      commands: ['ticket --new-quest', 'forge "an online shop for my workshop"', 'mail --to kaliso.dev@gmail.com', 'echo "salam" | mail kaliso.dev@gmail.com'],
    },
  },
};

// fusion profonde : les objets se mélangent, les tableaux et textes remplacent
function deepMerge(base, over) {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = (base && typeof base[k] === 'object' && !Array.isArray(base[k])) ? deepMerge(base[k], over[k]) : over[k];
  return out;
}
// projet → champs dans la langue courante (repli sur le français)
function localizeProject(p) {
  const fr = (p.i18n && p.i18n.fr) || {};
  const loc = (p.i18n && p.i18n[LANG]) || {};
  const story = p.story ? (p.story[LANG] || p.story.fr || null) : null;
  return { ...p, ...fr, ...loc, story, storyLang: p.story && p.story[LANG] ? LANG : 'fr' };
}
(function applyLang() {
  const over = SITE_I18N[LANG];
  if (over) for (const k of Object.keys(over)) SITE[k] = deepMerge(SITE[k], over[k]);
  SITE.projects = SITE.projects.map(localizeProject);
  document.documentElement.lang = LANG;
  document.documentElement.dir = RTL ? 'rtl' : 'ltr';
})();

function setLang(l) {
  if (!LANGS.includes(l) || l === LANG) return false;
  try { localStorage.setItem('kaliso-lang', l); } catch (e) {}
  if (typeof Seals !== 'undefined') Seals.lang(l);
  // un voile tombe, la page renaît dans l'autre langue (puis la lame tranche le voile)
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  try { sessionStorage.setItem('kaliso-relang', l); } catch (e) {}
  const veil = document.createElement('div');
  veil.className = 'lang-veil';
  veil.innerHTML = `<span lang="${l}">${LANG_NAMES[l]}</span>`;
  document.body.appendChild(veil);
  const reload = () => location.replace(u.toString());
  if (typeof gsap !== 'undefined' && !REDUCED) gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => setTimeout(reload, 60) });
  else reload();
  return true;
}
