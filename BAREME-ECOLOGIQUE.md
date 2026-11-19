# Notation et catalogue du parking

La note reste sur 5 000, dont 4 000 pour les végétaux et 1 000 pour les revêtements. Les voies et les places ont chacune leur note sur 500. Les résultats sont calculés à partir des données brutes et arrondis vers le bas à la fin de chaque critère.

| Critère | Maximum |
|---|---:|
| Exposition des végétaux | 600 |
| Sol et variations d’humidité | 1 400 |
| Diversité des espèces | 1 000 |
| Floraisons utiles étalées | 500 |
| Ressources pour les pollinisateurs | 500 |
| Revêtement des voies | 500 |
| Revêtement des places | 500 |

Le parcours raccourci comporte 5 arbres (3 au centre et 2 dans la noue) et 4 secteurs de vivaces (2 en bordure et 2 dans la noue). Deux anciennes zones du haut sont regroupées ; les 262 m² de surfaces plantées sont conservés.

## Végétaux et précision

Les arbres comptent pour 70 % de l’exposition, de l’adaptation au sol et de la diversité. Les vivaces comptent pour 30 %. Les moyennes sont calculées à l’intérieur de chaque groupe avant d’appliquer ces poids. Une erreur de même nature pèse ainsi davantage sur un arbre. Par exemple, tolérer un seul des deux états du sol au lieu des deux retire 98 points de sol pour un arbre, contre 53 pour une zone de vivaces, avant les effets sur les bonus écologiques.

Le sol du modèle alterne entre frais et sec au centre et en bordure, entre humide et très humide dans la noue. Les conditions sont indiquées au joueur. Une plante tolérant un état sur deux reçoit un crédit partiel pour le sol. Le mauvais groupe de végétal vaut zéro en exposition et en sol. Le bon type ne donne pas de points gratuits.

L’exposition doit être compatible avec au moins une des expositions annoncées. Soleil et plein soleil sont acceptés dans les zones au soleil, sans pénalité artificielle liée au vocabulaire des sources.

Les bonus de diversité, de floraison et de ressources pour les pollinisateurs exigent le bon groupe, une exposition compatible et la tolérance aux deux états du sol. Une information manquante n’est pas remplacée par une capacité supposée. Le résultat reflète le catalogue et les hypothèses du jeu, pas une mesure écologique de terrain.

La diversité de chaque groupe est `(n² − somme(effectifEspèce²)) / (N × (N − 1))`, avec N le nombre d’emplacements et n le nombre de plantes entièrement adaptées. La note vaut `plancher(1 000 × (0,7 × indiceArbres + 0,3 × indiceVivaces))`. Une seule répétition entre deux arbres adaptés retire 70 points. Les cultivars d’une même espèce restent une espèce. Un secteur de vivaces compte comme une unité, indépendamment de sa surface.

Les floraisons utiles sont évaluées sur les 7 mois de mars à septembre. Les ressources pour les pollinisateurs ont un objectif de 5 plantations entièrement adaptées avec un intérêt documenté. Chaque critère vaut au maximum 500 points. Un intérêt non documenté ne signifie pas absence d’intérêt.

Le maximum de diversité impose ici une espèce différente par emplacement pour l’exercice, sans constituer une prescription paysagère. Les volumes racinaires et les distances de visibilité ne sont pas mesurés automatiquement. Les fiches servent aussi à discuter ces limites.

## Revêtements

Le barème des revêtements v6 combine cinq indices favorables sur 100 : infiltration (25 %), adaptation à l’usage (25 %), économie à la pose (20 %), entretien et réparabilité (20 %), durée de vie (10 %). Les indices et les coefficients sont des hypothèses pédagogiques pour un parking de véhicules légers. Ils ne sont ni des prix, ni des durées garanties, ni une étude hydraulique.

La somme pondérée brute est ensuite rapportée au meilleur compromis du catalogue pour le même usage : note = plancher(500 × brut / meilleurBrut). Cette normalisation rend 500 atteignable pour chaque zone. Elle signifie que les poids expriment l’importance relative des critères, et non des sous-notes sur 125 ou 100 points. Ajouter ou modifier un revêtement peut changer la référence : il faut alors revérifier le barème.

| Revêtement | Voies / 500 | Places / 500 |
|---|---:|---:|
| Enrobé | 350 | 338 |
| Béton drainant | 422 | 408 |
| Pavés béton à joints perméables | 485 | 476 |
| Stabilisé sans liant | 500 | 482 |
| Gravier en dalles alvéolées | 390 | 447 |
| Dalles béton-gazon | 389 | 500 |
| Pavés à joints enherbés | 405 | 476 |

Le stabilisé est valorisé pour son coût et sa reprise locale, tout en conservant une moindre note de durée de vie. Le béton drainant conserve une bonne infiltration mais perd sur les coûts de pose et de réparation. Le gravier alvéolé est moins adapté aux passages répétés. Les dalles béton-gazon sont valorisées sur les places pour leurs qualités paysagères et infiltrantes ; elles demandent un entretien et ne conviennent pas aux mêmes usages que les voies. L’esthétique est expliquée qualitativement, sans bonus chiffré supplémentaire caché.

Les coefficients d’infiltration restent distincts du classement économique : le stabilisé n’est pas supposé toujours plus infiltrant que le béton drainant. Le fonctionnement dépend des fines, du compactage, du sol, de la fondation et de l’entretien. Sources : [ADOPTA](https://www.adopta.fr/revetements-de-sol-permeables/), [DRIEAT](https://www.drieat.ile-de-france.developpement-durable.gouv.fr/qu-est-ce-qu-un-revetement-permeable-pour-un-a3642.html).

Le bilan affiche les avantages et les limites des deux matériaux retenus. Le détail du chantier indique les cinq indices et leurs poids. Le maximum total reste 5 000, avec 4 000 pour les végétaux, 500 pour les voies et 500 pour les places.

### Aides au choix des plantes

Les termes techniques sont conservés. Une aide explique leur sens et l’alternance saisonnière. La distance est calculée entre les coordonnées des troncs : 15 m pour les arbres centraux et 16 m pour les deux arbres de la noue. La fiche distingue cette distance du diamètre adulte du houppier. Ces informations sont des aides de lecture ; aucune nouvelle pénalité d’encombrement ou de tassement n’est déduite d’un texte libre non structuré.

Le catalogue reste alphabétique, avec au plus 12 noms courants par page et une recherche sur les noms courants et scientifiques. Le nom scientifique reste dans la fiche complète. Les listes ne montrent ni note individuelle ni validation d’adaptation.

## Début de partie et bilan

L’accueil présente un seul bouton de lancement, Commencer une partie. Il conduit à l’écran Comment jouer. Le bouton J’ai compris, commencer l’analyse ouvre ensuite le chantier. Le même parcours s’applique à Rejouer. Une analyse mise en pause se reprend directement, avec ses indices conservés.

Les notes individuelles et les validations restent masquées pendant le choix des végétaux. Le bilan affiche les sous-totaux Végétaux sur 4 000 et Revêtements sur 1 000, ainsi que les deux notes de revêtement sur 500. Trois étoiles à partir de 4 900, deux à 4 500, une à 3 750. L’analyse du site n’ajoute pas de points.

Les scores déjà enregistrés restent conservés. Le barème des revêtements a changé le 17 novembre 2026 ; les scores antérieurs ne sont donc pas strictement comparables. Le détail des résultats des nouvelles parties porte la version de barème 6. Revenir aux choix et valider à nouveau ne cumule pas la note du même aménagement.

## Catalogue et sources

Le catalogue source conserve 51 végétaux. La sélection active du jeu est réduite à 26 : 10 arbres et 16 vivaces, soit environ moitié moins de propositions. Le fichier `Catalogue-vegetaux.xlsx` rassemble les six rubriques demandées dans les premières colonnes, les sources, les dimensions et les conseils pour le parking.

Les compléments Floriscope sont présents sur 30 fiches du catalogue, avec une URL par taxon dans l’Excel et dans le jeu. Seuls les champs effectivement disponibles sur la fiche correspondante sont repris. Les données initiales sont conservées lorsqu’une information complémentaire manque. Une sous-catégorie absente reste non renseignée, même si la catégorie Vivaces est disponible. Les propriétés d’un cultivar n’ont pas été attribuées à un autre cultivar.

Les conseils de parking sont rédigés pour l’exercice à partir des besoins et des dimensions. Les informations sur les pollinisateurs ont leurs propres sources, dont Smits, Willemse, Pollinis et la pépinière Lemaire selon les végétaux. Les liens proposés sont en français. Les caractéristiques seules ne donnent pas automatiquement un bonus écologique.

## Actualiser depuis l’Excel

L’Excel enrichi est la source de cette version. Le jeu utilise un export afin de fonctionner en ligne et en ouvrant directement `index.html`. Le navigateur ne relit pas automatiquement le classeur.

Le script `outils/synchroniser-catalogue.ps1` retrouve l’onglet Catalogue parking et lit les colonnes A à T, dans leur ordre fourni. Il accepte les nouvelles lignes ayant le groupe Arbre ou Vivace. Il régénère ensemble `data/API_plantes.csv` et `data/plantes-embarquees.js`.

```powershell
& ./outils/synchroniser-catalogue.ps1
```

Le chemin par défaut vise le classeur livré à la racine du jeu. Le paramètre `-Classeur` permet d’en préciser un autre. Le script accepte aussi le format précédent Sélection parking sur demande explicite, mais réimporter ce format rétablit son ancienne sélection.

La synchronisation a été vérifiée avec PowerShell 7 dans l’environnement de développement. Windows PowerShell bloque actuellement les scripts sur cet ordinateur. Elle peut être refaite dans l’environnement de développement sans changer les règles de sécurité Windows. Il n’est pas nécessaire de la lancer pour jouer à la version fournie.

Après synchronisation, republier les deux exports et les fichiers modifiés dans le dépôt du site pour actualiser le lien partagé.

## Parcours raccourci du 19 novembre 2026

Neuf choix de végétaux remplacent les douze précédents : 5 arbres et 4 secteurs de vivaces. Le maximum reste 5 000. Les moyennes et la diversité utilisent les nouveaux effectifs ; la cible des pollinisateurs devient 5 sur 9. Le résultat est marqué version 7. Les anciennes notes et listes sont conservées ; leur rendu est masqué si le nombre d’emplacements correspond au plan précédent, pour éviter une image trompeuse. Les anciennes tentatives ne sont pas déverrouillées.

## Sélection active du 19 novembre 2026

`data/selection-catalogue.js` définit les 26 noms scientifiques proposés aux joueurs. Le filtre est appliqué après lecture du catalogue, en ligne et hors serveur, sans changer les identifiants d’origine. L’Excel et ses 51 fiches restent conservés, et une resynchronisation de l’Excel ne réactive pas les végétaux exclus.

La sélection privilégie l’adaptation aux deux milieux du modèle, des espèces différentes, des vivaces fleuries et des graminées. Quelques choix demandant une adaptation partielle restent à comparer dans les fiches ; la sélection n’est pas une liste de notes identiques. Les données de floraison et d’intérêt documenté n’ont pas été modifiées pour fabriquer un meilleur score. Deux palettes différentes atteignant 5 000 ont été vérifiées avec le catalogue réduit.

Liste retenue :

- Érable champêtre — Acer campestre
- Savonnier de Chine — Koelreuteria paniculata
- Noisetier de Byzance — Corylus colurna
- Charme commun — Carpinus betulus
- Erable de Montpellier — Acer monspessulanum
- Poirier à fleurs Chanticleer — Pyrus calleryana 'Chanticleer'
- Cerisier à grappes — Prunus padus
- Bouleau noir — Betula nigra
- Aulne glutineux — Alnus glutinosa
- Tupélo noir — Nyssa sylvatica
- Sauge des bois ‘Blauhügel’ — Salvia nemorosa 'Blauhügel'
- Echinacée pourpre — Echinacea purpurea
- Géranium sanguin — Geranium sanguineum
- Oreille de Lapin — Stachys byzantina
- Origan commun — Origanum vulgare
- Véronique en épis Nana Blauteppich — Veronica spicata 'Nana Blauteppich'
- Bergénia à feuilles épaisses — Bergenia crassifolia
- Marguerite commune — Leucanthemum vulgare
- Benoîte des ruisseaux — Geum rivale
- Populage des marais — Caltha palustris
- Laîche élevée Aurea — Carex elata 'Aurea'
- Molinie bleue Banshee — Molinia caerulea 'Banshee'
- Lysimaque nummulaire — Lysimachia nummularia
- Salicaire commune ‘Robert’ — Lythrum salicaria 'Robert'
- Iris versicolore — Iris versicolor
- Canche cespiteuse Tardiflora — Deschampsia cespitosa 'Tardiflora'

## Bilan unique

La validation ouvre directement l’écran vert du bilan. L’ancienne fenêtre blanche intermédiaire et son bouton de poursuite sont supprimés. Les deux rendus sont suivis du formulaire d’enregistrement puis du détail complet de la note : sous-totaux, critères, calendrier, conseils et listes. Le classement reste sur la même page. Le détail des revêtements est ouvert par défaut ; le bouton Comprendre ma note fait défiler vers cette section, sans ouvrir une autre fenêtre. Les tentatives déjà validées retrouvent ce même écran.
