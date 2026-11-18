<!-- Fiche projet KALISO — BARID.app — EXEMPLE FICTIF : remplace-la par un vrai projet (voir docs/gabarit-etude-de-cas.md). -->

```json
{
  "slug": "barid",
  "name": "BARID",
  "ext": ".app",
  "year": 2025,
  "order": 3,
  "hue": 38,
  "emblem": "crown",
  "url": "",
  "repo": "",
  "exemple": true,
  "stack": [
    "React Native",
    "Expo",
    "Supabase",
    "Reanimated"
  ],
  "fr": {
    "type": "Application mobile",
    "services": [
      "Mobile",
      "Design produit",
      "Animation"
    ],
    "description": [
      "Barid, le messager : une app qui annonce les événements d'une communauté locale avant tout le monde. Notifications justes, carte vivante, zéro bruit.",
      "Chaque geste a été pensé au pouce : retours haptiques et transitions à soixante images par seconde, même sur des téléphones d'entrée de gamme."
    ],
    "notes": [
      "Le prototype a été testé dans la rue, pas en salle. Trois écrans ont disparu après la première semaine.",
      "Les animations tournent entièrement sur le fil d'interface : le JavaScript ne bloque jamais un geste."
    ],
    "stats": [
      [
        "4.8",
        "Note App Store"
      ],
      [
        "60fps",
        "Sur entrée de gamme"
      ],
      [
        "31k",
        "Utilisateurs actifs"
      ],
      [
        "3",
        "Écrans supprimés"
      ]
    ]
  },
  "en": {
    "type": "Mobile app",
    "services": [
      "Mobile",
      "Product design",
      "Animation"
    ],
    "description": [
      "Barid, the messenger: an app that announces a local community's events before anyone else. Accurate notifications, a living map, zero noise.",
      "Every gesture was designed for the thumb: haptic feedback and sixty-frames-per-second transitions, even on entry-level phones."
    ],
    "notes": [
      "The prototype was tested in the street, not in a meeting room. Three screens disappeared after the first week.",
      "Animations run entirely on the UI thread: JavaScript never blocks a gesture."
    ],
    "stats": [
      [
        "4.8",
        "App Store rating"
      ],
      [
        "60fps",
        "On entry-level phones"
      ],
      [
        "31k",
        "Active users"
      ],
      [
        "3",
        "Screens removed"
      ]
    ]
  }
}
```

# code

```tsx
export function MessageDuBarid({ evenement }: Props) {
  const presse = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - presse.value * 0.04 }],
  }));

  return (
    <GestureDetector gesture={toucher(presse)}>
      <Animated.View style={[styles.carte, style]}>
        <Sceau type={evenement.type} />
        <Text style={styles.titre}>{evenement.titre}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```
