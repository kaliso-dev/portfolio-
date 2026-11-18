/* ==========================================================================
   LANGUES — français (base), anglais, arabe (RTL)
   UI : chaque clé → [fr, en, ar]. Contenu : SITE_I18N.en / .ar remplacent
   les champs de SITE (00-config.js) ; les projets portent leurs propres
   traductions (src/projets/*.md).
   ========================================================================== */
const LANGS = ['fr', 'en', 'ar'];
const LANG_NAMES = { fr: 'Français', en: 'English', ar: 'العربية' };
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
const RTL = LANG === 'ar';

const UI = {
  // navigation, menu, son
  'nav.menu': ['Menu', 'Menu', 'القائمة'],
  'nav.close': ['Fermer', 'Close', 'إغلاق'],
  'nav.contact': ['Contact', 'Contact', 'تواصل'],
  'nav.main': ['Principale', 'Main', 'الرئيسية'],
  'menu.index': ['Index', 'Index', 'الرئيسية'],
  'menu.work': ['Projets', 'Work', 'المشاريع'],
  'menu.about': ['À propos', 'About', 'من أنا'],
  'menu.contact': ['Contact', 'Contact', 'تواصل'],
  'menu.terminal': ['Terminal', 'Terminal', 'الطرفية'],
  'menu.lang': ['langue', 'language', 'اللغة'],
  'snd.on': ['son : on', 'sound: on', 'الصوت: مُفعَّل'],
  'snd.off': ['son : off', 'sound: off', 'الصوت: مُطفأ'],
  'snd.mute': ['Couper le son', 'Mute', 'كتم الصوت'],
  'snd.unmute': ['Activer le son', 'Unmute', 'تشغيل الصوت'],
  'music.credit': ['musique de fond :', 'background music:', 'موسيقى الخلفية:'],
  'noscript': ['Activez JavaScript pour voir ce portfolio.', 'Enable JavaScript to see this portfolio.', 'فعِّل JavaScript لمشاهدة هذا الموقع.'],
  // chargement
  'gate.key': ['[ Entrée ]', '[ Enter ]', '[ Enter ]'],
  'gate.draw': ['dégainer', 'draw the blade', 'استلّ السيف'],
  'gate.sound': ['♪ avec le son', '♪ with sound', '♪ مع الصوت'],
  'gate.mute': ['entrer sans son', 'enter without sound', 'ادخل دون صوت'],
  'pre.os': ['forge', 'forge', 'الكير'],
  'pre.boot': ['démarrage', 'booting', 'الإقلاع'],
  'pre.forge': ['allumage de la forge', 'lighting the forge', 'إشعال الكير'],
  'pre.claude': ['invocation de claude', 'summoning claude', 'استدعاء claude'],
  'pre.temper': ['trempe du cimeterre', 'tempering the scimitar', 'سقي السيف'],
  'pre.ready': ['statut 200 — marhaba', 'status 200 — marhaba', 'الحالة 200 — مرحبا'],
  // titres
  'title.work': ['Projets', 'Work', 'المشاريع'],
  'title.about': ['À propos', 'About', 'من أنا'],
  'title.contact': ['Contact', 'Contact', 'تواصل'],
  'title.terminal': ['Terminal', 'Terminal', 'الطرفية'],
  'title.404': ['Introuvable', 'Not found', 'غير موجودة'],
  // pied de page
  'foot.made': ['Forgé à la main, avec Claude', 'Hand-forged, with Claude', 'صُنع يدويًا، مع Claude'],
  'foot.salam': ['Dire salam', 'Say salam', 'قل السلام'],
  'foot.system': ['Système', 'System', 'النظام'],
  // forge allumée
  'forge.lit': ['Forge allumée', 'Forge lit', 'الكير مشتعل'],
  'forge.litSub': ['ouvert aux nouvelles quêtes', 'open to new quests', 'متاح لمهام جديدة'],
  'forge.out': ['Forge éteinte', 'Forge cold', 'الكير مطفأ'],
  'forge.outSub': ['carnet plein pour le moment', 'fully booked for now', 'المواعيد ممتلئة حاليًا'],
  'forge.cta': ['décrire ma quête →', 'describe my quest →', 'صِف مهمّتك ←'],
  // accueil, projets
  'home.knight': ['Chevalier en ASCII animé', 'Animated ASCII knight', 'فارس متحرّك بحروف ASCII'],
  'work.hint': ['[ glisser · molette · ← → · entrée ]', '[ drag · scroll · ← → · enter ]', '[ اسحب · مرّر · ← → · Enter ]'],
  'work.open': ['Ouvrir le projet', 'Open the project', 'افتح المشروع'],
  'proj.cover': ['visuel principal', 'main visual', 'الصورة الرئيسية'],
  'proj.quest': ['// la quête', '// the quest', '// المهمّة'],
  'proj.arsenal': ["// l'arsenal", '// the arsenal', '// العُدّة'],
  'proj.live': ['Voir le live ↗', 'See it live ↗', 'شاهده مباشرة ↗'],
  'proj.code': ['Code source ↗', 'Source code ↗', 'الشيفرة المصدرية ↗'],
  'proj.shotCode': ['code', 'code', 'الشيفرة'],
  'proj.shotLog': ['journal de déploiement', 'deployment log', 'سجلّ النشر'],
  'proj.notes': ['$ cat notes.md', '$ cat notes.md', '\u200E$ cat notes.md'],
  'proj.case': ['$ cat etude-de-cas.md', '$ cat case-study.md', '\u200E$ cat case-study.md'],
  'proj.next': ['Quête suivante', 'Next quest', 'المهمّة التالية'],
  'case.quete': ['La quête', 'The quest', 'المهمّة'],
  'case.claude': ['Ce que Claude a accéléré', 'What Claude accelerated', 'ما سرّعه Claude'],
  'case.decisions': ["Ce que j'ai décidé", 'What I decided', 'ما قرّرته بنفسي'],
  'case.resultats': ['Résultats', 'Results', 'النتائج'],
  'case.time': ['Temps : estimé vs réel', 'Time: estimated vs actual', 'الوقت: المُقدَّر مقابل الفعلي'],
  'case.estimated': ['estimé', 'estimated', 'المُقدَّر'],
  'case.actual': ['réel', 'actual', 'الفعلي'],
  'case.faster': ['{n} % plus rapide que prévu', '{n}% faster than planned', 'أسرع من المتوقّع بـ {n}%'],
  'case.slower': ['{n} % plus long que prévu', '{n}% longer than planned', 'أطول من المتوقّع بـ {n}%'],
  'case.onTime': ['pile dans les temps', 'right on time', 'في الموعد تمامًا'],
  // à propos
  'about.bust': ['Buste du chevalier en ASCII', 'ASCII bust of the knight', 'تمثال نصفي للفارس بحروف ASCII'],
  'about.portrait': ['Chevalier en ASCII, vue de trois quarts', 'ASCII knight, three-quarter view', 'فارس بحروف ASCII، منظر جانبي'],
  'about.skills': ['$ ls ./savoir-faire', '$ ls ./skills', '\u200E$ ls ./skills'],
  'about.stack': ['$ ls ./arsenal', '$ ls ./arsenal', '\u200E$ ls ./arsenal'],
  'about.xp': ['$ cat campagnes.log', '$ cat campaigns.log', '\u200E$ cat campaigns.log'],
  'about.allies': ['$ ls ./allies', '$ ls ./allies', '\u200E$ ls ./allies'],
  // contact
  'contact.email': ['Email', 'Email', 'البريد'],
  'contact.newTab': ['(nouvel onglet)', '(new tab)', '(نافذة جديدة)'],
  'contact.copy': ["Copier l'email", 'Copy email', 'نسخ البريد'],
  'contact.copied': ['Copié ✓', 'Copied ✓', 'تم النسخ ✓'],
  'contact.forge': ['Décrire ma quête à KALISO', 'Describe my quest to KALISO', 'صِف مهمّتك لـ KALISO'],
  'contact.reply': ['Réponse sous 48 h', 'Reply within 48 h', 'الردّ خلال 48 ساعة'],
  'contact.written': ['', 'Everything happens in writing (email or ticket)', 'كل التواصل يتمّ كتابةً (بريد أو تذكرة)'],
  // 404
  'nf.note': ['Erreur 404 — piste perdue dans le désert', 'Error 404 — trail lost in the desert', 'خطأ 404 — أثرٌ ضائع في الصحراء'],
  'nf.copy': ["Cette page s'est perdue dans les sables, ou n'a jamais existé.", 'This page got lost in the sands, or never existed.', 'ضاعت هذه الصفحة في الرمال، أو لم توجد قطّ.'],
  'nf.home': ['Retour au campement', 'Back to camp', 'العودة إلى المخيّم'],
  'nf.work': ["Voir l'armurerie", 'See the armoury', 'زيارة مخزن السلاح'],
  // terminal
  'term.cmd': ['Commande', 'Command', 'الأمر'],
  'term.user': ['visiteur', 'visitor', 'visitor'],
  'term.keys': ['↑ ↓ historique · Tab complète · Ctrl+C annule', '↑ ↓ history · Tab completes · Ctrl+C cancels', '↑ ↓ السجلّ · Tab للإكمال · Ctrl+C للإلغاء'],
  'h.whoami': ['qui suis-je', 'who am I', 'من أنا'],
  'h.ls': ['lister les projets', 'list the projects', 'قائمة المشاريع'],
  'h.open': ['ouvrir un projet', 'open a project', 'فتح مشروع'],
  'h.cat': ['à propos, en bref', 'about, in short', 'نبذة مختصرة'],
  'h.forge': ['décrire ta quête à KALISO (IA)', 'describe your quest to KALISO (AI)', 'صِف مهمّتك لـ KALISO (ذكاء اصطناعي)'],
  'h.ticket': ['ouvrir une quête (devis, mission, question)', 'open a quest (quote, mission, question)', 'افتح مهمّة (عرض سعر، مشروع، سؤال)'],
  'h.claude': ['mon second sabre', 'my second sabre', 'سيفي الثاني'],
  'h.status': ['suivre mes tickets', 'track my tickets', 'تتبّع تذاكري'],
  'h.contact': ['email et réseaux', 'email and socials', 'البريد والشبكات'],
  'h.lang': ['changer de langue', 'change language', 'تغيير اللغة'],
  'h.theme': ["changer la couleur d'accent", 'change the accent colour', 'تغيير اللون'],
  'h.cd': ['index · projets · a-propos · contact', 'index · projets · a-propos · contact', 'index · projets · a-propos · contact'],
  'h.clear': ["effacer l'écran", 'clear the screen', 'مسح الشاشة'],
  'h.duel': ['défier le chevalier', 'challenge the knight', 'تحدَّ الفارس'],
  'term.salam': ['wa alaykoum salam, voyageur. que ta route soit douce.', 'wa alaykum salam, traveller. may your road be gentle.', 'وعليكم السلام أيها المسافر. طريق السلامة.'],
  'term.total': ['total {n}', 'total {n}', 'المجموع {n}'],
  'term.openHint': ['→ open <nom> pour ouvrir un projet', '→ open <name> to open a project', '→ open <الاسم> لفتح مشروع'],
  'term.openUsage': ['usage : open <projet>   (ls pour la liste)', 'usage: open <project>   (ls for the list)', 'الاستعمال: open <مشروع>   (ls للقائمة)'],
  'term.openNf': ['open : projet introuvable : {x}', 'open: project not found: {x}', 'open: المشروع غير موجود: {x}'],
  'term.opening': ['ouverture de {x}…', 'opening {x}…', 'جارٍ فتح {x}…'],
  'term.catNf': ['cat : fichier introuvable (essaie : cat about.md)', 'cat: file not found (try: cat about.md)', 'cat: الملف غير موجود (جرّب: cat about.md)'],
  'term.cdNf': ['cd : page inconnue : {x}  (index · projets · a-propos · contact)', 'cd: unknown page: {x}  (index · projets · a-propos · contact)', 'cd: صفحة غير معروفة: {x}  (index · projets · a-propos · contact)'],
  'term.orSimpler': ['ou plus simple :', 'or simpler:', 'أو ببساطة:'],
  'term.unknown': ['commande introuvable : {x}', 'command not found: {x}', 'أمر غير معروف: {x}'],
  'term.typeHelp': ['— tape', '— type', '— اكتب'],
  'term.themeNf': ['theme : couleur inconnue : {x}', 'theme: unknown colour: {x}', 'theme: لون غير معروف: {x}'],
  'term.current': ['(actuel)', '(current)', '(الحالي)'],
  'term.langSet': ['langue → {x}', 'language → {x}', 'اللغة ← {x}'],
  'term.sudo': ['permission refusée : seul le chevalier détient la clé.', 'permission denied: only the knight holds the key.', 'تم رفض الإذن: وحده الفارس يملك المفتاح.'],
  'term.bye': ['déconnexion…', 'logging out…', 'جارٍ الخروج…'],
  'term.soundOn': ['son : activé', 'sound: on', 'الصوت: مُفعَّل'],
  'term.soundOff': ['son : coupé', 'sound: off', 'الصوت: مُطفأ'],
  'term.of': ['terminal de', 'terminal of', 'طرفية'],
  'term.intro': ['tape {help} pour la liste des commandes, {forge} pour décrire ta quête à KALISO, ou {ticket} pour l’envoyer directement.', 'type {help} for the list of commands, {forge} to describe your quest to KALISO, or {ticket} to send it straight away.', 'اكتب {help} لقائمة الأوامر، أو {forge} لتصف مهمّتك لـ KALISO، أو {ticket} لإرسالها مباشرة.'],
  'term.dispo': ['dispo : {x}', 'availability: {x}', 'التوفّر: {x}'],
  'term.stack': ['stack : {x}', 'stack: {x}', 'العُدّة: {x}'],
  'claude.who': ["— l'IA d'Anthropic, mon compagnon de forge", "— Anthropic's AI, my forge companion", '— الذكاء الاصطناعي من Anthropic، رفيقي في الكير'],
  'claude.p1': ["Je développe avec Claude au quotidien : il écrit vite, propose, explore ; je tiens la lame. Architecture, choix techniques, relecture ligne à ligne, sécurité, finition : tout passe par moi avant de partir en production.", 'I develop with Claude every day: it writes fast, suggests, explores; I hold the blade. Architecture, technical choices, line-by-line review, security, finish: everything goes through me before it reaches production.', 'أطوّر مع Claude كل يوم: يكتب بسرعة، ويقترح، ويستكشف؛ وأنا أمسك النصل. الهندسة، والاختيارات التقنية، والمراجعة سطرًا بسطر، والأمن، واللمسات الأخيرة: كل شيء يمرّ عبري قبل أن يصل إلى الإنتاج.'],
  'claude.p2': ["Le résultat : la cadence d'une équipe, la cohérence d'un seul artisan. Sites, apps, API, SaaS, agents IA, automatisations… aucune quête n'est hors de portée.", 'The result: the pace of a team, the consistency of a single craftsman. Websites, apps, APIs, SaaS, AI agents, automations… no quest is out of reach.', 'والنتيجة: سرعة فريق كامل، وانسجام حِرفيّ واحد. مواقع، تطبيقات، واجهات برمجية، SaaS، وكلاء ذكاء اصطناعي، أتمتة… لا مهمّة بعيدة المنال.'],
  'claude.kaliso': ["(KALISO, l'assistant de la commande forge, est un autre modèle : open source, sur Cloudflare.)", '(KALISO, the assistant behind the forge command, is a different model: open source, on Cloudflare.)', '(KALISO، مساعد الأمر forge، نموذج آخر: مفتوح المصدر، على Cloudflare.)'],
  'claude.ready': ['prêt ?', 'ready?', 'مستعدّ؟'],
  // tickets
  'tk.name': ['Ton nom, ou celui de ta structure', "Your name, or your company's", 'اسمك، أو اسم مؤسّستك'],
  'tk.email': ['Ton email (pour te répondre)', 'Your email (so I can reply)', 'بريدك الإلكتروني (للردّ عليك)'],
  'tk.type': ['Quel type de quête ?', 'What kind of quest?', 'ما نوع المهمّة؟'],
  'tk.budget': ['Budget estimé', 'Estimated budget', 'الميزانية التقديرية'],
  'tk.delai': ['Délai souhaité', 'Desired timeline', 'المدّة المرغوبة'],
  'tk.message': ['Décris ta quête en quelques lignes', 'Describe your quest in a few lines', 'صِف مهمّتك في بضعة أسطر'],
  'tk.vName': ['au moins 2 caractères', 'at least 2 characters', 'حرفان على الأقل'],
  'tk.vEmail': ['email invalide', 'invalid email', 'بريد إلكتروني غير صالح'],
  'tk.vMsg': ['un peu plus de détails (10 caractères minimum)', 'a bit more detail (10 characters minimum)', 'المزيد من التفاصيل (10 أحرف على الأقل)'],
  'tk.new': ['nouvelle quête — Ctrl+C ou « annuler » pour rebrousser chemin', 'new quest — Ctrl+C or “cancel” to turn back', 'مهمّة جديدة — Ctrl+C أو «إلغاء» للتراجع'],
  'tk.prefilled': ['quête préremplie avec le plan de KALISO ✓', "quest pre-filled with KALISO's plan ✓", 'المهمّة مملوءة مسبقًا بخطة KALISO ✓'],
  'tk.cancelled': ['ticket annulé.', 'ticket cancelled.', 'أُلغيت التذكرة.'],
  'tk.dropped': ['ticket abandonné. tape ticket pour recommencer.', 'ticket dropped. type ticket to start again.', 'تُركت التذكرة. اكتب ticket للبدء من جديد.'],
  'tk.yn': ['réponds o (oui) ou n (non)', 'answer y (yes) or n (no)', 'أجب بـ y (نعم) أو n (لا)'],
  'tk.pick': ['choisis un numéro entre 1 et {n}', 'pick a number between 1 and {n}', 'اختر رقمًا بين 1 و{n}'],
  'tk.send': ['Envoyer ce ticket au forgeron ?', 'Send this ticket to the smith?', 'هل ترسل هذه التذكرة إلى الحدّاد؟'],
  'tk.yes': ['[o]ui', '[y]es', '[y] نعم'],
  'tk.no': ['[n]on', '[n]o', '[n] لا'],
  'tk.sending': ['transmission à la forge…', 'sending to the forge…', 'جارٍ الإرسال إلى الكير…'],
  'tk.sent': ['✓ ticket {id} transmis.', '✓ ticket {id} sent.', '✓ أُرسلت التذكرة {id}.'],
  'tk.replyBy': ['réponse sous 48 h à {email}.', 'reply within 48 h at {email}.', 'الردّ خلال 48 ساعة على {email}.'],
  'tk.track': ['suivi :', 'track it:', 'التتبّع:'],
  'tk.fail': ["transmission impossible, passage par l'email.", 'could not send it, switching to email.', 'تعذّر الإرسال، سننتقل إلى البريد.'],
  'tk.ready': ["✓ ticket {id} prêt. ton client mail va s'ouvrir avec la demande préremplie : il ne reste qu'à l'envoyer.", '✓ ticket {id} ready. your mail app will open with the request pre-filled: just hit send.', '✓ التذكرة {id} جاهزة. سيفتح بريدك الإلكتروني مع الطلب مكتوبًا مسبقًا: لم يبقَ إلا الإرسال.'],
  'tk.byEmail': ['envoyer par email', 'send by email', 'أرسل بالبريد'],
  'tk.trackLabel': ['suivi', 'track', 'تتبّع'],
  'tk.none': ["aucun ticket pour l'instant —", 'no tickets yet —', 'لا توجد تذاكر بعد —'],
  'tk.nf': ['status : ticket introuvable : {x}', 'status: ticket not found: {x}', 'status: التذكرة غير موجودة: {x}'],
  'tk.checking': ['vérification auprès de la forge…', 'checking with the forge…', 'جارٍ التحقّق مع الكير…'],
  'tk.smith': ['message du forgeron :', 'message from the smith:', 'رسالة من الحدّاد:'],
  'tk.noCopy': ['aucun ticket à copier', 'no ticket to copy', 'لا توجد تذكرة لنسخها'],
  'tk.copied': ['ticket copié dans le presse-papiers ✓', 'ticket copied to the clipboard ✓', 'نُسخت التذكرة ✓'],
  'tk.copyFail': ['copie impossible ici — sélectionne le ticket à la main', 'cannot copy here — select the ticket by hand', 'تعذّر النسخ هنا — حدّد التذكرة يدويًا'],
  'tk.noDl': ['aucun ticket à télécharger', 'no ticket to download', 'لا توجد تذكرة لتنزيلها'],
  'tk.saved': ['{f} enregistré', '{f} saved', 'حُفظ {f}'],
  'tk.dlCancel': ['téléchargement annulé', 'download cancelled', 'أُلغي التنزيل'],
  'tk.downloaded': ['{f} téléchargé', '{f} downloaded', 'نُزّل {f}'],
  'tk.noSend': ['aucun ticket à envoyer', 'no ticket to send', 'لا توجد تذكرة لإرسالها'],
  'tk.mailFoot': ['Envoyé depuis le terminal de {name}', "Sent from {name}'s terminal", 'أُرسلت من طرفية {name}'],
  'tk.k.client': ['client', 'client', 'client'],
  'tk.k.email': ['email', 'email', 'email'],
  'tk.k.type': ['type', 'type', 'type'],
  'tk.k.budget': ['budget', 'budget', 'budget'],
  'tk.k.delai': ['délai', 'timeline', 'timeline'],
  'tk.k.prio': ['priorité', 'priority', 'priority'],
  'tk.k.date': ['créé le', 'created', 'created'],
  'tk.draft': ['BROUILLON', 'DRAFT', 'DRAFT'],
  'tk.open': ['OUVERT', 'OPEN', 'OPEN'],
  'prio.haute': ['haute', 'high', 'عالية'],
  'prio.normale': ['normale', 'normal', 'عادية'],
  'prio.basse': ['basse', 'low', 'منخفضة'],
  'st.nouveau': ['nouveau', 'new', 'جديدة'],
  'st.discussion': ['en discussion', 'in discussion', 'قيد النقاش'],
  'st.devis': ['devis envoyé', 'quote sent', 'أُرسل العرض'],
  'st.forge': ['en forge', 'in the forge', 'قيد الصنع'],
  'st.livre': ['livré', 'delivered', 'سُلِّمت'],
  'st.archive': ['archivé', 'archived', 'مؤرشفة'],
  'type.vitrine': ['Site vitrine', 'Showcase website', 'موقع تعريفي'],
  'type.ecommerce': ['Site e-commerce', 'Online shop', 'متجر إلكتروني'],
  'type.webapp': ['Application web / SaaS', 'Web app / SaaS', 'تطبيق ويب / SaaS'],
  'type.mobile': ['Application mobile', 'Mobile app', 'تطبيق جوّال'],
  'type.api': ['API / back-end', 'API / back-end', 'واجهة برمجية / خادم'],
  'type.ia': ['Agent IA / automatisation', 'AI agent / automation', 'وكيل ذكاء اصطناعي / أتمتة'],
  'type.outil': ['Outil interne / intégration', 'Internal tool / integration', 'أداة داخلية / تكامل'],
  'type.autre': ['Autre : tout le reste', 'Other: anything else', 'أخرى: كل ما تبقّى'],
  'budget.lt2k': ['< 2 k€', '< €2k', 'أقل من 2000 €'],
  'budget.2-5k': ['2 – 5 k€', '€2k – €5k', 'من 2000 إلى 5000 €'],
  'budget.5-10k': ['5 – 10 k€', '€5k – €10k', 'من 5000 إلى 10000 €'],
  'budget.10k+': ['10 k€ et +', '€10k +', '10000 € فأكثر'],
  'budget.tbd': ['À définir ensemble', 'To be defined together', 'نحدّدها معًا'],
  'delai.urgent': ['Urgent (< 2 semaines)', 'Urgent (< 2 weeks)', 'عاجل (أقل من أسبوعين)'],
  'delai.1m': ['Sous 1 mois', 'Within a month', 'خلال شهر'],
  'delai.2-3m': ['2 – 3 mois', '2 – 3 months', 'من شهرين إلى ثلاثة'],
  'delai.flex': ['Flexible', 'Flexible', 'مرن'],
  // KALISO
  'fg.ask': ['Décris ta quête en une ou deux phrases : ce que tu veux construire, pour qui, et ce qui compte le plus.', 'Describe your quest in a sentence or two: what you want to build, for whom, and what matters most.', 'صِف مهمّتك في جملة أو جملتين: ماذا تريد أن تبني، ولمن، وما الأهمّ بالنسبة لك.'],
  'fg.privacy': ['ta description est transmise à KALISO et lisible par Sofiene : n’y mets rien de confidentiel.', "your description is sent to KALISO and readable by Sofiene: don't include anything confidential.", 'يُرسَل وصفك إلى KALISO ويمكن لسفيان قراءته: لا تكتب فيه شيئًا سرّيًّا.'],
  'fg.short': ['un peu plus de détails, que KALISO ait de quoi forger (12 caractères minimum)', 'a bit more detail, so KALISO has something to forge (12 characters minimum)', 'المزيد من التفاصيل، كي يجد KALISO ما يصنعه (12 حرفًا على الأقل)'],
  'fg.heat': [['KALISO attise la braise', 'le métal rougit', 'premières frappes', 'la lame prend forme', 'trempe en cours'], ['KALISO stokes the embers', 'the metal glows', 'first strikes', 'the blade takes shape', 'quenching'], ['KALISO يؤجّج الجمر', 'المعدن يحمرّ', 'الضربات الأولى', 'النصل يتشكّل', 'جارٍ السقي']],
  'fg.plan': ['plan de bataille', 'battle plan', 'خطة المعركة'],
  'fg.features': ['fonctionnalités', 'features', 'الميزات'],
  'fg.stack': ['arsenal', 'stack', 'العُدّة التقنية'],
  'fg.steps': ['étapes', 'steps', 'المراحل'],
  'fg.questions': ['questions du forgeron', "the smith's questions", 'أسئلة الحدّاد'],
  'fg.complexity': ['complexité', 'complexity', 'التعقيد'],
  'fg.range': ['fourchette indicative', 'indicative range', 'تقدير أوّلي'],
  'fg.price': ['{a} – {b} €', '€{a} – €{b}', '{a} – {b} €'],
  'fg.weeks': ['{a} à {b} semaines', '{a} to {b} weeks', 'من {a} إلى {b} أسابيع'],
  'fg.disclaimer': ['calculée sur la grille de Sofiene, à confirmer après échange : KALISO ne fixe aucun prix.', "computed from Sofiene's own pricing grid, to be confirmed once we talk: KALISO never sets prices.", 'محسوبة وفق جدول أسعار سفيان، وتُؤكَّد بعد التواصل: KALISO لا يحدّد الأسعار.'],
  'fg.next': ['envoyer ce plan à Sofiene : {ticket} · affiner : {forge}', 'send this plan to Sofiene: {ticket} · refine it: {forge}', 'أرسل هذه الخطة إلى سفيان: {ticket} · حسّنها: {forge}'],
  'fg.credit': ['KALISO — modèle open source ({model}) sur Cloudflare · {s} s', 'KALISO — open-source model ({model}) on Cloudflare · {s} s', 'KALISO — نموذج مفتوح المصدر ({model}) على Cloudflare · {s} ث'],
  'fg.cold': ['la forge refroidit…', 'the forge is cooling down…', 'الكير يبرد…'],
  'fg.rate': ['trop de coups de marteau d’un coup : réessaie dans {m} min.', 'too many hammer strikes at once: try again in {m} min.', 'ضربات كثيرة دفعة واحدة: أعد المحاولة بعد {m} دقيقة.'],
  'fg.quota': ["KALISO a assez forgé pour aujourd'hui.", 'KALISO has forged enough for today.', 'صنع KALISO ما يكفي لهذا اليوم.'],
  'fg.down': ['KALISO ne répond pas pour le moment.', 'KALISO is not answering right now.', 'KALISO لا يجيب حاليًا.'],
  'fg.keep': ['ta description est gardée : ouvre un {ticket}, elle sera déjà dedans.', "your description is kept: open a {ticket}, it'll already be in it.", 'وصفك محفوظ: افتح {ticket} وستجده فيها.'],
  'fg.offtopic': ['décris un projet numérique (site, app, API, outil, IA…) et KALISO forgera un plan.', 'describe a digital project (website, app, API, tool, AI…) and KALISO will forge a plan.', 'صِف مشروعًا رقميًا (موقع، تطبيق، واجهة برمجية، أداة، ذكاء اصطناعي…) وسيصنع KALISO خطة.'],
  'fg.planOf': ['plan de KALISO : {title} ({id})', "KALISO's plan: {title} ({id})", 'خطة KALISO: {title} ({id})'],
  // secrets
  'seal.found': ['Sceau {n}/{t} brisé — {name}', 'Seal {n}/{t} broken — {name}', 'كُسر الختم {n}/{t} — {name}'],
  'seal.all': ['Les sept sceaux sont brisés. Le trésor t’attend : tape tresor dans le terminal.', 'The seven seals are broken. The treasure awaits: type tresor in the terminal.', 'كُسرت الأختام السبعة. الكنز ينتظرك: اكتب tresor في الطرفية.'],
  'seal.more': ['sceaux → terminal', 'sceaux → terminal', 'sceaux ← الطرفية'],
  'seal.progress': ['{n}/{t} sceaux brisés', '{n}/{t} seals broken', '{n}/{t} أختام مكسورة'],
  'seal.konami': ['le code des anciens', "the elders' code", 'شيفرة الأوّلين'],
  'seal.salam': ['le salut', 'the greeting', 'التحيّة'],
  'seal.knight': ['le chevalier éveillé', 'the knight awakened', 'الفارس المستيقظ'],
  'seal.duel': ['la victoire en duel', 'the duel won', 'النصر في المبارزة'],
  'seal.desert': ['le voyageur égaré', 'the lost traveller', 'المسافر التائه'],
  'seal.console': ['le regard du forgeron', "the smith's eye", 'عين الحدّاد'],
  'seal.polyglot': ['le polyglotte', 'the polyglot', 'متعدّد الألسن'],
  'hint.konami': ['↑ ↑ ↓ ↓ …', '↑ ↑ ↓ ↓ …', '↑ ↑ ↓ ↓ …'],
  'hint.salam': ['la politesse d’abord', 'manners first', 'الأدب أولًا'],
  'hint.knight': ['réveille le chevalier, sept fois', 'wake the knight, seven times', 'أيقظ الفارس، سبع مرّات'],
  'hint.duel': ['croise le fer', 'cross swords', 'بارِز'],
  'hint.desert': ['perds-toi', 'get lost', 'تُه'],
  'hint.console': ['regarde sous le capot', 'look under the hood', 'انظر تحت الغطاء'],
  'hint.polyglot': ['parle toutes les langues de la forge', 'speak every tongue of the forge', 'تحدّث كل ألسنة الكير'],
  'seal.console.log': ['Tu lis le code ? Le forgeron aussi. Tape kaliso.sceau() pour briser un sceau.', 'Reading the code? So does the smith. Type kaliso.sceau() to break a seal.', 'تقرأ الشيفرة؟ الحدّاد أيضًا. اكتب kaliso.sceau() لكسر ختم.'],
  'treasure.locked': ['le coffre est scellé : {n}/{t} sceaux. tape sceaux pour les indices.', 'the chest is sealed: {n}/{t} seals. type sceaux for hints.', 'الصندوق مختوم: {n}/{t} أختام. اكتب sceaux للتلميحات.'],
  'treasure.open': ['Le coffre s’ouvre. Tu as débloqué l’accent or (theme or), et tes prochains tickets porteront la marque des sept sceaux : le forgeron saura que tu es des nôtres.', 'The chest opens. You unlocked the gold accent (theme or), and your next tickets will bear the mark of the seven seals: the smith will know you are one of us.', 'انفتح الصندوق. فتحت اللون الذهبي (theme or)، وستحمل تذاكرك القادمة علامة الأختام السبعة: سيعرف الحدّاد أنك منّا.'],
  // duel
  'duel.intro': ['Le chevalier te défie. Trois touches pour gagner. Choisis : 1) estoc · 2) taille · 3) parade', 'The knight challenges you. First to three hits wins. Choose: 1) thrust · 2) slash · 3) parry', 'الفارس يتحدّاك. من يصل إلى ثلاث إصابات يفوز. اختر: 1) طعنة · 2) ضربة · 3) صدّ'],
  'duel.rules': ['l’estoc perce la taille, la taille brise la parade, la parade dévie l’estoc.', 'the thrust pierces the slash, the slash breaks the parry, the parry deflects the thrust.', 'الطعنة تخترق الضربة، والضربة تكسر الصدّ، والصدّ يردّ الطعنة.'],
  'duel.moves': [['estoc', 'taille', 'parade'], ['thrust', 'slash', 'parry'], ['طعنة', 'ضربة', 'صدّ']],
  'duel.vs': ['toi : {a}  ·  chevalier : {b}', 'you: {a}  ·  knight: {b}', 'أنت: {a}  ·  الفارس: {b}'],
  'duel.hit': ['touché ! point pour toi.', 'hit! a point for you.', 'إصابة! نقطة لك.'],
  'duel.hurt': ['le chevalier te touche.', 'the knight hits you.', 'الفارس يصيبك.'],
  'duel.tie': ['les lames se croisent : égalité.', 'blades cross: a tie.', 'تتقاطع النصال: تعادل.'],
  'duel.score': ['score {a} – {b}', 'score {a} – {b}', 'النتيجة {a} – {b}'],
  'duel.win': ['victoire ! le chevalier pose un genou à terre.', 'victory! the knight takes a knee.', 'نصر! الفارس يجثو على ركبته.'],
  'duel.lose': ['défaite… le chevalier rengaine. revanche : duel', 'defeat… the knight sheathes his blade. rematch: duel', 'هزيمة… الفارس يُغمد سيفه. للثأر: duel'],
  'duel.pick': ['1, 2 ou 3 (ou « fuir »)', '1, 2 or 3 (or “flee”)', '1 أو 2 أو 3 (أو «اهرب»)'],
  'duel.flee': ['tu rengaines. le chevalier hoche la tête.', 'you sheathe your blade. the knight nods.', 'تُغمد سيفك. الفارس يومئ برأسه.'],
  // langues
  'lang.switch': ['Changer de langue', 'Change language', 'تغيير اللغة'],
  // unités de temps (études de cas)
  'u.heures': [['heure', 'heures'], ['hour', 'hours'], ['ساعة', 'ساعتان', 'ساعات', 'ساعة']],
  'u.jours': [['jour', 'jours'], ['day', 'days'], ['يوم', 'يومان', 'أيام', 'يومًا']],
  'u.semaines': [['semaine', 'semaines'], ['week', 'weeks'], ['أسبوع', 'أسبوعان', 'أسابيع', 'أسبوعًا']],
  'u.mois': [['mois', 'mois'], ['month', 'months'], ['شهر', 'شهران', 'أشهر', 'شهرًا']],
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
// « 6 semaines », « 6 weeks », « 6 أسابيع »
function unit(n, u) {
  const f = t('u.' + u);
  if (!Array.isArray(f)) return `${n} ${u}`;
  if (LANG === 'ar') {
    const w = n === 1 ? f[0] : n === 2 ? f[1] : (n >= 3 && n <= 10) ? f[2] : f[3];
    return n <= 2 ? w : `${n} ${w}`;
  }
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
  ar: {
    role: 'مطوّر · مواقع، تطبيقات، واجهات برمجية وذكاء اصطناعي',
    location: 'عن بُعد — حيثما تناديني المهمّة',
    motto: 'صُنع مع Claude، وسُقي باليد',
    home: {
      footer: ['مطوّر × Claude', 'كل المهام · بكل الأحجام'],
      loreLeft: '$ whoami — مطوّر يصنع مع Claude، الذكاء الاصطناعي من Anthropic. مواقع، تطبيقات، واجهات برمجية، منصّات SaaS، وكلاء ذكاء اصطناعي، أتمتة، أدوات داخلية: مهما كان المشروع، أقوده من الفكرة إلى الإطلاق.',
      loreRight: '…في كيري، يضرب Claude بسرعة وأنا أمسك النصل: الهندسة، والاختيارات، والمراجعة، واللمسات الأخيرة. سرعة قافلة كاملة، ودقّة حِرفيّ واحد. لا مهمّة أصغر من أن تُنجز، ولا أثقل من أن تُحمل.',
    },
    workLabel: '\u200E$ ls ./armoury — 2023 — 2026',
    about: {
      // l'arche est composée en chasse fixe : on garde l'anglais pour qu'elle reste nette
      ring: 'Sofiene Lamsouni forges with Claude / websites, apps, APIs, SaaS, AI agents, automations / any project, from idea to launch / the speed of AI, the standards of a craftsman / every blade tempered, every line reviewed / no niche, no limit, only what holds / ',
      door: 'مطوّر يعزّز عمله بـ Claude. أصنع مواقع وتطبيقات وواجهات برمجية وأدوات ووكلاء ذكاء اصطناعي، مهما كان حجم المهمّة، بصبر الحِرفيّ وصرامة الفارس.',
      intro: 'لا أنتمي إلى خانة واحدة. موقع لحِرفيّ، أو واجهة برمجية للدفع، أو تطبيق جوّال، أو منصّة SaaS، أو وكيل ذكاء اصطناعي، أو سكربت يعيد لفريق ثلاث ساعات كل يوم: إن كان يُبرمَج، فأنا أصنعه. Claude سيفي الثاني: هو يُسرّع، وأنا أقرّر وأراجع وأسلّم.',
      portraitTitle: 'القَسَم',
      portraitLines: ['مطوّر × Claude', 'موقع · تطبيق · API · ذكاء اصطناعي · أداة'],
      skills: ['مواقع تعريفية', 'التجارة الإلكترونية', 'تطبيقات الويب', 'تطبيقات الجوّال', 'واجهات برمجية وخوادم', 'منصّات SaaS', 'وكلاء الذكاء الاصطناعي', 'الأتمتة', 'أدوات داخلية', 'التكامل بين الأنظمة', 'WebGL وثلاثي الأبعاد', 'DevOps والنشر'],
      copy: 'أعمل مع Claude كما يعمل الحدّاد مع منفاخه: هو يؤجّج النار، وأنا أوجّه كل ضربة. والنتيجة: مشاريع تُسلَّم أسرع، دون أي تنازل عن الهندسة أو الأمن أو الإتقان. روّاد أعمال، حِرفيون، استوديوهات، شركات صغيرة ومتوسطة، فرق منتجات: أحضِروا المهمّة، وأنا أصنع السلاح. عن بُعد، من أي مكان.',
      experience: [['2024 — اليوم', 'كير مستقلّ · مطوّر × Claude'], ['2022 — 2024', 'مطوّر رئيسي · Atelier Médina'], ['2020 — 2022', 'مطوّر متكامل · Agence Caravane'], ['2019 — 2020', 'مطوّر · Startup Oasis']],
    },
    contact: {
      copy: 'في بالك مهمّة؟ موقع، تطبيق، واجهة برمجية، منصّة SaaS، وكيل ذكاء اصطناعي، أتمتة، إعادة تصميم، أو مجرّد فكرة مكتوبة على طرف ورقة: صِفها في بضعة أسطر، أو افتح تذكرة في الطرفية. الردّ خلال 48 ساعة، مع خطة معركة.',
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
  veil.innerHTML = `<span lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">${LANG_NAMES[l]}</span>`;
  document.body.appendChild(veil);
  const reload = () => location.replace(u.toString());
  if (typeof gsap !== 'undefined' && !REDUCED) gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => setTimeout(reload, 60) });
  else reload();
  return true;
}
