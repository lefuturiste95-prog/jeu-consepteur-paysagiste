# L'Apprenti Concepteur

Jeu web pour découvrir le métier de concepteur paysagiste.
Cinq chantiers à végétaliser, un catalogue de 140 végétaux,
un score et un tableau des scores.

## Lancer le jeu

**Sur l'ordinateur** — double-cliquez sur `index.html`.
Le catalogue est embarqué dans `data/plantes-embarquees.js`,
le jeu fonctionne donc même sans serveur.

**Sur la tablette** — double-cliquez sur `Ouvrir sur ma tablette.command`.
Une fenêtre de terminal s'ouvre et affiche une adresse du type
`http://192.168.1.42:8000`. Tapez-la dans Safari ou Chrome sur la
tablette (connectée au même Wi-Fi que le Mac).

Pour un vrai confort : sur la tablette, menu **Partage →
« Sur l'écran d'accueil »**. Le jeu s'installe comme une application,
en plein écran, sans barre de navigateur.

Gardez la fenêtre du terminal ouverte pendant la partie.

## Règles et notation

Chaque emplacement de plantation rapporte jusqu'à 100 points :

| Critère                | Points |
|------------------------|--------|
| Exposition compatible  | 40     |
| Humidité du sol adaptée| 40     |
| Bon type de végétal    | 20     |

S'y ajoute un bonus de floraison : 10 points par mois de floraison
couvert par la composition, dans la limite de 6 mois (60 points).

Le rang final va de « Première saison » à « Paysagiste d'exception ».
Les scores sont enregistrés dans le navigateur de l'appareil
(`localStorage`), sans aucun envoi sur Internet.

## Organisation des fichiers

```
index.html                     structure des 3 écrans
style.css                      thème nature, responsive
script.js                      données, chantiers, notation, scoreboard
manifest.json                  installation sur l'écran d'accueil
data/API_plantes.csv           catalogue source (séparateur « ; »)
data/plantes-embarquees.js     copie du CSV pour l'ouverture hors serveur
image/jardintest.jpg           photo de l'écran d'accueil
image/icone.png                icône de l'application
Ouvrir sur ma tablette.command lance le serveur local
```

## Modifier le catalogue

Éditez `data/API_plantes.csv` (les deux premières lignes sont un titre
et les en-têtes), puis regénérez la copie embarquée :

```bash
python3 - <<'PY'
import json
csv = open('data/API_plantes.csv', encoding='utf-8-sig').read()
open('data/plantes-embarquees.js', 'w', encoding='utf-8').write(
    "window.CSV_PLANTES = " + json.dumps(csv, ensure_ascii=False) + ";\n")
PY
```

## Modifier les chantiers

Tout est dans la constante `MISSIONS` en haut de `script.js` :
titre, texte du brief, conditions du site (`expositions`, `humidites`),
décor dessiné en SVG et liste des emplacements de plantation
(position en % et type de végétal attendu).
