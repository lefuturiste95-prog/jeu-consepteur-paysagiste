/* ==========================================================
   L'APPRENTI CONCEPTEUR — ADMINISTRATION
   Version : chantiers + points d'analyse + classement + sauvegarde
   ========================================================== */


// ===============================
// PROTECTION DE LA PAGE
// ===============================

// Protection contre les accès accidentels.
// Sur un site statique, cela ne remplace pas une vraie authentification serveur.
if (sessionStorage.getItem("adminAutorise") !== "oui") {
    window.location.replace("index.html");
}


// ===============================
// CONSTANTES
// ===============================

const CLE_CONFIG = "apprenti-concepteur-config";
const CLE_CLASSEMENT = "apprenti-concepteur-classement";

const CONFIG_PAR_DEFAUT = {
    version: 1,
    chantiers: [
        {
            titre: "Création du parking",

            brief:
                "Une zone actuellement enherbée doit être transformée en parking " +
                "pour augmenter le nombre de places disponibles pour le personnel " +
                "et les étudiants. Avant de concevoir, commencez par analyser le site.",

            conseil:
                "L’analyse du site doit guider les futurs choix de matériaux, " +
                "de gestion de l’eau et de végétation.",

            titreAnalyse: "Parking — Analyse du site",

            instructionAnalyse:
                "Touchez les yeux sur les différentes vues pour découvrir " +
                "les informations utiles au projet.",

            conditionsAnalyse: [
                "≈ 3 270 m² de zone de projet",
                "≈ cours d’eau au sud",
                "Terrain actuellement enherbé"
            ],

            titreAmenagement: "Parking — Aménagement",

            briefAmenagement:
                "L’analyse est terminée. Cette vue montre pour l’instant " +
                "une proposition d’aménagement provisoire du futur parking.",

            instructionAmenagement:
                "Les choix de matériaux, de gestion de l’eau et de végétaux " +
                "seront ajoutés dans une prochaine étape.",

            conditionsAmenagement: [
                "Analyse terminée",
                "Gestion de l’eau à intégrer",
                "Aménagement provisoire"
            ],

            imageAmenagement:
                "image/parking/vue-amenagement-provisoire.png",

            vues: [
                {
                    id: "aerienne",
                    label: "Vue aérienne",
                    image: "image/parking/vue-aerienne.png",
                    ratio: "16 / 9",

                    points: [
                        {
                            id: "surface",
                            x: 52,
                            y: 48,
                            titre: "Emprise du projet",
                            indice:
                                "Regardez la surface indiquée au centre de la vue aérienne.",
                            texte:
                                "La zone de projet représente environ 3 270 m². " +
                                "Cette surface devra accueillir le stationnement, " +
                                "les circulations et les espaces paysagers."
                        },
                        {
                            id: "cours-eau",
                            x: 64,
                            y: 88,
                            titre: "Cours d’eau au sud",
                            indice:
                                "Observez la limite sud de la parcelle.",
                            texte:
                                "Un petit cours d’eau passe au sud du site et rejoint " +
                                "le Noir Riez. La gestion des eaux pluviales devra donc " +
                                "être prise en compte dans l’aménagement."
                        },
                        {
                            id: "acces",
                            x: 20,
                            y: 38,
                            titre: "Accès existant",
                            indice:
                                "Repérez les surfaces déjà circulées à proximité du terrain.",
                            texte:
                                "Le site est directement voisin d’une voirie existante. " +
                                "Cet accès constitue un point important pour organiser " +
                                "l’entrée et la circulation du futur parking."
                        },
                        {
                            id: "lisiere",
                            x: 86,
                            y: 54,
                            titre: "Lisière végétale",
                            indice:
                                "Regardez la bordure droite de la parcelle.",
                            texte:
                                "Une végétation arborée borde une partie du site. " +
                                "Elle participe au paysage existant et doit être prise " +
                                "en compte dans la conception."
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
                            id: "acces",
                            x: 56,
                            y: 70,
                            titre: "Accès existant",
                            indice:
                                "Regardez la voie au premier plan.",
                            texte:
                                "La voie existante permet de comprendre comment le futur " +
                                "parking pourra être raccordé aux circulations déjà présentes."
                        },
                        {
                            id: "terrain",
                            x: 43,
                            y: 49,
                            titre: "Terrain actuel",
                            indice:
                                "Observez la parcelle derrière la voie.",
                            texte:
                                "Le terrain est aujourd’hui non aménagé et majoritairement " +
                                "enherbé. Le projet va donc transformer une surface " +
                                "actuellement perméable."
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
                            id: "terrain",
                            x: 50,
                            y: 66,
                            titre: "Terrain actuel",
                            indice:
                                "Regardez la couverture du sol sur l’ensemble de la parcelle.",
                            texte:
                                "La parcelle est actuellement couverte d’une végétation " +
                                "herbacée. Cette situation sert de point de départ pour " +
                                "réfléchir à l’imperméabilisation et à la végétalisation " +
                                "du futur parking."
                        },
                        {
                            id: "lisiere",
                            x: 86,
                            y: 50,
                            titre: "Lisière végétale",
                            indice:
                                "Observez les arbres sur les côtés et au fond de l’image.",
                            texte:
                                "Les arbres et la végétation périphérique donnent déjà " +
                                "une structure paysagère au site. Le futur aménagement " +
                                "devra dialoguer avec cet environnement."
                        }
                    ]
                }
            ]
        },

        {
            titre: "Zone 6",

            brief:
                "Le long d'un ruisseau, la terre est gorgée d'eau une bonne partie " +
                "de l'année et la berge s'érode. La commune demande une végétation " +
                "qui tienne le talus et supporte les pieds dans l'eau.",

            conseil:
                "Les sols très humides réclament des espèces adaptées à la ripisylve.",

            vues: [
                {
                    id: "principale",
                    label: "Vue principale",
                    image: "image/chantier-2.jpg",
                    ratio: "16 / 9",
                    points: []
                }
            ]
        }
    ]
};


// ===============================
// ETAT
// ===============================

let config = lireConfig();
let chantierCourant = 0;
let vueCourante = 0;
let pointSelectionne = -1;
let modePlacement = null;
let actionConfirmee = null;
let timerMessage = null;


// ===============================
// RACCOURCIS DOM
// ===============================

const $ = (selecteur) => document.querySelector(selecteur);


// ===============================
// OUTILS GENERAUX
// ===============================

function copie(objet) {
    return JSON.parse(JSON.stringify(objet));
}


function borner(nombre, minimum, maximum) {

    const valeur = Number(nombre);

    if (!Number.isFinite(valeur)) {
        return minimum;
    }

    return Math.min(maximum, Math.max(minimum, valeur));
}


function texte(texteBrut) {

    const element = document.createElement("div");
    element.textContent = String(texteBrut ?? "");

    return element.innerHTML;
}


function lireConfig() {

    try {

        const donnee = JSON.parse(localStorage.getItem(CLE_CONFIG));

        if (
            donnee &&
            Array.isArray(donnee.chantiers) &&
            donnee.chantiers.length >= 2
        ) {
            return donnee;
        }

    } catch (erreur) {
        console.warn("Configuration admin illisible :", erreur);
    }

    return copie(CONFIG_PAR_DEFAUT);
}


function sauvegarderConfig(message = "Modifications enregistrées") {

    localStorage.setItem(CLE_CONFIG, JSON.stringify(config));

    $("#etat-sauvegarde").textContent = "Enregistré";
    afficherMessage(message);
}


function afficherMessage(message) {

    const zone = $("#message-admin");

    zone.textContent = message;
    zone.classList.add("est-visible");

    clearTimeout(timerMessage);

    timerMessage = setTimeout(() => {
        zone.classList.remove("est-visible");
    }, 2200);
}


function listeDepuisChamp(valeur) {

    return String(valeur || "")
        .split("|")
        .map(item => item.trim())
        .filter(Boolean);
}


function champDepuisListe(liste) {

    return Array.isArray(liste)
        ? liste.join(" | ")
        : "";
}


function identifiantDepuisTitre(titre) {

    const base = String(titre || "point")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const vue = obtenirVue();

    const deja = new Set((vue?.points || []).map(point => point.id));

    let id = base || "point";
    let numero = 2;

    while (deja.has(id)) {
        id = (base || "point") + "-" + numero;
        numero += 1;
    }

    return id;
}


// ===============================
// NAVIGATION ENTRE PANNEAUX
// ===============================

document.querySelectorAll(".onglet-admin").forEach(bouton => {

    bouton.addEventListener("click", () => {

        const nom = bouton.dataset.panneau;

        document.querySelectorAll(".onglet-admin").forEach(element => {
            element.classList.toggle(
                "est-actif",
                element.dataset.panneau === nom
            );
        });

        document.querySelectorAll("[data-panneau-contenu]").forEach(element => {
            element.classList.toggle(
                "est-actif",
                element.dataset.panneauContenu === nom
            );
        });

        if (nom === "analyse") {
            rechargerEditeurAnalyse();
        }

        if (nom === "classement") {
            afficherClassementAdmin();
        }
    });
});


// ===============================
// CHANTIERS
// ===============================

function obtenirChantier(index = chantierCourant) {

    return config.chantiers[index];
}


function chargerFormulaireChantier() {

    chantierCourant = Number($("#select-chantier").value) || 0;

    const chantier = obtenirChantier();

    $("#chantier-titre").value = chantier.titre || "";
    $("#chantier-brief").value = chantier.brief || "";
    $("#chantier-conseil").value = chantier.conseil || "";

    const parking = chantierCourant === 0;

    $("#reglages-parking").style.display = parking ? "block" : "none";

    if (parking) {

        $("#parking-titre-analyse").value =
            chantier.titreAnalyse || "Parking — Analyse du site";

        $("#parking-instruction-analyse").value =
            chantier.instructionAnalyse || "";

        $("#parking-conditions-analyse").value =
            champDepuisListe(chantier.conditionsAnalyse);

        $("#parking-titre-amenagement").value =
            chantier.titreAmenagement || "Parking — Aménagement";

        $("#parking-image-amenagement").value =
            chantier.imageAmenagement || "";

        $("#parking-brief-amenagement").value =
            chantier.briefAmenagement || "";

        $("#parking-instruction-amenagement").value =
            chantier.instructionAmenagement || "";

        $("#parking-conditions-amenagement").value =
            champDepuisListe(chantier.conditionsAmenagement);

        mettreAJourApercuAmenagement();
    }
}


function enregistrerFormulaireChantier() {

    const chantier = obtenirChantier();

    chantier.titre =
        $("#chantier-titre").value.trim() || chantier.titre || "Chantier";

    chantier.brief =
        $("#chantier-brief").value.trim();

    chantier.conseil =
        $("#chantier-conseil").value.trim();

    if (chantierCourant === 0) {

        chantier.titreAnalyse =
            $("#parking-titre-analyse").value.trim()
            || "Parking — Analyse du site";

        chantier.instructionAnalyse =
            $("#parking-instruction-analyse").value.trim();

        chantier.conditionsAnalyse =
            listeDepuisChamp($("#parking-conditions-analyse").value);

        chantier.titreAmenagement =
            $("#parking-titre-amenagement").value.trim()
            || "Parking — Aménagement";

        chantier.imageAmenagement =
            $("#parking-image-amenagement").value.trim();

        chantier.briefAmenagement =
            $("#parking-brief-amenagement").value.trim();

        chantier.instructionAmenagement =
            $("#parking-instruction-amenagement").value.trim();

        chantier.conditionsAmenagement =
            listeDepuisChamp($("#parking-conditions-amenagement").value);
    }

    sauvegarderConfig("Chantier enregistré");

    synchroniserSelecteursChantiers();
    chargerFormulaireChantier();
}


function mettreAJourApercuAmenagement() {

    const image = $("#apercu-amenagement");
    const chemin = $("#parking-image-amenagement").value.trim();

    image.onerror = () => {
        image.onerror = null;
        image.src = "image/jardintest.jpg";
    };

    image.src = chemin || "image/jardintest.jpg";
}


$("#select-chantier").addEventListener("change", chargerFormulaireChantier);

$("#enregistrer-chantier")
    .addEventListener("click", enregistrerFormulaireChantier);

$("#parking-image-amenagement")
    .addEventListener("input", mettreAJourApercuAmenagement);


// ===============================
// SYNCHRONISATION DES SELECTEURS
// ===============================

function synchroniserSelecteursChantiers() {

    const selectPrincipal = $("#select-chantier");
    const selectAnalyse = $("#analyse-chantier");

    const indexPrincipal = Number(selectPrincipal.value) || 0;
    const indexAnalyse = Number(selectAnalyse.value) || 0;

    [selectPrincipal, selectAnalyse].forEach(select => {

        select.innerHTML = "";

        config.chantiers.forEach((chantier, index) => {

            const option = document.createElement("option");

            option.value = index;
            option.textContent = chantier.titre || ("Chantier " + (index + 1));

            select.appendChild(option);
        });
    });

    selectPrincipal.value =
        String(Math.min(indexPrincipal, config.chantiers.length - 1));

    selectAnalyse.value =
        String(Math.min(indexAnalyse, config.chantiers.length - 1));
}


// ===============================
// VUES
// ===============================

function obtenirVue() {

    const chantier = config.chantiers[chantierCourant];

    if (!chantier || !Array.isArray(chantier.vues)) {
        return null;
    }

    return chantier.vues[vueCourante] || null;
}


function chargerListeVues() {

    const select = $("#analyse-vue");
    const chantier = obtenirChantier();

    if (!Array.isArray(chantier.vues)) {
        chantier.vues = [];
    }

    if (chantier.vues.length === 0) {

        chantier.vues.push({
            id: "principale",
            label: "Vue principale",
            image: "image/jardintest.jpg",
            ratio: "16 / 9",
            points: []
        });

        sauvegarderConfig("Une vue principale a été créée");
    }

    vueCourante = Math.min(vueCourante, chantier.vues.length - 1);

    select.innerHTML = "";

    chantier.vues.forEach((vue, index) => {

        const option = document.createElement("option");

        option.value = index;
        option.textContent = vue.label || ("Vue " + (index + 1));

        select.appendChild(option);
    });

    select.value = String(vueCourante);
}


function chargerFormulaireVue() {

    const vue = obtenirVue();

    if (!vue) {
        return;
    }

    $("#vue-label").value = vue.label || "";
    $("#vue-image").value = vue.image || "";
    $("#vue-ratio").value = vue.ratio || "16 / 9";

    $("#apercu-site").style.aspectRatio = vue.ratio || "16 / 9";

    const image = $("#apercu-site-image");

    image.onerror = () => {
        image.onerror = null;
        image.src = "image/jardintest.jpg";
    };

    image.src = vue.image || "image/jardintest.jpg";
    image.alt = vue.label || "Vue du chantier";

    pointSelectionne = -1;
    modePlacement = null;

    majModePlacement();
    afficherPointsVue();
    viderFormulairePoint();
}


function enregistrerVue() {

    const vue = obtenirVue();

    if (!vue) {
        return;
    }

    vue.label =
        $("#vue-label").value.trim() || "Vue";

    vue.image =
        $("#vue-image").value.trim() || "image/jardintest.jpg";

    vue.ratio =
        $("#vue-ratio").value || "16 / 9";

    sauvegarderConfig("Vue enregistrée");

    chargerListeVues();
    chargerFormulaireVue();
}


function ajouterVue() {

    const chantier = obtenirChantier();

    chantier.vues.push({
        id: "vue-" + Date.now(),
        label: "Nouvelle vue",
        image: "image/jardintest.jpg",
        ratio: "16 / 9",
        points: []
    });

    vueCourante = chantier.vues.length - 1;

    sauvegarderConfig("Nouvelle vue créée");

    chargerListeVues();
    chargerFormulaireVue();
}


function supprimerVue() {

    const chantier = obtenirChantier();

    if (chantier.vues.length <= 1) {

        afficherMessage("Un chantier doit garder au moins une vue");
        return;
    }

    const vue = obtenirVue();

    demanderConfirmation(
        "Supprimer cette vue ?",
        `La vue « ${vue?.label || "sélectionnée"} » et ses points seront supprimés.`,
        () => {

            chantier.vues.splice(vueCourante, 1);

            vueCourante = Math.max(
                0,
                Math.min(vueCourante, chantier.vues.length - 1)
            );

            sauvegarderConfig("Vue supprimée");

            chargerListeVues();
            chargerFormulaireVue();
        }
    );
}


$("#analyse-chantier").addEventListener("change", () => {

    chantierCourant = Number($("#analyse-chantier").value) || 0;
    vueCourante = 0;

    chargerListeVues();
    chargerFormulaireVue();
});


$("#analyse-vue").addEventListener("change", () => {

    vueCourante = Number($("#analyse-vue").value) || 0;
    chargerFormulaireVue();
});


$("#enregistrer-vue").addEventListener("click", enregistrerVue);
$("#ajouter-vue").addEventListener("click", ajouterVue);
$("#supprimer-vue").addEventListener("click", supprimerVue);


// Aperçu en direct du chemin / ratio
$("#vue-image").addEventListener("input", () => {

    const chemin = $("#vue-image").value.trim();

    $("#apercu-site-image").src =
        chemin || "image/jardintest.jpg";
});


$("#vue-ratio").addEventListener("change", () => {
    $("#apercu-site").style.aspectRatio = $("#vue-ratio").value;
});


// ===============================
// POINTS D'ANALYSE
// ===============================

function pointsVue() {

    const vue = obtenirVue();

    if (!vue) {
        return [];
    }

    if (!Array.isArray(vue.points)) {
        vue.points = [];
    }

    return vue.points;
}


function afficherPointsVue() {

    const conteneur = $("#apercu-points");
    const liste = $("#liste-points");

    conteneur.innerHTML = "";
    liste.innerHTML = "";

    const points = pointsVue();

    if (points.length === 0) {

        liste.innerHTML = `
            <div class="liste-vide">
                Aucun point sur cette vue.
            </div>`;
    }

    points.forEach((point, index) => {

        const bouton = document.createElement("button");

        bouton.type = "button";
        bouton.className =
            "point-apercu" +
            (index === pointSelectionne ? " est-selectionne" : "");

        bouton.style.left = borner(point.x, 0, 100) + "%";
        bouton.style.top = borner(point.y, 0, 100) + "%";

        bouton.textContent = "👁";
        bouton.title = point.titre || "Point d'analyse";

        bouton.addEventListener("click", evenement => {

            evenement.stopPropagation();

            selectionnerPoint(index);
        });

        conteneur.appendChild(bouton);


        const ligne = document.createElement("button");

        ligne.type = "button";
        ligne.className =
            "bouton-point-liste" +
            (index === pointSelectionne ? " est-selectionne" : "");

        ligne.innerHTML = `
            <span class="icone">👁</span>
            <span>
                <strong>${texte(point.titre || "Sans titre")}</strong>
                <br>
                <small>${texte(point.id || "sans-identifiant")}</small>
            </span>
            <small>${Math.round(Number(point.x) || 0)}% / ${Math.round(Number(point.y) || 0)}%</small>
        `;

        ligne.addEventListener("click", () => {
            selectionnerPoint(index);
        });

        liste.appendChild(ligne);
    });
}


function selectionnerPoint(index) {

    const points = pointsVue();

    if (!points[index]) {
        return;
    }

    pointSelectionne = index;
    modePlacement = null;

    const point = points[index];

    $("#titre-editeur-point").textContent =
        point.titre || "Point d'analyse";

    $("#formulaire-point").classList.remove("est-inactif");

    $("#point-id").value = point.id || "";
    $("#point-titre").value = point.titre || "";
    $("#point-indice").value = point.indice || "";
    $("#point-texte").value = point.texte || "";
    $("#point-x").value = borner(point.x, 0, 100);
    $("#point-y").value = borner(point.y, 0, 100);

    $("#deplacer-point").disabled = false;

    majModePlacement();
    afficherPointsVue();
}


function viderFormulairePoint() {

    $("#titre-editeur-point").textContent =
        "Aucun point sélectionné";

    $("#formulaire-point").classList.add("est-inactif");

    $("#point-id").value = "";
    $("#point-titre").value = "";
    $("#point-indice").value = "";
    $("#point-texte").value = "";
    $("#point-x").value = "";
    $("#point-y").value = "";

    $("#deplacer-point").disabled = true;
}


function ajouterPoint() {

    modePlacement = "ajout";
    pointSelectionne = -1;

    viderFormulairePoint();
    majModePlacement();

    $("#aide-clic").textContent =
        "Clique maintenant sur l'endroit exact où tu veux placer le nouvel œil.";
}


function demanderDeplacementPoint() {

    if (pointSelectionne < 0) {
        return;
    }

    modePlacement = "deplacement";

    majModePlacement();

    $("#aide-clic").textContent =
        "Clique sur l'image pour déplacer le point sélectionné.";
}


function majModePlacement() {

    const actif =
        modePlacement === "ajout" ||
        modePlacement === "deplacement";

    $("#apercu-site").classList.toggle("est-placement", actif);

    const zone = $("#mode-placement");

    zone.classList.toggle("est-actif", actif);

    if (modePlacement === "ajout") {
        zone.textContent = "Placement d'un nouveau point";
    } else if (modePlacement === "deplacement") {
        zone.textContent = "Déplacement du point";
    } else {
        zone.textContent = "Mode normal";
    }
}


$("#apercu-site").addEventListener("click", evenement => {

    if (!modePlacement) {
        return;
    }

    const rectangle =
        $("#apercu-site").getBoundingClientRect();

    const x = borner(
        ((evenement.clientX - rectangle.left) / rectangle.width) * 100,
        0,
        100
    );

    const y = borner(
        ((evenement.clientY - rectangle.top) / rectangle.height) * 100,
        0,
        100
    );

    if (modePlacement === "ajout") {

        const points = pointsVue();

        points.push({
            id: identifiantDepuisTitre("nouveau-point"),
            x: Number(x.toFixed(1)),
            y: Number(y.toFixed(1)),
            titre: "Nouveau point",
            indice: "",
            texte: ""
        });

        pointSelectionne = points.length - 1;

        sauvegarderConfig("Point créé");

        selectionnerPoint(pointSelectionne);

        $("#point-titre").focus();

    } else if (modePlacement === "deplacement") {

        const point = pointsVue()[pointSelectionne];

        if (!point) {
            return;
        }

        point.x = Number(x.toFixed(1));
        point.y = Number(y.toFixed(1));

        sauvegarderConfig("Point déplacé");

        modePlacement = null;

        selectionnerPoint(pointSelectionne);
    }

    $("#aide-clic").textContent =
        "Clique sur un œil pour le modifier.";
});


function enregistrerPoint() {

    if (pointSelectionne < 0) {
        return;
    }

    const point = pointsVue()[pointSelectionne];

    if (!point) {
        return;
    }

    const titrePoint =
        $("#point-titre").value.trim() || "Point d'analyse";

    point.id =
        $("#point-id").value.trim()
        || identifiantDepuisTitre(titrePoint);

    point.titre = titrePoint;
    point.indice = $("#point-indice").value.trim();
    point.texte = $("#point-texte").value.trim();

    point.x = Number(
        borner($("#point-x").value, 0, 100).toFixed(1)
    );

    point.y = Number(
        borner($("#point-y").value, 0, 100).toFixed(1)
    );

    sauvegarderConfig("Point enregistré");

    selectionnerPoint(pointSelectionne);
}


function supprimerPoint() {

    if (pointSelectionne < 0) {
        return;
    }

    const point = pointsVue()[pointSelectionne];

    demanderConfirmation(
        "Supprimer ce point ?",
        `Le point « ${point?.titre || "sélectionné"} » sera retiré de cette vue.`,
        () => {

            pointsVue().splice(pointSelectionne, 1);

            pointSelectionne = -1;
            modePlacement = null;

            sauvegarderConfig("Point supprimé");

            afficherPointsVue();
            viderFormulairePoint();
            majModePlacement();
        }
    );
}


$("#ajouter-point").addEventListener("click", ajouterPoint);

$("#deplacer-point")
    .addEventListener("click", demanderDeplacementPoint);

$("#enregistrer-point")
    .addEventListener("click", enregistrerPoint);

$("#supprimer-point")
    .addEventListener("click", supprimerPoint);


// Mise à jour visuelle des coordonnées sans attendre Enregistrer.
["#point-x", "#point-y"].forEach(selecteur => {

    $(selecteur).addEventListener("input", () => {

        if (pointSelectionne < 0) {
            return;
        }

        const point = pointsVue()[pointSelectionne];

        point.x = borner($("#point-x").value, 0, 100);
        point.y = borner($("#point-y").value, 0, 100);

        afficherPointsVue();
    });
});


// ===============================
// RECHARGEMENT DE L'EDITEUR
// ===============================

function rechargerEditeurAnalyse() {

    chantierCourant =
        Number($("#analyse-chantier").value) || 0;

    vueCourante = 0;

    chargerListeVues();
    chargerFormulaireVue();
}


// ===============================
// CLASSEMENT
// ===============================

function lireClassement() {

    try {
        return JSON.parse(localStorage.getItem(CLE_CLASSEMENT)) || [];
    } catch (erreur) {
        return [];
    }
}


function ecrireClassement(classement) {

    localStorage.setItem(
        CLE_CLASSEMENT,
        JSON.stringify(classement)
    );
}


function afficherClassementAdmin() {

    const zone = $("#admin-classement");

    const classement = lireClassement()
        .map((entree, indexOriginal) => ({
            ...entree,
            indexOriginal
        }))
        .sort((a, b) => b.score - a.score);

    zone.innerHTML = "";

    if (classement.length === 0) {

        zone.innerHTML = `
            <div class="classement-vide">
                Aucun score enregistré sur cet appareil.
            </div>`;

        return;
    }

    classement.forEach((entree, position) => {

        const ligne = document.createElement("div");

        ligne.className = "ligne-score";

        ligne.innerHTML = `
            <span class="place">${position + 1}</span>
            <span class="nom">${texte(entree.nom || "Anonyme")}</span>
            <span class="date">${texte(entree.date || "")}</span>
            <span class="score">${Number(entree.score) || 0} pts</span>

            <button class="supprimer-score"
                    type="button"
                    data-index="${entree.indexOriginal}">
                Supprimer
            </button>
        `;

        zone.appendChild(ligne);
    });


    document.querySelectorAll(".supprimer-score")
        .forEach(bouton => {

            bouton.addEventListener("click", () => {

                const index =
                    Number(bouton.dataset.index);

                const classementActuel =
                    lireClassement();

                const entree =
                    classementActuel[index];

                demanderConfirmation(
                    "Supprimer ce score ?",
                    `Le score de ${entree?.nom || "ce joueur"} sera supprimé.`,
                    () => {

                        const nouveauClassement =
                            lireClassement();

                        nouveauClassement.splice(index, 1);

                        ecrireClassement(nouveauClassement);

                        afficherClassementAdmin();

                        afficherMessage("Score supprimé");
                    }
                );
            });
        });
}


$("#effacer-classement").addEventListener("click", () => {

    const classement = lireClassement();

    if (classement.length === 0) {

        afficherMessage("Le classement est déjà vide");
        return;
    }

    demanderConfirmation(
        "Effacer tout le classement ?",
        "Tous les scores enregistrés sur cet appareil seront supprimés.",
        () => {

            localStorage.removeItem(CLE_CLASSEMENT);

            afficherClassementAdmin();

            afficherMessage("Classement effacé");
        }
    );
});


// ===============================
// EXPORT / IMPORT
// ===============================

$("#exporter-config").addEventListener("click", () => {

    const contenu =
        JSON.stringify(config, null, 2);

    const blob =
        new Blob(
            [contenu],
            { type: "application/json;charset=utf-8" }
        );

    const url =
        URL.createObjectURL(blob);

    const lien =
        document.createElement("a");

    lien.href = url;
    lien.download =
        "configuration-apprenti-concepteur.json";

    document.body.appendChild(lien);

    lien.click();
    lien.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    afficherMessage("Configuration exportée");
});


$("#importer-config").addEventListener("change", evenement => {

    const fichier =
        evenement.target.files?.[0];

    if (!fichier) {
        return;
    }

    const lecteur =
        new FileReader();

    lecteur.onload = () => {

        try {

            const donnee =
                JSON.parse(String(lecteur.result || ""));

            if (
                !donnee ||
                !Array.isArray(donnee.chantiers) ||
                donnee.chantiers.length < 2
            ) {
                throw new Error("Format incorrect");
            }

            config = donnee;

            sauvegarderConfig("Configuration importée");

            initialiserInterface();

        } catch (erreur) {

            afficherMessage(
                "Le fichier JSON n'est pas une configuration valide"
            );
        }

        evenement.target.value = "";
    };

    lecteur.readAsText(fichier);
});


$("#reinitialiser-config").addEventListener("click", () => {

    demanderConfirmation(
        "Réinitialiser la configuration ?",
        "Les modifications faites dans l'administration seront remplacées par les réglages de cette version.",
        () => {

            config =
                copie(CONFIG_PAR_DEFAUT);

            localStorage.removeItem(CLE_CONFIG);

            initialiserInterface();

            afficherMessage("Configuration réinitialisée");
        }
    );
});


// ===============================
// CONFIRMATIONS
// ===============================

const voileConfirmation =
    $("#voile-confirmation");

const confirmationTitre =
    $("#confirmation-titre");

const confirmationTexte =
    $("#confirmation-texte");


function demanderConfirmation(titre, texteConfirmation, action) {

    confirmationTitre.textContent = titre;
    confirmationTexte.textContent = texteConfirmation;

    actionConfirmee = action;

    voileConfirmation.classList.add("est-ouvert");
}


function fermerConfirmation() {

    voileConfirmation.classList.remove("est-ouvert");
    actionConfirmee = null;
}


$("#confirmation-annuler")
    .addEventListener("click", fermerConfirmation);


$("#confirmation-valider")
    .addEventListener("click", () => {

        const action = actionConfirmee;

        fermerConfirmation();

        if (typeof action === "function") {
            action();
        }
    });


voileConfirmation.addEventListener("click", evenement => {

    if (evenement.target === voileConfirmation) {
        fermerConfirmation();
    }
});


document.addEventListener("keydown", evenement => {

    if (evenement.key === "Escape") {

        fermerConfirmation();

        if (modePlacement) {
            modePlacement = null;
            majModePlacement();

            $("#aide-clic").textContent =
                "Clique sur un œil pour le modifier.";
        }
    }
});


// ===============================
// NAVIGATION
// ===============================

$("#bouton-retour-jeu")
    .addEventListener("click", () => {
        window.location.href = "index.html";
    });


$("#bouton-deconnexion")
    .addEventListener("click", () => {

        sessionStorage.removeItem("adminAutorise");

        window.location.href = "index.html";
    });


// ===============================
// DEMARRAGE
// ===============================

function initialiserInterface() {

    synchroniserSelecteursChantiers();

    $("#select-chantier").value = "0";
    $("#analyse-chantier").value = "0";

    chantierCourant = 0;
    vueCourante = 0;
    pointSelectionne = -1;
    modePlacement = null;

    chargerFormulaireChantier();
    chargerListeVues();
    chargerFormulaireVue();
    afficherClassementAdmin();

    $("#etat-sauvegarde").textContent =
        localStorage.getItem(CLE_CONFIG)
            ? "Configuration personnalisée"
            : "Réglages d'origine";
}


initialiserInterface();
