"""Produit la photo aérienne de base du rendu (image/parking/rendu/base.jpg).

Usage : python base.py
"""
from PIL import Image

from commun import (CADRE_M, CENTRE_LAT, CENTRE_LON, PX_PAR_M, SORTIE,
                    facteur_ign_vers_rendu, ortho_autour)


def main():
    largeur, hauteur = CADRE_M[0] * PX_PAR_M, CADRE_M[1] * PX_PAR_M
    facteur = facteur_ign_vers_rendu()
    native = ortho_autour(CENTRE_LON, CENTRE_LAT,
                          round(largeur / facteur), round(hauteur / facteur))
    base = native.resize((largeur, hauteur), Image.LANCZOS)
    SORTIE.mkdir(parents=True, exist_ok=True)
    base.save(SORTIE / "base.jpg", quality=90)
    print(f"base.jpg {base.size} (ortho native {native.size}, x{facteur:.3f})")


if __name__ == "__main__":
    main()
