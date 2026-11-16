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

Les 7 arbres et les 5 secteurs de vivaces sont conservés. Trois secteurs sont en bordure et deux dans la noue, avec les mêmes 262 m² de surfaces plantées.

## Végétaux et précision

Les arbres comptent pour 70 % de l’exposition, de l’adaptation au sol et de la diversité. Les vivaces comptent pour 30 %. Les moyennes sont calculées à l’intérieur de chaque groupe avant d’appliquer ces poids. Une erreur de même nature pèse ainsi davantage sur un arbre. Par exemple, tolérer un seul des deux états du sol au lieu des deux retire 70 points de sol pour un arbre, contre 42 pour une zone de vivaces, avant les effets sur les bonus écologiques.

Le sol du modèle alterne entre frais et sec au centre et en bordure, entre humide et très humide dans la noue. Les conditions sont indiquées au joueur. Une plante tolérant un état sur deux reçoit un crédit partiel pour le sol. Le mauvais groupe de végétal vaut zéro en exposition et en sol. Le bon type ne donne pas de points gratuits.

L’exposition doit être compatible avec au moins une des expositions annoncées. Soleil et plein soleil sont acceptés dans les zones au soleil, sans pénalité artificielle liée au vocabulaire des sources.

Les bonus de diversité, de floraison et de ressources pour les pollinisateurs exigent le bon groupe, une exposition compatible et la tolérance aux deux états du sol. Une information manquante n’est pas remplacée par une capacité supposée. Le résultat reflète le catalogue et les hypothèses du jeu, pas une mesure écologique de terrain.

La diversité de chaque groupe est `(n² − somme(effectifEspèce²)) / (N × (N − 1))`, avec N le nombre d’emplacements et n le nombre de plantes entièrement adaptées. La note vaut `plancher(1 000 × (0,7 × indiceArbres + 0,3 × indiceVivaces))`. Une seule répétition entre deux arbres adaptés retire 34 points. Les cultivars d’une même espèce restent une espèce. Un secteur de vivaces compte comme une unité, indépendamment de sa surface.

Les floraisons utiles sont évaluées sur les 7 mois de mars à septembre. Les ressources pour les pollinisateurs ont un objectif de 7 plantations entièrement adaptées avec un intérêt documenté. Chaque critère vaut au maximum 500 points. Un intérêt non documenté ne signifie pas absence d’intérêt.

Le maximum de diversité impose ici une espèce différente par emplacement pour l’exercice, sans constituer une prescription paysagère. Les volumes racinaires et les distances de visibilité ne sont pas mesurés automatiquement. Les fiches servent aussi à discuter ces limites.

## Revêtements

Chaque zone est évaluée séparément avec `plancher(500 × (coefficientInfiltration + coefficientUsage) / 200)`. Les coefficients sont sur 100. L’usage évalué est le roulage pour les voies et le stationnement pour les places.

Les voies valent donc 500 points maximum et les places 500. Deux surfaces en enrobé donnent 250 points chacune, faute d’infiltration, soit une perte totale de 500 points. Des dalles-gazon sur les voies et du béton drainant sur les places retirent 200 points dans le barème fourni. Une variation d’un point d’un coefficient reste visible avec une baisse de 2 ou 3 points après arrondi.

Les coefficients sont pédagogiques, sans constituer des mesures hydrauliques. La perméabilité réelle dépend aussi de la structure, du sol et de l’entretien.

## Début de partie et bilan

L’accueil présente un seul bouton de lancement, Commencer une partie. Il conduit à l’écran Comment jouer. Le bouton J’ai compris, commencer l’analyse ouvre ensuite le chantier. Le même parcours s’applique à Rejouer. Une analyse mise en pause se reprend directement, avec ses indices conservés.

Les notes individuelles et les validations restent masquées pendant le choix des végétaux. Le bilan affiche les sous-totaux Végétaux sur 4 000 et Revêtements sur 1 000, ainsi que les deux notes de revêtement sur 500. Trois étoiles à partir de 4 900, deux à 4 500, une à 3 750. L’analyse du site n’ajoute pas de points.

Le classement de ce barème est distinct des précédents, qui restent conservés dans le navigateur. Revenir aux choix et valider à nouveau ne cumule pas la note du même aménagement.

## Catalogue et sources

Le catalogue compte 51 végétaux, soit 20 arbres et 31 vivaces. Les 44 choix précédents sont conservés et 7 sont ajoutés, avec trois graminées et quatre vivaces fleuries. Le fichier `Catalogue-vegetaux.xlsx` rassemble les six rubriques demandées dans les premières colonnes, les sources, les dimensions et les conseils pour le parking.

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
