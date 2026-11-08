"""Prélève des voitures garées dans l'ortho IGN (image/parking/rendu/voitures/).

SAM 2 détoure chaque voiture à partir d'un point, puis la voiture est
redressée (longueur à la verticale) et mise à l'échelle du rendu.
Le jeu la tourne ensuite dans l'axe des places.

Usage : python voitures.py <ortho.png> <poids_sam2.pt>
"""
import json
import sys

import cv2
import numpy as np
from PIL import Image

from commun import SORTIE, facteur_ign_vers_rendu

# Centres des voitures (px de l'ortho native utilisée pour les houppiers :
# 3000 x 3000 px centrés sur 3.2085, 50.5285), parking rue de la Libération.
POINTS = [
    (1698, 1228), (1710, 1222), (1722, 1217), (1733, 1212), (1745, 1207),
    (1757, 1200), (1768, 1192), (1779, 1183), (1792, 1178), (1803, 1173),
    (1757, 1265), (1768, 1260), (1781, 1253), (1793, 1252), (1805, 1247),
    (1815, 1238), (1825, 1225), (1838, 1223), (1848, 1213),
]
FENETRE = 64
DECALAGES = [(0, 0), (2, 5), (-2, -5), (4, 0), (-4, 0), (0, 4), (0, -4)]
LONGUEUR_MIN_PX, LONGUEUR_MAX_PX = 18, 30      # 3,4 à 5,7 m à 0,19 m/px


def redresser(fenetre, masque):
    """Tourne la voiture pour que sa longueur soit verticale ; recadre."""
    contours, _ = cv2.findContours(masque.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    (cx, cy), (w, h), angle = cv2.minAreaRect(max(contours, key=cv2.contourArea))
    if w > h:
        angle += 90
    rgba = Image.fromarray(np.dstack([fenetre, masque.astype(np.uint8) * 255]), "RGBA")
    droite = rgba.rotate(angle, resample=Image.BICUBIC, center=(cx, cy))
    droite = droite.crop(droite.getchannel("A").getbbox())
    return droite, max(w, h), min(w, h)


def composante_principale(masque):
    nombre, etiquettes, stats, _ = cv2.connectedComponentsWithStats(masque.astype(np.uint8))
    if nombre < 2:
        return masque
    return etiquettes == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))


def meilleure_voiture(modele, ortho, x, y, m):
    """Essaie le point et ses voisins ; garde le premier masque en forme de voiture."""
    for dx, dy in DECALAGES:
        cx, cy = x + dx, y + dy
        fenetre = ortho[cy - m:cy + m, cx - m:cx + m]
        resultat = modele.predict(fenetre[..., ::-1].copy(), points=[[m, m]], labels=[1], verbose=False)
        if not resultat or resultat[0].masks is None or len(resultat[0].masks.data) == 0:
            continue
        masque = composante_principale(resultat[0].masks.data[0].cpu().numpy() > 0.5)
        sprite, longueur, largeur = redresser(fenetre, masque)
        remplissage = masque.sum() / max(1, longueur * largeur)
        if (LONGUEUR_MIN_PX <= longueur <= LONGUEUR_MAX_PX
                and 1.6 <= longueur / largeur <= 2.8 and remplissage >= 0.8):
            return sprite, longueur
    return None


def main():
    from ultralytics import SAM

    ortho = np.asarray(Image.open(sys.argv[1]).convert("RGB"))
    modele = SAM(sys.argv[2])
    facteur = facteur_ign_vers_rendu()
    sortie = SORTIE / "voitures"
    sortie.mkdir(parents=True, exist_ok=True)
    m = FENETRE // 2
    voitures = []

    for x, y in POINTS:
        trouve = meilleure_voiture(modele, ortho, x, y, m)
        if trouve is None:
            print("rejet", x, y)
            continue

        sprite, longueur = trouve
        sprite = sprite.resize((round(sprite.width * facteur), round(sprite.height * facteur)), Image.LANCZOS)
        nom = f"voiture-{len(voitures) + 1:02d}.png"
        sprite.save(sortie / nom)
        voitures.append({"fichier": "voitures/" + nom, "longueurPx": round(longueur * facteur, 1)})
        print(nom, round(longueur * 0.19, 1), "m")

    (sortie / "voitures.json").write_text(json.dumps(voitures, indent=1))


if __name__ == "__main__":
    main()
