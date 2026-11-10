/* Vue vectorielle du jeu, dans le même repère que le rendu aérien. */
window.QGISParking = {
    afficher(conteneur) {
        const { contourPx, voies, rangees, largeurPlace, massifs, noue, emplacementsArbres } = PLAN_PARKING;
        const { largeur, hauteur, pxParM } = RENDU;
        const clipId = conteneur.id + "-emprise";
        const pointsSvg = points => points.map(point => point.join(",")).join(" ");
        const polygone = (points, classe) =>
            `<polygon class="${classe}" points="${pointsSvg(points)}"/>`;
        const contour = pointsSvg(contourPx);
        const cheminVoies = voies.map(voie => `M ${pointsSvg(voie.map(versPx))} Z`).join(" ");

        const places = rangees.map(({ u0, u1, v0, v1 }) => {
            const bord = polygone(rectangle(u0, v0, u1, v1).map(versPx), "qgis-place-standard");
            const separateurs = [];
            for (let u = u0 + largeurPlace; u < u1; u += largeurPlace) {
                const [x1, y1] = versPx([u, v0]);
                const [x2, y2] = versPx([u, v1]);
                separateurs.push(`<line class="qgis-place-standard" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
            }
            return bord + separateurs.join("");
        }).join("");

        const [xNoue, yNoue] = versPx([noue.u0, noue.v]);
        const largeurNoue = noue.largeur * pxParM;
        const rotation = RENDU.angle * 180 / Math.PI;
        const echelle = 20 * pxParM;
        const arbres = emplacementsArbres.map(({ u, v }) => {
            const [x, y] = versPx([u, v]);
            return `<circle class="qgis-arbre" cx="${x}" cy="${y}" r="${2.4 * pxParM}"/>`;
        }).join("");

        conteneur.innerHTML = `
            <svg class="qgis-svg" viewBox="0 0 ${largeur} ${hauteur}"
                 aria-label="Plan vectoriel du parking à l’échelle">
                <defs>
                    <clipPath id="${clipId}"><polygon points="${contour}"/></clipPath>
                </defs>
                <polygon class="qgis-emprise-polygone" points="${contour}"/>
                <g clip-path="url(#${clipId})">
                    <rect class="qgis-noue-polygone" x="${-largeurNoue / 2}" y="${-largeurNoue / 2}"
                          width="${(noue.u1 - noue.u0) * pxParM + largeurNoue}" height="${largeurNoue}"
                          rx="${largeurNoue / 2}" transform="translate(${xNoue} ${yNoue}) rotate(${rotation})"/>
                </g>
                ${massifs.map(massif => polygone(massif.map(versPx), "qgis-ile-plantee")).join("")}
                <path class="qgis-circulation" style="stroke:none" d="${cheminVoies}"/>
                ${places}
                ${arbres}
                <g class="qgis-echelle" transform="translate(30 ${hauteur - 34})">
                    <rect x="-12" y="-23" width="${echelle + 24}" height="38" rx="8"/>
                    <line x1="0" y1="0" x2="${echelle}" y2="0"/>
                    <line x1="0" y1="-6" x2="0" y2="6"/>
                    <line x1="${echelle}" y1="-6" x2="${echelle}" y2="6"/>
                    <text x="0" y="-9">0</text>
                    <text x="${echelle}" y="-9" text-anchor="end">20 m</text>
                </g>
            </svg>`;
    }
};
