"""Étape 2 du prélèvement : exporte les houppiers triés à la main.

Lit selection.json (identifiants retenus par famille après tri visuel de la
planche-contact), nettoie chaque détourage, met à l'échelle du rendu, et écrit
image/parking/rendu/sprites.js, chargé par le jeu.

Usage : python exporter_sprites.py <dossier_candidats>
"""
import json
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

from commun import SORTIE, facteur_ign_vers_rendu

SELECTION = Path(__file__).parent / "selection.json"
MARGE_PX = 3


def nettoyer_masque(alpha):
    """Garde la tache principale, bouche les trous, ronge le liseré de fond."""
    masque = (alpha > 127).astype(np.uint8)
    nombre, etiquettes, stats, _ = cv2.connectedComponentsWithStats(masque)
    if nombre > 1:
        masque = (etiquettes == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    noyau = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    masque = cv2.morphologyEx(masque, cv2.MORPH_CLOSE, noyau, iterations=2)
    return cv2.erode(masque, noyau, iterations=1) * 255


def exporter(dossier, candidat, destination):
    """Écrit le sprite à l'échelle du rendu ; renvoie son diamètre en px."""
    source = Image.open(Path(dossier) / f"{candidat['id']:03d}.png").convert("RGBA")
    pixels = np.asarray(source)
    masque = nettoyer_masque(pixels[..., 3])
    facteur = facteur_ign_vers_rendu()

    rgb = Image.fromarray(pixels[..., :3]).resize(
        (round(source.width * facteur), round(source.height * facteur)), Image.LANCZOS)
    alpha = Image.fromarray(masque).resize(rgb.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.9))

    sprite = rgb.convert("RGBA")
    sprite.putalpha(alpha)
    x0, y0, x1, y1 = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    sprite.crop((max(0, x0 - MARGE_PX), max(0, y0 - MARGE_PX),
                 x1 + MARGE_PX, y1 + MARGE_PX)).save(destination, optimize=True)

    return round(float(2 * np.sqrt((np.asarray(alpha) > 127).sum() / np.pi)), 1)


def main():
    dossier = sys.argv[1]
    candidats = {c["id"]: c for c in json.loads((Path(dossier) / "candidats.json").read_text())}
    selection = json.loads(SELECTION.read_text())

    sortie = SORTIE / "arbres"
    if sortie.exists():
        shutil.rmtree(sortie)
    sortie.mkdir(parents=True)

    sprites = {"houppiers": {}, "arbustes": [], "voitures": []}

    for famille, identifiants in selection.items():
        liste = []
        for rang, ident in enumerate(identifiants, start=1):
            nom = f"{famille}-{rang:02d}.png"
            diametre = exporter(dossier, candidats[ident], sortie / nom)
            liste.append({"fichier": "arbres/" + nom, "diametrePx": diametre})
        if famille == "arbustes":
            sprites["arbustes"] = liste
        else:
            sprites["houppiers"][famille] = liste

    fichier_voitures = SORTIE / "voitures" / "voitures.json"
    if fichier_voitures.exists():
        sprites["voitures"] = json.loads(fichier_voitures.read_text())

    (SORTIE / "sprites.js").write_text(
        "// Généré par outils/rendu-parking/exporter_sprites.py\n"
        "window.SPRITES_PARKING = " + json.dumps(sprites, indent=1) + ";\n", encoding="utf-8")
    print({famille: len(liste) for famille, liste in sprites["houppiers"].items()},
          len(sprites["arbustes"]), "arbustes", len(sprites["voitures"]), "voitures")


if __name__ == "__main__":
    main()
