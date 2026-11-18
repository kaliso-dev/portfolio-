<!-- Fiche projet KALISO — SOUK.shop — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

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
  "exemple": true,
  "stack": [
    "Next.js",
    "Shopify",
    "Stripe",
    "Sanity"
  ],
  "temps": {
    "estime": 8,
    "reel": 6,
    "unite": "semaines"
  },
  "fr": {
    "type": "Site e-commerce",
    "services": [
      "E-commerce",
      "Site vitrine",
      "Paiement en ligne"
    ],
    "description": [
      "La boutique en ligne d'un atelier de zellige de Fès : chaque carreau photographié, un configurateur de motifs, la livraison partout dans le monde.",
      "Des pages qui s'affichent avant qu'on ait fini de cligner des yeux, un tunnel d'achat en trois étapes et un back-office pensé pour des artisans, pas pour des développeurs."
    ],
    "notes": [
      "Le configurateur compose le motif en direct, carreau par carreau, comme le maâlem à l'atelier.",
      "Claude a préparé les fiches produits en trois langues ; chaque traduction a été relue par l'atelier avant publication."
    ],
    "stats": [
      [
        "0.8s",
        "Chargement mobile"
      ],
      [
        "+212%",
        "Ventes en ligne"
      ],
      [
        "3",
        "Langues"
      ],
      [
        "1 400",
        "Carreaux au catalogue"
      ]
    ]
  },
  "en": {
    "type": "E-commerce website",
    "services": [
      "E-commerce",
      "Showcase website",
      "Online payment"
    ],
    "description": [
      "The online shop of a zellige workshop in Fez: every tile photographed, a pattern configurator, worldwide shipping.",
      "Pages that load before you finish blinking, a three-step checkout and a back office designed for craftsmen, not developers."
    ],
    "notes": [
      "The configurator composes the pattern live, tile by tile, like the maâlem at the workshop.",
      "Claude prepared the product sheets in three languages; every translation was proofread by the workshop before publishing."
    ],
    "stats": [
      [
        "0.8s",
        "Mobile load time"
      ],
      [
        "+212%",
        "Online sales"
      ],
      [
        "3",
        "Languages"
      ],
      [
        "1,400",
        "Tiles in the catalogue"
      ]
    ]
  }
}
```

# fr

## quete

L'atelier vendait surtout sur place, aux visiteurs de la médina. Les commandes à distance passaient par WhatsApp : photos floues, devis à la main, paiements par virement. Il fallait une boutique qui montre la finesse du zellige et qui encaisse sans friction, partout dans le monde.

## claude

- Les premières versions du configurateur de motifs : la grille, les rotations, l'export en image.
- Les fiches produits en français, anglais et arabe, à partir des notes de l'atelier.
- Les tests de bout en bout du tunnel d'achat, écrits en une après-midi.

## decisions

Shopify plutôt qu'une boutique sur mesure : l'atelier devait pouvoir tout gérer seul. Le rendu des motifs côté serveur, pour que chaque carreau s'affiche net même en 3G. Et une règle : **aucune traduction publiée sans relecture humaine**.

## resultats

Des pages chargées en moins d'une seconde sur mobile, des ventes en ligne multipliées par trois en six mois, et des commandes qui arrivent désormais de onze pays.

# en

## quete

The workshop sold mostly on site, to visitors of the medina. Remote orders went through WhatsApp: blurry photos, hand-written quotes, bank transfers. It needed a shop that shows the finesse of zellige and takes payments without friction, anywhere in the world.

## claude

- The first versions of the pattern configurator: the grid, the rotations, the image export.
- Product sheets in French, English and Arabic, drafted from the workshop's notes.
- End-to-end tests of the checkout, written in one afternoon.

## decisions

Shopify rather than a custom shop: the workshop had to be able to run everything on its own. Server-side pattern rendering, so every tile looks sharp even on 3G. And one rule: **no translation published without a human proofread**.

## resultats

Pages that load in under a second on mobile, online sales multiplied by three in six months, and orders now coming in from eleven countries.


# code

```tsx
export default async function Carreau({ params }: { params: { slug: string } }) {
  const carreau = await souk.produit(params.slug);
  if (!carreau) notFound();

  return (
    <Atelier>
      <Motif trame={carreau.motif} couleurs={carreau.couleurs} />
      <Prix montant={carreau.prix} devise="MAD" />
      <AjouterAuPanier id={carreau.id} />
    </Atelier>
  );
}
```
