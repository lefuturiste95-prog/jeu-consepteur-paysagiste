# L'Apprenti Concepteur — Projet complet

Ce dossier regroupe le jeu web et tous les fichiers SIG/QGIS utilisés pour le chantier Parking.

## POUR LANCER LE JEU

Ouvrir :
    index.html

Pour la version en ligne :
    envoyer tout le contenu du dossier sur le dépôt GitHub Pages.

## ACCÈS ADMIN

Depuis la page d'accueil : bouton Admin

Code :
    etudessuperieures

## STRUCTURE

jeu_concepteur_paysagiste_COMPLET/
├── index.html
├── style.css
├── script.js
├── admin.html
├── admin.css
├── admin.js
├── manifest.json
├── demo-qgis.html
│
├── data/
│   ├── API_plantes.csv
│   └── plantes-embarquees.js
│
├── image/
│   ├── icone.png
│   ├── jardintest.jpg
│   ├── chantier-2.jpg
│   └── parking/
│       ├── vue-aerienne.png
│       ├── vue-pieton-acces.jpeg
│       ├── vue-pieton-terrain.jpeg
│       ├── vue-amenagement-provisoire.png
│       ├── vue-amenagement-qgis.png
│       └── vue-amenagement-qgis-v2.png
│
└── qgis/
    ├── OUVRIR_DANS_QGIS.qgs
    │
    ├── reference_genech_lambert93/
    │   ├── Genech_reference_SWMaps_batiments.gpkg
    │   ├── apercu_batiments_swmap.png
    │   └── LISEZ-MOI.txt
    │
    ├── parking_local_a_recaler/
    │   ├── parking_projet.gpkg
    │   ├── fond_vue_aerienne_calage_local.tif
    │   ├── parking-qgis.js
    │   └── geojson/
    │
    └── sources_originales/
        ├── Batiment_Genech_2.shp
        ├── Batiment_Genech_2.shx
        ├── Batiment_Genech_2.dbf
        ├── Batiment_Genech_2.prj
        ├── Batiment_Genech_2.cpg
        ├── Batiment_Genech_2.qmd
        └── releve_SWMaps_original.swmz

## IMPORTANT — QGIS

Le dossier `reference_genech_lambert93` est géoréférencé en :
    RGF93 / Lambert-93 — EPSG:2154

C'est maintenant notre référence géographique fiable.

Le dossier `parking_local_a_recaler` contient le parking créé avant l'arrivée
des données GNSS et bâtiments. Il est encore dans un repère métrique local.

NE PAS considérer ce parking comme géographiquement positionné avec précision
tant qu'il n'a pas été recalé sur la référence Lambert-93.

Pour commencer dans QGIS :
    double-cliquer sur qgis/OUVRIR_DANS_QGIS.qgs

Le projet charge les bâtiments de Genech, les traces SW Maps,
les points GNSS et les arbres SW Maps.

## PROCHAINE ÉTAPE DU PROJET

Recréer/recaler l'emprise du parking directement dans le projet Lambert-93,
puis y redessiner :
- les voies ;
- les places ;
- les PMR ;
- les îlots plantés ;
- la noue ;
- les cheminements.

Cela permettra ensuite d'exporter un plan réellement géoréférencé vers le jeu web.
