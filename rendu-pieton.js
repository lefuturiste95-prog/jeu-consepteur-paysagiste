/* ==========================================================
   VUE PIETONNE DU PARKING
   Compose l'aménagement sur la photo prise depuis l'accès.
   ----------------------------------------------------------
   Une caméra virtuelle est calée sur la photo. Le sol est dessiné
   à plat (plan haute définition), puis plaqué en perspective ligne
   par ligne ; les arbres, détourés dans les photos du site, sont
   posés du plus loin au plus près.
   Dépend de rendu-parking.js.
   ========================================================== */


const CAMERA_PIETON = {
    photo: "../vue-pieton-acces.jpeg",
    largeur: 1536,
    hauteur: 1152,

    // Calage sur le plan (repère u, v de rendu-parking.js, en mètres)
    position: [44, -9],
    angleVisee: 60 * Math.PI / 180,     // depuis -u, vers +v
    focale: 610,
    horizonY: 515,
    hauteurOeil: 1.6,

    // Partie de l'image où le sol est visible : exclut les massifs du premier plan
    zoneVisible: [[240, 525], [1425, 525], [1425, 600], [700, 700], [170, 700], [140, 620], [170, 560]],

    // Plan haute définition du sol
    sol: { u0: -17, v0: -2, largeur: 72, hauteur: 52, pxParM: 30 },

    // Le soleil, dans la photo, est 44° à droite de la visée, assez bas
    azimutSoleil: 44 * Math.PI / 180,
    longueurOmbre: 1.6,

    hauteurTronc: 1.8
};

const DIRECTIONS_CAMERA = (() => {
    const a = CAMERA_PIETON.angleVisee;
    const avant = [-Math.cos(a), Math.sin(a)];
    return { avant, droite: [-avant[1], avant[0]] };
})();


function projeterPieton(u, v) {

    const { position, focale, horizonY, hauteurOeil, largeur } = CAMERA_PIETON;
    const { avant, droite } = DIRECTIONS_CAMERA;
    const du = u - position[0];
    const dv = v - position[1];
    const distance = du * avant[0] + dv * avant[1];
    const lateral = du * droite[0] + dv * droite[1];

    return {
        x: largeur / 2 + focale * lateral / distance,
        y: horizonY + focale * hauteurOeil / distance,
        distance
    };
}


/** Point du plan haute définition (px) vu à la colonne x, ligne y de la photo. */
function pointSolVu(x, y) {

    const { position, focale, horizonY, hauteurOeil, largeur, sol } = CAMERA_PIETON;
    const { avant, droite } = DIRECTIONS_CAMERA;
    const distance = focale * hauteurOeil / (y - horizonY);
    const lateral = (x - largeur / 2) / focale * distance;
    const u = position[0] + distance * avant[0] + lateral * droite[0];
    const v = position[1] + distance * avant[1] + lateral * droite[1];

    return [(u - sol.u0) * sol.pxParM, (v - sol.v0) * sol.pxParM];
}


function pxVersPlan([x, y]) {

    const cos = Math.cos(RENDU.angle);
    const sin = Math.sin(RENDU.angle);
    const rx = (x - RENDU.origine[0]) / RENDU.pxParM;
    const ry = (y - RENDU.origine[1]) / RENDU.pxParM;

    return [rx * cos + ry * sin, -rx * sin + ry * cos];
}


// ===============================
// IMAGES
// ===============================

let imagesPieton = null;


function chargerImagesPieton() {

    if (imagesPieton) {
        return Promise.resolve(imagesPieton);
    }

    const noms = [...new Set(["pelouse", "paillage", ...REVETEMENTS.map(r => r.texture)])];
    const familles = (window.SPRITES_PIETON || { familles: {} }).familles;

    return Promise.all([
        chargerImage(CAMERA_PIETON.photo),
        chargerImage("usure.png"),
        Promise.all(noms.map(nom => chargerImage("pieton/sol/" + nom + ".png"))),
        Promise.all(Object.entries(familles).map(([famille, liste]) =>
            Promise.all(liste.map(chargerSprite)).then(sprites => [famille, sprites])))
    ]).then(([photo, usure, sols, arbres]) => {
        imagesPieton = {
            photo, usure,
            sols: Object.fromEntries(noms.map((nom, i) => [nom, sols[i]])),
            arbres: Object.fromEntries(arbres)
        };
        return imagesPieton;
    });
}


// ===============================
// LE SOL, DESSINE A PLAT
// ===============================

function cheminSol(points) {

    const { sol } = CAMERA_PIETON;
    return cheminPx(points.map(([u, v]) => [(u - sol.u0) * sol.pxParM, (v - sol.v0) * sol.pxParM]));
}


function cheminsSol(polygones) {

    const chemin = new Path2D();
    polygones.forEach(polygone => chemin.addPath(cheminSol(polygone)));
    return chemin;
}


function remplirSol(ctx, chemin, texture) {

    ctx.save();
    ctx.clip(chemin);
    ctx.fillStyle = ctx.createPattern(texture, "repeat");
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}


function tracerSegmentsPlan(ctx, couleur, epaisseurM, segments) {

    const { pxParM } = CAMERA_PIETON.sol;

    ctx.save();
    ctx.strokeStyle = couleur;
    ctx.lineWidth = epaisseurM * pxParM;
    segments.forEach(chemin => ctx.stroke(chemin));
    ctx.restore();
}


function dessinerMarquagePieton(ctx, revetement) {

    const segments = [];

    PLAN_PARKING.rangees.forEach(rangee => {
        for (let u = rangee.u0; u <= rangee.u1 + 0.01; u += PLAN_PARKING.largeurPlace) {
            segments.push(cheminSol([[u, rangee.v0], [u, rangee.v1]]));
        }
    });

    tracerSegmentsPlan(ctx, COULEURS_MARQUAGE[revetement.marquage],
                       revetement.marquage === "peinture" ? 0.12 : 0.18, segments);
}


function ombresArbresSurSol(ctx, objets) {

    const { sol, longueurOmbre, azimutSoleil } = CAMERA_PIETON;
    const { avant, droite } = DIRECTIONS_CAMERA;
    const k = sol.pxParM;

    // À l'opposé du soleil : vers la caméra, un peu à gauche
    const du = -(Math.cos(azimutSoleil) * avant[0] + Math.sin(azimutSoleil) * droite[0]);
    const dv = -(Math.cos(azimutSoleil) * avant[1] + Math.sin(azimutSoleil) * droite[1]);
    const angle = Math.atan2(dv, du);

    objets.forEach(({ emplacement, largeurM, hauteurM }) => {

        const longueur = hauteurM * longueurOmbre;
        const cx = (emplacement.u + du * longueur / 2 - sol.u0) * k;
        const cy = (emplacement.v + dv * longueur / 2 - sol.v0) * k;

        dessinerOmbre(ctx, (contexte) => {
            contexte.fillStyle = "#000";
            contexte.beginPath();
            contexte.ellipse(cx, cy, (longueur / 2 + largeurM / 3) * k, largeurM / 2 * k, angle, 0, Math.PI * 2);
            contexte.fill();
        }, [0, 0], 14, "rgba(10, 16, 14, 0.5)");
    });
}


function construireSolPieton(images, choix, objets) {

    const { sol } = CAMERA_PIETON;
    const canvas = document.createElement("canvas");
    canvas.width = sol.largeur * sol.pxParM;
    canvas.height = sol.hauteur * sol.pxParM;

    const ctx = canvas.getContext("2d");
    const contour = PLAN_PARKING.contourPx.map(pxVersPlan);
    const parcelle = cheminSol(contour);
    const voie = trouverRevetement(choix.voie);
    const places = trouverRevetement(choix.places);

    remplirSol(ctx, parcelle, images.sols.pelouse);
    remplirSol(ctx, cheminsSol(PLAN_PARKING.massifs), images.sols.paillage);

    if (voie) remplirSol(ctx, cheminsSol(PLAN_PARKING.voies), images.sols[voie.texture]);

    if (places) {
        const rangees = PLAN_PARKING.rangees.map(r => rectangle(r.u0, r.v0, r.u1, r.v1));
        remplirSol(ctx, cheminsSol(rangees), images.sols[places.texture]);
        dessinerMarquagePieton(ctx, places);
    }

    // Variation douce : casse la répétition des tuiles
    ctx.save();
    ctx.clip(parcelle);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(images.usure, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    tracerSegmentsPlan(ctx, "rgb(200, 198, 188)", 0.15,
                       [cheminSol(PLAN_PARKING.bordExterieur), cheminSol(PLAN_PARKING.massifs[2])]);

    ctx.save();
    ctx.clip(parcelle);
    ombresArbresSurSol(ctx, objets);
    ctx.restore();

    adoucirBordSol(ctx, parcelle);

    return canvas;
}


function niveauxDeDetail(sol) {

    const niveaux = [sol];

    for (let i = 1; i <= 3; i++) {
        const precedent = niveaux[i - 1];
        const reduit = document.createElement("canvas");
        reduit.width = Math.ceil(precedent.width / 2);
        reduit.height = Math.ceil(precedent.height / 2);
        const ctx = reduit.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(precedent, 0, 0, reduit.width, reduit.height);
        niveaux.push(reduit);
    }

    return niveaux;
}


/** Fond le sol dans la photo : aucun bord tiré à la règle. */
function adoucirBordSol(ctx, parcelle) {

    const masque = document.createElement("canvas");
    masque.width = ctx.canvas.width;
    masque.height = ctx.canvas.height;

    dessinerOmbre(masque.getContext("2d"), (contexte) => {
        contexte.fillStyle = "#000";
        contexte.fill(parcelle);
    }, [0, 0], 16, "#000");

    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(masque, 0, 0);
    ctx.restore();
}


/**
 * Plaque le sol sur la photo. Sur une ligne de l'image, la perspective est
 * une simple transformation affine : chaque ligne est donc exacte.
 */
function plaquerSol(ctx, sol) {

    const { horizonY, hauteur, zoneVisible } = CAMERA_PIETON;
    const ligneHaut = horizonY + 10;
    const niveaux = niveauxDeDetail(sol);

    ctx.save();
    ctx.clip(cheminPx(zoneVisible));

    for (let y = ligneHaut; y < hauteur - 1; y++) {

        const origine = pointSolVu(0, y);
        const surColonne = pointSolVu(1, y);
        const surLigne = pointSolVu(0, y + 1);
        const ax = surColonne[0] - origine[0];
        const ay = surColonne[1] - origine[1];
        const bx = surLigne[0] - origine[0];
        const by = surLigne[1] - origine[1];

        // Plus le sol est loin, plus on lit une version réduite (évite le moiré)
        const empreinte = Math.sqrt(Math.hypot(ax, ay) * Math.hypot(bx, by));
        const niveau = Math.max(0, Math.min(niveaux.length - 1, Math.round(Math.log2(empreinte))));
        const reduction = 2 ** niveau;

        const det = ax * by - ay * bx;
        const a = by / det * reduction;
        const b = -ay / det * reduction;
        const c = -bx / det * reduction;
        const d = ax / det * reduction;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, CAMERA_PIETON.largeur, 1.5);
        ctx.clip();
        ctx.setTransform(a, b, c, d,
                         -(by * origine[0] - bx * origine[1]) / det,
                         y - (-ay * origine[0] + ax * origine[1]) / det);
        ctx.drawImage(niveaux[niveau], 0, 0);
        ctx.restore();
    }

    ctx.restore();
}


// ===============================
// LES ARBRES
// ===============================

function objetsArbresPieton(images, arbres) {

    return PLAN_PARKING.emplacementsArbres
        .map((emplacement, index) => ({ emplacement, plante: arbres[index] }))
        .filter(({ plante }) => plante)
        .map(({ emplacement, plante }) => {

            const essence = essencePourPlante(plante);
            const variantes = images.arbres[essence.familleNom] || images.arbres["rond-moyen"] || [];
            const graine = hacherTexte(emplacement.id + plante.nomVernaculaire);
            const sprite = variantes[graine % Math.max(1, variantes.length)];

            if (!sprite) return null;

            const largeurM = essence.diametre * (0.92 + (graine % 17) / 100);
            const houppierM = largeurM * sprite.hauteur / sprite.largeur;

            return {
                emplacement, sprite, largeurM, houppierM,
                hauteurM: houppierM + CAMERA_PIETON.hauteurTronc,
                reflet: (graine >> 5) % 2 === 1,
                vue: projeterPieton(emplacement.u, emplacement.v)
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.vue.distance - a.vue.distance);
}


/** Arbustes bas des massifs : position, sujet et taille tirés au sort (graine fixe). */
function objetsArbustesPieton(images) {

    const sujets = [...(images.arbres["rond-moyen"] || []), ...(images.arbres["rond-fonce"] || [])];
    const hasard = hasardFixe(13);
    const objets = [];

    if (!sujets.length) return objets;

    PLAN_PARKING.massifs.slice(2).forEach(massif => {

        const [u0, v0] = massif[0];
        const [u1, v1] = massif[2];

        for (let u = u0 + 0.6; u < u1 - 0.4; u += 1.1 + hasard() * 0.6) {
            for (let v = v0 + 0.6; v < v1 - 0.3; v += 1.1 + hasard() * 0.5) {

                const sprite = sujets[Math.floor(hasard() * sujets.length)];
                const largeurM = 0.55 + hasard() * 0.4;
                const uFinal = u + (hasard() - 0.5) * 0.4;

                objets.push({
                    sprite, largeurM, arbuste: true,
                    houppierM: largeurM * 0.6,
                    reflet: hasard() < 0.5,
                    vue: projeterPieton(uFinal, v)
                });
            }
        }
    });

    return objets;
}


// Réemploie les petits sujets des massifs de la vue piétonne.
function objetsVivacesPieton(images, vivaces) {
    const sujets = [...(images.arbres["rond-moyen"] || []), ...(images.arbres["rond-fonce"] || [])];
    if (!sujets.length) return [];

    return touffesVivaces(vivaces)
        .filter((_, index) => index % 3 === 0)
        .map(touffe => {
            const sprite = sujets[touffe.graine % sujets.length];
            const largeurM = 0.55 + (touffe.graine % 41) / 100;
            return {
                sprite, largeurM, arbuste: true,
                houppierM: largeurM * 0.6,
                reflet: touffe.graine % 2 === 0,
                vue: projeterPieton(touffe.u, touffe.v)
            };
        });
}


function dessinerArbrePieton(ctx, objet) {

    const { sprite, largeurM, houppierM, reflet, vue, arbuste } = objet;
    const { focale } = CAMERA_PIETON;
    const hauteurTronc = arbuste ? 0 : CAMERA_PIETON.hauteurTronc;
    const echelle = focale / vue.distance;
    const largeur = largeurM * echelle;
    const hauteur = houppierM * echelle;
    const basHouppier = vue.y - hauteurTronc * echelle;

    if (!arbuste) {
        const epaisseurTronc = Math.max(2, 0.24 * echelle);
        ctx.fillStyle = "rgb(46, 40, 34)";
        ctx.fillRect(vue.x - epaisseurTronc / 2, basHouppier - hauteur * 0.2, epaisseurTronc,
                     hauteurTronc * echelle + hauteur * 0.2);
    }

    ctx.save();
    ctx.translate(vue.x, basHouppier + hauteur * 0.06);
    if (reflet) ctx.scale(-1, 1);
    ctx.drawImage(sprite.image, -largeur / 2, -hauteur, largeur, hauteur);
    ctx.restore();
}


/**
 * Dessine la vue piétonne complète sur le canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {{ voie: string|null, places: string|null, arbres: Array<object|null>, vivaces: Array<object|null> }} choix
 * @returns {Promise<void>}
 */
function dessinerRenduPieton(canvas, choix) {

    return chargerImagesPieton().then(images => {

        canvas.width = CAMERA_PIETON.largeur;
        canvas.height = CAMERA_PIETON.hauteur;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(images.photo, 0, 0);

        const objets = objetsArbresPieton(images, choix.arbres || []);

        plaquerSol(ctx, construireSolPieton(images, choix, objets));

        ctx.save();
        ctx.clip(cheminPx(CAMERA_PIETON.zoneVisible));
        objetsArbustesPieton(images)
            .sort((a, b) => b.vue.distance - a.vue.distance)
            .forEach(objet => dessinerArbrePieton(ctx, objet));
        ctx.restore();

        objets.forEach(objet => dessinerArbrePieton(ctx, objet));

        const solVisible = cheminPx(CAMERA_PIETON.zoneVisible);
        objetsVivacesPieton(images, choix.vivaces || [])
            .filter(({ vue }) => vue.distance > 0 && ctx.isPointInPath(solVisible, vue.x, vue.y))
            .sort((a, b) => b.vue.distance - a.vue.distance)
            .forEach(objet => dessinerArbrePieton(ctx, objet));
    });
}
