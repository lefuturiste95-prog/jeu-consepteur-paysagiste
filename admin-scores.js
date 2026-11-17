/* Lecture du classement commun dans l’administration. */
(() => {
    "use strict";
    if (sessionStorage.getItem("adminAutorise") !== "oui") return;

    const parId = id => document.getElementById(id);
    const boutonActualiser = parId("actualiser-scores-partages");
    const boutonSuite = parId("suite-scores-partages");
    const statut = parId("statut-scores-partages");
    const corps = parId("lignes-scores-partages");
    const vide = parId("vide-scores-partages");
    const tableau = parId("table-scores-partages");
    const TAILLE_PAGE = 50;
    let lignes = [];
    let requete = 0;

    function dessiner() {
        const elements = lignes.map((entree, index) => {
            const ligne = document.createElement("tr");
            for (const valeur of [index + 1, entree.nom, entree.score.toLocaleString("fr-FR") + " / 5 000"]) {
                const cellule = document.createElement("td");
                cellule.textContent = String(valeur);
                ligne.appendChild(cellule);
            }
            return ligne;
        });
        corps.replaceChildren(...elements);
        tableau.hidden = lignes.length === 0;
        vide.hidden = lignes.length !== 0;
    }

    async function afficher(plus = false) {
        const api = window.ScoresPartages;
        if (!api?.estConfigure()) {
            statut.textContent = "La connexion au classement partagé n’est pas configurée sur cette copie du jeu.";
            boutonActualiser.disabled = true;
            boutonSuite.hidden = true;
            return;
        }
        const version = ++requete;
        boutonActualiser.disabled = true;
        boutonSuite.disabled = true;
        statut.textContent = "Chargement des scores de tous les appareils…";
        try {
            const debut = plus ? lignes.length : 0;
            const page = await api.lire(TAILLE_PAGE + 1, debut);
            if (version !== requete) return;
            lignes = (plus ? lignes : []).concat(page.slice(0, TAILLE_PAGE));
            dessiner();
            boutonSuite.hidden = page.length <= TAILLE_PAGE;
            statut.textContent = lignes.length === 0
                ? "La base partagée ne contient encore aucun score."
                : lignes.length + (lignes.length === 1 ? " résultat affiché" : " résultats affichés") +
                    (boutonSuite.hidden ? " · tous les résultats ont été chargés." : " · d’autres résultats sont disponibles.");
        } catch (erreur) {
            if (version !== requete) return;
            statut.textContent = lignes.length
                ? "Actualisation impossible. Les scores affichés peuvent être anciens. Clique sur Actualiser pour réessayer."
                : "Impossible de charger les scores partagés. Vérifie Internet puis clique sur Actualiser.";
            vide.hidden = true;
        } finally {
            if (version === requete) {
                boutonActualiser.disabled = false;
                boutonSuite.disabled = false;
            }
        }
    }

    boutonActualiser.addEventListener("click", () => afficher());
    boutonSuite.addEventListener("click", () => afficher(true));
    window.AdminScoresPartages = Object.freeze({ afficher });
})();
