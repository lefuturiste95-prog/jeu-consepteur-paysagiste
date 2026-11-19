const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const [repo = path.resolve(__dirname, "../.."), folder = repo] = process.argv.slice(2);
const read = (name, dir = folder) => fs.readFileSync(fs.existsSync(path.join(dir, name))
    ? path.join(dir, name) : path.join(repo, name), "utf8").replace(/\r\n/g, "\n");
const html = read("index.html");
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const js = read("script.js");
for (const [, id] of js.matchAll(/\$\("#([\w-]+)"\)/g)) assert(ids.has(id), "Élément manquant : " + id);
assert(!/Chantier suivant|deux chantiers|1\/2/.test(html));

class Option {
    constructor(text, value) { this.text = text; this.value = String(value); }
}
class Path2D {
    constructor() { this.points = []; }
    moveTo(x, y) { this.points.push([x, y]); }
    lineTo(x, y) { this.points.push([x, y]); }
    closePath() {}
}
function dansPolygone(points, x, y) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [a, b] = points[i];
        const [c, d] = points[j];
        if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) inside = !inside;
    }
    return inside;
}

function element() {
    const classes = new Set();
    return {
        options: [], selectedIndex: -1, style: {}, dataset: {}, children: [], attributes: {},
        set innerHTML(value) { this.markup = value; this.children = []; },
        get innerHTML() { return this.markup || ""; },
        get value() { return this.options[this.selectedIndex]?.value || this.inputValue || ""; },
        set value(value) {
            this.inputValue = value;
            this.selectedIndex = this.options.findIndex(option => option.value === value);
        },
        replaceChildren(...options) { this.options = options; this.selectedIndex = 0; },
        appendChild(child) { this.children.push(child); },
        setAttribute(key, value) { this.attributes[key] = value; },
        addEventListener(event, listener) { this["on" + event] = listener; },
        focus() {},
        classList: {
            add: name => classes.add(name),
            remove: (...names) => names.forEach(name => classes.delete(name)),
            contains: name => classes.has(name),
            toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
        }
    };
}
const elements = new Map();
function $(selector) {
    if (!ids.has(selector.slice(1))) return null;
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
}
const store = {
    "apprenti-concepteur-config": JSON.stringify({ version: 1, chantiers: [
        { titreAnalyse: "Analyse personnalisée" }, { titre: "Ancien chantier" }
    ] })
};
const tracked = { traits: 0, fleurs: 0, sprites: 0 };
const brush = {
    drawImage(source) { if (source?.ancienSprite) tracked.sprites++; },
    clip() {}, save() {}, restore() {}, translate() {}, beginPath() {}, scale() {}, fillRect() {},
    ellipse() {}, fill() {}, moveTo() {}, quadraticCurveTo() {}, stroke() { tracked.traits++; },
    arc() { tracked.fleurs++; },
    isPointInPath: (p, x, y) => dansPolygone(p.points, x, y)
};
for (const id of ["scene-rendu", "resultat-rendu", "resultat-rendu-pieton", "bilan-rendu-canvas", "bilan-rendu-pieton"]) {
    $("#" + id).getContext = () => brush;
}
const context = vm.createContext({
    console, Option, Path2D,
    document: { querySelector: $, querySelectorAll: () => [], createElement: element, addEventListener() {} },
    window: { scrollTo() {}, QGISParking: { afficher() {} } },
    localStorage: { getItem: key => store[key] ?? null, setItem: (key, value) => { store[key] = value; } },
    fetch: () => Promise.reject(new Error("Mode fichier local")),
    setTimeout: () => 0, clearTimeout() {}
});
const run = code => vm.runInContext(code, context);
for (const file of ["data/selection-catalogue.js", "data/plantes-embarquees.js", "rendu-parking.js", "rendu-pieton.js", "script.js", "parking-amenagement.js"]) {
    run(read(file));
}
assert.equal(context.window.CSV_PLANTES, read("data/API_plantes.csv"));
run(`
    chargerImagesRendu = () => Promise.resolve({ base: {}, arbustes: [], houppiers: {} });
    chargerImagesPieton = () => Promise.resolve({ photo: {}, arbres: {
        "rond-moyen": [{ image: { ancienSprite: true }, largeur: 80, hauteur: 40 }]
    } });
    document.createElement = tag => tag === "canvas" ? { getContext: () => document.querySelector("#scene-rendu").getContext("2d") } : document.createMarker();
    dessinerSol = () => {};
    adoucirBord = () => {};
    dessinerVoitures = () => {};
    plaquerSol = () => {};
    construireSolPieton = () => {};
`);
context.document.createMarker = element;

async function verify(){
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(run('plantes.length'),26);
 assert.equal(run('plantes.filter(p=>p.groupe==="Arbre").length'),10);
 assert.equal(run('plantes.filter(p=>p.groupe==="Vivace").length'),16);
 assert.equal(run('new Set(plantes.map(p=>p.nomScientifique)).size'),26);
     run(`
        function choisir(nom){return plantes.find(p=>p.nomScientifique.startsWith(nom));}
        const paletteComplete={...nouveauChoixParking(),voie:'stabilise',places:'dalles-gazon',
            arbres:['Acer campestre','Koelreuteria paniculata','Corylus colurna','Prunus padus','Betula nigra'].map(choisir),
            vivaces:['Salvia','Echinacea purpurea','Caltha palustris',"Carex elata 'Aurea'"].map(choisir)};
        partie.parking=paletteComplete;
    `);

 assert.equal(run('PLAN_PARKING.emplacementsArbres.length'),5);
 assert.equal(run('PLAN_PARKING.emplacementsVivaces.length'),4);
 assert.equal(run('EMPLACEMENTS_PARKING.length'),9);
 assert.equal(run('PLAN_PARKING.emplacementsVivaces.reduce((s,z)=>s+(z.u1-z.u0)*(z.v1-z.v0),0)'),262);
 assert.equal(run('evaluerParking().score'),5000);
 run(`const autrePalette={...paletteComplete, arbres:['Acer campestre','Koelreuteria paniculata','Acer monspessulanum','Alnus glutinosa','Prunus padus'].map(choisir),vivaces:['Geranium sanguineum','Origanum vulgare','Caltha palustris','Molinia caerulea'].map(choisir)};partie.parking=autrePalette;`);
 assert.equal(run('evaluerParking().score'),5000,'Une autre palette atteint aussi le maximum');
 run('partie.parking=paletteComplete');
 assert.match(run('evaluerParking().criteres[4].detail'),/Objectif 5\/9/);
 assert.equal(run('evaluerParking().versionBareme'),7);
 for(const voie of run('REVETEMENTS.map(r=>r.id)'))for(const places of run('REVETEMENTS.map(r=>r.id)')){
  context.vTest=voie;context.pTest=places;
  run('partie.parking={...paletteComplete,voie:vTest,places:pTest}');
  const r=run('evaluerParking()');assert.equal(r.totaux.vegetaux,4000);assert(r.score<=5000);assert(r.criteres.every(c=>c.points>=0&&c.points<=c.maximum));
 }
 run('partie.parking=nouveauChoixParking(); construireChoixRevetements(); majAmenagementParking(); afficherMenuPlantation()');
 assert.equal($('#scene-arbres').children.length,9);
 assert.equal($('#compteur-plantations').textContent,'0/5 arbres · 0/4 secteurs de vivaces');
 assert($('#bouton-valider-parking').disabled);
 run('viserEmplacement(0)');assert.match($('#emplacement-courant').innerHTML,/15 m/);
 run('viserEmplacement(3)');assert.match($('#emplacement-courant').innerHTML,/16 m/);
 for(let i=0;i<9;i++){
  run('viserEmplacement('+i+')');context.iTest=i;
  const plante=run('iTest<5?paletteComplete.arbres[iTest]:paletteComplete.vivaces[iTest-5]');
  const menu=$('#choix-plantation');menu.value=String(plante.id);menu.onchange({target:menu});$('#bouton-planter').onclick();
 }
 $('#choix-voie').value='stabilise';$('#choix-voie').onchange();$('#choix-places').value='dalles-gazon';$('#choix-places').onchange();
 assert(!$('#bouton-valider-parking').disabled);assert.equal(run('evaluerParking().score'),5000);
 await run('renduEnCours');await run('dessinerRenduPieton($("#scene-rendu"),partie.parking)');
 console.log('5 arbres, 4 secteurs, 262 m², deux rendus, 49 couples de revêtements et maximum de 5 000 vérifiés.');
}
verify().catch(e=>{console.error(e);process.exitCode=1;});
