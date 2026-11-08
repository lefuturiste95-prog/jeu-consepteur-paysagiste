"""Réglages communs à la préparation des images du rendu Parking.

Toutes les images produites partagent la même échelle (PX_PAR_M) et la
même lumière que l'orthophoto IGN : c'est ce qui rend le résultat cohérent.
"""
import io
import math
import time
import urllib.request
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
SORTIE = RACINE / "image" / "parking" / "rendu"

# Centre de la parcelle (Institut de Genech, rue de la Libération)
CENTRE_LON = 3.2100463
CENTRE_LAT = 50.5284710

# Cadre du rendu : 160 m x 90 m, 10 pixels par mètre
PX_PAR_M = 10
CADRE_M = (160, 90)

# Orthophoto IGN (BD ORTHO 20 cm, Licence Ouverte 2.0)
ZOOM_IGN = 19
COUCHE_IGN = "ORTHOIMAGERY.ORTHOPHOTOS"
URL_WMTS = (
    "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0"
    "&LAYER={couche}&STYLE=normal&TILEMATRIXSET=PM"
    "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg"
)

# Lumière mesurée sur les houppiers de l'ortho : soleil au sud-est,
# ombres portées vers le nord-ouest.
DIRECTION_OMBRE = (-0.55, -0.83)


def metres_par_pixel_ign(lat=CENTRE_LAT, z=ZOOM_IGN):
    return 40075016.686 * math.cos(math.radians(lat)) / (256 * 2 ** z)


def pixel_global(lon, lat, z=ZOOM_IGN):
    """Position en pixels (fractionnaires) dans la grille Web Mercator."""
    n = 2 ** z * 256
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def telecharger_tuile(x, y, z=ZOOM_IGN, couche=COUCHE_IGN):
    url = URL_WMTS.format(x=x, y=y, z=z, couche=couche)
    requete = urllib.request.Request(url, headers={"User-Agent": "apprenti-concepteur/1.0"})
    for essai in range(3):
        try:
            with urllib.request.urlopen(requete, timeout=30) as reponse:
                return Image.open(io.BytesIO(reponse.read())).convert("RGB")
        except OSError:
            if essai == 2:
                raise
            time.sleep(1 + essai)


def ortho_autour(lon, lat, largeur_px, hauteur_px, z=ZOOM_IGN):
    """Extrait de l'ortho IGN native, centré sur (lon, lat)."""
    cx, cy = pixel_global(lon, lat, z)
    x0, y0 = cx - largeur_px / 2, cy - hauteur_px / 2
    tx0, ty0 = int(x0 // 256), int(y0 // 256)
    tx1, ty1 = int((x0 + largeur_px) // 256), int((y0 + hauteur_px) // 256)
    mosaique = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            mosaique.paste(telecharger_tuile(tx, ty, z), ((tx - tx0) * 256, (ty - ty0) * 256))
    gauche, haut = x0 - tx0 * 256, y0 - ty0 * 256
    return mosaique.crop((round(gauche), round(haut),
                          round(gauche + largeur_px), round(haut + hauteur_px)))


def facteur_ign_vers_rendu():
    return metres_par_pixel_ign() * PX_PAR_M
