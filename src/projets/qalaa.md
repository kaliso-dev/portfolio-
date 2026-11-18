<!-- Fiche projet KALISO — QALAA.api — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "qalaa",
  "name": "QALAA",
  "ext": ".api",
  "year": 2025,
  "order": 2,
  "hue": 205,
  "emblem": "tower",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "Go",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Terraform"
  ],
  "fr": {
    "type": "API de paiement & infrastructure",
    "services": [
      "Back-end",
      "Infrastructure",
      "Sécurité"
    ],
    "description": [
      "Une API de paiement bâtie comme une qal'a, une citadelle : chaque requête franchit trois remparts avant de toucher la base.",
      "Limitation de débit adaptative, idempotence native, journaux signés. Toute l'infrastructure se rebâtit depuis le sable en onze minutes."
    ],
    "notes": [
      "Les tests de charge tournent chaque nuit contre une copie de la production : une régression de latence bloque le déploiement du lendemain.",
      "Aucun secret ne dort dans le code. Tout passe par un coffre, avec rotation automatique toutes les vingt-quatre heures."
    ],
    "stats": [
      [
        "99.98%",
        "Disponibilité"
      ],
      [
        "38ms",
        "Latence p95"
      ],
      [
        "2.4M",
        "Requêtes / jour"
      ],
      [
        "11min",
        "Reconstruction totale"
      ]
    ]
  },
  "en": {
    "type": "Payment API & infrastructure",
    "services": [
      "Back-end",
      "Infrastructure",
      "Security"
    ],
    "description": [
      "A payment API built like a qal'a, a citadel: every request crosses three ramparts before it touches the database.",
      "Adaptive rate limiting, native idempotency, signed logs. The whole infrastructure rebuilds from the sand in eleven minutes."
    ],
    "notes": [
      "Load tests run every night against a copy of production: a latency regression blocks the next day's deploy.",
      "No secret sleeps in the code. Everything goes through a vault, with automatic rotation every twenty-four hours."
    ],
    "stats": [
      [
        "99.98%",
        "Availability"
      ],
      [
        "38ms",
        "p95 latency"
      ],
      [
        "2.4M",
        "Requests / day"
      ],
      [
        "11min",
        "Full rebuild"
      ]
    ]
  }
}
```

# code

```go
package qalaa

func (g *Gate) Handle(w http.ResponseWriter, r *http.Request) {
    // trois remparts avant la base
    if !g.limiter.Allow(r.RemoteAddr) {
        http.Error(w, "trop de requêtes", 429)
        return
    }
    key := r.Header.Get("Idempotency-Key")
    if res, ok := g.cache.Get(key); ok {
        g.replay(w, res)
        return
    }
    g.donjon.Serve(w, r.WithContext(signed(r.Context())))
}
```
