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
for (const file of ["data/plantes-embarquees.js", "rendu-parking.js", "rendu-pieton.js", "script.js", "parking-amenagement.js"]) {
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

async function verify() {
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(run('plantes.length'),51);
    assert.equal(run('PLAN_PARKING.emplacementsVivaces.length'),5);
    assert.equal(run('EMPLACEMENTS_PARKING.length'),12);
    const zones=run('PLAN_PARKING.emplacementsVivaces');
    assert.equal(zones.filter(z=>z.milieu==='lisiere').length,3);
    assert.equal(zones.filter(z=>z.milieu==='noue').length,2);
    assert.equal(zones.reduce((s,z)=>s+(z.u1-z.u0)*(z.v1-z.v0),0),262);
    const anciennes=[[6,0,18,2],[18,0,31,2],[31,0,44,2],[44,0,50,7],[0,40,16,43],[16,40,32,43],[32,40,48,43]];
    for(let u=.25;u<50;u+=.5)for(let v=.25;v<43;v+=.5){
        assert.equal(zones.some(z=>u>=z.u0&&u<z.u1&&v>=z.v0&&v<z.v1),anciennes.some(z=>u>=z[0]&&u<z[2]&&v>=z[1]&&v<z[3]),'Surface conservée '+u+','+v);
    }
    run(`
        function choisir(nom){return plantes.find(p=>p.nomScientifique.startsWith(nom));}
        const paletteComplete={...nouveauChoixParking(),voie:'stabilise',places:'dalles-gazon',
            arbres:['Acer campestre','Koelreuteria paniculata','Ostrya carpinifolia','Carpinus betulus','Corylus colurna','Prunus padus','Betula nigra'].map(choisir),
            vivaces:['Salvia','Geranium sanguineum','Echinacea purpurea','Caltha palustris',"Carex elata 'Aurea'"].map(choisir)};
        partie.parking=paletteComplete;
    `);
    const parfait=run('evaluerParking()');
    assert.equal(parfait.score,5000,'Le maximum doit être atteignable avec le vrai catalogue');
    assert.equal(parfait.maximum,5000);
    assert.equal(parfait.totaux.vegetaux,4000);
    assert.equal(parfait.totaux.revetements,1000);
    assert.equal(parfait.criteres.reduce((s,c)=>s+c.maximum,0),5000);
    assert.equal(parfait.etoiles,3);
    assert.equal(parfait.calendrier.filter(m=>m.especes.length).length,7);

    run("partie.parking={...paletteComplete,arbres:paletteComplete.arbres.map((p,i)=>i===4?paletteComplete.arbres[2]:p)}");
    const doublon=run('evaluerParking()');
    assert.equal(doublon.score,4966,'Une seule répétition doit coûter des points sans arrondi à 100');
    run("partie.parking={...paletteComplete,arbres:paletteComplete.arbres.map((p,i)=>i===0?choisir('Amelanchier'):p)}");
    const partiel=run('evaluerParking()');
    assert.equal(partiel.criteres[0].points,600);
    assert.equal(partiel.criteres[1].points,1330,'Un seul état du sol sur deux vaut un crédit partiel');
    assert.equal(partiel.lignesPlantations[0].tauxSol,.5);
    assert(!partiel.lignesPlantations[0].humComplet);
    assert(partiel.score<5000 && partiel.etoiles<3);
    run("partie.parking={...paletteComplete,vivaces:paletteComplete.vivaces.map((p,i)=>i===3?paletteComplete.vivaces[4]:p)}");
    const sansMars=run('evaluerParking()');
    assert.equal(sansMars.criteres[3].points,428,'Les mois manquants restent visibles après l’arrondi');
    run("partie.parking={...paletteComplete,arbres:paletteComplete.arbres.map(p=>({...p,pollinisateurs:null})),vivaces:paletteComplete.vivaces.map(p=>({...p,pollinisateurs:null}))}");
    assert.equal(run('evaluerParking().criteres[3].points'),0);
    assert.equal(run('evaluerParking().criteres[4].points'),0);
    run("partie.parking={...paletteComplete,arbres:paletteComplete.arbres.map(()=>choisir('Salvia')),vivaces:paletteComplete.vivaces.map(()=>choisir('Acer'))}");
    assert.equal(run('evaluerParking().totaux.vegetaux'),0,'Pas de points gratuits pour le mauvais groupe');

    assert.equal(parfait.criteres[5].maximum,500);
    assert.equal(parfait.criteres[6].maximum,500);
    assert.equal(parfait.criteres[5].points,500);
    assert.equal(parfait.criteres[6].points,500);
    run("partie.parking={...paletteComplete,vivaces:paletteComplete.vivaces.map((p,i)=>i===0?choisir('Achillea'):p)}");
    const partielVivace=run('evaluerParking()');
    assert.equal(partielVivace.criteres[1].maximum-partielVivace.criteres[1].points,42);
    assert.equal(partiel.criteres[1].maximum-partiel.criteres[1].points,70,'Une même erreur d’humidité pèse davantage pour un arbre');

    run('partie.parking=nouveauChoixParking()');
    assert.equal(run('evaluerParking().score'),0);

    for(const voie of run('REVETEMENTS.map(r=>r.id)'))for(const places of run('REVETEMENTS.map(r=>r.id)')){
        context.vTest=voie;context.pTest=places;
        run('partie.parking={...paletteComplete,voie:vTest,places:pTest}');
        const note=run('evaluerParking()');
        assert.equal(note.totaux.vegetaux,4000);
        assert(Number.isInteger(note.score)&&note.score>=0&&note.score<=5000);
        const a=run('REVETEMENTS.find(r=>r.id===vTest)'),b=run('REVETEMENTS.find(r=>r.id===pTest)');
        const attendu=run('evaluerRevetement(REVETEMENTS.find(r=>r.id===vTest),"voie").points + evaluerRevetement(REVETEMENTS.find(r=>r.id===pTest),"places").points');
        assert.equal(note.totaux.revetements,attendu);
    }
    run("partie.parking={...paletteComplete,voie:'enrobe',places:'enrobe'}");
    assert(run('evaluerParking().score')<5000);
    run("partie.parking={...paletteComplete,voie:'dalles-gazon',places:'beton-drainant'}");
    assert(run('evaluerParking().score')<5000);
    run("partie.parking={...paletteComplete}; const beton=REVETEMENTS.find(r=>r.id==='beton-drainant'); beton.eau--");
    assert(run('evaluerParking().score')<=5000);
    run('beton.eau++');
    for(let i=0;i<250;i++){
        run("partie.parking={...paletteComplete,arbres:paletteComplete.arbres.map(()=>plantes.filter(p=>p.groupe==='Arbre')[Math.floor(Math.random()*20)]),vivaces:paletteComplete.vivaces.map(()=>plantes.filter(p=>p.groupe==='Vivace')[Math.floor(Math.random()*31)])}");
        const note=run('evaluerParking()');
        assert(Number.isInteger(note.score)&&note.score>=0&&note.score<=5000);
        assert(note.criteres.every(c=>Number.isInteger(c.points)&&c.points>=0&&c.points<=c.maximum));
    }

    assert(!ids.has('bouton-regles'));
    assert(!ids.has('voile-regles'));
    $('#bouton-jouer').onclick();
    assert($('#ecran-regles').classList.contains('est-actif'));
    assert(!$('#ecran-jeu').classList.contains('est-actif'));
    $('#bouton-retour-regles').onclick();
    assert($('#ecran-accueil').classList.contains('est-actif'));
    $('#bouton-jouer').onclick();
    assert($('#ecran-regles').classList.contains('est-actif'));
    $('#bouton-demarrer-analyse').onclick();
    assert($('#ecran-jeu').classList.contains('est-actif'));
    assert($('#ecran-jeu').classList.contains('mode-parking-analyse'));
    run("partie.analyseTrouvee.add(listePointsAnalyseParking()[0].id)");
    $('#bouton-retour-etape').onclick();
    assert(run('partie.analyseEnPause'));
    $('#bouton-jouer').onclick();
    assert($('#ecran-jeu').classList.contains('est-actif'));
    assert.equal(run('partie.analyseTrouvee.size'),1,'La reprise conserve l’analyse sans rejouer le tutoriel');
    run('listePointsAnalyseParking().forEach(p=>partie.analyseTrouvee.add(p.id)); majAnalyseParking()');
    $('#bouton-passer-amenagement').onclick();
    $('#bouton-rendu-parking').onclick();
    assert.equal($('#scene-arbres').children.length,12);
    assert.equal($('#compteur-plantations').textContent,'0/7 arbres · 0/5 secteurs de vivaces');
    assert($('#bouton-valider-parking').disabled);
    run('validerParking()');
    assert.equal(run('partie.resultats.length'),1);
    for(const [id,valeur] of [['#choix-voie','stabilise'],['#choix-places','dalles-gazon']]){$(id).value=valeur;$(id).onchange();}
    for(let i=0;i<12;i++){
        run('viserEmplacement('+i+')');
        context.choixIndex=i;
        const plante=run('choixIndex<7?paletteComplete.arbres[choixIndex]:paletteComplete.vivaces[choixIndex-7]');
        const menu=$('#choix-plantation');
        menu.value=String(plante.id);menu.onchange({target:menu});
        assert.doesNotMatch($('#fiche-plantation').innerHTML,/\d+\s*(?:%|points)|✓|compatible|à revoir|Zone conseillée|Déjà présente/);
        assert(!menu.options.some(o=>o.text.startsWith('✓')));
        $('#bouton-planter').onclick();
        if(i<11)assert($('#bouton-valider-parking').disabled);
    }
    assert.equal($('#compteur-plantations').textContent,'7/7 arbres · 5/5 secteurs de vivaces');
    assert(!$('#bouton-valider-parking').disabled);
    await run('renduEnCours');
    const nombreTouffes=run('touffesVivaces(partie.parking.vivaces).length');
    assert(nombreTouffes>100);
    const avantSprites=tracked.sprites;
    await run('dessinerRenduPieton($("#scene-rendu"),partie.parking)');
    assert(tracked.sprites>avantSprites+20);
    $('#bouton-valider-parking').onclick();
    assert.equal(run('partie.score'),5000);
    assert.equal($('#resultat-max').textContent,'/ 5000 points');
    assert.match($('#resultat-detail').innerHTML,/Végétaux/);
    assert.match($('#resultat-detail').innerHTML,/Revêtements/);
    assert.match($('#resultat-detail').innerHTML,/5000|5 000/);
    $('#bouton-retour-resultat').onclick();
    assert.equal(run('partie.score'),0);
    $('#bouton-valider-parking').onclick();
    $('#bouton-suite').onclick();
    assert.equal(run('partie.score'),5000);
    assert.equal($('#bilan-etoiles').textContent,3);
    assert.equal($('#bilan-pourcent').textContent,'100 %');
    $('#bouton-revoir').onclick();
    assert.match($('#detail-partie').innerHTML,/5000 \/ 5000/);
    assert.equal(run('CLE_CLASSEMENT'),'apprenti-concepteur-classement-5000-v5');
    assert(read('admin.js').includes('apprenti-concepteur-classement-5000-v5'));
    assert(!/points \/ 100|note sur 100|\/ 100 points/.test(html));
    $('#bouton-rejouer').onclick();
    assert($('#ecran-regles').classList.contains('est-actif'),'Chaque nouvelle partie commence par les explications');
    assert.equal(run('partie.score'),0);
    assert.equal(run('partie.resultats.length'),0);
    $('#bouton-demarrer-analyse').onclick();
    assert($('#ecran-jeu').classList.contains('mode-parking-analyse'));
    assert.equal(run('partie.analyseTrouvee.size'),0);
    run('partie.parking=nouveauChoixParking(); viserEmplacement(0)');
    assert.match($('#emplacement-courant').innerHTML,/7,5 m/);
    run('viserEmplacement(5)');assert.match($('#emplacement-courant').innerHTML,/16 m/);
    assert($('#choix-plantation').options.length<=13);
    $('#catalogue-suivant').onclick();assert($('#choix-plantation').options.length<=13);
    assert.equal(run('partie.parking.pageCatalogue'),1);
    $('#catalogue-precedent').onclick();assert.equal(run('partie.parking.pageCatalogue'),0);
    const scores=run('REVETEMENTS.map(r=>({id:r.id,voie:evaluerRevetement(r,"voie").points,places:evaluerRevetement(r,"places").points}))');
    const note=id=>scores.find(r=>r.id===id);
    assert.equal(note('stabilise').voie,500);assert.equal(note('dalles-gazon').places,500);
    assert(note('stabilise').voie>note('beton-drainant').voie);
    assert(note('gravier').voie<note('beton-drainant').voie);
    assert.match(run('detailParkingHTML(evaluerParking())'),/Végétaux/);
    console.log(JSON.stringify(scores));
    console.log('Tutoriel obligatoire au lancement et à la relance, retour accueil et reprise d’analyse vérifiés.');
    console.log('5 000/5 000 atteignable, 4 000 points végétaux, 500 par revêtement, 49 couples de revêtements et erreurs minimes vérifiés.');
    console.log('Cinq zones, 262 m² de surface conservée, 12 plantations, deux rendus et retour aux choix sans cumul vérifiés.');
    console.log('Touffes de vivaces rendues :',nombreTouffes);
}
verify().catch(erreur=>{console.error(erreur);process.exitCode=1;});
