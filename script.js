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
// LES DEUX CHANTIERS
// ===============================

let MISSIONS = [

    // ==========================================================
    // CHANTIER 1 — PARKING (CHANTIER REEL)
    // ==========================================================

    {
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
                        id: "cours-eau", x: 64, y: 88,
                        titre: "Cours d’eau au sud",
                        indice: "Observez la limite sud de la parcelle.",
                        texte: "Un petit cours d’eau passe au sud du site et rejoint le Noir Riez. La gestion des eaux pluviales devra donc être prise en compte dans l’aménagement."
                    },
                    {
                        id: "acces", x: 20, y: 38,
                        titre: "Accès existant",
                        indice: "Repérez les surfaces déjà circulées à proximité du terrain.",
                        texte: "Le site est directement voisin d’une voirie existante. Cet accès constitue un point important pour organiser l’entrée et la circulation du futur parking."
                    },
                    {
                        id: "lisiere", x: 86, y: 54,
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
                        id: "lisiere", x: 86, y: 50,
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

        // Conservé uniquement pour compatibilité avec le reste du prototype.
        emplacements: []
    },

    // ==========================================================
    // CHANTIER 2 — ZONE 6
    // ==========================================================
    // On conserve volontairement presque tout l'ancien chantier 2.

    {
        titre: "Zone 6",

        vues: [
            {
                id: "principale",
                label: "Vue principale",
                image: "image/chantier-2.jpg"
            }
        ],

        brief: "Le long d'un ruisseau, la terre est gorgée d'eau une bonne partie " +
               "de l'année et la berge s'érode. La commune demande une végétation " +
               "qui tienne le talus et supporte les pieds dans l'eau.",
        expositions: ["mi-ombre", "soleil"],
        humidites: ["très humide", "humide"],
        conseil: "Les sols très humides réclament des espèces de ripisylve " +
                 "(aulne, saule, viorne obier, cornouiller) : leurs racines " +
                 "fixent la berge.",

        emplacements: [
            { groupe: "Arbre",   x: 22, y: 60, taille: 19 },
            { groupe: "Arbuste", x: 48, y: 66, taille: 13 },
            { groupe: "Arbuste", x: 70, y: 70, taille: 13 },
            { groupe: "Vivace",  x: 36, y: 78, taille: 9 }
        ]
    }

]


// ===============================
// CONFIGURATION PERSONNALISEE PAR L'ADMIN
// ===============================

const CLE_CONFIG_ADMIN = "apprenti-concepteur-config";


function appliquerConfigurationAdmin() {

    try {

        const sauvegarde =
            JSON.parse(localStorage.getItem(CLE_CONFIG_ADMIN));

        if (
            !sauvegarde ||
            !Array.isArray(sauvegarde.chantiers)
        ) {
            return;
        }

        sauvegarde.chantiers.forEach((modifications, index) => {

            if (!MISSIONS[index] || !modifications) {
                return;
            }

            const missionOriginale = MISSIONS[index];

            MISSIONS[index] = {
                ...missionOriginale,
                ...modifications,

                // Si l'admin a enregistré des vues, on les utilise.
                // Sinon on conserve celles présentes dans le code.
                vues:
                    Array.isArray(modifications.vues) &&
                    modifications.vues.length > 0
                        ? modifications.vues
                        : missionOriginale.vues,

                // Les emplacements de plantation de Zone 6 ne sont pas
                // gérés dans l'admin pour le moment : on les conserve.
                emplacements:
                    Array.isArray(modifications.emplacements)
                        ? modifications.emplacements
                        : missionOriginale.emplacements,

                expositions:
                    Array.isArray(modifications.expositions)
                        ? modifications.expositions
                        : missionOriginale.expositions,

                humidites:
                    Array.isArray(modifications.humidites)
                        ? modifications.humidites
                        : missionOriginale.humidites
            };
        });

    } catch (erreur) {

        console.warn(
            "Impossible de lire la configuration administrateur :",
            erreur
        );
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
const BONUS_PAR_MOIS    = 10;
const BONUS_MOIS_MAX    = 6;


// ===============================
// ETAT DE LA PARTIE
// ===============================

let plantes = [];

const partie = {
    missionCourante: 0,
    score: 0,
    resultats: [],          // un objet par chantier terminé
    choix: [],              // index de plante par emplacement
    emplacementVise: 0,
    vueScene: 0,
    phaseParking: "analyse",
    analyseTrouvee: new Set(),
    parking: null            // choix de la phase Aménagement (parking-amenagement.js)
};

const filtres = {
    recherche: "",
    expositions: new Set(),
    humidites: new Set(),
    groupe: ""
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
        construirePuces();
        afficherPlantes();
        console.log(plantes.length + " plantes chargées");

    })

    .catch(erreur => {

        console.error("Erreur de chargement :", erreur);

        $("#nombre-resultats").textContent =
            "Impossible de charger le catalogue de plantes.";
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
                floraison:       lireFloraison(colonnes[6])
            };

        })

        .filter(plante => plante.nomVernaculaire !== "");
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
// DESSINS : SILHOUETTES DE PLANTES
// ===============================

const COULEURS_FLEURS = [
    "#e8618f", "#f0c73f", "#d8552f", "#9a6fd0",
    "#f7f3e8", "#ef8a3c", "#e04f6a", "#6fa8dc"
];

function hachage(texte) {

    let valeur = 0;

    for (let i = 0; i < texte.length; i++) {
        valeur = (valeur * 31 + texte.charCodeAt(i)) % 100000;
    }

    return valeur;
}


function silhouette(plante) {

    const graine = hachage(plante.nomVernaculaire + plante.groupe);

    const variation = (graine % 30) - 15;

    const fleurit = plante.floraison.length > 0;
    const fleur   = COULEURS_FLEURS[graine % COULEURS_FLEURS.length];

    if (plante.groupe === "Arbre") {
        return silhouetteArbre(graine, variation, fleurit, fleur);
    }

    if (plante.groupe === "Arbuste") {
        return silhouetteArbuste(graine, variation, fleurit, fleur);
    }

    return silhouetteVivace(graine, variation, fleurit, fleur);
}


function silhouetteArbre(graine, variation, fleurit, fleur) {

    const clair  = `hsl(${105 + variation}, 38%, 46%)`;
    const fonce  = `hsl(${105 + variation}, 40%, 32%)`;
    const forme  = graine % 3;

    let houppier = "";

    if (forme === 0) {
        // port arrondi
        houppier = `
            <ellipse cx="50" cy="44" rx="34" ry="32" fill="${fonce}"/>
            <ellipse cx="43" cy="38" rx="26" ry="24" fill="${clair}"/>
            <ellipse cx="62" cy="50" rx="20" ry="18" fill="${clair}" opacity=".75"/>`;
    } else if (forme === 1) {
        // port conique
        houppier = `
            <path d="M50 4 L82 78 H18 Z" fill="${fonce}"/>
            <path d="M50 16 L72 78 H30 Z" fill="${clair}"/>`;
    } else {
        // port étalé
        houppier = `
            <ellipse cx="50" cy="50" rx="40" ry="24" fill="${fonce}"/>
            <ellipse cx="40" cy="44" rx="27" ry="17" fill="${clair}"/>
            <ellipse cx="66" cy="52" rx="22" ry="14" fill="${clair}" opacity=".8"/>`;
    }

    const fleurs = fleurit
        ? `<circle cx="34" cy="40" r="4" fill="${fleur}"/>
           <circle cx="58" cy="32" r="3.4" fill="${fleur}"/>
           <circle cx="66" cy="52" r="3" fill="${fleur}" opacity=".85"/>`
        : "";

    return `
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M46 118 L47 70 H53 L54 118 Z" fill="#6b4a32"/>
            <path d="M50 78 L38 62 M50 74 L63 60" stroke="#6b4a32"
                  stroke-width="3.5" fill="none" stroke-linecap="round"/>
            ${houppier}
            ${fleurs}
        </svg>`;
}


function silhouetteArbuste(graine, variation, fleurit, fleur) {

    const clair = `hsl(${118 + variation}, 36%, 48%)`;
    const fonce = `hsl(${118 + variation}, 38%, 34%)`;

    const decalage = (graine % 7) - 3;

    const fleurs = fleurit
        ? `<circle cx="${30 + decalage}" cy="34" r="4.2" fill="${fleur}"/>
           <circle cx="56" cy="26" r="4.6" fill="${fleur}"/>
           <circle cx="72" cy="40" r="3.8" fill="${fleur}"/>
           <circle cx="44" cy="46" r="3.4" fill="${fleur}" opacity=".9"/>`
        : "";

    return `
        <svg viewBox="0 0 100 86" xmlns="http://www.w3.org/2000/svg">
            <path d="M48 84 V56 M48 64 L34 52 M48 62 L64 50" stroke="#6b4a32"
                  stroke-width="3" fill="none" stroke-linecap="round"/>
            <circle cx="${32 + decalage}" cy="46" r="24" fill="${fonce}"/>
            <circle cx="66" cy="48" r="22" fill="${fonce}"/>
            <circle cx="50" cy="34" r="24" fill="${clair}"/>
            <circle cx="${30 + decalage}" cy="44" r="17" fill="${clair}" opacity=".85"/>
            <circle cx="70" cy="46" r="15" fill="${clair}" opacity=".7"/>
            ${fleurs}
        </svg>`;
}


function silhouetteVivace(graine, variation, fleurit, fleur) {

    const clair = `hsl(${98 + variation}, 40%, 50%)`;
    const fonce = `hsl(${98 + variation}, 42%, 36%)`;

    const penche = (graine % 9) - 4;

    const fleurs = fleurit
        ? `<path d="M50 44 V20 M34 48 V28 M66 46 V26" stroke="${fonce}"
                 stroke-width="2.2" fill="none" stroke-linecap="round"/>
           <circle cx="50" cy="16" r="6" fill="${fleur}"/>
           <circle cx="34" cy="24" r="5" fill="${fleur}"/>
           <circle cx="66" cy="22" r="5" fill="${fleur}"/>`
        : "";

    return `
        <svg viewBox="0 0 100 72" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 70 C30 62 ${18 + penche} 46 16 30
                     C30 38 44 52 50 70 Z" fill="${fonce}"/>
            <path d="M50 70 C70 62 ${82 + penche} 46 84 30
                     C70 38 56 52 50 70 Z" fill="${fonce}"/>
            <path d="M50 70 C42 56 40 38 44 22
                     C52 36 56 54 50 70 Z" fill="${clair}"/>
            <path d="M50 70 C58 56 62 40 60 24
                     C54 38 48 54 50 70 Z" fill="${clair}"/>
            ${fleurs}
        </svg>`;
}


// ===============================
// VUES REELLES DU CHANTIER
// ===============================

const PHOTO_SECOURS = "image/jardintest.jpg";

function chargerScene(mission) {

    partie.vueScene = 0;
    creerBoutonsVues(mission);
    afficherVueChantier(0);
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

    const mission = MISSIONS[partie.missionCourante];
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

    if (partie.missionCourante === 0 && partie.phaseParking === "analyse") {
        dessinerPointsAnalyse(vue);
    } else {
        $("#scene-hotspots").innerHTML = "";
    }
}


// ===============================
// DESSINS : LES SITES
// ===============================

function dessinerScene(mission) {

    const decor = mission.decor;

    return `
    <svg viewBox="0 0 1000 560" preserveAspectRatio="none"
         xmlns="http://www.w3.org/2000/svg">

        <defs>
            <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="${decor.ciel[0]}"/>
                <stop offset="100%" stop-color="${decor.ciel[1]}"/>
            </linearGradient>
            <linearGradient id="sol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="${decor.sols[1]}"/>
                <stop offset="100%" stop-color="${decor.sols[0]}"/>
            </linearGradient>
        </defs>

        <rect width="1000" height="560" fill="url(#ciel)"/>

        ${dessinerSoleil(decor.soleil)}
        ${dessinerNuages(decor.soleil)}

        <!-- horizon lointain -->
        <path d="M0 300 C160 262 300 296 430 286 C560 276 700 250 830 268
                 C900 278 960 286 1000 282 V560 H0 Z"
              fill="#8fae86" opacity=".55"/>

        ${dessinerBatiment(decor.batiment)}

        <!-- sol principal -->
        <path d="M0 330 C180 312 340 340 520 334 C700 328 860 312 1000 326
                 V560 H0 Z" fill="url(#sol)"/>

        ${decor.pave   ? dessinerPave()   : ""}
        ${decor.eau    ? dessinerEau()    : ""}
        ${decor.rochers ? dessinerRochers() : ""}

        ${(decor.grandsArbres || []).map(dessinerGrandArbre).join("")}

        <!-- touffes d'herbe au premier plan -->
        ${dessinerHerbes(decor)}

    </svg>`;
}


function dessinerSoleil(intensite) {

    if (!intensite) {
        return `<circle cx="820" cy="96" r="52" fill="#ffffff" opacity=".28"/>`;
    }

    const eclat = intensite === "fort" ? ".85" : ".55";
    const rayon = intensite === "fort" ? 44 : 36;

    return `
        <circle cx="812" cy="92" r="${rayon + 46}" fill="#ffe9a8" opacity=".3"/>
        <circle cx="812" cy="92" r="${rayon + 20}" fill="#ffe9a8" opacity=".35"/>
        <circle cx="812" cy="92" r="${rayon}" fill="#ffd45e" opacity="${eclat}"/>`;
}


function dessinerNuages(intensite) {

    const opacite = intensite === "fort" ? ".45" : ".75";

    return `
        <g fill="#ffffff" opacity="${opacite}">
            <ellipse cx="180" cy="110" rx="86" ry="30"/>
            <ellipse cx="240" cy="96"  rx="58" ry="26"/>
            <ellipse cx="128" cy="98"  rx="44" ry="22"/>
            <ellipse cx="520" cy="72"  rx="66" ry="22"/>
            <ellipse cx="570" cy="62"  rx="42" ry="18"/>
        </g>`;
}


function dessinerBatiment(type) {

    if (type === "prau") {
        return `
            <g>
                <rect x="0" y="150" width="250" height="184" fill="#d8d2c4"/>
                <path d="M-10 150 H262 L240 118 H10 Z" fill="#b08063"/>
                <rect x="40" y="196" width="54" height="66" fill="#8fb3c4" rx="4"/>
                <rect x="140" y="196" width="54" height="66" fill="#8fb3c4" rx="4"/>
                <rect x="88" y="278" width="66" height="56" fill="#9c7a5c" rx="3"/>
            </g>`;
    }

    if (type === "village") {
        return `
            <g>
                <rect x="60" y="176" width="150" height="158" fill="#e3d9c8"/>
                <path d="M46 176 H224 L135 112 Z" fill="#b5654a"/>
                <rect x="240" y="206" width="120" height="128" fill="#d6cbb8"/>
                <path d="M228 206 H372 L300 156 Z" fill="#a85b43"/>
                <rect x="640" y="190" width="170" height="144" fill="#ded4c2"/>
                <path d="M626 190 H824 L725 130 Z" fill="#b5654a"/>
                <g fill="#7d9aa8">
                    <rect x="92" y="216" width="34" height="44" rx="3"/>
                    <rect x="150" y="216" width="34" height="44" rx="3"/>
                    <rect x="268" y="240" width="30" height="40" rx="3"/>
                    <rect x="676" y="226" width="36" height="46" rx="3"/>
                    <rect x="740" y="226" width="36" height="46" rx="3"/>
                </g>
            </g>`;
    }

    if (type === "mediatheque") {
        return `
            <g>
                <rect x="300" y="140" width="700" height="194" fill="#cfd6d4"/>
                <rect x="300" y="140" width="700" height="14" fill="#9aa5a2"/>
                <g fill="#9cc2d4" opacity=".92">
                    <rect x="330" y="172" width="120" height="146" rx="4"/>
                    <rect x="470" y="172" width="120" height="146" rx="4"/>
                    <rect x="610" y="172" width="120" height="146" rx="4"/>
                    <rect x="750" y="172" width="120" height="146" rx="4"/>
                    <rect x="890" y="172" width="90"  height="146" rx="4"/>
                </g>
                <g stroke="#ffffff" stroke-width="3" opacity=".5">
                    <path d="M330 240 H980"/>
                </g>
            </g>`;
    }

    return "";
}


function dessinerEau() {

    return `
        <g>
            <path d="M0 392 C180 366 340 400 520 396 C700 392 860 372 1000 388
                     V560 H0 Z" fill="#4b90ad"/>
            <path d="M0 392 C180 366 340 400 520 396 C700 392 860 372 1000 388
                     V430 C860 416 700 436 520 440 C340 444 180 410 0 436 Z"
                  fill="#6fb0c9" opacity=".7"/>
            <g stroke="#ffffff" stroke-width="3" opacity=".45" fill="none">
                <path d="M90 470 q30 -10 60 0 q30 10 60 0"/>
                <path d="M420 506 q30 -10 60 0 q30 10 60 0"/>
                <path d="M700 460 q30 -10 60 0 q30 10 60 0"/>
            </g>
        </g>`;
}


function dessinerRochers() {

    return `
        <g fill="#b0a48c">
            <path d="M60 470 L110 420 L176 468 L150 486 Z"/>
            <path d="M760 430 L806 392 L868 438 L830 456 Z" opacity=".9"/>
            <path d="M420 520 L470 484 L540 522 L500 540 Z" opacity=".8"/>
        </g>
        <g fill="#c9bda3" opacity=".7">
            <circle cx="260" cy="500" r="11"/>
            <circle cx="300" cy="514" r="8"/>
            <circle cx="620" cy="482" r="9"/>
            <circle cx="656" cy="498" r="12"/>
        </g>`;
}


function dessinerPave() {

    let pave = `<g stroke="#a89e8b" stroke-width="2" opacity=".5">`;

    for (let ligne = 0; ligne < 7; ligne++) {

        const y = 360 + ligne * 30;

        pave += `<path d="M0 ${y} H1000"/>`;

        for (let x = (ligne % 2) * 40; x < 1000; x += 80) {
            pave += `<path d="M${x} ${y} V${y + 30}"/>`;
        }
    }

    return pave + `</g>`;
}


function dessinerGrandArbre(arbre) {

    const e = arbre.echelle;

    return `
        <g transform="translate(${arbre.x} ${arbre.y}) scale(${e})">
            <path d="M-8 130 L-4 0 H8 L12 130 Z" fill="#5d4130"/>
            <path d="M0 40 L-40 8 M0 30 L44 2" stroke="#5d4130"
                  stroke-width="9" fill="none" stroke-linecap="round"/>
            <ellipse cx="0" cy="-16" rx="96" ry="76" fill="#2f5c39"/>
            <ellipse cx="-30" cy="-34" rx="62" ry="48" fill="#3d7245"/>
            <ellipse cx="42" cy="-6" rx="50" ry="40" fill="#3d7245" opacity=".8"/>
        </g>`;
}


function dessinerHerbes(decor) {

    let herbes = `<g fill="${decor.sols[1]}" opacity=".8">`;

    for (let x = -10; x < 1010; x += 46) {

        const h = 14 + ((x * 7) % 16);

        herbes += `<path d="M${x} 560 q6 -${h} 12 0 Z"/>`;
        herbes += `<path d="M${x + 18} 560 q5 -${h - 5} 10 0 Z"/>`;
    }

    return herbes + `</g>`;
}


// ===============================
// LE CATALOGUE
// ===============================

function construirePuces() {

    remplirPuces("#puces-exposition", EXPOSITIONS, "expositions");
    remplirPuces("#puces-humidite",   HUMIDITES,   "humidites");

    const groupes = [...new Set(plantes.map(plante => plante.groupe))].sort();

    const conteneur = $("#puces-groupe");

    conteneur.innerHTML = "";

    groupes.forEach(groupe => {

        const puce = document.createElement("button");

        puce.type = "button";
        puce.className = "puce";
        puce.textContent = groupe + "s";
        puce.setAttribute("aria-pressed", "false");

        puce.addEventListener("click", () => {

            filtres.groupe = (filtres.groupe === groupe) ? "" : groupe;

            conteneur.querySelectorAll(".puce").forEach(autre => {
                const actif = autre === puce && filtres.groupe === groupe;
                autre.classList.toggle("est-active", actif);
                autre.setAttribute("aria-pressed", actif ? "true" : "false");
            });

            afficherPlantes();
        });

        conteneur.appendChild(puce);
    });
}


function remplirPuces(selecteur, valeurs, cle) {

    const conteneur = $(selecteur);

    conteneur.innerHTML = "";

    valeurs.forEach(valeur => {

        const puce = document.createElement("button");

        puce.type = "button";
        puce.className = "puce";
        puce.dataset.valeur = valeur;
        puce.textContent = valeur.charAt(0).toUpperCase() + valeur.slice(1);
        puce.setAttribute("aria-pressed", "false");

        puce.addEventListener("click", () => {

            if (filtres[cle].has(valeur)) {
                filtres[cle].delete(valeur);
            } else {
                filtres[cle].add(valeur);
            }

            const actif = filtres[cle].has(valeur);

            puce.classList.toggle("est-active", actif);
            puce.setAttribute("aria-pressed", actif ? "true" : "false");

            afficherPlantes();
        });

        conteneur.appendChild(puce);
    });
}


function plantesFiltrees() {

    const recherche = filtres.recherche;

    return plantes.filter(plante => {

        const correspondRecherche =
            recherche === ""
            || plante.nomVernaculaire.toLowerCase().includes(recherche)
            || plante.nomScientifique.toLowerCase().includes(recherche);

        const correspondExposition =
            filtres.expositions.size === 0
            || [...filtres.expositions].some(valeur =>
                   plante.expositions.includes(valeur));

        const correspondHumidite =
            filtres.humidites.size === 0
            || [...filtres.humidites].some(valeur =>
                   plante.humidites.includes(valeur));

        const correspondGroupe =
            filtres.groupe === "" || plante.groupe === filtres.groupe;

        return correspondRecherche
            && correspondExposition
            && correspondHumidite
            && correspondGroupe;
    });
}


function afficherPlantes() {

    const liste      = plantesFiltrees();
    const conteneur  = $("#liste-plantes");
    const compteur   = $("#nombre-resultats");

    compteur.textContent = liste.length === 0
        ? "Aucune plante ne correspond"
        : liste.length + " plante(s) disponible(s)";

    conteneur.innerHTML = "";

    if (liste.length === 0) {

        conteneur.innerHTML = `
            <p class="message-vide">
                Aucun végétal ne coche toutes ces cases.<br>
                Essayez de retirer un filtre.
            </p>`;

        return;
    }

    const fragment = document.createDocumentFragment();

    liste.forEach(plante => {

        const carte = document.createElement("button");

        carte.type = "button";
        carte.className = "plante";
        carte.dataset.id = plante.id;

        if (partie.choix.includes(plante.id)) {
            carte.classList.add("est-utilisee");
        }

        carte.innerHTML = `
            <span class="plante-vignette">${silhouette(plante)}</span>

            <span class="plante-texte">
                <span class="plante-nom">${plante.nomVernaculaire}</span>
                <span class="plante-scientifique">
                    ${plante.nomScientifique || "—"}
                </span>
                <span class="plante-etiquettes">
                    <span class="mini est-groupe">${plante.groupe}</span>
                    <span class="mini est-expo">
                        ☀ ${plante.expositions.join(" · ") || "?"}
                    </span>
                    <span class="mini est-hum">
                        ≈ ${plante.humidites.join(" · ") || "?"}
                    </span>
                </span>
            </span>

            <span class="plante-ajout" aria-hidden="true">+</span>`;

        carte.addEventListener("click", () => planter(plante));

        fragment.appendChild(carte);
    });

    conteneur.appendChild(fragment);
}


// ===============================
// DEROULEMENT D'UN CHANTIER
// ===============================

function lancerMission(numero) {

    if (numero === 0) {
        lancerParkingAnalyse();
        return;
    }

    lancerMissionVegetal(numero);
}


function lancerParkingAnalyse() {

    partie.missionCourante = 0;
    partie.phaseParking = "analyse";
    partie.analyseTrouvee = new Set();
    partie.vueScene = 0;

    const mission = MISSIONS[0];
    const ecranJeu = $("#ecran-jeu");

    ecranJeu.classList.add("mode-parking-analyse");
    ecranJeu.classList.remove("mode-parking-amenagement");
    fermerAmenagementParking();

    $("#numero-mission").textContent = "Chantier 1 / 2";
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

    $("#scene-slots").innerHTML = "";

    chargerScene(mission);
    majAnalyseParking();
    majJauge();
    afficherEcran("jeu");

    setTimeout(() => message(
        "Commencez par la vue aérienne puis explorez les vues piétonnes."), 600);
}


function listePointsAnalyseParking() {

    const uniques = new Map();

    MISSIONS[0].vues.forEach(vue => {
        (vue.points || []).forEach(point => {
            if (!uniques.has(point.id)) uniques.set(point.id, point);
        });
    });

    return [...uniques.values()];
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
    $("#analyse-indice").textContent = point.indice;
    $("#analyse-texte").textContent = point.texte;

    majAnalyseParking();

    const mission = MISSIONS[0];
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
        score: 100,
        maximum: 100,
        ratio: 1,
        etoiles: 3
    };

    partie.resultats.push(resultat);
    partie.score += resultat.score;
    $("#score-courant").textContent = partie.score;
}


function passerAmenagementParking() {

    enregistrerResultatAnalyseParking();

    partie.phaseParking = "amenagement";

    const ecranJeu = $("#ecran-jeu");
    ecranJeu.classList.remove("mode-parking-analyse");
    ecranJeu.classList.add("mode-parking-amenagement");

    $("#phase-mission").textContent = "Aménagement";

    const mission = MISSIONS[0];

    $("#titre-mission").textContent =
        mission.titreAmenagement || "Parking — Aménagement";

    $("#brief-mission").textContent =
        mission.briefAmenagement ||
        "Le plan du parking est arrêté. À vous de choisir les revêtements et les arbres : les deux vues montrent le résultat en direct.";

    $("#instruction-phase").textContent =
        mission.instructionAmenagement ||
        "Pensez à l’eau de pluie et au milieu de chaque arbre : sol sec entre les places, humide dans la noue.";

    $("#conditions-mission").innerHTML =
        conditionsDepuisAdmin(
            mission.conditionsAmenagement,
            [
                "Analyse terminée",
                "≈ Infiltrer l’eau de pluie",
                "☀ Ombrager les places"
            ]
        );

    $("#scene-hotspots").innerHTML = "";
    $("#scene-slots").innerHTML = "";

    ouvrirAmenagementParking();
}


function lancerMissionVegetal(numero) {

    $("#ecran-jeu").classList.remove("mode-parking-analyse", "mode-parking-amenagement");
    fermerAmenagementParking();
    $("#phase-mission").textContent = "Aménagement";
    $("#instruction-phase").textContent = "Choisissez les végétaux adaptés au site puis validez votre composition.";

    partie.missionCourante = numero;
    partie.choix = new Array(MISSIONS[numero].emplacements.length).fill(null);
    partie.emplacementVise = 0;

    const mission = MISSIONS[numero];

    $("#numero-mission").textContent =
        "Chantier " + (numero + 1) + " / " + MISSIONS.length;

    $("#titre-mission").textContent = mission.titre;
    $("#brief-mission").textContent = mission.brief;

    $("#conditions-mission").innerHTML = `
        <span class="condition est-expo">
            ☀ ${mission.expositions.join(" ou ")}
        </span>
        <span class="condition est-hum">
            ≈ sol ${mission.humidites.join(" à ")}
        </span>
        <span class="condition">
            ⚑ ${resumerComposition(mission)}
        </span>`;

    partie.vueScene = 0;
    chargerScene(mission);

    dessinerEmplacements();
    majJauge();
    majProgression();
    afficherPlantes();

    afficherEcran("jeu");

    if (numero === 0) {
        setTimeout(() => message(
            "Touchez un emplacement sur le plan, puis une plante du catalogue."),
            700);
    }
}


function resumerComposition(mission) {

    const comptes = {};

    mission.emplacements.forEach(emplacement => {
        comptes[emplacement.groupe] = (comptes[emplacement.groupe] || 0) + 1;
    });

    return Object.entries(comptes)
        .map(([groupe, nombre]) =>
            nombre + " " + groupe.toLowerCase() + (nombre > 1 ? "s" : ""))
        .join(", ");
}


function dessinerEmplacements() {

    const mission   = MISSIONS[partie.missionCourante];
    const conteneur = $("#scene-slots");

    conteneur.innerHTML = "";

    mission.emplacements.forEach((emplacement, index) => {

        const bouton = document.createElement("button");

        bouton.type = "button";
        bouton.className = "emplacement";
        bouton.style.left  = emplacement.x + "%";
        bouton.style.top   = emplacement.y + "%";
        bouton.style.width = emplacement.taille + "%";

        const idPlante = partie.choix[index];

        if (idPlante === null) {

            bouton.innerHTML = `
                <span class="emplacement-trou">${emplacement.groupe}</span>`;

            bouton.setAttribute("aria-label",
                "Emplacement vide pour un " + emplacement.groupe.toLowerCase());

            if (index === partie.emplacementVise) {
                bouton.classList.add("est-vise");
            }

            bouton.addEventListener("click", () => {
                partie.emplacementVise = index;
                dessinerEmplacements();
                ouvrirCatalogue();
            });

        } else {

            const plante = plantes.find(p => p.id === idPlante);

            bouton.classList.add("est-plante");

            bouton.innerHTML = `
                <span class="emplacement-plante">${silhouette(plante)}</span>
                <span class="etiquette-plante">${plante.nomVernaculaire}</span>
                <span class="retirer" aria-label="Retirer cette plante">✕</span>`;

            bouton.addEventListener("click", (evenement) => {

                if (evenement.target.classList.contains("retirer")) {
                    retirer(index);
                    return;
                }

                partie.emplacementVise = index;
                dessinerEmplacements();
                ouvrirCatalogue();
            });
        }

        conteneur.appendChild(bouton);
    });
}


function planter(plante) {

    if (partie.choix.includes(plante.id)) {
        message("« " + plante.nomVernaculaire + " » est déjà sur le chantier.");
        return;
    }

    const emplacements = MISSIONS[partie.missionCourante].emplacements;

    let cible = -1;

    // 1. l'emplacement visé s'il est libre
    if (partie.choix[partie.emplacementVise] === null) {
        cible = partie.emplacementVise;
    }

    // 2. sinon un emplacement libre du même type de végétal
    if (cible === -1) {
        cible = partie.choix.findIndex((choix, index) =>
            choix === null && emplacements[index].groupe === plante.groupe);
    }

    // 3. sinon n'importe quel emplacement libre
    if (cible === -1) {
        cible = partie.choix.indexOf(null);
    }

    if (cible === -1) {
        message("Tous les emplacements sont plantés : validez le chantier.");
        return;
    }

    partie.choix[cible] = plante.id;

    const suivant = partie.choix.indexOf(null);
    partie.emplacementVise = suivant === -1 ? cible : suivant;

    if (emplacements[cible].groupe !== plante.groupe) {
        message("Attention : cet emplacement attend un " +
                emplacements[cible].groupe.toLowerCase() + ".");
    }

    dessinerEmplacements();
    majProgression();
    afficherPlantes();
}


function retirer(index) {

    partie.choix[index] = null;
    partie.emplacementVise = index;

    dessinerEmplacements();
    majProgression();
    afficherPlantes();
}


function majProgression() {

    const total   = partie.choix.length;
    const remplis = partie.choix.filter(choix => choix !== null).length;

    $("#progression").textContent =
        remplis + " / " + total + " emplacement" + (total > 1 ? "s" : "") +
        " planté" + (remplis > 1 ? "s" : "");

    $("#bouton-valider").disabled = remplis < total;
    $("#bouton-vider").disabled   = remplis === 0;
}


function majJauge() {

    const jauge = $("#jauge-etapes");

    jauge.innerHTML = "";

    MISSIONS.forEach((mission, index) => {

        const barre = document.createElement("span");

        if (index < partie.missionCourante)      barre.className = "est-faite";
        else if (index === partie.missionCourante) barre.className = "est-courante";

        jauge.appendChild(barre);
    });
}


// ===============================
// NOTATION DU CHANTIER
// ===============================

function evaluerChantier() {

    const mission = MISSIONS[partie.missionCourante];

    const lignes = partie.choix.map((idPlante, index) => {

        const plante      = plantes.find(p => p.id === idPlante);
        const emplacement = mission.emplacements[index];

        const expoOk = plante.expositions.some(valeur =>
            mission.expositions.includes(valeur));

        const humOk = plante.humidites.some(valeur =>
            mission.humidites.includes(valeur));

        const groupeOk = plante.groupe === emplacement.groupe;

        const points =
            (expoOk   ? POINTS_EXPOSITION : 0) +
            (humOk    ? POINTS_HUMIDITE   : 0) +
            (groupeOk ? POINTS_GROUPE     : 0);

        return { plante, emplacement, expoOk, humOk, groupeOk, points };
    });

    const moisFleuris = new Set();

    lignes.forEach(ligne =>
        ligne.plante.floraison.forEach(mois => moisFleuris.add(mois)));

    const bonus = Math.min(moisFleuris.size, BONUS_MOIS_MAX) * BONUS_PAR_MOIS;

    const score = lignes.reduce((total, ligne) => total + ligne.points, 0) + bonus;

    const maximum = lignes.length * 100 + BONUS_MOIS_MAX * BONUS_PAR_MOIS;

    const ratio = score / maximum;

    const etoiles = ratio >= 0.9 ? 3
                  : ratio >= 0.72 ? 2
                  : ratio >= 0.5 ? 1
                  : 0;

    return {
        titre: mission.titre,
        conseil: mission.conseil,
        lignes, bonus, moisFleuris: moisFleuris.size,
        score, maximum, ratio, etoiles
    };
}


function validerChantier() {

    const resultat = evaluerChantier();

    partie.resultats.push(resultat);
    partie.score += resultat.score;

    $("#score-courant").textContent = partie.score;

    afficherResultat(resultat);
}


function afficherResultat(resultat) {

    $("#resultat-etiquette").textContent =
        "Chantier " + (partie.missionCourante + 1) + " — " + resultat.titre;

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
    rendu.classList.toggle("est-visible", resultat.type === "amenagement-parking");
    renduPieton.classList.toggle("est-visible", resultat.type === "amenagement-parking");

    if (resultat.type === "amenagement-parking") {
        copierRenduParking(rendu, renduPieton, resultat.choix);
        $("#resultat-detail").innerHTML = detailParkingHTML(resultat);
    } else {
        afficherDetailVegetal(resultat);
    }

    $("#resultat-conseil").textContent = resultat.conseil;

    $("#bouton-suite").textContent =
        partie.missionCourante === MISSIONS.length - 1
            ? "Voir mon bilan →"
            : "Chantier suivant →";

    ouvrirFenetre("#voile-resultat");
}


function afficherDetailVegetal(resultat) {

    $("#resultat-detail").innerHTML =
        resultat.lignes.map(ligne => `
            <div class="ligne-detail">
                <span class="ligne-detail-nom">
                    ${ligne.plante.nomVernaculaire}
                    <small>${ligne.emplacement.groupe} attendu</small>
                </span>
                <span class="verdicts">
                    <span class="verdict ${ligne.expoOk ? "" : "est-faux"}"
                          title="Exposition">☀</span>
                    <span class="verdict ${ligne.humOk ? "" : "est-faux"}"
                          title="Humidité du sol">≈</span>
                    <span class="verdict ${ligne.groupeOk ? "" : "est-faux"}"
                          title="Type de végétal">✿</span>
                </span>
                <span class="ligne-detail-points">${ligne.points}</span>
            </div>`).join("")
        + `<div class="ligne-detail">
                <span class="ligne-detail-nom">
                    Bonus floraison
                    <small>${resultat.moisFleuris} mois de floraison couverts</small>
                </span>
                <span class="ligne-detail-points">${resultat.bonus}</span>
           </div>`;
}


function titreSelonRatio(ratio) {

    if (ratio >= 0.9)  return "Chantier exemplaire !";
    if (ratio >= 0.72) return "Beau travail";
    if (ratio >= 0.5)  return "Ça pousse, mais…";
    return "À revoir sur le terrain";
}


// ===============================
// BILAN FINAL
// ===============================

const RANGS = [
    { seuil: 0.95, nom: "Paysagiste d'exception",
      texte: "Lecture du site impeccable : chaque végétal est à sa place." },
    { seuil: 0.85, nom: "Concepteur confirmé",
      texte: "Vos palettes sont justes et cohérentes avec chaque milieu." },
    { seuil: 0.70, nom: "Apprenti paysagiste",
      texte: "De bons réflexes : surveillez encore l'humidité du sol." },
    { seuil: 0.50, nom: "Stagiaire motivé",
      texte: "Relisez bien la fiche de chantier avant de choisir vos plantes." },
    { seuil: 0,    nom: "Première saison",
      texte: "Les filtres du catalogue sont là pour vous : utilisez-les !" }
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

    $("#bilan-lignes").innerHTML = partie.resultats.map((resultat, index) => `
        <tr>
            <td>${index + 1}. ${resultat.titre}</td>
            <td>${resultat.score} / ${resultat.maximum}</td>
            <td>${"★".repeat(resultat.etoiles) || "—"}</td>
        </tr>`).join("");

    const parking = partie.resultats.find(resultat => resultat.type === "amenagement-parking");
    $("#bilan-rendu").classList.toggle("est-visible", Boolean(parking));

    if (parking) {
        copierRenduParking($("#bilan-rendu-canvas"), $("#bilan-rendu-pieton"), parking.choix);
    }

    $("#nom-joueur").value = "";
    $("#form-classement").style.display = "flex";

    afficherClassement();
    afficherEcran("bilan");
}


// ===============================
// CLASSEMENT (mémorisé sur l'appareil)
// ===============================

const CLE_CLASSEMENT = "apprenti-concepteur-classement";


function lireClassement() {

    try {
        return JSON.parse(localStorage.getItem(CLE_CLASSEMENT)) || [];
    } catch (erreur) {
        return [];
    }
}


function ecrireClassement(classement) {

    try {
        localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(classement));
    } catch (erreur) {
        console.warn("Classement non sauvegardé :", erreur);
    }
}


function afficherClassement(nouveau) {

    const classement = lireClassement()
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

    const liste = $("#classement");

    if (classement.length === 0) {

        liste.innerHTML =
            `<p class="classement-vide">
                Aucun score enregistré pour le moment.
             </p>`;

        return;
    }

    liste.innerHTML = classement.map((entree, index) => `
        <li class="${entree.date === nouveau ? "est-nouveau" : ""}">
            <span class="place">${index + 1}</span>
            <span class="qui">${entree.nom}</span>
            <span class="quand">${entree.date}</span>
            <span class="pts">${entree.score}</span>
        </li>`).join("");
}


function afficherMeilleurScore() {

    const classement = lireClassement();

    if (classement.length === 0) {
        $("#meilleur-score").textContent = "";
        return;
    }

    const meilleur = classement.reduce((a, b) => a.score >= b.score ? a : b);

    $("#meilleur-score").textContent =
        "Meilleur score sur cet appareil : " +
        meilleur.score + " pts — " + meilleur.nom;
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


function ouvrirCatalogue() {

    const catalogue = $("#catalogue");

    if (window.matchMedia("(max-width: 900px)").matches) {
        catalogue.classList.remove("est-repliee");
    }
}


// ===============================
// EVENEMENTS
// ===============================

// --- Accueil ---

$("#bouton-jouer").addEventListener("click", () => {

    partie.score = 0;
    partie.resultats = [];
    partie.analyseTrouvee = new Set();

    $("#score-courant").textContent = "0";

    lancerMission(0);
});

$("#bouton-regles").addEventListener("click", () => ouvrirFenetre("#voile-regles"));

$("#bouton-fermer-regles").addEventListener("click",
    () => fermerFenetre("#voile-regles"));


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


// --- Recherche et filtres ---

$("#recherche-plante").addEventListener("input", (evenement) => {

    filtres.recherche = evenement.target.value.toLowerCase().trim();

    afficherPlantes();
});


$("#reinitialiser-filtres").addEventListener("click", () => {

    filtres.recherche = "";
    filtres.expositions.clear();
    filtres.humidites.clear();
    filtres.groupe = "";

    $("#recherche-plante").value = "";

    document.querySelectorAll(".puce").forEach(puce => {
        puce.classList.remove("est-active");
        puce.setAttribute("aria-pressed", "false");
    });

    afficherPlantes();
});


$("#bouton-filtrer-chantier").addEventListener("click", () => {

    const mission = MISSIONS[partie.missionCourante];

    filtres.expositions = new Set(mission.expositions);
    filtres.humidites   = new Set(mission.humidites);

    document.querySelectorAll("#puces-exposition .puce").forEach(puce => {
        const actif = filtres.expositions.has(puce.dataset.valeur);
        puce.classList.toggle("est-active", actif);
        puce.setAttribute("aria-pressed", actif ? "true" : "false");
    });

    document.querySelectorAll("#puces-humidite .puce").forEach(puce => {
        const actif = filtres.humidites.has(puce.dataset.valeur);
        puce.classList.toggle("est-active", actif);
        puce.setAttribute("aria-pressed", actif ? "true" : "false");
    });

    $("#bloc-filtres").open = true;

    afficherPlantes();
    ouvrirCatalogue();

    message("Catalogue filtré selon les conditions du site.");
});


// --- Catalogue repliable (tablette / téléphone) ---

$(".catalogue-tete").addEventListener("click", () => {

    if (window.matchMedia("(max-width: 900px)").matches) {
        $("#catalogue").classList.toggle("est-repliee");
    }
});


// --- Actions du chantier ---

$("#bouton-vider").addEventListener("click", () => {

    partie.choix = partie.choix.map(() => null);
    partie.emplacementVise = 0;

    dessinerEmplacements();
    majProgression();
    afficherPlantes();
});


$("#bouton-valider").addEventListener("click", validerChantier);


$("#bouton-suite").addEventListener("click", () => {

    fermerFenetre("#voile-resultat");

    if (partie.missionCourante === MISSIONS.length - 1) {
        afficherBilan();
    } else {
        lancerMission(partie.missionCourante + 1);
    }
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

$("#form-classement").addEventListener("submit", (evenement) => {

    evenement.preventDefault();

    const nom = $("#nom-joueur").value.trim() || "Anonyme";

    const date = new Date().toLocaleDateString("fr-FR");

    const entree = { nom, score: partie.score, date };

    const classement = lireClassement();

    classement.push(entree);

    ecrireClassement(classement);

    $("#form-classement").style.display = "none";

    afficherClassement(date);

    message("Score enregistré : " + partie.score + " points.");
});


$("#bouton-rejouer").addEventListener("click", () => {

    partie.score = 0;
    partie.resultats = [];

    $("#score-courant").textContent = "0";

    afficherMeilleurScore();
    lancerMission(0);
});


$("#bouton-retour-accueil").addEventListener("click", () => {

    // On remet la partie en attente sans effacer le classement enregistré.
    partie.score = 0;
    partie.resultats = [];
    partie.analyseTrouvee = new Set();
    partie.choix = [];
    partie.emplacementVise = 0;

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
            : resultat.type === "amenagement-parking"
            ? detailParkingHTML(resultat)
            : resultat.lignes.map(ligne => `
                <div class="ligne-detail">
                    <span class="ligne-detail-nom">
                        ${ligne.plante.nomVernaculaire}
                        <small>${ligne.plante.groupe} ·
                            ${ligne.plante.expositions.join(", ")} ·
                            ${ligne.plante.humidites.join(", ")}</small>
                    </span>
                    <span class="ligne-detail-points">${ligne.points}</span>
                </div>`).join("");

        return `
            <div class="detail-chantier">
                <h3>${index + 1}. ${resultat.titre}</h3>
                <p class="detail-sous">
                    ${resultat.score} / ${resultat.maximum} points ·
                    ${"★".repeat(resultat.etoiles) || "aucune étoile"}
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
        fermerFenetre("#voile-regles");
        fermerFenetre("#voile-detail");
        fermerFenetre("#voile-admin");
        fermerFenetre("#voile-analyse");
    }
});


// --- Démarrage ---

afficherMeilleurScore();
