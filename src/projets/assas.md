<!-- Fiche projet KALISO — ASSAS.bot — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "assas",
  "name": "ASSAS",
  "ext": ".bot",
  "year": 2025,
  "order": 7,
  "hue": 355,
  "emblem": "helm",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "Node.js",
    "n8n",
    "API Claude",
    "Webhooks"
  ],
  "fr": {
    "type": "Automatisations & intégrations",
    "services": [
      "Automatisation",
      "Intégrations",
      "Outils internes"
    ],
    "description": [
      "Assas, le veilleur de nuit : des automatisations qui travaillent pendant que l'équipe dort. Factures rapprochées, contacts qualifiés, rapports envoyés à l'aube.",
      "Une trentaine de flux branchés sur les outils déjà en place (CRM, compta, Slack, tableurs), sans changer les habitudes de personne."
    ],
    "notes": [
      "Les tâches répétitives de l'équipe sont passées de onze heures à quarante minutes par semaine.",
      "Chaque flux a un journal lisible et un bouton « rejouer » : quand ça casse, on voit où, on corrige, on relance."
    ],
    "stats": [
      [
        "−94%",
        "Tâches manuelles"
      ],
      [
        "31",
        "Flux actifs"
      ],
      [
        "6",
        "Outils connectés"
      ],
      [
        "24/7",
        "Veille"
      ]
    ]
  },
  "en": {
    "type": "Automations & integrations",
    "services": [
      "Automation",
      "Integrations",
      "Internal tools"
    ],
    "description": [
      "Assas, the night watchman: automations that work while the team sleeps. Invoices reconciled, leads qualified, reports sent at dawn.",
      "Some thirty workflows plugged into the tools already in place (CRM, accounting, Slack, spreadsheets), without changing anyone's habits."
    ],
    "notes": [
      "The team's repetitive tasks went from eleven hours to forty minutes a week.",
      "Every workflow has a readable log and a “replay” button: when something breaks, you see where, fix it and run it again."
    ],
    "stats": [
      [
        "−94%",
        "Manual tasks"
      ],
      [
        "31",
        "Active workflows"
      ],
      [
        "6",
        "Connected tools"
      ],
      [
        "24/7",
        "On watch"
      ]
    ]
  },
  "ar": {
    "type": "أتمتة وتكامل",
    "services": [
      "الأتمتة",
      "التكامل",
      "أدوات داخلية"
    ],
    "description": [
      "عسّاس، حارس الليل: عمليات مؤتمتة تعمل بينما ينام الفريق. فواتير مُطابَقة، وعملاء محتملون مؤهَّلون، وتقارير تُرسَل عند الفجر.",
      "نحو ثلاثين مسارًا موصولًا بالأدوات الموجودة أصلًا (إدارة العملاء، المحاسبة، Slack، الجداول) دون تغيير عادات أحد."
    ],
    "notes": [
      "انخفضت المهام المتكررة للفريق من إحدى عشرة ساعة إلى أربعين دقيقة في الأسبوع.",
      "لكل مسار سجلّ مقروء وزرّ «إعادة التشغيل»: حين يتعطّل شيء، ترى أين، فتصلحه وتعيد تشغيله."
    ],
    "stats": [
      [
        "−94%",
        "مهام يدوية"
      ],
      [
        "31",
        "مسارًا نشطًا"
      ],
      [
        "6",
        "أدوات موصولة"
      ],
      [
        "24/7",
        "حراسة"
      ]
    ]
  }
}
```

# code

```js
// chaque nuit, le veilleur fait sa ronde
export default ronde("0 5 * * *", async () => {
  const factures = await compta.nonRapprochees();
  for (const f of factures) {
    const paiement = await banque.chercher(f.montant, f.reference);
    if (paiement) await compta.rapprocher(f.id, paiement.id);
  }
  const resume = await claude.resumer(factures, { ton: "bref" });
  await slack.poster("#finances", `☾ Ronde terminée — ${resume}`);
});
```
