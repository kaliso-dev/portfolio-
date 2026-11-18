<!-- Fiche projet KALISO — NOUR.ai — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "nour",
  "name": "NOUR",
  "ext": ".ai",
  "year": 2026,
  "order": 6,
  "hue": 48,
  "emblem": "chalice",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "Python",
    "FastAPI",
    "pgvector",
    "API Claude"
  ],
  "fr": {
    "type": "Agent IA",
    "services": [
      "IA appliquée",
      "Agents",
      "Back-end"
    ],
    "description": [
      "Nour, la lumière : un agent de recherche pour des cabinets ensevelis sous les archives. Il retrouve la bonne page, cite sa source et admet quand il ne sait pas.",
      "Recherche hybride, citations vérifiables, propulsé par l'API Claude, avec une interface pensée pour la confiance plutôt que pour l'effet magique."
    ],
    "notes": [
      "Chaque réponse est liée à un passage exact. Sans source, pas de réponse.",
      "Le jeu d'évaluation a été écrit avec les utilisateurs finaux avant la première ligne de code."
    ],
    "stats": [
      [
        "94%",
        "Réponses sourcées"
      ],
      [
        "1.2M",
        "Pages indexées"
      ],
      [
        "2.1s",
        "Réponse médiane"
      ],
      [
        "0",
        "Source inventée"
      ]
    ]
  },
  "en": {
    "type": "AI agent",
    "services": [
      "Applied AI",
      "Agents",
      "Back-end"
    ],
    "description": [
      "Nour, the light: a research agent for firms buried under their archives. It finds the right page, cites its source and admits when it doesn't know.",
      "Hybrid search, verifiable citations, powered by the Claude API, with an interface designed for trust rather than for magic tricks."
    ],
    "notes": [
      "Every answer is tied to an exact passage. No source, no answer.",
      "The evaluation set was written with the end users before the first line of code."
    ],
    "stats": [
      [
        "94%",
        "Sourced answers"
      ],
      [
        "1.2M",
        "Indexed pages"
      ],
      [
        "2.1s",
        "Median answer"
      ],
      [
        "0",
        "Invented sources"
      ]
    ]
  }
}
```

# code

```python
@app.post("/demander")
async def demander(q: Question, db: Session = Depends(get_db)) -> Reponse:
    passages = await recherche_hybride(db, q.texte, k=8)
    if not passages:
        return Reponse.inconnue(q.texte)

    brouillon = await claude.repondre(q.texte, contexte=passages)
    cite = verifier_citations(brouillon, passages)
    return Reponse(texte=cite.texte, sources=cite.sources)
```
