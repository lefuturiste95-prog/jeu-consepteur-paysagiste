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
// LES CINQ CHANTIERS
// ===============================

const MISSIONS = [

    {
        titre: "La cour de l'école",
        photo: "image/chantier-1.jpg",
        brief: "Une cour orientée au nord, à l'ombre du préau et de deux grands " +
               "tilleuls. Le sol reste frais toute l'année. L'équipe pédagogique " +
               "veut un coin de nature qui tienne sans arrosage l'été.",
        expositions: ["ombre", "mi-ombre"],
        humidites: ["frais"],
        conseil: "En situation d'ombre, on cherche des végétaux de sous-bois : " +
                 "feuillage ample, floraison précoce avant la feuillaison des arbres.",
        decor: {
            ciel: ["#b9cfd8", "#e4ecec"],
            sols: ["#6d8f5c", "#587a4b"],
            soleil: false,
            batiment: "prau",
            grandsArbres: [
                { x: 120, y: 330, echelle: 1.35 },
                { x: 880, y: 320, echelle: 1.2 }
            ]
        },
        emplacements: [
            { groupe: "Arbre",   x: 50, y: 66, taille: 19 },
            { groupe: "Arbuste", x: 24, y: 76, taille: 13 },
            { groupe: "Arbuste", x: 76, y: 76, taille: 13 },
            { groupe: "Vivace",  x: 38, y: 89, taille: 9 },
            { groupe: "Vivace",  x: 62, y: 89, taille: 9 }
        ]
    },

    {
        titre: "La berge du ruisseau",
        photo: "image/chantier-2.jpg",
        brief: "Le long d'un ruisseau, la terre est gorgée d'eau une bonne partie " +
               "de l'année et la berge s'érode. La commune demande une végétation " +
               "qui tienne le talus et supporte les pieds dans l'eau.",
        expositions: ["mi-ombre", "soleil"],
        humidites: ["très humide", "humide"],
        conseil: "Les sols très humides réclament des espèces de ripisylve " +
                 "(aulne, saule, viorne obier, cornouiller) : leurs racines " +
                 "fixent la berge.",
        decor: {
            ciel: ["#8fc0d8", "#dcecec"],
            sols: ["#5f8f56", "#4b7a48"],
            soleil: "doux",
            eau: true,
            grandsArbres: [
                { x: 930, y: 300, echelle: 1.1 }
            ]
        },
        emplacements: [
            { groupe: "Arbre",   x: 22, y: 60, taille: 19 },
            { groupe: "Arbuste", x: 48, y: 66, taille: 13 },
            { groupe: "Arbuste", x: 70, y: 70, taille: 13 },
            { groupe: "Vivace",  x: 36, y: 78, taille: 9 }
        ]
    },

    {
        titre: "Le talus plein sud",
        photo: "image/chantier-3.jpg",
        brief: "Un remblai en pente exposé plein sud, caillouteux et très drainant. " +
               "L'eau ne s'y arrête jamais et la roche affleure. Objectif : zéro " +
               "arrosage après la reprise.",
        expositions: ["soleil", "plein soleil"],
        humidites: ["sec", "très sec"],
        conseil: "En terrain sec et chaud, la palette méditerranéenne s'impose : " +
                 "feuillage gris, petites feuilles, végétaux aromatiques.",
        decor: {
            ciel: ["#8ec4de", "#f4e7c9"],
            sols: ["#c2a266", "#a98a52"],
            soleil: "fort",
            rochers: true
        },
        emplacements: [
            { groupe: "Arbre",   x: 74, y: 58, taille: 18 },
            { groupe: "Arbuste", x: 30, y: 66, taille: 12 },
            { groupe: "Arbuste", x: 52, y: 72, taille: 12 },
            { groupe: "Vivace",  x: 18, y: 84, taille: 9 },
            { groupe: "Vivace",  x: 44, y: 90, taille: 9 }
        ]
    },

    {
        titre: "La place du village",
        photo: "image/chantier-4.jpg",
        brief: "Une place minérale à réaménager. Le soleil tape du matin au soir " +
               "sur les pavés, mais la terre des fosses de plantation reste fraîche. " +
               "On attend de l'ombre portée sur les bancs.",
        expositions: ["plein soleil"],
        humidites: ["frais"],
        conseil: "Sur une place, l'arbre fait le projet : c'est lui qui apporte " +
                 "l'ombre et rafraîchit l'air. On le choisit pour son port et " +
                 "sa tenue en milieu urbain.",
        decor: {
            ciel: ["#79b9dd", "#eef0e2"],
            sols: ["#cdc4b2", "#b8ae9a"],
            soleil: "fort",
            batiment: "village",
            pave: true
        },
        emplacements: [
            { groupe: "Arbre",   x: 27, y: 64, taille: 20 },
            { groupe: "Arbre",   x: 68, y: 62, taille: 20 },
            { groupe: "Arbuste", x: 46, y: 80, taille: 12 },
            { groupe: "Vivace",  x: 16, y: 88, taille: 9 },
            { groupe: "Vivace",  x: 84, y: 86, taille: 9 }
        ]
    },

    {
        titre: "Le jardin de la médiathèque",
        photo: "image/chantier-5.jpg",
        brief: "Au pied d'une façade vitrée orientée est : soleil du matin, ombre " +
               "l'après-midi. Le sol, enrichi lors du chantier, reste humide et " +
               "frais. Le public traverse ce jardin tous les jours.",
        expositions: ["ombre", "mi-ombre"],
        humidites: ["humide", "frais"],
        conseil: "Un jardin très regardé demande de l'intérêt en toutes saisons : " +
                 "on étale les floraisons et on mise sur les feuillages persistants.",
        decor: {
            ciel: ["#a8cadb", "#eaf0e6"],
            sols: ["#6b9159", "#557c4a"],
            soleil: "doux",
            batiment: "mediatheque",
            grandsArbres: [
                { x: 60, y: 340, echelle: 1.1 }
            ]
        },
        emplacements: [
            { groupe: "Arbre",   x: 82, y: 62, taille: 18 },
            { groupe: "Arbuste", x: 32, y: 70, taille: 12 },
            { groupe: "Arbuste", x: 56, y: 72, taille: 12 },
            { groupe: "Vivace",  x: 16, y: 84, taille: 9 },
            { groupe: "Vivace",  x: 42, y: 88, taille: 9 },
            { groupe: "Vivace",  x: 68, y: 90, taille: 9 }
        ]
    }

];

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
    modeScene: "mixte"
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
// PHOTO + PLAN / TOPOGRAPHIE
// ===============================

const PHOTO_SECOURS = "image/jardintest.jpg";

function chargerScene(mission) {

    const photo = $("#scene-photo");

    // On tente la photo propre au chantier. Si elle n'existe pas encore,
    // le projet reste jouable avec l'image de secours actuelle.
    photo.onerror = () => {
        if (!photo.src.endsWith("jardintest.jpg")) {
            photo.src = PHOTO_SECOURS;
        }
    };

    photo.src = mission.photo || PHOTO_SECOURS;
    photo.alt = "Photo du site — " + mission.titre;

    $("#scene-svg").innerHTML = dessinerScene(mission);

    definirModeScene(partie.modeScene);
}

function definirModeScene(mode) {

    const modes = ["photo", "mixte", "plan"];
    partie.modeScene = modes.includes(mode) ? mode : "mixte";

    const scene = $("#scene");
    scene.classList.remove("mode-photo", "mode-mixte", "mode-plan");
    scene.classList.add("mode-" + partie.modeScene);

    document.querySelectorAll(".scene-mode").forEach(bouton => {
        const actif = bouton.dataset.mode === partie.modeScene;
        bouton.classList.toggle("est-actif", actif);
        bouton.setAttribute("aria-pressed", actif ? "true" : "false");
    });
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

    partie.modeScene = "mixte";
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

    $("#resultat-conseil").textContent = resultat.conseil;

    $("#bouton-suite").textContent =
        partie.missionCourante === MISSIONS.length - 1
            ? "Voir mon bilan →"
            : "Chantier suivant →";

    ouvrirFenetre("#voile-resultat");
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

    $("#score-courant").textContent = "0";

    lancerMission(0);
});

$("#bouton-regles").addEventListener("click", () => ouvrirFenetre("#voile-regles"));

$("#bouton-fermer-regles").addEventListener("click",
    () => fermerFenetre("#voile-regles"));


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


// --- Photo / Mixte / Plan ---

document.querySelectorAll(".scene-mode").forEach(bouton => {

    bouton.addEventListener("click", () => {
        definirModeScene(bouton.dataset.mode);
    });
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


$("#bouton-revoir").addEventListener("click", () => {

    $("#detail-partie").innerHTML = partie.resultats.map((resultat, index) => `
        <div class="detail-chantier">
            <h3>${index + 1}. ${resultat.titre}</h3>
            <p class="detail-sous">
                ${resultat.score} / ${resultat.maximum} points ·
                ${"★".repeat(resultat.etoiles) || "aucune étoile"}
            </p>
            <div class="detail-plantes">
                ${resultat.lignes.map(ligne => `
                    <div class="ligne-detail">
                        <span class="ligne-detail-nom">
                            ${ligne.plante.nomVernaculaire}
                            <small>${ligne.plante.groupe} ·
                                ${ligne.plante.expositions.join(", ")} ·
                                ${ligne.plante.humidites.join(", ")}</small>
                        </span>
                        <span class="ligne-detail-points">${ligne.points}</span>
                    </div>`).join("")}
            </div>
        </div>`).join("");

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
    }
});


// --- Démarrage ---

afficherMeilleurScore();
