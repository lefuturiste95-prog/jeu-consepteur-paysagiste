"""Produit les tuiles de revêtement du rendu (image/parking/rendu/textures/).

Chaque tuile est raccordable, à l'échelle réelle (PX_PAR_M), et déjà
« harmonisée » avec l'orthophoto : on garde le relief de la texture
photographique (luminance) et on impose une teinte relevée sur la photo IGN.
Le jeu les fait pivoter dans l'axe du plan au moment du dessin.

Usage : python textures.py <dossier_textures_ambientcg>
Textures CC0 de ambientCG : https://ambientcg.com
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from commun import CADRE_M, PX_PAR_M, SORTIE

LUMA = np.array([0.299, 0.587, 0.114])

# nom: (fichier ambientCG, taille réelle en cm, teinte RGB cible, contraste de luminance)
# Teintes calées sur la photo : la cour en enrobé mesure (147, 160, 166),
# écart-type de luminance 3,5 ; la pelouse (74, 80, 73).
MATERIAUX = {
    "enrobe":         ("Asphalt033", 250, (108, 117, 123), 4),
    "beton-drainant": ("Concrete049", 110, (163, 170, 168), 5),
    "paves-beton":    ("PavingStones070", 115, (152, 152, 146), 5),
    "stabilise":      ("Ground111", 280, (168, 160, 142), 4),
    "gravier":        ("Gravel043", 160, (174, 172, 162), 6),
    "pelouse":        ("Grass004", 140, (72, 86, 70), 5),
    "paillage":       ("Ground111", 280, (92, 84, 72), 5),
}


def charger(dossier, nom):
    return Image.open(Path(dossier) / f"{nom}_1K-JPG_Color.jpg").convert("RGB")


def teinter(image, rgb, contraste):
    """Relief de la texture (luminance normalisée) + teinte imposée."""
    a = np.asarray(image).astype(float)
    lum = a @ LUMA
    relief = (lum - lum.mean()) / (lum.std() + 1e-6) * contraste
    sortie = np.array(rgb, dtype=float)[None, None, :] + relief[..., None]
    return Image.fromarray(np.clip(sortie, 0, 255).astype(np.uint8))


def adoucir_raccordable(tuile, rayon=0.6):
    """Flou optique de l'ortho, sans casser le raccord des bords."""
    w, h = tuile.size
    grande = Image.new("RGB", (w * 3, h * 3))
    for i in range(3):
        for j in range(3):
            grande.paste(tuile, (i * w, j * h))
    grande = grande.filter(ImageFilter.GaussianBlur(rayon))
    return grande.crop((w, h, 2 * w, 2 * h))


def a_l_echelle(image, taille_cm):
    cote = max(4, round(taille_cm / 100 * PX_PAR_M))
    return image.resize((cote, cote), Image.LANCZOS)


def dalles_gazon():
    """Dalles béton-gazon (60 x 40 cm, alvéoles enherbées), dessinées à 1 cm/px."""
    rng = np.random.default_rng(1)
    w, h = 240, 240                      # 2,4 m x 2,4 m
    beton = np.array([150, 156, 152], dtype=float)
    herbe = np.array([70, 92, 68], dtype=float)
    img = np.ones((h, w, 3)) * beton + rng.normal(0, 6, (h, w, 1))
    for y in range(0, h, 20):
        for x in range(0, w, 20):
            alveole = herbe + rng.normal(0, 10, 3)
            img[y + 4:y + 16, x + 4:x + 16] = alveole + rng.normal(0, 8, (12, 12, 1))
    img[::40, :] *= 0.8                  # joints entre dalles
    img[:, ::60] *= 0.8
    tuile = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    return tuile.resize((24, 24), Image.LANCZOS)


def paves_joints_herbe(dossier):
    """Pavés à joints larges enherbés : les joints sombres deviennent verts."""
    image = charger(dossier, "PavingStones070")
    a = np.asarray(image).astype(float)
    lum = a @ LUMA
    joint = np.clip((np.percentile(lum, 40) - lum) / 18, 0, 1)[..., None]
    pierre = np.array([150, 148, 140], dtype=float) + ((lum - lum.mean()) / lum.std() * 6)[..., None]
    herbe = np.array([74, 94, 70], dtype=float)
    melange = pierre * (1 - joint) + herbe * joint
    tuile = Image.fromarray(np.clip(melange, 0, 255).astype(np.uint8))
    return a_l_echelle(tuile, 115)


def usure():
    """Calque de variation douce (salissure, usure) à multiplier sur les sols.

    Gris clair : 255 = aucun effet. Casse la répétition des tuiles et ajoute
    le grain du capteur.
    """
    w, h = CADRE_M[0] * PX_PAR_M, CADRE_M[1] * PX_PAR_M
    rng = np.random.default_rng(11)
    total = np.zeros((h, w))
    for echelle_m, poids in ((12, 1.0), (4, 0.6), (1.2, 0.35)):
        pas = max(2, int(echelle_m * PX_PAR_M))
        grille = rng.normal(0, 1, (h // pas + 3, w // pas + 3))
        couche = Image.fromarray(((grille + 4) / 8 * 255).clip(0, 255).astype(np.uint8))
        couche = couche.resize((w + 3 * pas, h + 3 * pas), Image.BICUBIC).crop((pas, pas, w + pas, h + pas))
        total += (np.asarray(couche).astype(float) / 255 - 0.5) * poids
    grain = rng.normal(0, 0.012, (h, w))
    valeur = 1 - np.clip(total * 0.09, -0.02, 0.12) + grain
    return Image.fromarray(np.clip(valeur * 255, 0, 255).astype(np.uint8))


def bruit_multi_echelle(taille, echelles, graine):
    """Somme de bruits doux (échelles en mètres, poids), centrée sur 0."""
    w, h = taille
    rng = np.random.default_rng(graine)
    total = np.zeros((h, w))
    for echelle_m, poids in echelles:
        pas = max(2, int(echelle_m * PX_PAR_M))
        grille = rng.normal(0, 1, (h // pas + 3, w // pas + 3))
        couche = Image.fromarray(((grille + 4) / 8 * 255).clip(0, 255).astype(np.uint8))
        couche = couche.resize((w + 3 * pas, h + 3 * pas), Image.BICUBIC).crop((pas, pas, w + pas, h + pas))
        total += (np.asarray(couche).astype(float) / 255 - 0.5) * poids
    return total


def pelouse_pleine(dossier):
    """Pelouse du cadre entier, sans répétition visible.

    Une pelouse vue du ciel en été est marbrée : plaques plus sèches,
    zones plus vertes, traces de tonte. Le grain fin vient de la texture
    photographique, les variations de bruits à plusieurs échelles.
    """
    w, h = CADRE_M[0] * PX_PAR_M, CADRE_M[1] * PX_PAR_M
    fin = teinter(a_l_echelle(charger(dossier, "Grass004"), 140), (0, 0, 0), 5)
    grain = np.asarray(fin).astype(float)[..., 0]
    grain = np.tile(grain, (h // grain.shape[0] + 1, w // grain.shape[1] + 1))[:h, :w]

    vert = np.array([74, 84, 68], dtype=float)
    sec = np.array([100, 98, 82], dtype=float)
    secheresse = np.clip(bruit_multi_echelle((w, h), ((14, 1.0), (5, 0.7)), 3) * 1.6 + 0.25, 0, 0.75)
    relief = bruit_multi_echelle((w, h), ((8, 0.5), (2.5, 0.6), (0.8, 0.6), (0.3, 0.6)), 5) * 18

    couleur = vert * (1 - secheresse[..., None]) + sec * secheresse[..., None]
    couleur += (relief + grain)[..., None]
    image = Image.fromarray(np.clip(couleur, 0, 255).astype(np.uint8))
    return image.filter(ImageFilter.GaussianBlur(0.5))


def main():
    dossier = sys.argv[1]
    sortie = SORTIE / "textures"
    sortie.mkdir(parents=True, exist_ok=True)

    for nom, (source, taille_cm, rgb, contraste) in MATERIAUX.items():
        tuile = teinter(a_l_echelle(charger(dossier, source), taille_cm), rgb, contraste)
        adoucir_raccordable(tuile).save(sortie / f"{nom}.png")

    adoucir_raccordable(dalles_gazon()).save(sortie / "dalles-gazon.png")
    adoucir_raccordable(paves_joints_herbe(dossier)).save(sortie / "paves-joints-herbe.png")
    usure().save(SORTIE / "usure.png")
    pelouse_pleine(dossier).save(SORTIE / "pelouse.jpg", quality=88)
    print("textures :", sorted(p.name for p in sortie.iterdir()))


if __name__ == "__main__":
    main()
