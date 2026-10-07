# L'Apprenti Concepteur

Jeu web pour découvrir le métier de concepteur paysagiste.
Deux chantiers, un catalogue de 140 végétaux,
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

Tout est dans la constante `MISSIONS` en haut de `script.js`.
Le chantier Parking contient trois vues réelles : vue aérienne, vue piétonne depuis l’accès et vue piétonne depuis le terrain.
Le chantier Zone 6 conserve pour l’instant l’ancien contenu du chantier 2.
Les anciens modes Photo / Mixte / Plan ont été supprimés.


## Espace administrateur — version 1

- Bouton **Admin** en haut à droite de la page d'accueil.
- Code : `etudessuperieures`
- La page `admin.html` est protégée contre les accès accidentels par `sessionStorage`.
- L'administrateur peut déjà supprimer un score précis ou effacer tout le classement.
- Les outils visuels pour modifier les 3 chantiers, placer les points « ? » et les emplacements seront ajoutés dans la prochaine étape.
- Le bilan final contient maintenant un bouton **Retour à l'accueil** en plus de **Rejouer** et **Revoir le détail des chantiers**.

> Important : le code administrateur est côté navigateur. Il convient pour un forum et pour éviter les accès accidentels, mais ce n'est pas une sécurité serveur.


## Version Parking — Analyse / Aménagement

Le chantier 1 est maintenant séparé en deux phases :

1. **Analyse** : vue aérienne + deux vues piétonnes avec 5 points « œil » à découvrir.
2. **Aménagement** : affichage provisoire de la dernière vue générée du parking.

Les images utilisées sont dans `image/parking/` :

- `vue-aerienne.png`
- `vue-pieton-acces.jpeg`
- `vue-pieton-terrain.jpeg`
- `vue-amenagement-provisoire.png`

Les positions et textes des points d’analyse sont modifiables directement dans la première mission de `script.js`.
