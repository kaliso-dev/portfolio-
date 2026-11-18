<!-- Fiche projet KALISO — MEDINA.saas — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "medina",
  "name": "MEDINA",
  "ext": ".saas",
  "year": 2024,
  "order": 5,
  "hue": 268,
  "emblem": "shield",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "Next.js",
    "tRPC",
    "Prisma",
    "ClickHouse"
  ],
  "fr": {
    "type": "Application web SaaS",
    "services": [
      "Full-stack",
      "Visualisation de données",
      "Produit"
    ],
    "description": [
      "Un SaaS logistique où des millions d'événements se croisent comme les ruelles d'une médina, et une seule vue qui dit quoi faire maintenant.",
      "Requêtes agrégées côté serveur, graphiques en flux continu, filtres qui répondent avant que le doigt quitte la touche."
    ],
    "notes": [
      "La première version affichait trente graphiques ; les équipes en regardaient quatre. La deuxième en affiche quatre.",
      "Les requêtes les plus lourdes sont précalculées chaque minute : l'interface n'attend jamais la base."
    ],
    "stats": [
      [
        "120ms",
        "Temps de requête"
      ],
      [
        "8M",
        "Événements / jour"
      ],
      [
        "30 → 4",
        "Graphiques"
      ],
      [
        "−62%",
        "Temps de décision"
      ]
    ]
  },
  "en": {
    "type": "SaaS web application",
    "services": [
      "Full-stack",
      "Data visualisation",
      "Product"
    ],
    "description": [
      "A logistics SaaS where millions of events cross like the alleys of a medina, and one single view that says what to do now.",
      "Server-side aggregated queries, streaming charts, filters that answer before your finger leaves the key."
    ],
    "notes": [
      "The first version showed thirty charts; the teams looked at four. The second version shows four.",
      "The heaviest queries are precomputed every minute: the interface never waits for the database."
    ],
    "stats": [
      [
        "120ms",
        "Query time"
      ],
      [
        "8M",
        "Events / day"
      ],
      [
        "30 → 4",
        "Charts"
      ],
      [
        "−62%",
        "Decision time"
      ]
    ]
  }
}
```

# code

```ts
export const medina = router({
  ruelles: protectedProcedure
    .input(z.object({ periode: periodeSchema, entrepot: z.string() }))
    .query(async ({ ctx, input }) => {
      const lignes = await ctx.ch.query({
        query: VUE_GENERALE_SQL,
        query_params: { ...input.periode, entrepot: input.entrepot },
      });
      return enSeries(await lignes.json());
    }),
});
```
