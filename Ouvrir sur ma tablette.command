#!/bin/bash
# ===========================================================
#  L'Apprenti Concepteur — mise en ligne sur le réseau local
#  Double-cliquez sur ce fichier, puis tapez l'adresse affichée
#  dans le navigateur de la tablette (même Wi-Fi que ce Mac).
#  Pour arrêter : fermez cette fenêtre ou faites Ctrl + C.
# ===========================================================

cd "$(dirname "$0")" || exit 1

PORT=8000

# Adresse du Mac sur le réseau Wi-Fi (ou Ethernet en secours)
IP="$(ipconfig getifaddr en0 2>/dev/null)"
[ -z "$IP" ] && IP="$(ipconfig getifaddr en1 2>/dev/null)"
[ -z "$IP" ] && IP="$(ipconfig getifaddr en2 2>/dev/null)"
[ -z "$IP" ] && IP="localhost"

# Si le port est déjà pris, on en cherche un libre
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

ADRESSE="http://$IP:$PORT"

clear
printf '\n'
printf '  ╔══════════════════════════════════════════════════════╗\n'
printf '  ║          L APPRENTI CONCEPTEUR — SERVEUR LOCAL        ║\n'
printf '  ╚══════════════════════════════════════════════════════╝\n'
printf '\n'
printf '   Sur la tablette, ouvrez Safari ou Chrome et tapez :\n\n'
printf '        >>>  %s  <<<\n\n' "$ADRESSE"
printf '   Astuce : menu Partage > « Sur l écran d accueil »\n'
printf '   pour installer le jeu comme une vraie application.\n'
printf '\n'
printf '   Sur ce Mac : http://localhost:%s\n' "$PORT"
printf '\n'
printf '   Laissez cette fenêtre ouverte pendant la partie.\n'
printf '   ──────────────────────────────────────────────────────\n\n'

# Ouverture automatique sur le Mac
( sleep 1; open "http://localhost:$PORT" ) &

python3 -m http.server "$PORT" --bind 0.0.0.0
