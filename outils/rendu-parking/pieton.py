"""Prépare les images de la vue piétonne (image/parking/rendu/pieton/).

- Arbres vus de côté : détourés par SAM 2 dans les deux photos du site, puis
  étalonnés sur le contre-jour de la photo « accès » utilisée comme fond.
- Sols : mêmes textures ambientCG que la vue aérienne, mais à 30 px/m, car le
  parking est vu de bien plus près.

Usage : python pieton.py <dossier_textures_ambientcg> <poids_sam2.pt>
"""
import json
import sys

import cv2
import numpy as np
from PIL import Image, ImageFilter

from commun import RACINE, SORTIE
from textures import LUMA, charger

PHOTOS = RACINE / "image" / "parking"
TERRAIN = "vue-pieton-terrain.jpeg"
ACCES = "vue-pieton-acces.jpeg"
DEMI_FENETRE = 170

# Points posés sur les arbres ; (r, v, b) : étalonnage vers la lumière du fond
GRIS_VERT = (0.68, 0.78, 0.66)
POURPRE = (0.52, 0.34, 0.42)
ARBRES = {
    "rond-fonce":  [(TERRAIN, 1125, 510, (0.5, 0.62, 0.5)), (TERRAIN, 325, 515, (0.52, 0.64, 0.52))],
    "rond-moyen":  [(TERRAIN, 770, 520, GRIS_VERT), (TERRAIN, 1040, 480, GRIS_VERT), (TERRAIN, 325, 515, GRIS_VERT)],
    "leger-clair": [(TERRAIN, 500, 498, (0.7, 0.8, 0.58)), (TERRAIN, 770, 520, (0.74, 0.84, 0.6))],
    "pourpre":     [(TERRAIN, 1125, 510, POURPRE), (TERRAIN, 850, 525, POURPRE)],
    "conifere":    [(ACCES, 640, 480, (1.0, 1.05, 1.0))],
    "colonnaire":  [(ACCES, 945, 425, (0.52, 0.68, 0.5)), (ACCES, 975, 400, (0.52, 0.68, 0.5))],
}

PX_PAR_M_SOL = 30
# nom: (source, taille réelle cm, teinte RGB au soleil, contraste)
SOLS = {
    "enrobe":         ("Asphalt033", 250, (82, 82, 84), 9),
    "beton-drainant": ("Concrete049", 110, (176, 173, 165), 9),
    "paves-beton":    ("PavingStones070", 115, (160, 155, 145), 16),
    "stabilise":      ("Ground111", 280, (182, 166, 136), 11),
    "gravier":        ("Gravel043", 160, (186, 181, 166), 15),
    "pelouse":        ("Grass004", 140, (92, 116, 54), 14),
    "paillage":       ("Ground111", 280, (84, 67, 50), 11),
}


def detourer(modele, image, x, y):
    x0, y0 = max(0, x - DEMI_FENETRE), max(0, y - DEMI_FENETRE)
    fenetre = image[y0:y + DEMI_FENETRE, x0:x + DEMI_FENETRE]
    resultat = modele.predict(fenetre[..., ::-1].copy(), points=[[x - x0, y - y0]], labels=[1], verbose=False)
    masque = (resultat[0].masks.data[0].cpu().numpy() > 0.5).astype(np.uint8)
    nombre, etiquettes, stats, _ = cv2.connectedComponentsWithStats(masque)
    masque = (etiquettes == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    return fenetre, masque


def exporter_arbre(fenetre, masque, etalonnage, destination):
    """Applique l'étalonnage, adoucit le bord et recadre ; renvoie la taille."""
    noyau = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    masque = cv2.erode(cv2.morphologyEx(masque, cv2.MORPH_CLOSE, noyau, iterations=2), noyau)
    rgb = np.clip(fenetre * np.array(etalonnage), 0, 255).astype(np.uint8)
    alpha = Image.fromarray(masque * 255).filter(ImageFilter.GaussianBlur(0.8))
    sprite = Image.fromarray(np.dstack([rgb, np.asarray(alpha)]), "RGBA")
    sprite = sprite.crop(alpha.point(lambda v: 255 if v > 8 else 0).getbbox())
    sprite.save(destination, optimize=True)
    return sprite.size


def teinter_hd(image, rgb, contraste):
    a = np.asarray(image).astype(float)
    lum = a @ LUMA
    relief = (lum - lum.mean()) / (lum.std() + 1e-6) * contraste
    return Image.fromarray(np.clip(np.array(rgb, float)[None, None, :] + relief[..., None], 0, 255).astype(np.uint8))


def a_l_echelle_hd(image, taille_cm):
    cote = max(4, round(taille_cm / 100 * PX_PAR_M_SOL))
    return image.resize((cote, cote), Image.LANCZOS)


def dalles_gazon_hd():
    """Alvéoles enherbées de 20 cm, dessinées à 1 cm/px puis réduites."""
    rng = np.random.default_rng(1)
    img = np.ones((240, 240, 3)) * np.array([146, 148, 130.0]) + rng.normal(0, 6, (240, 240, 1))
    for y in range(0, 240, 20):
        for x in range(0, 240, 20):
            img[y + 4:y + 16, x + 4:x + 16] = np.array([96, 122, 56.0]) + rng.normal(0, 10, (12, 12, 1))
    img[::40, :] *= 0.78
    img[:, ::60] *= 0.78
    cote = round(2.4 * PX_PAR_M_SOL)
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((cote, cote), Image.LANCZOS)


def paves_joints_herbe_hd(dossier):
    a = np.asarray(charger(dossier, "PavingStones070")).astype(float)
    lum = a @ LUMA
    joint = np.clip((np.percentile(lum, 40) - lum) / 18, 0, 1)[..., None]
    pierre = np.array([158, 153, 142.0]) + ((lum - lum.mean()) / lum.std() * 12)[..., None]
    melange = pierre * (1 - joint) + np.array([100, 130, 54.0]) * joint
    return a_l_echelle_hd(Image.fromarray(np.clip(melange, 0, 255).astype(np.uint8)), 115)


def main():
    from ultralytics import SAM

    dossier, poids = sys.argv[1], sys.argv[2]
    sortie = SORTIE / "pieton"
    (sortie / "sol").mkdir(parents=True, exist_ok=True)

    photos = {nom: np.asarray(Image.open(PHOTOS / nom).convert("RGB")) for nom in (TERRAIN, ACCES)}
    modele = SAM(poids)
    familles = {}

    for famille, sources in ARBRES.items():
        familles[famille] = []
        for rang, (photo, x, y, etalonnage) in enumerate(sources, start=1):
            fenetre, masque = detourer(modele, photos[photo], x, y)
            nom = f"{famille}-{rang}.png"
            largeur, hauteur = exporter_arbre(fenetre, masque, etalonnage, sortie / nom)
            familles[famille].append({"fichier": "pieton/" + nom, "largeur": largeur, "hauteur": hauteur})

    for nom, (source, taille, rgb, contraste) in SOLS.items():
        teinter_hd(a_l_echelle_hd(charger(dossier, source), taille), rgb, contraste).save(sortie / "sol" / f"{nom}.png")
    dalles_gazon_hd().save(sortie / "sol" / "dalles-gazon.png")
    paves_joints_herbe_hd(dossier).save(sortie / "sol" / "paves-joints-herbe.png")

    (SORTIE / "sprites-pieton.js").write_text(
        "// Généré par outils/rendu-parking/pieton.py\n"
        "window.SPRITES_PIETON = " + json.dumps({"familles": familles}, indent=1) + ";\n", encoding="utf-8")
    print({famille: len(liste) for famille, liste in familles.items()})


if __name__ == "__main__":
    main()
