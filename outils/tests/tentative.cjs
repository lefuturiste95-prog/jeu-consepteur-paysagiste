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
    console, Option, Path2D, crypto: require("node:crypto"),
    document: { querySelector: $, querySelectorAll: () => [], createElement: element, addEventListener() {} },
    window: { scrollTo() {}, QGISParking: { afficher() {} } },
    localStorage: { getItem: key => store[key] ?? null, removeItem:key=>{delete store[key];}, setItem: (key, value) => { store[key] = value; } },
    fetch: () => Promise.reject(new Error("Mode fichier local")),
    setTimeout: () => 0, clearTimeout() {}
});
const run = code => vm.runInContext(code, context);
for (const file of ["data/plantes-embarquees.js", "rendu-parking.js", "rendu-pieton.js", "tentative.js", "script.js", "parking-amenagement.js"]) {
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
     run(`
        function choisir(nom){return plantes.find(p=>p.nomScientifique.startsWith(nom));}
        const paletteComplete={...nouveauChoixParking(),voie:'stabilise',places:'dalles-gazon',
            arbres:['Acer campestre','Koelreuteria paniculata','Corylus colurna','Prunus padus','Betula nigra'].map(choisir),
            vivaces:['Salvia','Echinacea purpurea','Caltha palustris',"Carex elata 'Aurea'"].map(choisir)};
        partie.parking=paletteComplete;
    `);

 run('$("#bouton-valider-parking").disabled=false; validerParking()');
 assert.equal(run('partie.score'),5000);
 const cle='apprenti-tentative-validee-v1';
 assert(JSON.parse(store[cle]).jeton);
 assert.equal(JSON.parse(store[cle]).resultat.score,5000);
 $('#bouton-retour-resultat').onclick();
 assert.equal(run('partie.score'),5000);
 assert($('#ecran-bilan').classList.contains('est-actif'));
 $('#bouton-rejouer').onclick();
 assert($('#ecran-bilan').classList.contains('est-actif'));
 assert.equal(run('partie.resultats.length'),1);
 run('partie.score=0; partie.resultats=[]');await run('restaurerBilanValide()');
 assert.equal(run('partie.score'),5000);
 const resume=run('resumerBilan(partie.resultats[0])');
 assert.equal(resume.plantations.length,9);assert.equal(resume.revetements.length,2);
 assert(!JSON.stringify(resume).includes('image/'));
 run('window.TentativeLocale.actualiser({publie:true}); window.ScoresPartages={estConfigure:()=>true, statut:async()=>{throw Error("Hors ligne")},lire:async()=>[]}');
 await run('restaurerBilanValide()');assert(run('window.TentativeLocale.charger()'));
 run('window.ScoresPartages.statut=async()=>false');
 await run('restaurerBilanValide()');assert.equal(run('window.TentativeLocale.charger()'),null);
 assert($('#ecran-regles').classList.contains('est-actif'));
 console.log('Validation unique, retour au bilan, reprise après rechargement, maintien hors ligne et déblocage enseignant vérifiés.');
}
verify().catch(e=>{console.error(e);process.exitCode=1;});
