/* ==========================================================
   RENDU DU PARKING
   Compose l'aménagement choisi sur l'orthophoto IGN du site.
   ----------------------------------------------------------
   Toutes les images de image/parking/rendu/ sont préparées par
   les scripts de outils/rendu-parking/ : même échelle (10 px/m),
   même lumière (soleil au sud-est) que la photo de base.
   ========================================================== */


// ===============================
// REPERE DU PLAN
// ===============================

const RENDU = {
    dossier: "image/parking/rendu/",
    largeur: 1600,
    hauteur: 900,
    pxParM: 10,

    // Le plan est décrit en mètres dans un repère aligné sur la parcelle :
    // u le long de la route (vers l'est), v vers le sud.
    origine: [520, 300],
    angle: -16 * Math.PI / 180,

    // Ombres portées vers le nord-ouest (mesuré sur les arbres de la photo)
    directionOmbre: [-0.55, -0.83],
    couleurOmbre: "rgba(12, 22, 26, 0.58)"
};


function versPx([u, v]) {

    const cos = Math.cos(RENDU.angle);
    const sin = Math.sin(RENDU.angle);
    const k = RENDU.pxParM;

    return [
        RENDU.origine[0] + (u * cos - v * sin) * k,
        RENDU.origine[1] + (u * sin + v * cos) * k
    ];
}


function rectangle(u0, v0, u1, v1) {
    return [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
}


// ===============================
// LE PLAN (FIXE)
// ===============================
// Coordonnées en mètres dans le repère ci-dessus. Pour corriger le plan,
// il suffit de modifier ces valeurs.

const PLAN_PARKING = {

    // Limite de la parcelle, en pixels de base.jpg
    contourPx: [[445, 430], [520, 410], [515, 295], [1010, 152], [1165, 585], [495, 790]],

    voies: [
        rectangle(0, -0.5, 6, 31.5),     // voie ouest + entrée depuis la route
        rectangle(0, 7, 50, 13),         // voie nord
        rectangle(0, 25.5, 50, 31.5),    // voie sud
        rectangle(44, 7, 50, 31.5)       // voie est (bouclage)
    ],

    // Rangées de places : 2,5 m de large, 5 m de profondeur
    rangees: [
        { u0: 6, u1: 44, v0: 2, v1: 7 },
        { u0: 6, u1: 44, v0: 13, v1: 18 },
        { u0: 6, u1: 44, v0: 20.5, v1: 25.5 },
        { u0: 6, u1: 44, v0: 31.5, v1: 36.5 }
    ],
    largeurPlace: 2.5,

    // Contour extérieur de la surface circulée (bordures)
    bordExterieur: [
        [0, -0.5], [6, -0.5], [6, 2], [44, 2], [44, 7], [50, 7],
        [50, 31.5], [44, 31.5], [44, 36.5], [6, 36.5], [6, 31.5], [0, 31.5]
    ],

    // Massifs plantés (paillage + arbustes)
    massifs: [
        rectangle(6, 0, 50, 2),
        rectangle(44, 2, 50, 7),
        rectangle(6, 18, 44, 20.5)
    ],

    // Noue de gestion des eaux pluviales, le long du ruisseau
    noue: { u0: -14, u1: 54, v: 41.5, largeur: 4 },

    emplacementsArbres: [
        { id: "m1", milieu: "bande", u: 9.75,  v: 19.25 },
        { id: "m2", milieu: "bande", u: 17.25, v: 19.25 },
        { id: "m3", milieu: "bande", u: 24.75, v: 19.25 },
        { id: "m4", milieu: "bande", u: 32.25, v: 19.25 },
        { id: "m5", milieu: "bande", u: 39.75, v: 19.25 },
        { id: "n1", milieu: "noue", u: 2,     v: 41 },
        { id: "n2", milieu: "noue", u: 11,    v: 41.5 },
        { id: "n3", milieu: "noue", u: 20,    v: 41 },
        { id: "n4", milieu: "noue", u: 29,    v: 41.5 },
        { id: "n5", milieu: "noue", u: 38,    v: 41 },
        { id: "n6", milieu: "noue", u: 47,    v: 41.5 }
    ]
};


// ===============================
// CATALOGUE DES REVETEMENTS
// ===============================
// voie / places : note sur 100 selon la perméabilité et l'usage
// (roulage continu ou stationnement).

const REVETEMENTS = [
    {
        id: "enrobe", nom: "Enrobé bitumineux", texture: "enrobe",
        marquage: "peinture", voie: 50, places: 25,
        avis: "Durable et confortable, mais totalement imperméable : toute la pluie part au réseau."
    },
    {
        id: "beton-drainant", nom: "Béton drainant", texture: "beton-drainant",
        marquage: "peinture", voie: 100, places: 85,
        avis: "Résiste au roulage tout en laissant l'eau s'infiltrer : idéal pour les voies."
    },
    {
        id: "paves-beton", nom: "Pavés béton à joints perméables", texture: "paves-beton",
        marquage: "peinture", voie: 85, places: 80,
        avis: "Bonne infiltration par les joints et bonne tenue au passage des véhicules."
    },
    {
        id: "stabilise", nom: "Stabilisé (grave compactée)", texture: "stabilise",
        marquage: "bordurette", voie: 55, places: 70,
        avis: "Perméable et économique, mais il se creuse d'ornières sous un trafic régulier."
    },
    {
        id: "gravier", nom: "Gravier en dalles alvéolées", texture: "gravier",
        marquage: "bordurette", voie: 40, places: 85,
        avis: "Très perméable pour stationner ; peu confortable en circulation continue."
    },
    {
        id: "dalles-gazon", nom: "Dalles béton-gazon", texture: "dalles-gazon",
        marquage: "bordurette", voie: 20, places: 100,
        avis: "Places vertes et infiltrantes ; le gazon ne supporte pas le passage répété des voies."
    },
    {
        id: "paves-joints-herbe", nom: "Pavés à joints enherbés", texture: "paves-joints-herbe",
        marquage: "bordurette", voie: 45, places: 100,
        avis: "Très bonne infiltration et aspect végétal pour les places de stationnement."
    }
];

const COULEURS_MARQUAGE = {
    peinture:   "rgba(226, 228, 222, 0.8)",
    bordurette: "rgba(178, 180, 172, 0.6)"
};


// ===============================
// ARBRES : FAMILLES DE HOUPPIER
// ===============================
// Vu du ciel à 10 px/m, on lit la forme, la couleur et la taille du
// houppier, pas l'espèce. Chaque essence est rattachée à une famille
// de houppiers prélevés dans l'orthophoto, avec son diamètre 10 ans
// après plantation (m). « ombre » : longueur de l'ombre portée
// rapportée au diamètre (un arbre étroit et haut porte loin).

const FAMILLES_HOUPPIER = {
    "rond-fonce":  { ombre: 0.36 },
    "rond-moyen":  { ombre: 0.34 },
    "leger-clair": { ombre: 0.34 },
    "pourpre":     { ombre: 0.3 },
    "conifere":    { ombre: 0.62 },
    "colonnaire":  { ombre: 1.0, famille: "rond-fonce" }
};

const ESSENCES_PARKING = {
    "Acer campestre": ["rond-moyen", 4.5],
    "Acer platanoides": ["rond-fonce", 5.5],
    "Acer pseudoplatanus": ["rond-moyen", 6],
    "Acer saccharinum": ["leger-clair", 6.5],
    "Acer palmatum": ["pourpre", 3],
    "Acer rubrum": ["rond-moyen", 5],
    "Aesculus hippocastanum": ["rond-fonce", 6.5],
    "Alnus glutinosa": ["rond-fonce", 5],
    "Alnus cordata": ["rond-moyen", 5],
    "Betula pendula": ["leger-clair", 4.5],
    "Betula pubescens": ["leger-clair", 4.5],
    "Carpinus betulus": ["rond-fonce", 5],
    "Castanea sativa": ["rond-fonce", 6.5],
    "Catalpa bignonioides": ["leger-clair", 6],
    "Cèdre du Liban": ["conifere", 5],
    "Cercis siliquastrum": ["leger-clair", 4],
    "Corylus colurna": ["rond-moyen", 4.5],
    "Crataegus monogyna": ["rond-moyen", 3.5],
    "Fagus sylvatica": ["rond-fonce", 6],
    "Fraxinus excelsior": ["leger-clair", 6],
    "Ginkgo biloba": ["leger-clair", 3.5],
    "Gleditsia triacanthos": ["leger-clair", 6],
    "Koelreuteria paniculata": ["leger-clair", 4.5],
    "Laburnum anagyroides": ["leger-clair", 3.5],
    "Liquidambar styraciflua": ["rond-moyen", 4.5],
    "Liriodendron tulipifera": ["rond-moyen", 6],
    "Magnolia kobus": ["rond-moyen", 4],
    "Magnolia grandiflora": ["rond-fonce", 4.5],
    "Malus sylvestris": ["rond-moyen", 4],
    "Metasequoia glyptostroboides": ["conifere", 4],
    "Morus alba": ["rond-moyen", 5],
    "Morus nigra": ["rond-fonce", 4],
    "Ostrya carpinifolia": ["rond-fonce", 5],
    "Parrotia persica": ["rond-moyen", 4],
    "Paulownia tomentosa": ["leger-clair", 7],
    "Pinus sylvestris": ["conifere", 4.5],
    "Pinus pinea": ["conifere", 6],
    "Platanus x hispanica": ["rond-moyen", 7],
    "Populus alba": ["leger-clair", 6.5],
    "Populus nigra": ["colonnaire", 3.5],
    "Populus tremula": ["leger-clair", 5],
    "Prunus avium": ["rond-moyen", 5],
    "Prunus cerasifera": ["rond-moyen", 4.5],
    "Pyrus calleryana": ["rond-moyen", 4],
    "Quercus cerris": ["rond-fonce", 6],
    "Quercus ilex": ["rond-fonce", 5],
    "Quercus petraea": ["rond-fonce", 6],
    "Quercus robur": ["rond-fonce", 6.5],
    "Quercus rubra": ["rond-moyen", 6.5],
    "Salix alba": ["leger-clair", 7],
    "Sequoiadendron giganteum": ["conifere", 4.5],
    "Sorbus aucuparia": ["leger-clair", 3.5],
    "Taxodium distichum": ["conifere", 4],
    "Tilia cordata": ["rond-fonce", 5.5],
    "Tilia platyphyllos": ["rond-fonce", 6],
    "Tilia x europaea": ["rond-fonce", 6],
    "Ulmus minor": ["rond-fonce", 5.5],
    "Abies alba": ["conifere", 4],
    "Picea abies": ["conifere", 4],
    "Taxus baccata": ["conifere", 3]
};

const ESSENCE_PAR_DEFAUT = ["rond-moyen", 5];


function essencePourPlante(plante) {

    const [familleNom, diametre] =
        ESSENCES_PARKING[plante.nomScientifique] ||
        ESSENCES_PARKING[plante.nomVernaculaire] ||
        ESSENCE_PAR_DEFAUT;

    const famille = FAMILLES_HOUPPIER[familleNom];

    return {
        famille: famille.famille || familleNom,
        familleNom,
        diametre,
        ombre: famille.ombre
    };
}


// ===============================
// HASARD REPRODUCTIBLE
// ===============================
// Le même plan donne toujours la même image.

function hasardFixe(graine) {

    let etat = graine >>> 0;

    return () => {
        etat = (etat + 0x6D2B79F5) >>> 0;
        let t = etat;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


function hacherTexte(texte) {

    let h = 2166136261;

    for (const caractere of texte) {
        h = Math.imul(h ^ caractere.charCodeAt(0), 16777619);
    }

    return h >>> 0;
}


// ===============================
// CHARGEMENT DES IMAGES
// ===============================

let imagesRendu = null;


function chargerImage(chemin) {

    return new Promise((resoudre, rejeter) => {
        const image = new Image();
        image.onload = () => resoudre(image);
        image.onerror = () => rejeter(new Error("Image introuvable : " + chemin));
        image.src = RENDU.dossier + chemin;
    });
}


function chargerSprite(sprite) {
    return chargerImage(sprite.fichier).then(image => ({ ...sprite, image }));
}


function chargerImagesRendu() {

    if (imagesRendu) {
        return Promise.resolve(imagesRendu);
    }

    const sprites = window.SPRITES_PARKING || { houppiers: {}, arbustes: [], voitures: [] };
    const textures = [...new Set([
        "paillage",
        ...REVETEMENTS.map(revetement => revetement.texture)
    ])];

    const promesses = {
        base: chargerImage("base.jpg"),
        pelouse: chargerImage("pelouse.jpg"),
        usure: chargerImage("usure.png"),
        textures: Promise.all(textures.map(nom => chargerImage("textures/" + nom + ".png")))
            .then(images => Object.fromEntries(textures.map((nom, i) => [nom, images[i]]))),
        houppiers: Promise.all(Object.entries(sprites.houppiers).map(([famille, liste]) =>
            Promise.all(liste.map(chargerSprite)).then(images => [famille, images])))
            .then(Object.fromEntries),
        arbustes: Promise.all(sprites.arbustes.map(chargerSprite)),
        voitures: Promise.all(sprites.voitures.map(chargerSprite))
    };

    const cles = Object.keys(promesses);

    return Promise.all(Object.values(promesses)).then(valeurs => {
        imagesRendu = Object.fromEntries(cles.map((cle, i) => [cle, valeurs[i]]));
        return imagesRendu;
    });
}


// ===============================
// OUTILS DE DESSIN
// ===============================

function cheminPx(points) {

    const chemin = new Path2D();

    points.forEach(([x, y], i) => {
        if (i === 0) chemin.moveTo(x, y);
        else chemin.lineTo(x, y);
    });

    chemin.closePath();
    return chemin;
}


function cheminPlan(points) {
    return cheminPx(points.map(versPx));
}


function cheminPlusieurs(polygones) {

    const chemin = new Path2D();
    polygones.forEach(polygone => chemin.addPath(cheminPlan(polygone)));
    return chemin;
}


/** Remplit un chemin avec une texture tournée dans l'axe du plan. */
function remplirTexture(ctx, chemin, texture) {

    ctx.save();
    ctx.clip(chemin);
    ctx.translate(RENDU.origine[0], RENDU.origine[1]);
    ctx.rotate(RENDU.angle);
    ctx.fillStyle = ctx.createPattern(texture, "repeat");
    ctx.fillRect(-RENDU.largeur * 2, -RENDU.hauteur * 2, RENDU.largeur * 4, RENDU.hauteur * 4);
    ctx.restore();
}


/** Assombrit légèrement les sols (usure, salissure, grain du capteur). */
function appliquerUsure(ctx, chemin, usure) {

    ctx.save();
    ctx.clip(chemin);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(usure, 0, 0);
    ctx.restore();
}


/**
 * Ombre floue d'une silhouette, sans filtre CSS (non géré sur iPad) :
 * on dessine l'objet hors du canvas et on ne garde que son ombre,
 * ramenée à sa place.
 */
function dessinerOmbre(ctx, dessin, decalage, flou, couleur) {

    const loin = RENDU.largeur * 3;

    ctx.save();
    ctx.shadowColor = couleur;
    ctx.shadowBlur = flou;
    ctx.shadowOffsetX = loin + decalage[0];
    ctx.shadowOffsetY = decalage[1];
    ctx.translate(-loin, 0);
    dessin(ctx);
    ctx.restore();
}


/**
 * Reflet d'un houppier par rapport à l'axe du soleil : la seule
 * variation qui garde un éclairage juste (une rotation le fausserait).
 */
function appliquerReflet(ctx) {

    const [dx, dy] = RENDU.directionOmbre;
    const n = Math.hypot(dx, dy);
    const ux = dx / n;
    const uy = dy / n;

    ctx.transform(2 * ux * ux - 1, 2 * ux * uy, 2 * ux * uy, 2 * uy * uy - 1, 0, 0);
}


// ===============================
// LES COUCHES DU RENDU
// ===============================

function trouverRevetement(id) {
    return REVETEMENTS.find(revetement => revetement.id === id) || null;
}


function dessinerSol(ctx, images, choix) {

    const parcelle = cheminPx(PLAN_PARKING.contourPx);
    const revetementVoie = trouverRevetement(choix.voie);
    const revetementPlaces = trouverRevetement(choix.places);

    // Pelouse : image pleine du cadre, sans répétition de motif
    ctx.save();
    ctx.clip(parcelle);
    ctx.drawImage(images.pelouse, 0, 0);
    ctx.restore();

    dessinerNoue(ctx);
    remplirTexture(ctx, cheminPlusieurs(PLAN_PARKING.massifs), images.textures.paillage);

    if (revetementVoie) {
        remplirTexture(ctx, cheminPlusieurs(PLAN_PARKING.voies),
                       images.textures[revetementVoie.texture]);
    }

    if (revetementPlaces) {
        const places = PLAN_PARKING.rangees.map(r => rectangle(r.u0, r.v0, r.u1, r.v1));
        remplirTexture(ctx, cheminPlusieurs(places), images.textures[revetementPlaces.texture]);
        dessinerMarquage(ctx, revetementPlaces);
    }

    appliquerUsure(ctx, parcelle, images.usure);
    dessinerBordures(ctx);
}


function dessinerNoue(ctx) {

    const { u0, u1, v, largeur } = PLAN_PARKING.noue;
    const [x0, y0] = versPx([u0, v]);
    const [x1, y1] = versPx([u1, v]);

    // Fond de noue plus humide : bandes de plus en plus étroites et sombres
    ctx.save();
    ctx.clip(cheminPx(PLAN_PARKING.contourPx));
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(24, 48, 30, 0.1)";

    for (let i = 6; i >= 1; i--) {
        ctx.lineWidth = largeur * RENDU.pxParM * i / 6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }

    ctx.restore();
}


function dessinerMarquage(ctx, revetement) {

    ctx.save();
    ctx.strokeStyle = COULEURS_MARQUAGE[revetement.marquage];
    ctx.lineWidth = revetement.marquage === "peinture" ? 1.2 : 1.6;

    PLAN_PARKING.rangees.forEach(rangee => {

        for (let u = rangee.u0; u <= rangee.u1 + 0.01; u += PLAN_PARKING.largeurPlace) {
            const [xa, ya] = versPx([u, rangee.v0]);
            const [xb, yb] = versPx([u, rangee.v1]);
            ctx.beginPath();
            ctx.moveTo(xa, ya);
            ctx.lineTo(xb, yb);
            ctx.stroke();
        }
    });

    ctx.restore();
}


function dessinerBordures(ctx) {

    const chemin = cheminPlusieurs([PLAN_PARKING.bordExterieur, PLAN_PARKING.massifs[2]]);
    const [ox, oy] = RENDU.directionOmbre;

    // Petite ombre de la bordure, côté nord-ouest
    ctx.save();
    ctx.translate(ox * 1.2, oy * 1.2);
    ctx.strokeStyle = "rgba(20, 28, 26, 0.35)";
    ctx.lineWidth = 1.4;
    ctx.stroke(chemin);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(186, 188, 180, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke(chemin);
    ctx.restore();
}


/** Fond le nouveau sol dans la photo avec un bord adouci (évite l'effet « collé »). */
function adoucirBord(ctxSol) {

    const masque = document.createElement("canvas");
    masque.width = RENDU.largeur;
    masque.height = RENDU.hauteur;

    dessinerOmbre(masque.getContext("2d"), (contexte) => {
        contexte.fillStyle = "#000";
        contexte.fill(cheminPx(PLAN_PARKING.contourPx));
    }, [0, 0], 12, "#000");

    ctxSol.save();
    ctxSol.globalCompositeOperation = "destination-in";
    ctxSol.drawImage(masque, 0, 0);
    ctxSol.restore();
}


function dessinerHouppier(ctx, objet, longueurOmbre, avecReflet) {

    const { sprite, position, diametre } = objet;
    const echelle = diametre * RENDU.pxParM / sprite.diametrePx;
    const w = sprite.image.width * echelle;
    const h = sprite.image.height * echelle;
    const [dx, dy] = RENDU.directionOmbre;
    const portee = diametre * RENDU.pxParM * longueurOmbre;

    const poser = (contexte) => {
        contexte.translate(position[0], position[1]);
        if (avecReflet) appliquerReflet(contexte);
        contexte.drawImage(sprite.image, -w / 2, -h / 2, w, h);
    };

    dessinerOmbre(ctx, poser, [dx * portee, dy * portee],
                  Math.max(2, diametre * 0.9), RENDU.couleurOmbre);

    ctx.save();
    poser(ctx);
    ctx.restore();
}


/** Arbustes des massifs : position, sujet et taille tirés au sort (graine fixe). */
function dessinerArbustes(ctx, images) {

    if (!images.arbustes.length) return;

    const hasard = hasardFixe(7);

    PLAN_PARKING.massifs.forEach(massif => {

        const [u0, v0] = massif[0];
        const [u1, v1] = massif[2];

        for (let u = u0 + 0.8; u < u1 - 0.6; u += 1.3 + hasard() * 0.8) {
            const v = v0 + (v1 - v0) * (0.3 + hasard() * 0.4);
            const sprite = images.arbustes[Math.floor(hasard() * images.arbustes.length)];
            const objet = { sprite, position: versPx([u, v]), diametre: 1.1 + hasard() * 0.8 };
            dessinerHouppier(ctx, objet, 0.25, false);
        }
    });
}


function dessinerVoitures(ctx, images) {

    if (!images.voitures.length) return;

    const hasard = hasardFixe(21);
    const pas = PLAN_PARKING.largeurPlace;
    const [dx, dy] = RENDU.directionOmbre;

    PLAN_PARKING.rangees.forEach(rangee => {

        for (let u = rangee.u0 + pas / 2; u < rangee.u1; u += pas) {

            if (hasard() > 0.62) continue;

            const sprite = images.voitures[Math.floor(hasard() * images.voitures.length)];
            const [x, y] = versPx([u + (hasard() - 0.5) * 0.4, (rangee.v0 + rangee.v1) / 2]);
            const echelle = 4.4 * RENDU.pxParM / sprite.longueurPx;
            const w = sprite.image.width * echelle;
            const h = sprite.image.height * echelle;
            const sens = hasard() < 0.5 ? 0 : Math.PI;

            const poser = (contexte) => {
                contexte.translate(x, y);
                contexte.rotate(RENDU.angle + sens);
                contexte.drawImage(sprite.image, -w / 2, -h / 2, w, h);
            };

            dessinerOmbre(ctx, poser, [dx * 6, dy * 6], 3, "rgba(12, 22, 26, 0.5)");

            ctx.save();
            poser(ctx);
            ctx.restore();
        }
    });
}


function dessinerArbres(ctx, images, arbres) {

    const objets = PLAN_PARKING.emplacementsArbres
        .map((emplacement, index) => ({ emplacement, plante: arbres[index] }))
        .filter(({ plante }) => plante)
        .map(({ emplacement, plante }) => {

            const essence = essencePourPlante(plante);
            const variantes = images.houppiers[essence.famille] || images.houppiers["rond-moyen"] || [];
            const graine = hacherTexte(emplacement.id + plante.nomVernaculaire);

            return {
                essence,
                sprite: variantes[graine % Math.max(1, variantes.length)],
                position: versPx([emplacement.u, emplacement.v]),
                diametre: essence.diametre * (0.92 + (graine % 17) / 100),
                reflet: (graine >> 5) % 2 === 1
            };
        })
        .filter(objet => objet.sprite)
        // Du nord au sud : un houppier au sud recouvre l'ombre de son voisin
        .sort((a, b) => a.position[1] - b.position[1]);

    objets.forEach(objet => dessinerHouppier(ctx, objet, objet.essence.ombre, objet.reflet));
}


/**
 * Dessine le rendu complet sur le canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {{ voie: string|null, places: string|null, arbres: Array<object|null> }} choix
 * @returns {Promise<void>}
 */
function dessinerRenduParking(canvas, choix) {

    return chargerImagesRendu().then(images => {

        canvas.width = RENDU.largeur;
        canvas.height = RENDU.hauteur;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(images.base, 0, 0);

        // Le nouveau sol est composé à part, puis fondu dans la photo.
        const sol = document.createElement("canvas");
        sol.width = RENDU.largeur;
        sol.height = RENDU.hauteur;
        const ctxSol = sol.getContext("2d");
        dessinerSol(ctxSol, images, choix);
        adoucirBord(ctxSol);
        ctx.drawImage(sol, 0, 0);

        dessinerArbustes(ctx, images);
        dessinerVoitures(ctx, images);
        dessinerArbres(ctx, images, choix.arbres || []);
    });
}


/** Position d'un emplacement d'arbre en % de l'image (pour les boutons). */
function positionEmplacementPourcent(emplacement) {

    const [x, y] = versPx([emplacement.u, emplacement.v]);
    return { x: x / RENDU.largeur * 100, y: y / RENDU.hauteur * 100 };
}
