# L'Apprenti Concepteur

Jeu web pour découvrir le métier de concepteur paysagiste.
Un chantier de parking paysager, un catalogue de végétaux,
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

Les réglages du chantier sont dans `missionParking`, en haut de `script.js`.
Le chantier Parking contient trois vues réelles : vue aérienne, vue piétonne depuis l’accès et vue piétonne depuis le terrain.
Les anciens modes Photo / Mixte / Plan ont été supprimés.


## Espace administrateur — version 1

- Bouton **Admin** en haut à droite de la page d'accueil.
- Code : `etudessuperieures`
- La page `admin.html` est protégée contre les accès accidentels par `sessionStorage`.
- L'administrateur peut déjà supprimer un score précis ou effacer tout le classement.
- L’onglet Analyse permet de modifier les points d’analyse du chantier.
- Le bilan final contient maintenant un bouton **Retour à l'accueil** en plus de **Rejouer** et **Revoir le détail du chantier**.

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


## Administration — version complète

L'accès se fait depuis le bouton **Admin** de la page d'accueil.

Code :
`etudessuperieures`

L'interface permet maintenant :
- de modifier le nom et les textes du chantier Parking ;
- de modifier les textes de la phase Analyse et Aménagement du parking ;
- de changer les chemins des images ;
- d'ajouter ou supprimer des vues ;
- de placer les points d'analyse directement en cliquant sur l'image ;
- de déplacer, modifier ou supprimer chaque point ;
- de supprimer des personnes du classement ou de vider le classement ;
- d'exporter et d'importer la configuration au format JSON ;
- de remettre les réglages d'origine.

Les réglages sont enregistrés dans `localStorage`.
Ils restent donc liés au navigateur et à l'appareil utilisés.


## Prototype QGIS intégré

Une nouvelle démonstration est disponible dans :

- `demo-qgis.html` : aperçu direct du principe sans lancer toute la partie.
- `qgis/parking-qgis.js` : couches vectorielles affichées dans le jeu.
- `qgis/fond_vue_aerienne_calage_local.tif` : vue aérienne calibrée en mètres.
- `qgis/parking_projet.gpkg` : couches vectorielles pour QGIS.
- `qgis/README_QGIS.md` : notice technique.

Dans le chantier Parking, après la phase Analyse, trois modes sont proposés :

1. **Vue actuelle** : photo aérienne d'origine, sans modification.
2. **Projet QGIS** : la même photo + le plan vectoriel.
3. **Plan seul** : uniquement le dessin du projet.

Le prototype utilise des places de 2,50 × 5,00 m, des places PMR de
3,30 × 5,00 m et des voies de circulation de 6,00 m.

### Limite du prototype

La capture est calibrée grâce à la barre d'échelle visible de 20 m.
Le dessin est donc cohérent en dimensions relatives mais n'est pas encore
géoréférencé aux vraies coordonnées IGN. Pour le rendu définitif, il faudra
ouvrir une vraie orthophoto géoréférencée dans QGIS et y replacer les couches.


## Mise à jour QGIS v2

Le plan parking a été agrandi pour utiliser presque toute l'emprise disponible.

Capacité du prototype actuel :
- 0 places standard ;
- 0 places PMR ;
- 0 places au total.

Le fond satellite reste inchangé. Le projet est dessiné par-dessus en couches vectorielles.

## Rendu du parking (vue aérienne et vue piétonne)

Depuis le plan QGIS, cliquez sur **Voir le rendu réaliste**. Utilisez les menus déroulants pour choisir les revêtements, les arbres et les vivaces. Les repères A désignent les arbres et les repères V les secteurs de vivaces. Le résultat apparaît sur de vraies images du site :

- `rendu-parking.js` : le **plan** (`PLAN_PARKING`, en mètres), le catalogue des revêtements, les essences, la vue aérienne ;
- `rendu-pieton.js` : la caméra calée sur la photo depuis l'accès (`CAMERA_PIETON`) et la vue piétonne ;
- `parking-amenagement.js` : les choix du joueur, la notation et le résultat.

**Pour corriger le plan**, modifiez `PLAN_PARKING` dans `rendu-parking.js` : les deux vues suivent.

Les images de `image/parking/rendu/` sont déjà prêtes. Il ne faut les regénérer que pour changer le cadrage ou les sujets, avec les scripts de `outils/rendu-parking/` (Python, `pip install pillow numpy scipy ultralytics`) :

| Script | Rôle |
|--------|------|
| `base.py` | photo aérienne IGN (BD ORTHO, Licence Ouverte 2.0) |
| `textures.py` | revêtements vue aérienne (textures CC0 ambientCG) |
| `detecter_houppiers.py` | détoure les arbres de l'orthophoto (SAM 2) |
| `exporter_sprites.py` | exporte les arbres retenus dans `selection.json` |
| `voitures.py` | voitures prélevées dans l'orthophoto |
| `pieton.py` | arbres vus de côté et sols de la vue piétonne |

Le catalogue du jeu comporte huit arbres de [Smits](https://smitsbv.nl/producten/) et huit vivaces de [Willemse](https://www.willemsefrance.fr/collections/plantes-vivaces). Les fiches du jeu renvoient à la source de chaque plante. Les catégories d’humidité et d’exposition sont simplifiées pour le score du jeu. Après une modification du CSV, synchronisez sa copie dans `data/plantes-embarquees.js` pour garder le mode hors connexion.
