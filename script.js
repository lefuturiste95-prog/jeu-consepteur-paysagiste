/* ==========================================================
   L'APPRENTI CONCEPTEUR
   Jeu de composition végétale — logique complète
   ========================================================== */


// ===============================
// REFERENCES DU DOCUMENT
// ===============================

const $ = (selecteur) => document.querySelector(selecteur);

const ecrans = {
    accueil: $("#ecran-accueil"),
    regles:  $("#ecran-regles"),
    jeu:     $("#ecran-jeu"),
    bilan:   $("#ecran-bilan")
};


// ===============================
// ACCES ADMINISTRATEUR
// ===============================

// Code demandé par Clément : "études supérieures", écrit tout collé.
const CODE_ADMIN = "etudessuperieures";


// ===============================
// VOCABULAIRE NORMALISE
// ===============================

const EXPOSITIONS = ["ombre", "mi-ombre", "soleil", "plein soleil"];

const HUMIDITES = ["très humide", "humide", "frais", "sec", "très sec"];

// Certaines fiches du CSV utilisent d'autres mots : on les traduit.
const TRADUCTION_HUMIDITE = {
    "aquatique":     ["très humide"],
    "drainé":        ["frais", "sec"],
    "bien drainé":   ["frais", "sec"],
    "normal":        ["frais"],
    "tous sols":     HUMIDITES
};

const TRADUCTION_EXPOSITION = {
    "tous types d'exposition": EXPOSITIONS,
    "intense (sous abri)":     ["plein soleil"]
};

const MOIS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];


// ===============================
// LE CHANTIER PARKING
// ===============================

let missionParking = {
    titre: "Création du parking",

    vues: [
        {
            id: "aerienne",
            label: "Vue aérienne",
            image: "image/parking/vue-aerienne.png",
            ratio: "16 / 9",
            points: [
                {
                    id: "surface", x: 52, y: 48,
                    titre: "Emprise du projet",
                    indice: "Regardez la surface indiquée au centre de la vue aérienne.",
                    texte: "La zone de projet représente environ 3 270 m². Cette surface devra accueillir le stationnement, les circulations et les espaces paysagers."
                },
                {
                    id: "cours-eau", x: 64, y: 79,
                    titre: "Cours d’eau au sud",
                    indice: "Observez la limite sud de la parcelle.",
                    texte: "Un petit cours d’eau passe au sud du site et rejoint le Noir Riez. La gestion des eaux pluviales devra donc être prise en compte dans l’aménagement."
                },
                {
                    id: "acces", x: 58, y: 10,
                    titre: "Accès existant",
                    indice: "Repérez les surfaces déjà circulées à proximité du terrain.",
                    texte: "Le site est directement voisin d’une voirie existante. Cet accès constitue un point important pour organiser l’entrée et la circulation du futur parking."
                },
                {
                    id: "lisiere", x: 78, y: 66,
                    titre: "Lisière végétale",
                    indice: "Regardez la bordure droite de la parcelle.",
                    texte: "Une végétation arborée borde une partie du site. Elle participe au paysage existant et doit être prise en compte dans la conception."
                }
            ]
        },
        {
            id: "pieton-acces",
            label: "Vue piétonne — accès",
            image: "image/parking/vue-pieton-acces.jpeg",
            ratio: "4 / 3",
            points: [
                {
                    id: "acces", x: 56, y: 70,
                    titre: "Accès existant",
                    indice: "Regardez la voie au premier plan.",
                    texte: "La voie existante permet de comprendre comment le futur parking pourra être raccordé aux circulations déjà présentes."
                },
                {
                    id: "terrain", x: 43, y: 49,
                    titre: "Terrain actuel",
                    indice: "Observez la parcelle derrière la voie.",
                    texte: "Le terrain est aujourd’hui non aménagé et majoritairement enherbé. Le projet va donc transformer une surface actuellement perméable."
                }
            ]
        },
        {
            id: "pieton-terrain",
            label: "Vue piétonne — terrain",
            image: "image/parking/vue-pieton-terrain.jpeg",
            ratio: "4 / 3",
            points: [
                {
                    id: "terrain", x: 50, y: 66,
                    titre: "Terrain actuel",
                    indice: "Regardez la couverture du sol sur l’ensemble de la parcelle.",
                    texte: "La parcelle est actuellement couverte d’une végétation herbacée. Cette situation sert de point de départ pour réfléchir à l’imperméabilisation et à la végétalisation du futur parking."
                },
                {
                    id: "lisiere", x: 94, y: 50,
                    titre: "Lisière végétale",
                    indice: "Observez les arbres sur les côtés et au fond de l’image.",
                    texte: "Les arbres et la végétation périphérique donnent déjà une structure paysagère au site. Le futur aménagement devra dialoguer avec cet environnement."
                }
            ]
        }
    ],

    imageAmenagement: "image/parking/vue-amenagement-provisoire.png",

    brief: "Une zone actuellement enherbée doit être transformée en parking pour augmenter le nombre de places disponibles pour le personnel et les étudiants. Avant de concevoir, commencez par analyser le site.",

    analyseTotal: 5,

    // Ces valeurs sont conservées pour les futures étapes du chantier.
    expositions: ["mi-ombre", "soleil"],
    humidites: ["humide", "frais"],

    conseil: "L’analyse du site doit guider les futurs choix de matériaux, de gestion de l’eau et de végétation.",
};


// ===============================
// CONFIGURATION PERSONNALISEE PAR L'ADMIN
// ===============================

const CLE_CONFIG_ADMIN = "apprenti-concepteur-config";


function appliquerConfigurationAdmin() {
    try {
        const sauvegarde = JSON.parse(localStorage.getItem(CLE_CONFIG_ADMIN));
        const modifications = sauvegarde?.chantiers?.[0];
        if (!modifications || typeof modifications !== "object") return;

        const vues = Array.isArray(modifications.vues) && modifications.vues.length
            ? modifications.vues
            : missionParking.vues;
        missionParking = { ...missionParking, ...modifications, vues };
    } catch (erreur) {
        console.warn("Impossible de lire la configuration administrateur :", erreur);
    }
}


function echapperConfigHTML(valeur) {

    return String(valeur ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function conditionsDepuisAdmin(liste, secours) {

    const conditions =
        Array.isArray(liste) && liste.length > 0
            ? liste
            : secours;

    return conditions
        .map((condition, index) => {

            let classe = "condition";

            if (index === 1) {
                classe += " est-hum";
            }

            if (index === 2) {
                classe += " est-expo";
            }

            return `
                <span class="${classe}">
                    ${echapperConfigHTML(condition)}
                </span>`;
        })
        .join("");
}


appliquerConfigurationAdmin();

const POINTS_EXPOSITION = 40;
const POINTS_HUMIDITE   = 40;
const POINTS_GROUPE     = 20;
// ===============================
// ETAT DE LA PARTIE
// ===============================

let plantes = [];

const partie = {
    score: 0,
    resultats: [],          // analyse et aménagement du parking
    vueScene: 0,
    phaseParking: "analyse",
    analyseEnPause: false,
    analyseTrouvee: new Set(),
    parking: null            // choix de la phase Aménagement (parking-amenagement.js)
};

// ===============================
// CHARGEMENT DES DONNEES
// ===============================

fetch("data/API_plantes.csv")

    .then(reponse => {

        if (!reponse.ok) {
            throw new Error("Fichier introuvable : " + reponse.status);
        }

        return reponse.text();
    })

    .catch(() => {

        // Ouverture directe du fichier (file://) : on utilise la copie
        // embarquée dans data/plantes-embarquees.js
        if (window.CSV_PLANTES) {
            return window.CSV_PLANTES;
        }

        throw new Error("Aucune source de données disponible");
    })

    .then(donnees => {

        analyserCSV(donnees);
        $("#catalogue-origine").textContent = "Catalogue Excel enrichi avec Floriscope · " +
            plantes.filter(p => p.groupe === "Arbre").length + " arbres et " +
            plantes.filter(p => p.groupe === "Vivace").length + " vivaces.";
        if (partie.parking) afficherMenuPlantation();
        console.log(plantes.length + " plantes chargées");

    })

    .catch(erreur => {

        console.error("Erreur de chargement :", erreur);

        message("Impossible de charger le catalogue de plantes.");
    });


// ===============================
// ANALYSE DU CSV
// ===============================

function analyserCSV(donnees) {

    const lignes = donnees.split(/\r?\n/);

    lignes.shift();     // titre du tableau
    lignes.shift();     // en-têtes des colonnes

    plantes = lignes

        .filter(ligne => ligne.trim() !== "")

        .map((ligne, index) => {

            const colonnes = ligne.split(";");

            const nomScientifique = (colonnes[1] || "").trim();

            return {
                id: index,
                groupe:          (colonnes[0] || "").trim(),
                nomScientifique: nomScientifique.startsWith("Non confirmé")
                                    ? ""
                                    : nomScientifique,
                nomVernaculaire: (colonnes[2] || "").trim(),
                expositions:     normaliser(colonnes[3], EXPOSITIONS,
                                            TRADUCTION_EXPOSITION),
                humidites:       normaliser(colonnes[4], HUMIDITES,
                                            TRADUCTION_HUMIDITE),
                type:            (colonnes[5] || "").trim(),
                floraison:       lireFloraison(colonnes[6]),
                hauteurAdulte:    (colonnes[7] || "").trim(),
                note:             (colonnes[8] || "").trim(),
                source:           (colonnes[9] || "").trim(),
                pollinisateurs:   (colonnes[10] || "").trim() === "documenté" ? true : null,
                sourceEcologie:   (colonnes[11] || "").trim(),
                espece:           (colonnes[12] || "").trim(),
                zoneConseillee:   (colonnes[13] || "").trim(),
                sousCategorieHorticole: (colonnes[14] || "").trim(),
                nomsVernaculaires: (colonnes[15] || colonnes[2] || "").trim(),
                categorieHorticole: (colonnes[16] || "").trim(),
                sourceFloriscope: (colonnes[17] || "").trim(),
                largeurAdulte: (colonnes[18] || "").trim()
            };

        })

        .filter(plante => plante.nomVernaculaire !== "" &&
            (!Array.isArray(window.SELECTION_CATALOGUE) || window.SELECTION_CATALOGUE.includes(plante.nomScientifique)));
}


/**
 * Transforme une cellule ("mi-ombre, soleil") en liste de mots-clés
 * connus du jeu, en passant par la table de traduction.
 */
function normaliser(cellule, vocabulaire, traductions) {

    const mots = (cellule || "")
        .toLowerCase()
        .split(",")
        .map(mot => mot.trim())
        .filter(mot => mot !== "");

    const resultat = new Set();

    mots.forEach(mot => {

        if (vocabulaire.includes(mot)) {
            resultat.add(mot);
            return;
        }

        if (traductions[mot]) {
            traductions[mot].forEach(valeur => resultat.add(valeur));
        }

    });

    // Ordre du vocabulaire (de l'ombre au plein soleil, du plus humide au plus sec)
    return vocabulaire.filter(valeur => resultat.has(valeur));
}


function lireFloraison(cellule) {

    return (cellule || "")
        .toLowerCase()
        .split(",")
        .map(mot => mot.trim())
        .filter(mot => MOIS.includes(mot));
}


// ===============================
// VUES REELLES DU CHANTIER
// ===============================

const PHOTO_SECOURS = "image/jardintest.jpg";

function chargerScene(mission, vue = 0) {

    creerBoutonsVues(mission);
    afficherVueChantier(vue);
}


function creerBoutonsVues(mission) {

    const conteneur = $("#scene-outils");
    conteneur.innerHTML = "";

    const vues = mission.vues && mission.vues.length
        ? mission.vues
        : [{ id: "principale", label: "Vue principale", image: PHOTO_SECOURS }];

    vues.forEach((vue, index) => {

        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "scene-mode";
        bouton.textContent = vue.label;
        bouton.dataset.vueIndex = index;

        bouton.addEventListener("click", () => {
            afficherVueChantier(index);
        });

        conteneur.appendChild(bouton);
    });
}


function afficherVueChantier(index) {

    const mission = missionParking;
    const vues = mission.vues && mission.vues.length
        ? mission.vues
        : [{ id: "principale", label: "Vue principale", image: PHOTO_SECOURS }];

    const indexValide = Math.max(0, Math.min(index, vues.length - 1));
    const vue = vues[indexValide];
    const photo = $("#scene-photo");

    partie.vueScene = indexValide;

    photo.onerror = () => {
        photo.onerror = null;
        photo.src = PHOTO_SECOURS;
    };

    photo.src = vue.image || PHOTO_SECOURS;
    photo.alt = vue.label + " — " + mission.titre;

    const scene = $("#scene");
    scene.style.aspectRatio = vue.ratio || "16 / 9";

    document.querySelectorAll(".scene-mode").forEach((bouton, i) => {
        const actif = i === indexValide;
        bouton.classList.toggle("est-actif", actif);
        bouton.setAttribute("aria-pressed", actif ? "true" : "false");
    });

    if (partie.phaseParking === "analyse") {
        dessinerPointsAnalyse(vue);
    } else {
        $("#scene-hotspots").innerHTML = "";
    }
}


// ===============================
// PARKING — AFFICHAGE VECTORIEL TYPE QGIS
// ===============================

function afficherModeQGIS(mode) {

    const ecranJeu = $("#ecran-jeu");
    const couche = $("#scene-qgis");
    const photo = $("#scene-photo");

    photo.src = RENDU.dossier + "base.jpg";
    $("#scene").style.aspectRatio = RENDU.largeur + " / " + RENDU.hauteur;

    const modes = ["actuel", "projet", "plan"];
    const modeValide = modes.includes(mode) ? mode : "projet";

    ecranJeu.classList.remove(
        "mode-qgis-actuel",
        "mode-qgis-projet",
        "mode-qgis-plan"
    );

    ecranJeu.classList.add("mode-qgis-" + modeValide);

    if (modeValide === "actuel") {
        couche.classList.remove("est-visible");
    } else {
        couche.classList.add("est-visible");

        window.QGISParking.afficher(couche);
    }

    document.querySelectorAll("#scene-outils .scene-mode").forEach(bouton => {

        const actif =
            bouton.dataset.modeQgis === modeValide;

        bouton.classList.toggle("est-actif", actif);
        bouton.setAttribute(
            "aria-pressed",
            actif ? "true" : "false"
        );
    });

    photo.alt =
        modeValide === "actuel"
            ? "Vue aérienne actuelle du site"
            : "Vue aérienne du site avec le plan vectoriel du parking";
}


function masquerModeQGIS() {

    const ecranJeu = $("#ecran-jeu");

    ecranJeu.classList.remove(
        "mode-qgis-actuel",
        "mode-qgis-projet",
        "mode-qgis-plan"
    );

    const couche = $("#scene-qgis");

    if (couche) {
        couche.classList.remove("est-visible");
        couche.innerHTML = "";
    }
}


// ===============================
// DEROULEMENT D'UN CHANTIER
// ===============================

function lancerParkingAnalyse(reprendre = false) {
    if (window.TentativeLocale?.charger()) { restaurerBilanValide(); return; }

    partie.phaseParking = "analyse";

    const mission = missionParking;
    const ecranJeu = $("#ecran-jeu");

    if (!reprendre) {
        partie.analyseTrouvee = new Set();
        partie.parking = null;
        partie.vueScene = 0;
    }

    masquerModeQGIS();

    ecranJeu.classList.add("mode-parking-analyse");
    ecranJeu.classList.remove("mode-parking-amenagement");
    fermerAmenagementParking();

    $("#phase-mission").textContent = "Analyse";
    $("#titre-mission").textContent = mission.titreAnalyse || "Parking — Analyse du site";
    $("#brief-mission").textContent = mission.brief;
    $("#instruction-phase").textContent =
        mission.instructionAnalyse ||
        "Touchez les yeux sur les différentes vues pour découvrir les informations utiles au projet.";

    $("#conditions-mission").innerHTML =
        conditionsDepuisAdmin(
            mission.conditionsAnalyse,
            [
                "≈ 3 270 m² de zone de projet",
                "≈ cours d’eau au sud",
                "Terrain actuellement enherbé"
            ]
        );


    chargerScene(mission, partie.vueScene);
    majAnalyseParking();
    majJauge();
    afficherEcran("jeu");

    setTimeout(() => message(
        "Commencez par la vue aérienne puis explorez les vues piétonnes."), 600);
}


function revenirEtapePrecedente() {
    if (partie.phaseParking === "analyse") {
        partie.analyseEnPause = true;
        $("#bouton-jouer").textContent = "Reprendre la partie";
        afficherEcran("accueil");
    } else if ($("#ecran-jeu").classList.contains("rendu-parking-actif")) {
        passerAmenagementParking();
    } else {
        lancerParkingAnalyse(true);
    }
}


function listePointsAnalyseParking() {

    const uniques = new Map();

    missionParking.vues.forEach(vue => {
        (vue.points || []).forEach(point => {
            if (!uniques.has(point.id)) uniques.set(point.id, point);
        });
    });

    return [...uniques.values()];
}


function ouvrirIndicesParking() {
    const points = listePointsAnalyseParking().filter(point => partie.analyseTrouvee.has(point.id));
    $("#liste-indices-parking").innerHTML = points.map(point => `
        <details>
            <summary>${echapperConfigHTML(point.titre)}</summary>
            <p>${[point.indice, point.texte].filter(Boolean).map(echapperConfigHTML).join("<br><br>")}</p>
        </details>`).join("");
    ouvrirFenetre("#voile-indices-parking");
    $("#bouton-fermer-indices").focus();
}


function dessinerPointsAnalyse(vue) {

    const conteneur = $("#scene-hotspots");
    conteneur.innerHTML = "";

    (vue.points || []).forEach(point => {

        const bouton = document.createElement("button");
        const trouve = partie.analyseTrouvee.has(point.id);

        bouton.type = "button";
        bouton.className = "point-analyse" + (trouve ? " est-trouve" : "");
        bouton.style.left = point.x + "%";
        bouton.style.top = point.y + "%";
        bouton.setAttribute("aria-label", "Analyser : " + point.titre);
        bouton.title = trouve ? point.titre + " — déjà analysé" : "Observer cette zone";
        bouton.innerHTML = trouve ? "✓" : "👁";

        bouton.addEventListener("click", () => ouvrirPointAnalyse(point));

        conteneur.appendChild(bouton);
    });
}


function ouvrirPointAnalyse(point) {

    partie.analyseTrouvee.add(point.id);

    $("#analyse-titre").textContent = point.titre;

    const indiceComplet = [
        point.indice,
        point.texte
    ]
        .filter(Boolean)
        .join("\n\n");

    $("#analyse-indice").textContent = indiceComplet;

    majAnalyseParking();

    const mission = missionParking;
    const vue = mission.vues[partie.vueScene];
    dessinerPointsAnalyse(vue);

    ouvrirFenetre("#voile-analyse");
}


function majAnalyseParking() {

    const points = listePointsAnalyseParking();
    const trouves = partie.analyseTrouvee.size;
    const total = points.length;

    $("#analyse-compteur").textContent = trouves + " / " + total;

    $("#analyse-liste").innerHTML = points.map(point => {

        const trouve = partie.analyseTrouvee.has(point.id);

        return `
            <div class="analyse-item ${trouve ? "est-trouve" : ""}">
                <span class="analyse-etat">${trouve ? "✓" : "?"}</span>
                <span>
                    <strong>${trouve ? point.titre : "Élément à découvrir"}</strong>
                    <small>${trouve ? "Information trouvée" : "Explorez les vues"}</small>
                </span>
            </div>`;
    }).join("");

    $("#bouton-passer-amenagement").disabled = trouves < total;

    if (trouves === total) {
        $("#indice-global").textContent =
            "Analyse terminée : vous pouvez maintenant passer à l’aménagement.";
    } else if (trouves >= 3) {
        $("#indice-global").textContent =
            "Pensez à changer de point de vue : certains éléments ne sont visibles que sur une autre image.";
    }
}


function enregistrerResultatAnalyseParking() {

    if (partie.resultats.some(resultat => resultat.type === "analyse-parking")) {
        return;
    }

    const elements = listePointsAnalyseParking();

    const resultat = {
        type: "analyse-parking",
        titre: "Parking — Analyse",
        conseil: "Une bonne conception commence par une lecture attentive du site.",
        lignes: [],
        elements,
        score: 0,
        maximum: 0,
        ratio: 1,
        etoiles: 0
    };

    partie.resultats.push(resultat);
    partie.score += resultat.score;
    $("#score-courant").textContent = partie.score;
}


function passerAmenagementParking() {

    enregistrerResultatAnalyseParking();
    fermerAmenagementParking();

    partie.phaseParking = "amenagement";

    const ecranJeu = $("#ecran-jeu");
    ecranJeu.classList.remove("mode-parking-analyse");
    ecranJeu.classList.add("mode-parking-amenagement");

    $("#phase-mission").textContent = "Aménagement";
    majJauge();

    const mission = missionParking;

    $("#titre-mission").textContent =
        mission.titreAmenagement || "Parking — Aménagement";

    $("#brief-mission").textContent =
        mission.briefAmenagement ||
        "L’analyse est terminée. Le plan vectoriel reprend le tracé du rendu réaliste sur la même vue aérienne.";

    $("#instruction-phase").textContent =
        mission.instructionAmenagement ||
        "Comparez les vues du plan, puis ouvrez le rendu réaliste pour essayer les revêtements, les arbres et les vivaces.";

    $("#conditions-mission").innerHTML =
        conditionsDepuisAdmin(
            mission.conditionsAmenagement,
            [
                "Analyse terminée",
                "Gestion de l’eau à intégrer",
                "Plan vectoriel à l’échelle"
            ]
        );

    $("#scene-hotspots").innerHTML = "";

    $("#scene-outils").innerHTML = `
        <button type="button"
                class="scene-mode"
                data-mode-qgis="actuel">
            Vue actuelle
        </button>

        <button type="button"
                class="scene-mode est-actif"
                data-mode-qgis="projet">
            Projet QGIS
        </button>

        <button type="button"
                class="scene-mode"
                data-mode-qgis="plan">
            Plan seul
        </button>`;

    document.querySelectorAll("#scene-outils [data-mode-qgis]")
        .forEach(bouton => {

            bouton.addEventListener("click", () => {
                afficherModeQGIS(bouton.dataset.modeQgis);
            });
        });

    afficherModeQGIS("projet");
}



function passerRenduParking() {
    masquerModeQGIS();

    $("#brief-mission").textContent =
        "Le plan du parking est arrêté. À vous de choisir les revêtements, les arbres et les vivaces : les deux vues montrent le résultat en direct.";

    $("#instruction-phase").textContent =
        "Les arbres de la noue et les vivaces doivent convenir à leur emplacement. Consultez les fiches et les indices du site pour les choisir.";

    $("#conditions-mission").innerHTML = conditionsDepuisAdmin([], [
        "Analyse terminée",
        "≈ Infiltrer l’eau de pluie",
        "☀ Ombrager les places"
    ]);

    ouvrirAmenagementParking();
}


function majJauge() {
    const jauge = $("#jauge-etapes");
    jauge.innerHTML = "";
    for (const phase of ["analyse", "amenagement"]) {
        const barre = document.createElement("span");
        if (phase === partie.phaseParking) barre.className = "est-courante";
        else if (phase === "analyse") barre.className = "est-faite";
        jauge.appendChild(barre);
    }
}


function afficherResultat(resultat) {

    $("#resultat-etiquette").textContent =
        resultat.titre;

    $("#resultat-titre").textContent = titreSelonRatio(resultat.ratio);

    $("#resultat-etoiles").innerHTML =
        "★★★".split("").map((etoile, index) =>
            index < resultat.etoiles
                ? "<span>★</span>"
                : "<span class='vide'>★</span>").join("");

    $("#resultat-score").textContent = resultat.score;
    $("#resultat-max").textContent   = "/ " + resultat.maximum + " points";

    const rendu = $("#resultat-rendu");
    const renduPieton = $("#resultat-rendu-pieton");
    rendu.classList.add("est-visible");
    renduPieton.classList.add("est-visible");
    copierRenduParking(rendu, renduPieton, resultat.choix);
    $("#resultat-detail").innerHTML = detailParkingHTML(resultat);

    $("#resultat-conseil").textContent = resultat.conseil;

    ouvrirFenetre("#voile-resultat");
}


function titreSelonRatio(ratio) {

    if (ratio >= 0.98) return "Chantier exemplaire !";
    if (ratio >= 0.90) return "Beau travail";
    if (ratio >= 0.75) return "Ça pousse, mais…";
    return "À revoir sur le terrain";
}


// ===============================
// BILAN FINAL
// ===============================

const RANGS = [
    { seuil: 0.98, nom: "Paysagiste d'exception",
      texte: "Très bon équilibre entre les revêtements et les végétaux du parking." },
    { seuil: 0.90, nom: "Concepteur confirmé",
      texte: "Des choix cohérents pour les circulations, le stationnement et les plantations." },
    { seuil: 0.75, nom: "Apprenti paysagiste",
      texte: "De bons réflexes : surveillez encore l'humidité du sol." },
    { seuil: 0.50, nom: "Stagiaire motivé",
      texte: "Relisez bien la fiche de chantier avant de choisir vos plantes." },
    { seuil: 0,    nom: "Première saison",
      texte: "Les indications sous chaque repère aident à choisir une plante adaptée." }
];


function afficherBilan() {

    const maximum = partie.resultats.reduce((t, r) => t + r.maximum, 0);
    const etoiles = partie.resultats.reduce((t, r) => t + r.etoiles, 0);
    const ratio   = maximum === 0 ? 0 : partie.score / maximum;

    const rang = RANGS.find(r => ratio >= r.seuil);

    $("#bilan-rang").textContent        = rang.nom;
    $("#bilan-sous-titre").textContent  = rang.texte;
    $("#bilan-score").textContent       = partie.score;
    $("#bilan-pourcent").textContent    = Math.round(ratio * 100) + " %";
    $("#bilan-etoiles").textContent     = etoiles;

    $("#bilan-lignes").innerHTML = partie.resultats.filter(resultat => resultat.maximum > 0).map((resultat, index) => `
        <tr>
            <td>${index + 1}. ${resultat.titre}</td>
            <td>${resultat.score} / ${resultat.maximum}</td>
            <td>${"★".repeat(resultat.etoiles) || "—"}</td>
        </tr>`).join("");

    const parking = partie.resultats.find(resultat => resultat.type === "amenagement-parking");
    const renduCompatible = parking && typeof PLAN_PARKING !== "undefined" && parking.choix?.arbres?.length === PLAN_PARKING.emplacementsArbres.length && parking.choix?.vivaces?.length === PLAN_PARKING.emplacementsVivaces.length;
    $("#bilan-rendu").classList.toggle("est-visible", Boolean(renduCompatible));

    $("#bilan-conseils-revetements").innerHTML = parking ? (parking.lignesRevetements || [])
        .filter(ligne => ligne.revetement).map(ligne => `<p><strong>${echapperConfigHTML(ligne.zone)} · ${echapperConfigHTML(ligne.revetement.nom)}</strong><br>${echapperConfigHTML(ligne.revetement.avis)}</p>`).join("") : "";
    if (renduCompatible) {
        copierRenduParking($("#bilan-rendu-canvas"), $("#bilan-rendu-pieton"), parking.choix);
    }

    preparerEnregistrementScore(parking);
    if (window.TentativeLocale && !window.TentativeLocale.estDurable()) message("Le stockage du navigateur est bloqué : le bilan ne pourra pas être retrouvé après fermeture.");
    $("#bouton-rejouer").textContent = "Revoir mon bilan";
    lignesClassement = [];
    dessinerClassement();
    $("#plus-classement").hidden = true;
    afficherClassement();
    afficherEcran("bilan");
}


// ===============================
// CLASSEMENT PARTAGÉ ET COPIE LOCALE
// ===============================

const CLE_CLASSEMENT = "apprenti-concepteur-classement-5000-v5";
const TAILLE_PAGE_CLASSEMENT = 20;
let lignesClassement = [];
let versionLectureClassement = 0;
let enregistrementBilan = null;

function classementPartageActif() {
    return Boolean(window.ScoresPartages?.estConfigure());
}

function lireClassement() {
    try {
        const donnees = JSON.parse(localStorage.getItem(CLE_CLASSEMENT));
        return Array.isArray(donnees) ? donnees.filter(entree =>
            entree && typeof entree.nom === "string" && Number.isInteger(entree.score) &&
            entree.score >= 0 && entree.score <= 5000) : [];
    } catch (erreur) {
        return [];
    }
}

function ecrireClassement(classement) {
    try {
        localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(classement));
        return true;
    } catch (erreur) {
        console.warn("Copie locale du score indisponible.");
        return false;
    }
}

function preparerEnregistrementScore(resultat) {
    if (!enregistrementBilan || enregistrementBilan.resultat !== resultat) {
        enregistrementBilan = { resultat, entree: null, enCours: false, termine: false, copieLocale: false };
        $("#nom-joueur").value = "";
        const sauvegarde = window.TentativeLocale?.charger();
        if (sauvegarde?.entree) enregistrementBilan.entree = sauvegarde.entree;
        if (sauvegarde?.publie) enregistrementBilan.termine = true;
        $("#statut-enregistrement").textContent = sauvegarde?.publie ? "Ce résultat est déjà enregistré." : "Une seule tentative est autorisée sur ce navigateur.";
    }
    $("#form-classement").style.display = enregistrementBilan.termine ? "none" : "flex";
    $("#nom-joueur").readOnly = Boolean(enregistrementBilan.entree);
    $("#enregistrer-score").disabled = enregistrementBilan.enCours;
    $("#enregistrer-score").textContent = enregistrementBilan.entree ? "Réessayer l’envoi" : "Enregistrer mon score";
    $("#notice-scores").textContent = classementPartageActif()
        ? "En enregistrant, tu partages ton prénom ou pseudo et ton score global. Les sous-scores, la date et la liste des choix sont réservés à l’enseignant ; seul le nom et le score global sont publics."
        : "Le classement partagé n’est pas encore activé. Pour le moment, les scores restent sur cet appareil.";
}

function dessinerClassement() {
    const liste = $("#classement");
    const vide = $("#classement-vide");
    vide.hidden = lignesClassement.length !== 0;
    liste.innerHTML = lignesClassement.map((entree, index) => `
        <li>
            <span class="place">${index + 1}</span>
            <span class="qui">${echapperConfigHTML(entree.nom)}</span>
            <span class="pts">${entree.score.toLocaleString("fr-FR")} <small>/ 5 000</small></span>
        </li>`).join("");
}

async function afficherClassement(plus = false) {
    const version = ++versionLectureClassement;
    const statut = $("#statut-classement");
    const suite = $("#plus-classement");
    const actualiser = $("#actualiser-classement");
    const partage = classementPartageActif();
    $("#titre-classement").textContent = partage ? "Classement de tous les joueurs" : "Classement sur cet appareil";
    suite.disabled = true;
    actualiser.disabled = true;
    statut.textContent = partage ? "Chargement du classement partagé…" : "";
    try {
        const debut = plus ? lignesClassement.length : 0;
        const page = partage
            ? await window.ScoresPartages.lire(TAILLE_PAGE_CLASSEMENT + 1, debut)
            : lireClassement().sort((a, b) => b.score - a.score)
                .slice(debut, debut + TAILLE_PAGE_CLASSEMENT + 1);
        if (version !== versionLectureClassement) return;
        lignesClassement = (plus ? lignesClassement : []).concat(page.slice(0, TAILLE_PAGE_CLASSEMENT));
        suite.hidden = page.length <= TAILLE_PAGE_CLASSEMENT;
        dessinerClassement();
        statut.textContent = partage
            ? "Classement partagé · score global uniquement · barème / 5 000"
            : "Scores locaux · barème / 5 000";
    } catch (erreur) {
        if (version !== versionLectureClassement) return;
        statut.textContent = lignesClassement.length
            ? "Actualisation impossible. Les résultats affichés peuvent être anciens. Réessaie avec Actualiser."
            : "Le classement partagé est indisponible. Réessaie avec Actualiser.";
        $("#classement-vide").hidden = true;
    } finally {
        if (version === versionLectureClassement) {
            suite.disabled = false;
            actualiser.disabled = false;
        }
    }
}

async function afficherMeilleurScore() {
    const partage = classementPartageActif();
    try {
        const classement = partage ? await window.ScoresPartages.lire(1, 0) : lireClassement();
        const meilleur = classement.reduce((a, b) => !a || b.score > a.score ? b : a, null);
        $("#meilleur-score").textContent = meilleur
            ? (partage ? "Meilleur score partagé : " : "Meilleur score sur cet appareil : ") +
                meilleur.score + " pts — " + meilleur.nom
            : "";
    } catch (erreur) {
        $("#meilleur-score").textContent = "Meilleur score partagé indisponible pour le moment.";
    }
}

async function enregistrerScoreBilan(evenement) {
    evenement.preventDefault();
    const etat = enregistrementBilan;
    if (!etat?.resultat || etat.enCours || etat.termine) return;
    const statut = $("#statut-enregistrement");
    try {
        if (!etat.entree) {
            const nom = $("#nom-joueur").value.trim();
            const resultat = etat.resultat;
            const entree = {
                nom, score: resultat.score,
                vegetaux: resultat.totaux.vegetaux,
                mineraux: resultat.totaux.revetements,
                date: new Date().toISOString(),
                jeton: window.TentativeLocale?.charger()?.jeton,
                bilan: resumerBilan(resultat)
            };
            window.ScoresPartages.verifier(entree);
            etat.entree = Object.freeze(entree);
            window.TentativeLocale?.actualiser({entree});
        }
        // L’entrée et son horodatage restent identiques lors d’une nouvelle tentative.
        etat.enCours = true;
        $("#nom-joueur").readOnly = true;
        $("#enregistrer-score").disabled = true;
        statut.textContent = classementPartageActif() ? "Envoi du score…" : "Enregistrement sur cet appareil…";
        if (!etat.copieLocale) {
            const locaux = lireClassement();
            if (!locaux.some(e => e.nom === etat.entree.nom && e.date === etat.entree.date)) locaux.push(etat.entree);
            etat.copieLocale = ecrireClassement(locaux);
        }
        if (classementPartageActif()) {
            await window.ScoresPartages.envoyer(etat.entree);
        } else if (!etat.copieLocale) {
            throw new Error("Enregistrement local impossible.");
        }
        etat.termine = true;
        window.TentativeLocale?.actualiser({publie: classementPartageActif()});
        if (enregistrementBilan !== etat) return;
        $("#form-classement").style.display = "none";
        statut.textContent = classementPartageActif()
            ? "Ton score a été enregistré dans le classement partagé."
            : "Score enregistré uniquement sur cet appareil. Le partage n’est pas encore activé.";
        await afficherClassement();
    } catch (erreur) {
        if (enregistrementBilan !== etat) return;
        if (erreur.code === "23505") {
            if (etat.entree) ecrireClassement(lireClassement().filter(e => !(e.nom === etat.entree.nom && e.date === etat.entree.date)));
            etat.entree = null;
            etat.copieLocale = false;
            window.TentativeLocale?.actualiser({entree:null});
            $("#nom-joueur").readOnly = false;
            statut.textContent = "Ce nom ou cette tentative est déjà enregistré. Utilise prénom et initiale du nom en cas d’homonyme, ou contacte l’enseignant.";
            return;
        }
        statut.textContent = etat.entree
            ? (etat.copieLocale ? "Score conservé sur cet appareil. " : "Score non enregistré. ") +
                "L’envoi a échoué. Réessaie pour le partager."
            : erreur.message;
        $("#enregistrer-score").textContent = etat.entree ? "Réessayer l’envoi" : "Enregistrer mon score";
    } finally {
        etat.enCours = false;
        if (enregistrementBilan === etat) $("#enregistrer-score").disabled = false;
    }
}


// ===============================
// PETITS OUTILS D'INTERFACE
// ===============================

function afficherEcran(nom) {

    Object.values(ecrans).forEach(ecran => ecran.classList.remove("est-actif"));

    ecrans[nom].classList.add("est-actif");

    window.scrollTo({ top: 0, behavior: "auto" });
}


function ouvrirFenetre(selecteur) {
    $(selecteur).classList.add("est-ouvert");
}


function fermerFenetre(selecteur) {
    $(selecteur).classList.remove("est-ouvert");
}


let minuterieMessage;

function message(texte) {

    const bulle = $("#info-bulle");

    bulle.textContent = texte;
    bulle.classList.add("est-visible");

    clearTimeout(minuterieMessage);

    minuterieMessage = setTimeout(
        () => bulle.classList.remove("est-visible"), 2600);
}


// ===============================
// EVENEMENTS
// ===============================

// --- Accueil ---

$("#bouton-jouer").addEventListener("click", () => {

    if (partie.analyseEnPause) {
        partie.analyseEnPause = false;
        $("#bouton-jouer").textContent = "Commencer une partie";
        afficherEcran("jeu");
        return;
    }

    preparerNouvellePartie();
});

function preparerNouvellePartie() {
    if (window.TentativeLocale?.charger()) { restaurerBilanValide(); return; }
    enregistrementBilan = null;
    versionLectureClassement++;
    partie.score = 0;
    partie.resultats = [];
    partie.analyseTrouvee = new Set();
    partie.analyseEnPause = false;
    partie.parking = null;
    $("#score-courant").textContent = "0";
    $("#bouton-jouer").textContent = "Commencer une partie";
    afficherEcran("regles");
    $("#regles-titre").focus();
}

$("#bouton-demarrer-analyse").addEventListener("click", () => lancerParkingAnalyse());
$("#bouton-retour-regles").addEventListener("click", () => {
    afficherEcran("accueil");
    $("#bouton-jouer").focus();
});


// --- Accès administrateur ---

$("#bouton-admin").addEventListener("click", () => {

    $("#code-admin").value = "";
    $("#erreur-admin").textContent = "";

    ouvrirFenetre("#voile-admin");

    setTimeout(() => $("#code-admin").focus(), 80);
});


$("#annuler-admin").addEventListener("click", () => {
    fermerFenetre("#voile-admin");
});


function verifierCodeAdmin() {

    const codeSaisi = $("#code-admin").value.trim().toLowerCase();

    if (codeSaisi === CODE_ADMIN) {

        // Autorisation valable uniquement pendant cette session du navigateur.
        sessionStorage.setItem("adminAutorise", "oui");

        window.location.href = "admin.html";
        return;
    }

    $("#erreur-admin").textContent = "Code incorrect.";
    $("#code-admin").select();
}


$("#valider-admin").addEventListener("click", verifierCodeAdmin);


$("#code-admin").addEventListener("keydown", (evenement) => {

    if (evenement.key === "Enter") {
        verifierCodeAdmin();
    }
});


// --- Analyse du parking ---

$("#bouton-fermer-analyse").addEventListener("click",
    () => fermerFenetre("#voile-analyse"));

$("#bouton-passer-amenagement").addEventListener("click", () => {
    passerAmenagementParking();
});

$("#bouton-indices-parking").addEventListener("click", ouvrirIndicesParking);
$("#bouton-fermer-indices").addEventListener("click", () => {
    fermerFenetre("#voile-indices-parking");
    $("#bouton-indices-parking").focus();
});

$("#bouton-rendu-parking").addEventListener("click", passerRenduParking);
$("#bouton-retour-qgis").addEventListener("click", passerAmenagementParking);

$("#bouton-retour-etape").addEventListener("click", revenirEtapePrecedente);

$("#bouton-retour-resultat").addEventListener("click", () => {
    if (window.TentativeLocale?.charger()) { fermerFenetre("#voile-resultat"); restaurerBilanValide(); return; }
    const resultat = partie.resultats.pop();
    partie.score -= resultat.score;
    $("#score-courant").textContent = partie.score;
    fermerFenetre("#voile-resultat");
    $("#bouton-valider-parking").focus();
});

$("#bouton-suite").addEventListener("click", () => {

    fermerFenetre("#voile-resultat");

    afficherBilan();
});


// --- Plein écran (pratique sur tablette) ---

$("#bouton-plein-ecran").addEventListener("click", () => {

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
            .catch(() => message("Le plein écran n'est pas disponible ici."));
    } else {
        message("Le plein écran n'est pas disponible sur cet appareil.");
    }
});


// --- Bilan ---

$("#form-classement").addEventListener("submit", enregistrerScoreBilan);
$("#actualiser-classement").addEventListener("click", () => afficherClassement());
$("#plus-classement").addEventListener("click", () => afficherClassement(true));


$("#bouton-rejouer").addEventListener("click", () => {
    afficherMeilleurScore();
    preparerNouvellePartie();
});


$("#bouton-retour-accueil").addEventListener("click", () => {

    // On remet la partie en attente sans effacer le classement enregistré.
    enregistrementBilan = null;
    versionLectureClassement++;
    partie.score = 0;
    partie.resultats = [];
    partie.analyseTrouvee = new Set();

    $("#score-courant").textContent = "0";
    $("#nom-joueur").value = "";
    $("#form-classement").style.display = "flex";

    afficherMeilleurScore();
    afficherEcran("accueil");
});


$("#bouton-revoir").addEventListener("click", () => {

    $("#detail-partie").innerHTML = partie.resultats.map((resultat, index) => {

        const contenu = resultat.type === "analyse-parking"
            ? resultat.elements.map(element => `
                <div class="ligne-detail">
                    <span class="ligne-detail-nom">
                        ${element.titre}
                        <small>Élément identifié pendant l’analyse du site</small>
                    </span>
                    <span class="ligne-detail-points">✓</span>
                </div>`).join("")
            : detailParkingHTML(resultat);

        return `
            <div class="detail-chantier">
                <h3>${index + 1}. ${resultat.titre}</h3>
                <p class="detail-sous">
                    ${resultat.maximum > 0
                        ? resultat.score + " / " + resultat.maximum + " points · " + ("★".repeat(resultat.etoiles) || "aucune étoile")
                        : "Analyse terminée · étape préparatoire sans points"}
                </p>
                <div class="detail-plantes">${contenu}</div>
            </div>`;
    }).join("");

    ouvrirFenetre("#voile-detail");
});


$("#bouton-fermer-detail").addEventListener("click",
    () => fermerFenetre("#voile-detail"));


// --- Fermeture des fenêtres au clic sur le voile ---

document.querySelectorAll(".voile").forEach(voile => {

    voile.addEventListener("click", (evenement) => {

        // le résultat de chantier ne se ferme que par le bouton
        if (evenement.target === voile && voile.id !== "voile-resultat") {
            voile.classList.remove("est-ouvert");
        }
    });
});


document.addEventListener("keydown", (evenement) => {

    if (evenement.key === "Escape") {
        fermerFenetre("#voile-detail");
        fermerFenetre("#voile-admin");
        fermerFenetre("#voile-analyse");
        fermerFenetre("#voile-indices-parking");
    }
});


function resumerBilan(r) {
    return {
        version: r.versionBareme || 6,
        criteres: (r.criteres || []).map(c => ({nom:c.nom,points:c.points,maximum:c.maximum})),
        plantations: (r.lignesPlantations || []).filter(l => l.plante).map(l => ({repere:l.repere,nom:l.plante.nomVernaculaire,scientifique:l.plante.nomScientifique})),
        revetements: (r.lignesRevetements || []).filter(l => l.revetement).map(l => ({zone:l.zone,nom:l.revetement.nom}))
    };
}
async function restaurerBilanValide() {
    const s = window.TentativeLocale?.charger();
    if (!s) return;
    if (s.publie && classementPartageActif()) {
        try {
            const existe = await window.ScoresPartages.statut(s.jeton);
            if (!existe) { window.TentativeLocale.effacer(); enregistrementBilan=null; preparerNouvellePartie(); return; }
        } catch { /* Hors ligne : conserver le verrou et le bilan. */ }
    }
    partie.resultats = [s.resultat]; partie.score = s.resultat.score;
    partie.parking = s.resultat.choix;
    $("#score-courant").textContent = partie.score;
    afficherBilan();
}
// --- Démarrage ---
setTimeout(() => { if (window.TentativeLocale?.charger()) restaurerBilanValide(); }, 0);

afficherMeilleurScore();
