/* ==========================================================
   L'APPRENTI CONCEPTEUR — ADMINISTRATION
   Première version : accès protégé + gestion du classement
   ========================================================== */


// ===============================
// PROTECTION DE LA PAGE
// ===============================

// Cette protection évite surtout les accès accidentels.
// Comme il s'agit d'un site statique, ce n'est pas une sécurité serveur.
if (sessionStorage.getItem("adminAutorise") !== "oui") {
    window.location.replace("index.html");
}


// ===============================
// CONSTANTES
// ===============================

const CLE_CLASSEMENT = "apprenti-concepteur-classement";

const zoneClassement = document.getElementById("admin-classement");

const voileConfirmation = document.getElementById("voile-confirmation");
const confirmationTitre = document.getElementById("confirmation-titre");
const confirmationTexte = document.getElementById("confirmation-texte");
const confirmationValider = document.getElementById("confirmation-valider");

let actionConfirmee = null;


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

    localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(classement));
}


function afficherClassementAdmin() {

    const classement = lireClassement()
        .map((entree, indexOriginal) => ({
            ...entree,
            indexOriginal
        }))
        .sort((a, b) => b.score - a.score);

    zoneClassement.innerHTML = "";

    if (classement.length === 0) {

        zoneClassement.innerHTML = `
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
            <span class="nom">${echapperHTML(entree.nom || "Anonyme")}</span>
            <span class="date">${echapperHTML(entree.date || "")}</span>
            <span class="score">${Number(entree.score) || 0} pts</span>
            <button
                class="supprimer-score"
                type="button"
                data-index="${entree.indexOriginal}">
                Supprimer
            </button>
        `;

        zoneClassement.appendChild(ligne);
    });

    document.querySelectorAll(".supprimer-score").forEach(bouton => {

        bouton.addEventListener("click", () => {

            const index = Number(bouton.dataset.index);

            const classementActuel = lireClassement();
            const entree = classementActuel[index];

            demanderConfirmation(
                "Supprimer ce score ?",
                `Le score de ${entree?.nom || "ce joueur"} sera supprimé de cet appareil.`,
                () => {

                    const nouveauClassement = lireClassement();
                    nouveauClassement.splice(index, 1);

                    ecrireClassement(nouveauClassement);
                    afficherClassementAdmin();
                }
            );
        });
    });
}


// ===============================
// CONFIRMATIONS
// ===============================

function demanderConfirmation(titre, texte, action) {

    confirmationTitre.textContent = titre;
    confirmationTexte.textContent = texte;

    actionConfirmee = action;

    voileConfirmation.classList.add("est-ouvert");
}


function fermerConfirmation() {

    voileConfirmation.classList.remove("est-ouvert");
    actionConfirmee = null;
}


document.getElementById("confirmation-annuler")
    .addEventListener("click", fermerConfirmation);


confirmationValider.addEventListener("click", () => {

    if (typeof actionConfirmee === "function") {
        actionConfirmee();
    }

    fermerConfirmation();
});


voileConfirmation.addEventListener("click", (evenement) => {

    if (evenement.target === voileConfirmation) {
        fermerConfirmation();
    }
});


// ===============================
// EFFACER TOUT LE CLASSEMENT
// ===============================

document.getElementById("effacer-classement")
    .addEventListener("click", () => {

        const classement = lireClassement();

        if (classement.length === 0) {
            return;
        }

        demanderConfirmation(
            "Effacer tout le classement ?",
            "Tous les scores enregistrés sur cet appareil seront supprimés.",
            () => {

                localStorage.removeItem(CLE_CLASSEMENT);
                afficherClassementAdmin();
            }
        );
    });


// ===============================
// NAVIGATION
// ===============================

document.getElementById("bouton-retour-jeu")
    .addEventListener("click", () => {
        window.location.href = "index.html";
    });


document.getElementById("bouton-deconnexion")
    .addEventListener("click", () => {

        sessionStorage.removeItem("adminAutorise");
        window.location.href = "index.html";
    });


// ===============================
// OUTIL DE SECURITE D'AFFICHAGE
// ===============================

function echapperHTML(texte) {

    const element = document.createElement("div");
    element.textContent = String(texte ?? "");

    return element.innerHTML;
}


// ===============================
// DEMARRAGE
// ===============================

afficherClassementAdmin();
