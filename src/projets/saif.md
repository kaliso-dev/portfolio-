<!-- Fiche projet KALISO — SAIF.cli — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "saif",
  "name": "SAIF",
  "ext": ".cli",
  "year": 2026,
  "order": 1,
  "hue": 20,
  "emblem": "sword",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "Rust",
    "Tokio",
    "Clap",
    "GitHub Actions"
  ],
  "fr": {
    "type": "Outil en ligne de commande",
    "services": [
      "Architecture",
      "Expérience développeur",
      "Open source"
    ],
    "description": [
      "Saif, le sabre : un outil en ligne de commande qui monte un environnement de développement complet en une seule frappe. Rapide, précis, sans fioritures.",
      "Binaire unique, zéro dépendance, configuration déclarative. Le genre d'arme qu'on oublie au fourreau parce qu'elle ne casse jamais."
    ],
    "notes": [
      "Chaque commande a été chronométrée : tout ce qui dépassait cent millisecondes a été retrempé ou supprimé.",
      "Claude a rédigé la première documentation à partir des tests ; chaque exemple est compilé avant que la release ne parte."
    ],
    "stats": [
      [
        "12k",
        "Téléchargements"
      ],
      [
        "84ms",
        "Démarrage à froid"
      ],
      [
        "0",
        "Dépendance"
      ],
      [
        "46",
        "Contributeurs"
      ]
    ]
  },
  "en": {
    "type": "Command-line tool",
    "services": [
      "Architecture",
      "Developer experience",
      "Open source"
    ],
    "description": [
      "Saif, the sabre: a command-line tool that sets up a complete development environment in a single strike. Fast, precise, no frills.",
      "One binary, zero dependencies, declarative configuration. The kind of weapon you forget in its sheath because it never breaks."
    ],
    "notes": [
      "Every command was timed: anything over a hundred milliseconds was re-tempered or cut.",
      "Claude drafted the first documentation from the tests; every example is compiled before a release ships."
    ],
    "stats": [
      [
        "12k",
        "Downloads"
      ],
      [
        "84ms",
        "Cold start"
      ],
      [
        "0",
        "Dependencies"
      ],
      [
        "46",
        "Contributors"
      ]
    ]
  }
}
```

# code

```rust
use saif::{Forge, Lame, Fil};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // une seule frappe, un environnement complet
    let forge = Forge::ouvrir("./armurerie")?;
    let lame = forge
        .tremper(Lame::cimeterre())
        .aiguiser(Fil::Rasoir)
        .await?;

    lame.deployer("production").await?;
    println!("⚔  prête en {}ms", lame.duree());
    Ok(())
}
```
