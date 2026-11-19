/* ==========================================================
   CHANTIER PARKING — PHASE AMENAGEMENT
   Choix des revêtements et des végétaux, rendu en direct sur la
   vue aérienne, notation et affichage du résultat.
   Dépend de script.js (partie, plantes, $, message…) et de
   rendu-parking.js (PLAN_PARKING, REVETEMENTS, dessinerRenduParking).
   ========================================================== */


// Milieux de plantation : ce que chaque emplacement impose à l'arbre
const MILIEUX_PARKING = {
    bande: {
        nom: "Bande centrale entre les places",
        resume: "Soleil · alternance de sol frais et sec",
        expositions: ["soleil", "plein soleil"],
        humidites: ["frais", "sec"]
    },
    lisiere: {
        nom: "Bordure devant les places",
        resume: "Soleil · sol drainé, alternance frais / sec",
        expositions: ["soleil", "plein soleil"],
        humidites: ["frais", "sec"]
    },
    noue: {
        nom: "Noue au bord du ruisseau",
        resume: "Soleil ou mi-ombre · alternance humide / très humide",
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




function nouveauChoixParking() {
    return {
        voie: null,
        places: null,
        arbres: PLAN_PARKING.emplacementsArbres.map(() => null),
        vivaces: PLAN_PARKING.emplacementsVivaces.map(() => null),
        vise: 0,
        candidat: null,
        recherche: "",
        pageCatalogue: 0,
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


function notationPlantation(plante, milieu, groupeAttendu = plante.groupe) {
    const { expoOk, humOk } = compatibilitePlantation(plante, milieu);
    const typeOk = plante.groupe === groupeAttendu;
    const couvertureSol = milieu.humidites.filter(h => plante.humidites.includes(h)).length / milieu.humidites.length;
    const tauxSol = typeOk ? couvertureSol : 0;
    const tauxExposition = typeOk && expoOk ? 1 : 0;
    return { expoOk, humOk, typeOk, humComplet: typeOk && couvertureSol === 1,
        tauxSol, tauxExposition, points: 100 * (tauxExposition + 2 * tauxSol) / 3 };
}


function afficherFichePlantation() {
    const { vise, candidat } = partie.parking;
    const emplacement = EMPLACEMENTS_PARKING[vise];
    const plante = candidat || partie.parking[emplacement.cle][emplacement.index];
    const fiche = $("#fiche-plantation");
    $("#bouton-planter").disabled = !candidat;
    if (!plante) {
        fiche.textContent = "Sélectionne une plante pour consulter ses besoins, sa floraison et son rôle dans la palette.";
        return;
    }

    const texte = echapperConfigHTML;
    const valeurs = liste => texte(liste.join(", ") || "Non renseigné");
    const origine = plante.source || "";
    const source = /^https:\/\/(?:www\.)?smitsbv\.nl\//.test(origine) ? "Smits" :
        /^https:\/\/(?:www\.)?willemsefrance\.fr\//.test(origine) ? "Willemse" :
        /^https:\/\/(?:www\.)?floriscope\.io\//.test(origine) ? "Floriscope" : "";
    const ficheFloriscope = /^https:\/\/(?:www\.)?floriscope\.io\/plantes\//.test(plante.sourceFloriscope || "");
    const sourceEco = /^https:\/\/(?:www\.)?(?:smitsbv\.nl|willemsefrance\.fr|rhs\.org\.uk|pollinis\.org|pepinierelemaire\.be)\//.test(plante.sourceEcologie || "");

    fiche.innerHTML = `
        <strong>${texte(plante.nomVernaculaire)}</strong>
        ${plante.nomScientifique ? `<em>${texte(plante.nomScientifique)}</em>` : ""}
        <dl>
            <dt>Nom(s) vernaculaire(s)</dt><dd>${texte(plante.nomsVernaculaires || plante.nomVernaculaire)}</dd>
            <dt>Groupe de plantation</dt><dd>${texte(plante.groupe)}</dd>
            <dt>Sous-catégorie horticole</dt><dd>${texte(plante.sousCategorieHorticole || "Non renseignée")}</dd>
            ${plante.categorieHorticole ? `<dt>Catégorie horticole</dt><dd>${texte(plante.categorieHorticole)}</dd>` : ""}
            ${plante.hauteurAdulte ? `<dt>Hauteur adulte</dt><dd>${texte(plante.hauteurAdulte)}</dd>` : ""}
            <dt>Exposition</dt><dd>${valeurs(plante.expositions)}</dd>
            <dt>Humidité du sol</dt><dd>${valeurs(plante.humidites)}</dd>
            <dt>Mois de floraison</dt><dd>${valeurs(plante.floraison)}</dd>
            <dt>Pollinisateurs</dt><dd>${plante.pollinisateurs === true ? "Intérêt documenté pour les pollinisateurs" : "Intérêt non documenté dans ce catalogue"}</dd>
        </dl>
        ${plante.largeurAdulte ? `<dl><dt>Largeur adulte</dt><dd>${texte(plante.largeurAdulte)}</dd></dl>` : ""}
        ${plante.note ? `<p><b>À retenir</b> · ${texte(plante.note)}</p>` : ""}
        ${source ? `<p><a href="${texte(plante.source)}" target="_blank" rel="noopener noreferrer">Fiche source · ${source}</a></p>` : ""}
        ${ficheFloriscope && plante.sourceFloriscope !== plante.source ? `<p><a href="${texte(plante.sourceFloriscope)}" target="_blank" rel="noopener noreferrer">Caractéristiques · Floriscope</a></p>` : ""}
        ${sourceEco ? `<p><a href="${texte(plante.sourceEcologie)}" target="_blank" rel="noopener noreferrer">Source de l’intérêt pour les pollinisateurs</a></p>` : ""}
        <p>Compare ces besoins au sol et à l’exposition indiqués pour le repère ${emplacement.repere}. Le bilan expliquera les effets de ta composition.</p>`;
}


function normaliserRecherchePlantation(texte) {
    return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}


function afficherMenuPlantation() {
    const { vise, recherche } = partie.parking;
    const emplacement = EMPLACEMENTS_PARKING[vise];
    const menu = $("#choix-plantation");
    const toutes = plantes
        .filter(plante => plante.groupe === emplacement.groupe &&
            normaliserRecherchePlantation((plante.nomsVernaculaires || plante.nomVernaculaire) + " " + plante.nomVernaculaire + " " + plante.nomScientifique).includes(recherche))
        .sort((a, b) => a.nomVernaculaire.localeCompare(b.nomVernaculaire, "fr"));

    const taille = 12;
    const dernierePage = Math.max(0, Math.ceil(toutes.length / taille) - 1);
    const page = Math.min(partie.parking.pageCatalogue || 0, dernierePage);
    partie.parking.pageCatalogue = page;
    const options = toutes.slice(page * taille, (page + 1) * taille);
    $("#catalogue-page").textContent = toutes.length
        ? (page * taille + 1) + "–" + Math.min((page + 1) * taille, toutes.length) + " sur " + toutes.length + " plantes · noms scientifiques dans la fiche"
        : "Aucune plante trouvée. Essaie un autre nom.";
    $("#catalogue-precedent").disabled = page === 0;
    $("#catalogue-suivant").disabled = page === dernierePage;
    const vivace = emplacement.groupe === "Vivace";
    $("#libelle-plantation").textContent = vivace ? "Vivace à planter" : "Arbre à planter";
    const libelle = vivace ? "Choisir une vivace" : "Choisir un arbre";
    const invite = new Option(options.length ? libelle : "Aucun résultat", "");
    invite.disabled = true;
    menu.replaceChildren(invite, ...options.map(plante => {
        const nom = plante.nomVernaculaire;
        return new Option(nom, plante.id);
    }));
    const plante = partie.parking.candidat || partie.parking[emplacement.cle][emplacement.index];
    menu.value = plante ? String(plante.id) : "";
    if (menu.selectedIndex === -1 && plante && toutes.includes(plante)) {
        const pagePlante = Math.floor(toutes.indexOf(plante) / taille);
        // Une plantation déjà sélectionnée reste visible dans sa page.
        if (pagePlante !== page && !partie.parking.navigationCatalogue) {
            partie.parking.pageCatalogue = pagePlante;
            return afficherMenuPlantation();
        }
    }
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
        partie.parking = { ...partie.parking, vise: index, candidat: null, pageCatalogue: 0, navigationCatalogue: false };
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
    const voisins = PLAN_PARKING.emplacementsArbres.filter(e => e.id !== emplacement.id);
    const distance = emplacement.groupe === "Arbre" ? Math.min(...voisins.map(e => Math.hypot(e.u - emplacement.u, e.v - emplacement.v))) : null;
    const aide = emplacement.milieu === "noue"
        ? "La noue reçoit l’eau de pluie : le sol peut rester humide puis devenir très humide."
        : "Après la pluie, la terre est fraîche ; elle peut devenir sèche en été. Frais ne signifie pas inondé.";
    const espace = distance === null ? "Compare aussi l’étalement et la hauteur adultes de la vivace à la place disponible."
        : "Arbre voisin le plus proche : " + distance.toLocaleString("fr-FR", {maximumFractionDigits:2}) + " m entre les troncs. Compare cette distance au diamètre du houppier adulte ; un léger contact des couronnes n’est pas forcément gênant.";

    $("#emplacement-courant").innerHTML = `
        <strong>${emplacement.repere} — ${milieu.nom}</strong>
        <span>${milieu.resume}</span>
        <small>${aide}</small><small>${espace}</small>
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
    [["voie", "#avis-voie"], ["places", "#avis-places"]].forEach(([zone, cible]) => {
        const revetement = REVETEMENTS.find(r => r.id === partie.parking[zone]);
        $(cible).textContent = revetement ? revetement.avis : "Compare le comportement du revêtement dans la zone choisie.";
    });
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

// Barème pédagogique. Chaque critère reste borné, même avec une palette incomplète.
const SAISON_POLLINISATEURS = ["mars", "avril", "mai", "juin", "juillet", "août", "septembre"];

function identiteEspece(plante) {
    if (plante.espece) return plante.espece;
    return String(plante.nomScientifique || plante.nomVernaculaire)
        .split(/['‘’]/)[0].trim().toLowerCase();
}

function repartitionEspeces(plantations) {
    const effectifs = new Map();
    for (const plante of plantations.filter(Boolean)) {
        const espece = identiteEspece(plante);
        effectifs.set(espece, (effectifs.get(espece) || 0) + 1);
    }
    return effectifs;
}

function diversiteGroupe(plantations) {
    const total = plantations.length;
    if (total < 2) return 0;
    const effectifs = repartitionEspeces(plantations);
    const presents = [...effectifs.values()].reduce((somme, nombre) => somme + nombre, 0);
    const carres = [...effectifs.values()].reduce((somme, nombre) => somme + nombre * nombre, 0);
    return (presents * presents - carres) / (total * (total - 1));
}

// Note calculée à partir des données brutes, puis arrondie vers le bas par critère.
const BAREME_PARKING = Object.freeze({
    maximum: 5000, exposition: 600, sol: 1400, diversite: 1000,
    floraisons: 500, pollinisateurs: 500, voies: 500, places: 500
});

// Les arbres représentent 70 % de l’adaptation et de la diversité des végétaux.
const POIDS_PLANTATIONS = Object.freeze({ arbres: 0.7, vivaces: 0.3 });

function evaluerParking() {
    const { voie, places, arbres, vivaces } = partie.parking;
    const plancher = valeur => Math.floor(valeur + 1e-9);
    const lignesPlantations = EMPLACEMENTS_PARKING.map(emplacement => {
        const plante = partie.parking[emplacement.cle][emplacement.index];
        const milieu = MILIEUX_PARKING[emplacement.milieu];
        const adequation = plante ? notationPlantation(plante, milieu, emplacement.groupe) :
            { points: 0, expoOk: false, humOk: false, humComplet: false, typeOk: false, tauxSol: 0, tauxExposition: 0 };
        return { plante, milieu, groupe: emplacement.groupe, cle: emplacement.cle, repere: emplacement.repere, ...adequation };
    });
    const bienPlacees = lignesPlantations.filter(l => l.plante && l.typeOk && l.expoOk && l.humComplet);
    const melliferes = bienPlacees.filter(l => l.plante.pollinisateurs === true);
    const calendrier = MOIS.map(mois => ({
        mois, especes: [...new Set(melliferes.filter(l => l.plante.floraison.includes(mois)).map(l => identiteEspece(l.plante)))]
    }));
    const moisCouverts = calendrier.filter(l => SAISON_POLLINISATEURS.includes(l.mois) && l.especes.length).length;
    const palette = cle => lignesPlantations.filter(l => l.cle === cle)
        .map(l => bienPlacees.includes(l) ? l.plante : null);
    const diversite = POIDS_PLANTATIONS.arbres * diversiteGroupe(palette("arbres")) +
        POIDS_PLANTATIONS.vivaces * diversiteGroupe(palette("vivaces"));
    const effectifs = repartitionEspeces([...arbres, ...vivaces]);
    const lignesRevetements = [
        { zone: "Voies", revetement: REVETEMENTS.find(r => r.id === voie) },
        { zone: "Places", revetement: REVETEMENTS.find(r => r.id === places) }
    ];
    const noterRevetement = (ligne, usage) => evaluerRevetement(ligne.revetement, usage).points;
    const ciblePollinisateurs = Math.max(1, Math.round(EMPLACEMENTS_PARKING.length * 0.6));
    const moyenne = cle => Object.entries(POIDS_PLANTATIONS).reduce((total, [groupe, poids]) => {
        const lignes = lignesPlantations.filter(l => l.cle === groupe);
        return total + poids * lignes.reduce((s, l) => s + l[cle], 0) / lignes.length;
    }, 0);
    const criteres = [
        { nom: "Exposition des végétaux", famille: "vegetaux", maximum: BAREME_PARKING.exposition,
            points: plancher(BAREME_PARKING.exposition * moyenne("tauxExposition")),
            detail: lignesPlantations.filter(l => l.typeOk && l.expoOk).length + "/" + lignesPlantations.length + " plantations du bon groupe avec une exposition compatible.",
            piste: "Revois les expositions qui ne conviennent pas aux emplacements." },
        { nom: "Sol et variations d’humidité", famille: "vegetaux", maximum: BAREME_PARKING.sol,
            points: plancher(BAREME_PARKING.sol * moyenne("tauxSol")),
            detail: "Le sol alterne entre frais et sec en bordure et au centre, entre humide et très humide dans la noue. Tolérer un seul des deux états donne une adaptation partielle.",
            piste: "Choisis des plantes capables de supporter les deux états du sol de leur zone." },
        { nom: "Diversité des espèces", famille: "vegetaux", maximum: BAREME_PARKING.diversite,
            points: plancher(BAREME_PARKING.diversite * diversite),
            detail: "Les arbres comptent pour 70 % de la diversité et les quatre secteurs de vivaces pour 30 %. Toute répétition ou plantation incomplètement adaptée réduit ce critère.",
            piste: "Remplace les répétitions par d’autres espèces entièrement adaptées." },
        { nom: "Floraisons utiles étalées", famille: "vegetaux", maximum: BAREME_PARKING.floraisons,
            points: plancher(BAREME_PARKING.floraisons * moisCouverts / SAISON_POLLINISATEURS.length),
            detail: moisCouverts + "/7 mois couverts de mars à septembre, par des plantes entièrement adaptées dont l’intérêt pour les pollinisateurs est documenté.",
            piste: "Complète les mois sans ressource florale avec des plantes entièrement adaptées." },
        { nom: "Ressources pour les pollinisateurs", famille: "vegetaux", maximum: BAREME_PARKING.pollinisateurs,
            points: plancher(BAREME_PARKING.pollinisateurs * Math.min(1, melliferes.length / ciblePollinisateurs)),
            detail: melliferes.length + " plantations entièrement adaptées avec un intérêt documenté. Objectif " + ciblePollinisateurs + "/" + lignesPlantations.length + " emplacements.",
            piste: "Augmente la part de plantes entièrement adaptées qui nourrissent les pollinisateurs." },
        { nom: "Revêtement des voies", famille: "revetements", maximum: BAREME_PARKING.voies,
            points: noterRevetement(lignesRevetements[0], "voie", BAREME_PARKING.voies),
            detail: "500 points maximum. Infiltration et usage : 25 % chacun ; économie à la pose et entretien/réparation : 20 % chacun ; durée de vie : 10 %. Note rapportée au meilleur compromis du catalogue pour les voies.",
            piste: "Compare aussi la pose, les réparations et l’usure liée aux passages répétés dans les voies." },
        { nom: "Revêtement des places", famille: "revetements", maximum: BAREME_PARKING.places,
            points: noterRevetement(lignesRevetements[1], "places", BAREME_PARKING.places),
            detail: "500 points maximum. Les mêmes cinq critères sont appliqués au stationnement, avec une note rapportée au meilleur compromis du catalogue pour les places.",
            piste: "Compare l’usage des places, la pose, la réparabilité et les bénéfices paysagers." }
    ];
    const score = criteres.reduce((s, c) => s + c.points, 0);
    const totaux = Object.fromEntries(["vegetaux", "revetements"].map(famille => [famille,
        criteres.filter(c => c.famille === famille).reduce((s, c) => s + c.points, 0)]));
    const pistes = criteres.filter(c => c.points < c.maximum)
        .sort((a, b) => a.points / a.maximum - b.points / b.maximum).slice(0, 2).map(c => c.piste);
    const ratio = score / BAREME_PARKING.maximum;
    return {
        type: "amenagement-parking", titre: "Parking — Bilan écologique", versionBareme: 7,
        score, maximum: BAREME_PARKING.maximum, ratio,
        etoiles: ratio >= 0.98 ? 3 : ratio >= 0.90 ? 2 : ratio >= 0.75 ? 1 : 0,
        criteres, totaux, calendrier, lignesPlantations, lignesRevetements,
        effectifs: Object.fromEntries(effectifs), choix: { ...partie.parking },
        conseil: pistes.join(" ") || "L’ensemble des critères est satisfait, pour les végétaux comme pour les revêtements."
    };
}


function detailParkingHTML(resultat) {
    const texte = echapperConfigHTML;
    const criteres = resultat.criteres.map(critere => `
        <div class="ligne-detail">
            <span class="ligne-detail-nom">${texte(critere.nom)}<small>${texte(critere.detail)}</small></span>
            <b class="ligne-detail-points">${critere.points}/${critere.maximum}</b>
        </div>`).join("");
    const calendrier = resultat.calendrier.map(({ mois, especes }) =>
        `<span class="mois-floraison ${especes.length ? "est-couvert" : ""}"
               title="${texte(mois)} · ${especes.length} espèce(s) utile(s) ${texte(especes.join(', '))}">${texte(mois.slice(0, 3))}</span>`).join("");
    const plantations = resultat.lignesPlantations.filter(ligne => ligne.plante).map(ligne => {
        const repetitions = resultat.effectifs[identiteEspece(ligne.plante)];
        return `<div class="ligne-detail">
            <span class="ligne-detail-nom">${texte(ligne.repere)} · ${texte(ligne.plante.nomVernaculaire)}
                <small>${texte(ligne.milieu.nom)} · ${repetitions} emplacement(s) de cette espèce</small>
                <small>Exposition ${ligne.expoOk ? "adaptée" : "à revoir"} · sol ${ligne.humComplet ? "adapté aux deux états" : ligne.humOk ? "partiellement adapté" : "à revoir"}</small>
            </span>

        </div>`;
    }).join("");
    const revetements = resultat.lignesRevetements.filter(ligne => ligne.revetement).map(ligne => {
        const note = evaluerRevetement(ligne.revetement, ligne.zone === "Voies" ? "voie" : "places");
        return `
        <div class="ligne-detail"><span class="ligne-detail-nom">${texte(ligne.zone)} · ${texte(ligne.revetement.nom)}
            <small>Note : ${note.points} / 500. ${texte(ligne.revetement.avis)}</small>
            <small>${note.details.map(c => texte(c.nom) + " : indice " + c.indice + "/100 (poids " + c.poids / 5 + " %)").join(" · ")}</small>
            <small>Indices de comparaison du scénario, sans prix ni durée garantis. La meilleure combinaison du catalogue pour cet usage reçoit 500.</small></span></div>`;
    }).join("");
    return `<div class="bilan-familles">
        <div><strong>Végétaux</strong><span>${resultat.totaux.vegetaux} / 4 000</span></div>
        <div><strong>Revêtements</strong><span>${resultat.totaux.revetements} / 1 000</span></div>
    </div>` + criteres + `
        <div class="calendrier-floraison" aria-label="Calendrier des ressources florales">${calendrier}</div>
        <p class="note-bareme">Barème pédagogique sur 5 000. Les arrondis sont faits à la fin de chaque critère, vers le bas. Un mois coloré indique une floraison documentée, sans garantir une floraison continue tout le mois.</p>
        <details><summary>Détail des revêtements</summary>${revetements}</details>
        <details><summary>Détail des plantations</summary>${plantations}</details>`;
}


// ===============================
// VALIDATION ET RESULTAT
// ===============================

function validerParking() {
    if (window.TentativeLocale?.charger()) { restaurerBilanValide(); return; }

    if ($("#bouton-valider-parking").disabled) return;
    const resultat = evaluerParking();

    window.TentativeLocale?.sauver(resultat);
    partie.resultats.push(resultat);
    partie.score += resultat.score;
    $("#score-courant").textContent = partie.score;

    afficherBilan();
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
    partie.parking = { ...partie.parking, recherche: normaliserRecherchePlantation(evenement.target.value), pageCatalogue: 0, navigationCatalogue: true };
    afficherMenuPlantation();
});

$("#catalogue-precedent").addEventListener("click", () => {
    partie.parking.candidat = null;
    partie.parking.pageCatalogue = Math.max(0, (partie.parking.pageCatalogue || 0) - 1);
    partie.parking.navigationCatalogue = true;
    afficherMenuPlantation();
});
$("#catalogue-suivant").addEventListener("click", () => {
    partie.parking.candidat = null;
    partie.parking.pageCatalogue = (partie.parking.pageCatalogue || 0) + 1;
    partie.parking.navigationCatalogue = true;
    afficherMenuPlantation();
});
