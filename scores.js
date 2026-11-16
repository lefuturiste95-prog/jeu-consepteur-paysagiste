/* API du classement : aucun SDK, cookie ni compte joueur nécessaire. */
(() => {
    "use strict";
    const config = window.CONFIG_SCORES || {};
    const url = typeof config.url === "string" ? config.url.replace(/\/+$/, "") : "";
    // Une clé secrète n’est jamais acceptée dans le navigateur.
    const cle = typeof config.clePublique === "string" &&
        /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.clePublique) ? config.clePublique : "";
    const configure = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && Boolean(cle);

    async function appeler(fonction, donnees) {
        if (!configure) throw new Error("Le classement partagé n’est pas encore configuré.");
        const controleur = new AbortController();
        const delai = setTimeout(() => controleur.abort(), 10000);
        try {
            const reponse = await fetch(url + "/rest/v1/rpc/" + fonction, {
                method: "POST",
                credentials: "omit",
                cache: "no-store",
                referrerPolicy: "no-referrer",
                headers: { apikey: cle, "Content-Type": "application/json" },
                body: JSON.stringify(donnees),
                signal: controleur.signal
            });
            if (!reponse.ok) throw new Error("Le service de classement est indisponible.");
            if (reponse.status === 204) return null;
            const contenu = await reponse.text();
            return contenu ? JSON.parse(contenu) : null;
        } finally {
            clearTimeout(delai);
        }
    }

    function verifier(entree) {
        if (typeof entree.nom !== "string" || !entree.nom.trim() ||
            Array.from(entree.nom.trim()).length > 30 || /[\u0000-\u001f\u007f]/.test(entree.nom)) {
            throw new Error("Indique un prénom ou un pseudo de 1 à 30 caractères.");
        }
        const limites = { score: 5000, vegetaux: 4000, mineraux: 1000 };
        for (const [champ, maximum] of Object.entries(limites)) {
            if (!Number.isInteger(entree[champ]) || entree[champ] < 0 || entree[champ] > maximum) {
                throw new Error("Le score est invalide.");
            }
        }
        if (entree.score !== entree.vegetaux + entree.mineraux ||
            !Number.isFinite(Date.parse(entree.date))) throw new Error("Le bilan est incohérent.");
    }

    async function envoyer(entree) {
        verifier(entree);
        // Seuls ces cinq champs quittent le jeu. Aucun choix de plantes n’est transmis.
        await appeler("enregistrer_score_parking", {
            p_nom: entree.nom.trim(),
            p_score_global: entree.score,
            p_score_vegetaux: entree.vegetaux,
            p_score_mineraux: entree.mineraux,
            p_date_heure: entree.date
        });
    }

    async function lire(limite = 21, decalage = 0) {
        if (!Number.isInteger(limite) || limite < 1 || limite > 101 ||
            !Number.isInteger(decalage) || decalage < 0) throw new Error("Page invalide.");
        const lignes = await appeler("lire_classement_parking", { p_limite: limite, p_decalage: decalage });
        if (!Array.isArray(lignes) || lignes.some(ligne =>
            typeof ligne.nom_joueur !== "string" || Array.from(ligne.nom_joueur).length > 30 ||
            !Number.isInteger(ligne.score_global) || ligne.score_global < 0 || ligne.score_global > 5000)) {
            throw new Error("Le classement reçu est invalide.");
        }
        // Même si le serveur renvoyait d’autres colonnes, elles ne sont pas conservées.
        return lignes.map(ligne => ({ nom: ligne.nom_joueur, score: ligne.score_global }));
    }

    window.ScoresPartages = Object.freeze({ estConfigure: () => configure, envoyer, lire, verifier });
})();
