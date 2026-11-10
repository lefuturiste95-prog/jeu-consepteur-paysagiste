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
        nom: "Bande centrale entre les places",
        resume: "Soleil · sol frais à sec",
        expositions: ["soleil", "plein soleil"],
        humidites: ["frais", "sec"]
    },
    lisiere: {
        nom: "Bordure devant les places",
        resume: "Soleil · sol drainé, frais à sec",
        expositions: ["soleil", "plein soleil"],
        humidites: ["frais", "sec", "très sec"]
    },
    noue: {
        nom: "Noue au bord du ruisseau",
        resume: "Soleil ou mi-ombre · sol humide à très humide",
        expositions: ["mi-ombre", "soleil", "plein soleil"],
        humidites: ["humide", "très humide"]
    }
};

const EMPLACEMENTS_PARKING = [
    ...PLAN_PARKING.emplacementsArbres.map((emplacement, index) =>
        ({ ...emplacement, index, groupe: "Arbre", cle: "arbres", repere: "A" + (index + 1) })),
    ...PLAN_PARKING.emplacementsVivaces.map((emplacement, index) =>
        ({ ...emplacement, index, groupe: "Vivace", cle: "vivaces", repere: "V" + (index + 1) }))
];


const BONUS_PAR_ESSENCE = 10;
const BONUS_ESSENCES_MAX = 6;


function nouveauChoixParking() {
    return {
        voie: null,
        places: null,
        arbres: PLAN_PARKING.emplacementsArbres.map(() => null),
        vivaces: PLAN_PARKING.emplacementsVivaces.map(() => null),
        vise: 0,
        candidat: null,
        recherche: "",
        vue: "aerienne"
    };
}


// ===============================
// OUVERTURE DE LA PHASE
// ===============================

function ouvrirAmenagementParking() {

    partie.parking ??= nouveauChoixParking();

    $("#ecran-jeu").classList.add("rendu-parking-actif");
    $("#recherche-plantation").value = partie.parking.recherche;

    construireBoutonsVuesParking();

    construireChoixRevetements();
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
    $("#scene-rendu").setAttribute("aria-label", vue === "pieton"
        ? "Vue piétonne de votre aménagement" : "Vue aérienne de votre aménagement");

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
        const menu = $(selecteur);
        const invite = new Option("Choisir un revêtement", "");
        invite.disabled = true;
        menu.replaceChildren(invite, ...REVETEMENTS.map(revetement =>
            new Option(revetement.nom, revetement.id)));
        menu.value = partie.parking[zone] ?? "";
        menu.onchange = () => {
            partie.parking = { ...partie.parking, [zone]: menu.value };
            majAmenagementParking();
        };
    });
}


// ===============================
// CHOIX DES ARBRES
// ===============================

function compatibilitePlantation(plante, milieu) {
    return {
        expoOk: plante.expositions.some(exposition => milieu.expositions.includes(exposition)),
        humOk: plante.humidites.some(humidite => milieu.humidites.includes(humidite))
    };
}


function notationPlantation(plante, milieu) {
    const { expoOk, humOk } = compatibilitePlantation(plante, milieu);
    const points = POINTS_GROUPE + (expoOk ? POINTS_EXPOSITION : 0) + (humOk ? POINTS_HUMIDITE : 0);
    return { expoOk, humOk, points };
}


function afficherFichePlantation() {
    const { vise, candidat } = partie.parking;
    const emplacement = EMPLACEMENTS_PARKING[vise];
    const plante = candidat || partie.parking[emplacement.cle][emplacement.index];
    const fiche = $("#fiche-plantation");
    $("#bouton-planter").disabled = !candidat;
    if (!plante) {
        fiche.textContent = "Sélectionne une plante pour voir ses besoins et les points possibles.";
        return;
    }

    const milieu = MILIEUX_PARKING[emplacement.milieu];
    const { expoOk, humOk, points } = notationPlantation(plante, milieu);
    const texte = echapperConfigHTML;
    const valeurs = liste => texte(liste.join(", ") || "Non renseigné");
    const origine = plante.source || "";
    const source = /^https:\/\/(?:www\.)?smitsbv\.nl\//.test(origine) ? "Smits" :
        /^https:\/\/(?:www\.)?willemsefrance\.fr\//.test(origine) ? "Willemse" : "";
    const statut = (liste, ok) => liste.length ? (ok ? "compatible" : "à revoir") : "non évalué";
    fiche.innerHTML = `
        <strong>${texte(plante.nomVernaculaire)}</strong>
        ${plante.nomScientifique ? `<em>${texte(plante.nomScientifique)}</em>` : ""}
        <dl>
            <dt>Type</dt><dd>${texte(plante.type || plante.groupe)}</dd>
            ${plante.hauteurAdulte ? `<dt>Hauteur adulte</dt><dd>${texte(plante.hauteurAdulte)}</dd>` : ""}
            <dt>Exposition</dt><dd>${valeurs(plante.expositions)} <b>· ${statut(plante.expositions, expoOk)}</b></dd>
            <dt>Humidité du sol</dt><dd>${valeurs(plante.humidites)} <b>· ${statut(plante.humidites, humOk)}</b></dd>
            <dt>Floraison</dt><dd>${valeurs(plante.floraison)}</dd>
        </dl>
        ${plante.note ? `<p><b>À retenir</b> · ${texte(plante.note)}</p>` : ""}
        ${source ? `<p><a href="${texte(plante.source)}" target="_blank" rel="noopener noreferrer">Fiche source · ${source}</a></p>` : ""}
        <p><b>${points}/100 points</b> pour le repère ${emplacement.repere}
            <small>(40 exposition · 40 sol · 20 type de plante)</small>
        </p>`;
}


function normaliserRecherchePlantation(texte) {
    return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}


function afficherMenuPlantation() {
    const { vise, recherche } = partie.parking;
    const emplacement = EMPLACEMENTS_PARKING[vise];
    const milieu = MILIEUX_PARKING[emplacement.milieu];
    const menu = $("#choix-plantation");
    const options = plantes
        .filter(plante => plante.groupe === emplacement.groupe &&
            normaliserRecherchePlantation(plante.nomVernaculaire + " " + plante.nomScientifique).includes(recherche))
        .map(plante => ({ plante, points: notationPlantation(plante, milieu).points }))
        .filter(({ points }) => emplacement.groupe === "Arbre" || points === 100)
        .sort((a, b) => b.points - a.points ||
            a.plante.nomVernaculaire.localeCompare(b.plante.nomVernaculaire, "fr"));

    const vivace = emplacement.groupe === "Vivace";
    $("#libelle-plantation").textContent = vivace ? "Vivaces adaptées au secteur" : "Arbre à planter";
    const libelle = vivace ? "Choisir une vivace" : "Choisir un arbre";
    const invite = new Option(options.length ? libelle : "Aucun résultat", "");
    invite.disabled = true;
    menu.replaceChildren(invite, ...options.map(({ plante, points }) => {
        const nom = plante.nomScientifique
            ? plante.nomVernaculaire + " — " + plante.nomScientifique
            : plante.nomVernaculaire;
        return new Option(points === 100 ? "✓ " + nom : nom, plante.id);
    }));
    const plante = partie.parking.candidat || partie.parking[emplacement.cle][emplacement.index];
    menu.value = plante ? String(plante.id) : "";
    if (menu.selectedIndex === -1) menu.selectedIndex = 0;
    menu.disabled = options.length === 0;
    afficherFichePlantation();
}


function planterParking(plante) {
    const cible = EMPLACEMENTS_PARKING[partie.parking.vise];
    const plantations = partie.parking[cible.cle].map((choix, index) =>
        index === cible.index ? plante : choix);
    partie.parking = { ...partie.parking, [cible.cle]: plantations, candidat: null };

    const suivant = EMPLACEMENTS_PARKING.findIndex(emplacement =>
        emplacement.cle === cible.cle && !plantations[emplacement.index]);
    const autre = suivant < 0 ? EMPLACEMENTS_PARKING.findIndex(emplacement =>
        !partie.parking[emplacement.cle][emplacement.index]) : suivant;
    viserEmplacement(autre < 0 ? partie.parking.vise : autre);
}


function viserEmplacement(index) {
    if (EMPLACEMENTS_PARKING[index].milieu !== EMPLACEMENTS_PARKING[partie.parking.vise].milieu) {
        $("#recherche-plantation").value = "";
        partie.parking = { ...partie.parking, recherche: "" };
    }
    if (index !== partie.parking.vise) {
        partie.parking = { ...partie.parking, vise: index, candidat: null };
    }
    majAmenagementParking();
}


function retirerPlantation() {
    const emplacement = EMPLACEMENTS_PARKING[partie.parking.vise];
    const plantations = partie.parking[emplacement.cle].map((plante, index) =>
        index === emplacement.index ? null : plante);
    partie.parking = { ...partie.parking, [emplacement.cle]: plantations, candidat: null };
    majAmenagementParking();
}


function dessinerReperesPlantations() {
    const conteneur = $("#scene-arbres");
    conteneur.innerHTML = "";
    if (partie.parking.vue === "pieton") return;

    EMPLACEMENTS_PARKING.forEach((emplacement, index) => {
        const { x, y } = positionEmplacementPourcent(emplacement);
        const plante = partie.parking[emplacement.cle][emplacement.index];
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "repere-plantation";
        bouton.classList.toggle("repere-vivace", emplacement.groupe === "Vivace");
        bouton.classList.toggle("est-plante", Boolean(plante));
        bouton.classList.toggle("est-vise", index === partie.parking.vise);
        bouton.style.left = x + "%";
        bouton.style.top = y + "%";
        bouton.textContent = emplacement.repere;
        const description = plante ? plante.nomVernaculaire : MILIEUX_PARKING[emplacement.milieu].nom;
        bouton.title = description;
        bouton.setAttribute("aria-label", emplacement.repere + " : " + description);
        bouton.setAttribute("aria-pressed", index === partie.parking.vise ? "true" : "false");
        bouton.addEventListener("click", () => {
            viserEmplacement(index);
            $("#choix-plantation").focus();
        });
        conteneur.appendChild(bouton);
    });
}


function majEmplacementCourant() {
    const emplacement = EMPLACEMENTS_PARKING[partie.parking.vise];
    const milieu = MILIEUX_PARKING[emplacement.milieu];
    const plante = partie.parking[emplacement.cle][emplacement.index];

    $("#emplacement-courant").innerHTML = `
        <strong>${emplacement.repere} — ${milieu.nom}</strong>
        <span>${milieu.resume}</span>
        ${plante ? `<span class="arbre-plante">
            ${echapperConfigHTML(plante.nomVernaculaire)}
            <button type="button" class="bouton-retirer-arbre" id="retirer-plantation">Retirer</button>
        </span>` : ""}`;
    $("#retirer-plantation")?.addEventListener("click", retirerPlantation);
}


// ===============================
// MISE A JOUR DE LA VUE
// ===============================

let renduEnCours = Promise.resolve();


function majAmenagementParking() {

    const { voie, places, arbres, vivaces } = partie.parking;
    const arbresPlantes = arbres.filter(Boolean).length;
    const vivacesPlantees = vivaces.filter(Boolean).length;
    $("#compteur-plantations").textContent =
        arbresPlantes + "/" + arbres.length + " arbres · " +
        vivacesPlantees + "/" + vivaces.length + " secteurs de vivaces";
    $("#bouton-valider-parking").disabled =
        !voie || !places || arbresPlantes !== arbres.length || vivacesPlantees !== vivaces.length;
    majBoutonsVuesParking();
    dessinerReperesPlantations();
    majEmplacementCourant();
    afficherMenuPlantation();

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

    const { voie, places, arbres, vivaces } = partie.parking;
    const revetementVoie = REVETEMENTS.find(r => r.id === voie);
    const revetementPlaces = REVETEMENTS.find(r => r.id === places);

    const lignesRevetements = [
        { zone: "Voies", revetement: revetementVoie, points: revetementVoie.voie },
        { zone: "Places", revetement: revetementPlaces, points: revetementPlaces.places }
    ];

    const lignesPlantations = EMPLACEMENTS_PARKING.map(emplacement => {
        const plante = partie.parking[emplacement.cle][emplacement.index];
        const milieu = MILIEUX_PARKING[emplacement.milieu];
        const { expoOk, humOk, points } = notationPlantation(plante, milieu);
        return { plante, milieu, repere: emplacement.repere, expoOk, humOk, points };
    });

    const essences = new Set([...arbres, ...vivaces].map(plante => plante.id)).size;
    const bonus = Math.min(essences, BONUS_ESSENCES_MAX) * BONUS_PAR_ESSENCE;

    const score = [...lignesRevetements, ...lignesPlantations]
        .reduce((total, ligne) => total + ligne.points, 0) + bonus;
    const maximum = 200 + lignesPlantations.length * 100 + BONUS_ESSENCES_MAX * BONUS_PAR_ESSENCE;
    const ratio = score / maximum;

    return {
        type: "amenagement-parking",
        titre: "Parking — Aménagement",
        conseil: "Adaptez les plantations à leur milieu : arbres de la bande centrale, vivaces de sol drainé en bordure et plantations de sol humide dans la noue.",
        choix: { ...partie.parking },
        lignesRevetements, lignesPlantations, essences, bonus,
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

    const plantations = resultat.lignesPlantations.map(ligne => `
        <div class="ligne-detail">
            <span class="ligne-detail-nom">
                ${ligne.repere} · ${echapperConfigHTML(ligne.plante.nomVernaculaire)}
                <small>${ligne.milieu.nom} · ${ligne.milieu.resume}</small>
            </span>
            <span class="verdicts">
                <span class="verdict ${ligne.expoOk ? "" : "est-faux"}" title="Exposition">☀</span>
                <span class="verdict ${ligne.humOk ? "" : "est-faux"}" title="Humidité du sol">≈</span>
            </span>
            <span class="ligne-detail-points">${ligne.points}</span>
        </div>`).join("");

    const pluriel = resultat.essences > 1 ? "s" : "";

    return revetements + plantations + `
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

    if ($("#bouton-valider-parking").disabled) return;
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

$("#choix-plantation").addEventListener("change", evenement => {
    const emplacement = EMPLACEMENTS_PARKING[partie.parking.vise];
    const plante = plantes.find(plante =>
        plante.groupe === emplacement.groupe && String(plante.id) === evenement.target.value);
    partie.parking = { ...partie.parking, candidat: plante || null };
    afficherFichePlantation();
});

$("#bouton-planter").addEventListener("click", () => {
    const { candidat } = partie.parking;
    if (candidat) planterParking(candidat);
});

$("#recherche-plantation").addEventListener("input", (evenement) => {
    partie.parking = { ...partie.parking, recherche: normaliserRecherchePlantation(evenement.target.value) };
    afficherMenuPlantation();
});
