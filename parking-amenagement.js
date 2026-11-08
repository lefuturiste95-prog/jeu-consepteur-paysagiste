/* ==========================================================
   CHANTIER PARKING — PHASE AMENAGEMENT
   Choix des revêtements et des arbres, rendu en direct sur la
   vue aérienne, notation et affichage du résultat.
   Dépend de script.js (partie, plantes, $, message…) et de
   rendu-parking.js (PLAN_PARKING, REVETEMENTS, dessinerRenduParking).
   ========================================================== */


// Milieux de plantation : ce que chaque emplacement impose à l'arbre
const MILIEUX_PARKING = {
    bande: {
        nom: "Bande plantée entre les places",
        resume: "plein soleil, sol tassé plutôt sec",
        expositions: ["soleil", "plein soleil"],
        humidites: ["frais", "sec"]
    },
    noue: {
        nom: "Noue au bord du ruisseau",
        resume: "sol humide, parfois gorgé d'eau",
        expositions: ["mi-ombre", "soleil"],
        humidites: ["humide", "très humide"]
    }
};

const BONUS_PAR_ESSENCE = 10;
const BONUS_ESSENCES_MAX = 6;


function nouveauChoixParking() {
    return {
        voie: null,
        places: null,
        arbres: PLAN_PARKING.emplacementsArbres.map(() => null),
        vise: 0,
        recherche: "",
        vue: "aerienne"
    };
}


// ===============================
// OUVERTURE DE LA PHASE
// ===============================

function ouvrirAmenagementParking() {

    partie.parking = nouveauChoixParking();

    $("#ecran-jeu").classList.add("rendu-parking-actif");
    $("#recherche-arbre").value = "";

    construireBoutonsVuesParking();

    construireChoixRevetements();
    afficherListeArbres();
    majAmenagementParking();
}


function construireBoutonsVuesParking() {

    const conteneur = $("#scene-outils");
    conteneur.innerHTML = "";

    [["aerienne", "Vue aérienne"], ["pieton", "Vue piétonne"]].forEach(([vue, libelle]) => {

        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "scene-mode";
        bouton.textContent = libelle;
        bouton.dataset.vue = vue;

        bouton.addEventListener("click", () => {
            partie.parking = { ...partie.parking, vue };
            majAmenagementParking();
        });

        conteneur.appendChild(bouton);
    });
}


function majBoutonsVuesParking() {

    const { vue } = partie.parking;
    const dimensions = vue === "pieton" ? CAMERA_PIETON : RENDU;

    $("#scene").style.aspectRatio = dimensions.largeur + " / " + dimensions.hauteur;

    document.querySelectorAll("#scene-outils .scene-mode").forEach(bouton => {
        const actif = bouton.dataset.vue === vue;
        bouton.classList.toggle("est-actif", actif);
        bouton.setAttribute("aria-pressed", actif ? "true" : "false");
    });
}


function fermerAmenagementParking() {
    $("#ecran-jeu").classList.remove("rendu-parking-actif");
    $("#scene-arbres").innerHTML = "";
}


// ===============================
// CHOIX DES REVETEMENTS
// ===============================

function construireChoixRevetements() {

    [["voie", "#choix-voie"], ["places", "#choix-places"]].forEach(([zone, selecteur]) => {

        const conteneur = $(selecteur);
        conteneur.innerHTML = "";

        REVETEMENTS.forEach(revetement => {

            const puce = document.createElement("button");
            puce.type = "button";
            puce.className = "puce";
            puce.textContent = revetement.nom;

            puce.addEventListener("click", () => {
                partie.parking = { ...partie.parking, [zone]: revetement.id };
                conteneur.querySelectorAll(".puce").forEach(autre =>
                    autre.classList.toggle("est-active", autre === puce));
                majAmenagementParking();
            });

            conteneur.appendChild(puce);
        });
    });
}


// ===============================
// CHOIX DES ARBRES
// ===============================

function arbresDuCatalogue() {

    const recherche = partie.parking.recherche;

    return plantes
        .filter(plante => plante.groupe === "Arbre")
        .filter(plante => !recherche ||
            (plante.nomVernaculaire + " " + plante.nomScientifique).toLowerCase().includes(recherche))
        .sort((a, b) => a.nomVernaculaire.localeCompare(b.nomVernaculaire, "fr"));
}


function afficherListeArbres() {

    const conteneur = $("#liste-arbres");
    conteneur.innerHTML = "";

    arbresDuCatalogue().forEach(plante => {

        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "arbre-choix";
        bouton.innerHTML = `
            <strong>${echapperConfigHTML(plante.nomVernaculaire)}</strong>
            <small>${echapperConfigHTML(plante.nomScientifique)}</small>`;

        bouton.addEventListener("click", () => planterArbreParking(plante));
        conteneur.appendChild(bouton);
    });
}


function planterArbreParking(plante) {

    const { arbres, vise } = partie.parking;
    const nouveauxArbres = arbres.map((arbre, index) => index === vise ? plante : arbre);

    // On passe au prochain emplacement vide, s'il en reste
    const suivant = nouveauxArbres.indexOf(null);

    partie.parking = {
        ...partie.parking,
        arbres: nouveauxArbres,
        vise: suivant === -1 ? vise : suivant
    };

    majAmenagementParking();
}


function viserEmplacement(index) {
    partie.parking = { ...partie.parking, vise: index };
    majAmenagementParking();
}


function retirerArbreParking(index) {

    partie.parking = {
        ...partie.parking,
        arbres: partie.parking.arbres.map((arbre, i) => i === index ? null : arbre),
        vise: index
    };

    majAmenagementParking();
}


function dessinerEmplacementsArbres() {

    const conteneur = $("#scene-arbres");
    conteneur.innerHTML = "";

    // Les emplacements ne se touchent que sur le plan vu du ciel
    if (partie.parking.vue === "pieton") return;

    PLAN_PARKING.emplacementsArbres.forEach((emplacement, index) => {

        const { x, y } = positionEmplacementPourcent(emplacement);
        const plante = partie.parking.arbres[index];
        const bouton = document.createElement("button");

        bouton.type = "button";
        bouton.className = "repere-arbre";
        bouton.classList.toggle("est-plante", Boolean(plante));
        bouton.classList.toggle("est-vise", index === partie.parking.vise);
        bouton.style.left = x + "%";
        bouton.style.top = y + "%";
        bouton.textContent = plante ? "" : String(index + 1);
        bouton.title = plante ? plante.nomVernaculaire : MILIEUX_PARKING[emplacement.milieu].nom;
        bouton.setAttribute("aria-label", plante
            ? "Emplacement " + (index + 1) + " : " + plante.nomVernaculaire
            : "Emplacement " + (index + 1) + " vide");

        bouton.addEventListener("click", () => viserEmplacement(index));
        conteneur.appendChild(bouton);
    });
}


function majEmplacementCourant() {

    const { vise, arbres } = partie.parking;
    const emplacement = PLAN_PARKING.emplacementsArbres[vise];
    const milieu = MILIEUX_PARKING[emplacement.milieu];
    const plante = arbres[vise];

    $("#emplacement-courant").innerHTML = `
        <strong>Emplacement ${vise + 1} — ${milieu.nom}</strong>
        <span>${milieu.resume}</span>
        ${plante ? `<span class="arbre-plante">
            ${echapperConfigHTML(plante.nomVernaculaire)}
            <button type="button" class="bouton-retirer-arbre" id="retirer-arbre">Retirer</button>
        </span>` : ""}`;

    const boutonRetirer = $("#retirer-arbre");
    if (boutonRetirer) {
        boutonRetirer.addEventListener("click", () => retirerArbreParking(vise));
    }
}


// ===============================
// MISE A JOUR DE LA VUE
// ===============================

let renduEnCours = Promise.resolve();


function majAmenagementParking() {

    const { voie, places, arbres } = partie.parking;
    const nombrePlantes = arbres.filter(Boolean).length;
    const complet = Boolean(voie && places) && nombrePlantes === arbres.length;

    $("#compteur-arbres").textContent = nombrePlantes + " / " + arbres.length;
    $("#bouton-valider-parking").disabled = !complet;

    majBoutonsVuesParking();
    dessinerEmplacementsArbres();
    majEmplacementCourant();

    // Les rendus s'enchaînent : le dernier choix est toujours celui affiché
    const choix = partie.parking;
    renduEnCours = renduEnCours
        .then(() => (choix.vue === "pieton" ? dessinerRenduPieton : dessinerRenduParking)($("#scene-rendu"), choix))
        .catch(erreur => {
            console.error("Rendu du parking impossible :", erreur);
            message("La vue aérienne n'a pas pu être dessinée.");
        });
}


// ===============================
// NOTATION
// ===============================

function evaluerParking() {

    const { voie, places, arbres } = partie.parking;
    const revetementVoie = REVETEMENTS.find(r => r.id === voie);
    const revetementPlaces = REVETEMENTS.find(r => r.id === places);

    const lignesRevetements = [
        { zone: "Voies", revetement: revetementVoie, points: revetementVoie.voie },
        { zone: "Places", revetement: revetementPlaces, points: revetementPlaces.places }
    ];

    const lignesArbres = PLAN_PARKING.emplacementsArbres.map((emplacement, index) => {

        const plante = arbres[index];
        const milieu = MILIEUX_PARKING[emplacement.milieu];
        const expoOk = plante.expositions.some(valeur => milieu.expositions.includes(valeur));
        const humOk = plante.humidites.some(valeur => milieu.humidites.includes(valeur));
        const points = (expoOk ? POINTS_EXPOSITION : 0) + (humOk ? POINTS_HUMIDITE : 0) + POINTS_GROUPE;

        return { plante, milieu, expoOk, humOk, points };
    });

    const essences = new Set(arbres.map(plante => plante.id)).size;
    const bonus = Math.min(essences, BONUS_ESSENCES_MAX) * BONUS_PAR_ESSENCE;

    const score = [...lignesRevetements, ...lignesArbres]
        .reduce((total, ligne) => total + ligne.points, 0) + bonus;
    const maximum = 200 + lignesArbres.length * 100 + BONUS_ESSENCES_MAX * BONUS_PAR_ESSENCE;
    const ratio = score / maximum;

    return {
        type: "amenagement-parking",
        titre: "Parking — Aménagement",
        conseil: "Un parking paysager infiltre la pluie là où elle tombe et choisit " +
                 "chaque arbre selon son milieu : sec et ensoleillé entre les places, humide dans la noue.",
        choix: { ...partie.parking },
        lignesRevetements, lignesArbres, essences, bonus,
        score, maximum, ratio,
        etoiles: ratio >= 0.9 ? 3 : ratio >= 0.72 ? 2 : ratio >= 0.5 ? 1 : 0
    };
}


function detailParkingHTML(resultat) {

    const revetements = resultat.lignesRevetements.map(ligne => `
        <div class="ligne-detail">
            <span class="ligne-detail-nom">
                ${ligne.zone} : ${ligne.revetement.nom}
                <small>${ligne.revetement.avis}</small>
            </span>
            <span class="ligne-detail-points">${ligne.points}</span>
        </div>`).join("");

    const arbres = resultat.lignesArbres.map((ligne, index) => `
        <div class="ligne-detail">
            <span class="ligne-detail-nom">
                ${index + 1}. ${echapperConfigHTML(ligne.plante.nomVernaculaire)}
                <small>${ligne.milieu.nom} · ${ligne.milieu.resume}</small>
            </span>
            <span class="verdicts">
                <span class="verdict ${ligne.expoOk ? "" : "est-faux"}" title="Exposition">☀</span>
                <span class="verdict ${ligne.humOk ? "" : "est-faux"}" title="Humidité du sol">≈</span>
            </span>
            <span class="ligne-detail-points">${ligne.points}</span>
        </div>`).join("");

    const pluriel = resultat.essences > 1 ? "s" : "";

    return revetements + arbres + `
        <div class="ligne-detail">
            <span class="ligne-detail-nom">
                Bonus diversité
                <small>${resultat.essences} essence${pluriel} différente${pluriel}</small>
            </span>
            <span class="ligne-detail-points">${resultat.bonus}</span>
        </div>`;
}


// ===============================
// VALIDATION ET RESULTAT
// ===============================

function validerParking() {

    const resultat = evaluerParking();

    partie.resultats.push(resultat);
    partie.score += resultat.score;
    $("#score-courant").textContent = partie.score;

    afficherResultat(resultat);
}


/** Dessine les deux vues d'un parking validé (fenêtre de résultat, bilan). */
function copierRenduParking(canvasAerien, canvasPieton, choix) {
    return Promise.all([
        dessinerRenduParking(canvasAerien, choix),
        dessinerRenduPieton(canvasPieton, choix)
    ]).catch(erreur => console.error("Rendu du parking impossible :", erreur));
}


$("#bouton-valider-parking").addEventListener("click", validerParking);

$("#recherche-arbre").addEventListener("input", (evenement) => {
    partie.parking = { ...partie.parking, recherche: evenement.target.value.toLowerCase().trim() };
    afficherListeArbres();
});
