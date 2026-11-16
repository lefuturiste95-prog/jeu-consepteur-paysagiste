# L’Apprenti Concepteur

Jeu pédagogique de conception d’un parking paysager.

## Ouvrir ou partager le jeu

Décompresser l’archive complète, puis ouvrir `index.html` avec un navigateur récent. Conserver les dossiers `data`, `image` et `qgis` à côté de ce fichier. Pour partager cette version, transmettre le ZIP entier. Les polices utilisent Internet, avec des polices de secours disponibles hors ligne.

Cette copie est une version locale. Elle ne modifie pas automatiquement le site GitHub Pages déjà partagé. Pour le mettre à jour, publier le contenu du dossier dans le dépôt du site.

## Jouer

1. Cliquer sur Commencer une partie, puis lire Comment jouer et commencer l’analyse.
2. Observer la vue aérienne et les vues piétonnes et découvrir les 5 indices.
3. Consulter le plan QGIS et ouvrir le rendu interactif.
4. Choisir les revêtements, les 7 arbres et les 5 secteurs de vivaces. Les deux derniers arbres sont dans la noue. Consulter les besoins et les données écologiques de chaque plante avant de planter.
5. Valider pour obtenir le bilan sur 5 000. Le retour aux choix permet de corriger la palette. Les deux vues du projet figurent au bilan.

## Notation et catalogue Excel

La note est sur 5 000, avec 500 points pour les voies, 500 pour les places et 4 000 pour les végétaux. Les arbres représentent 70 % de l’adaptation et de la diversité des plantations. Le sol est évalué par état d’humidité, les répétitions et les mois sans floraison utile retirent des points. Les arrondis sont faits à la fin de chaque critère. Les fiches des plantes ne montrent pas de note individuelle.

La liste des végétaux reste alphabétique, sans correction automatique avant validation. Les répétitions réduisent la diversité. Les données non documentées ne donnent pas de bonus inventé. Le barème est expliqué dans l’aménagement avant validation. Le détail de la formule, les limites et les sources sont dans [BAREME-ECOLOGIQUE.md](BAREME-ECOLOGIQUE.md).

Le catalogue enrichi compte 51 végétaux, soit 20 arbres et 31 vivaces. Le fichier Catalogue-vegetaux.xlsx contient les caractéristiques et leurs sources. Pour actualiser la sélection après modification de l’Excel, utiliser `outils/synchroniser-catalogue.ps1`, comme expliqué dans le document du barème. La synchronisation ne modifie pas le classeur.

## Réglages et scores

Le bouton Admin de l’accueil ouvre les réglages du chantier. Code `etudessuperieures`. Cet accès évite les modifications accidentelles, sans constituer une sécurité serveur.

Les réglages et les classements restent dans le navigateur de chaque appareil. Ils ne sont pas partagés entre amis. Le classement écologique sur 5 000 est distinct de l’ancien classement, qui reste conservé dans le navigateur.

## Fichiers principaux

`index.html`, `style.css` et `script.js` gèrent les écrans. `parking-amenagement.js` gère la sélection des végétaux et la notation. `rendu-parking.js` et `rendu-pieton.js` composent les deux vues. `data/API_plantes.csv` et `data/plantes-embarquees.js` contiennent le même catalogue pour l’usage en ligne et hors serveur. `data/ecologie-plantes.json` conserve les compléments écologiques vérifiés et leurs liens sources.

## Ajouts du 15 novembre 2026

Trois graminées (miscanthus Gracillimus, calamagrostide Karl Foerster et herbe aux écouvillons) et quatre vivaces fleuries (hémérocalle Stella de Oro, bergénia, iris des jardins et marguerite commune) sont ajoutées à l’Excel et au jeu.

Les plantes courantes suivent les mêmes critères que les autres. Leur nom ou leur popularité ne donne ni bonus ni malus. Les liens étrangers ont été remplacés par des versions françaises ou des fiches françaises sur la même plante.

## Note sur 5 000 et cinq secteurs de vivaces

Le regroupement conserve toutes les surfaces plantées, avec trois secteurs en bordure et deux dans la noue. Trois étoiles à partir de 4 900 points, deux à 4 500 et une à 3 750. Le classement utilise une nouvelle version pour conserver les anciens scores séparément.

## Parcours de lancement

L’accueil présente uniquement Commencer une partie pour lancer le jeu. Les explications apparaissent systématiquement à l’étape suivante. Une partie mise en pause se reprend directement.
