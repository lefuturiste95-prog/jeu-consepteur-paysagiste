"""Étape 1 du prélèvement : détecte et détoure les houppiers dans l'ortho IGN.

Repère les taches de feuillage (texturées, vertes ou pourpres), puis demande
à SAM 2 de détourer chacune à partir de son centre. Ne garde que les
houppiers entiers, compacts et de taille plausible. Produit un dossier de
candidats et une planche-contact numérotée pour le tri visuel.

Usage : python detecter_houppiers.py <ortho.png> <dossier_candidats> <poids_sam2.pt>
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

from commun import metres_par_pixel_ign

M_PX = metres_par_pixel_ign()
DIAMETRE_MIN_M, DIAMETRE_MAX_M = 1.4, 13
FENETRE = 128                 # px natifs autour du candidat donnés à SAM
COMPACITE_MIN = 0.86          # aire / aire de l'enveloppe convexe
VEGETAL_MIN = 0.80            # part de pixels végétaux dans le masque
MAX_RETENUS = 140             # largement assez pour le tri visuel


def ecart_local(lum, taille):
    moy = ndimage.uniform_filter(lum, taille)
    moy2 = ndimage.uniform_filter(lum * lum, taille)
    return np.sqrt(np.maximum(moy2 - moy * moy, 0))


def cartes(image):
    """Feuillage d'arbre (texturé) et végétal au sens large (pelouse comprise)."""
    a = np.asarray(image).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = a @ np.array([0.299, 0.587, 0.114])
    exg = (2 * g - r - b) / (r + g + b + 1e-6)
    vert = exg > 0.05
    pourpre = (r > g + 4) & (r > b) & (lum < 95) & (lum > 25)
    feuillage = (vert | pourpre) & (ecart_local(lum, 5) > 7) & (lum > 35)
    feuillage = ndimage.binary_opening(feuillage, iterations=1)
    feuillage = ndimage.binary_closing(feuillage, iterations=2)
    return feuillage, vert | pourpre


def candidats(feuillage):
    distance = ndimage.gaussian_filter(ndimage.distance_transform_edt(feuillage), 2)
    pics = ((distance == ndimage.maximum_filter(distance, size=15))
            & (distance > DIAMETRE_MIN_M / 2 / M_PX))
    ys, xs = np.nonzero(pics)
    # Ordre mélangé (graine fixe) : mêle petits et grands sujets si on s'arrête tôt
    ordre = np.random.default_rng(4).permutation(len(xs))
    return [(int(xs[i]), int(ys[i])) for i in ordre]


def compacite(masque):
    contours, _ = cv2.findContours(masque.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return 0
    principal = max(contours, key=cv2.contourArea)
    enveloppe = cv2.contourArea(cv2.convexHull(principal))
    return cv2.contourArea(principal) / enveloppe if enveloppe else 0


def main():
    from ultralytics import SAM

    ortho = Image.open(sys.argv[1]).convert("RGB")
    sortie = Path(sys.argv[2])
    sortie.mkdir(parents=True, exist_ok=True)
    modele = SAM(sys.argv[3])

    feuillage, vegetal = cartes(ortho)
    pixels = np.asarray(ortho)
    deja_pris = np.zeros(feuillage.shape, dtype=bool)
    h, w = feuillage.shape
    m = FENETRE // 2
    retenus = []

    for x, y in candidats(feuillage):
        if deja_pris[y, x] or not (m <= x < w - m and m <= y < h - m):
            continue
        fenetre = pixels[y - m:y + m, x - m:x + m]
        resultat = modele.predict(fenetre[..., ::-1].copy(), points=[[m, m]], labels=[1], verbose=False)
        if not resultat or resultat[0].masks is None or len(resultat[0].masks.data) == 0:
            continue
        masque = resultat[0].masks.data[0].cpu().numpy() > 0.5
        aire = masque.sum()
        diametre = 2 * np.sqrt(aire / np.pi) * M_PX
        bord = masque[0].any() or masque[-1].any() or masque[:, 0].any() or masque[:, -1].any()
        part_vegetale = vegetal[y - m:y + m, x - m:x + m][masque].mean() if aire else 0
        if (bord or not DIAMETRE_MIN_M <= diametre <= DIAMETRE_MAX_M
                or part_vegetale < VEGETAL_MIN or compacite(masque) < COMPACITE_MIN):
            continue

        deja_pris[y - m:y + m, x - m:x + m] |= masque
        ident = len(retenus)
        rgba = np.dstack([fenetre, masque.astype(np.uint8) * 255])
        Image.fromarray(rgba, "RGBA").save(sortie / f"{ident:03d}.png")
        couleur = fenetre[masque].mean(axis=0)
        retenus.append({"id": ident, "x": x, "y": y, "diametre_m": round(float(diametre), 2),
                        "rgb": [round(float(c), 1) for c in couleur]})
        (sortie / "candidats.json").write_text(json.dumps(retenus, indent=1))
        print(ident, x, y, round(float(diametre), 1), flush=True)
        if len(retenus) >= MAX_RETENUS:
            break

    planche(sortie, retenus)


def planche(sortie, retenus, cote=96, par_ligne=16):
    lignes = max(1, (len(retenus) + par_ligne - 1) // par_ligne)
    image = Image.new("RGB", (par_ligne * cote, lignes * cote), (255, 0, 255))
    dessin = ImageDraw.Draw(image)
    for i, c in enumerate(retenus):
        sprite = Image.open(sortie / f"{c['id']:03d}.png")
        sprite = sprite.crop(sprite.getchannel("A").getbbox())
        sprite.thumbnail((cote - 4, cote - 14))
        x, y = (i % par_ligne) * cote, (i // par_ligne) * cote
        image.paste(sprite, (x + 2, y + 12), sprite)
        dessin.text((x + 2, y), f"{c['id']} {c['diametre_m']:.0f}m", fill="white")
    image.save(sortie / "planche.png")


if __name__ == "__main__":
    main()
