const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// À la racine du dépôt : node --test outils/tests/classement.cjs
const root = fs.existsSync(path.join(__dirname, 'scores.js')) ? __dirname : path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = { url: 'https://test-classement.supabase.co', clePublique: 'sb_publishable_test' };
const response = body => ({ ok: true, status: 200, text: async () => JSON.stringify(body) });

function service() {
    const rows = [], calls = [];
    let failAfterInsert = false;
    return {
        rows, calls,
        failNext() { failAfterInsert = true; },
        async fetch(url, options) {
            const data = JSON.parse(options.body);
            calls.push({ url, options, data });
            if (url.endsWith('enregistrer_score_parking')) {
                if (!rows.some(row => JSON.stringify(row) === JSON.stringify(data))) rows.push(data);
                if (failAfterInsert) {
                    failAfterInsert = false;
                    throw new Error('Réponse perdue après écriture');
                }
                return response(null);
            }
            return response([...rows].sort((a,b) => b.p_score_global - a.p_score_global ||
                a.p_date_heure.localeCompare(b.p_date_heure)).slice(data.p_decalage, data.p_decalage + data.p_limite)
                .map(row => ({ nom_joueur: row.p_nom, score_global: row.p_score_global })));
        }
    };
}

function appareil(backend, settings = config, storageBlocked = false) {
    const ids = new Set([...read('index.html').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    const elements = new Map(), store = {};
    function $(selector) {
        assert(ids.has(selector.slice(1)), 'Élément HTML absent : ' + selector);
        if (!elements.has(selector)) {
            const classes = new Set();
            elements.set(selector, {
                style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', hidden: false,
                addEventListener(event, fn) { this['on' + event] = fn; },
                focus() {}, setAttribute() {},
                classList: {
                    add: s => classes.add(s), remove: s => classes.delete(s), contains: s => classes.has(s),
                    toggle: (s,b) => b ? classes.add(s) : classes.delete(s)
                }
            });
        }
        return elements.get(selector);
    }
    const context = vm.createContext({
        console: { warn() {}, log() {}, error() {} }, setTimeout, clearTimeout, AbortController,
        window: { CONFIG_SCORES: settings, scrollTo() {} },
        document: { querySelector: $, querySelectorAll: () => [], addEventListener() {} },
        localStorage: {
            getItem: key => store[key] || null,
            setItem(key, value) { if (storageBlocked) throw new Error('Stockage bloqué'); store[key] = value; }
        },
        fetch: (url, options) => url === 'data/API_plantes.csv'
            ? Promise.resolve({ok: true, text: async () => 'Catalogue de test\nEn-têtes\n'})
            : backend.fetch(url, options),
        copierRenduParking() {}, detailParkingHTML() { return '<p>Détail de la note</p>'; }
    });
    const run = code => vm.runInContext(code, context);
    run(read('scores.js'));
    run(read('script.js'));
    return {
        $, store, run, api: context.window.ScoresPartages,
        bilan(vegetaux = 3500, mineraux = 900) {
            run(`partie.resultats = [{type: 'amenagement-parking', score: ${vegetaux + mineraux},
                maximum: 5000, etoiles: 1, titre: 'Parking', choix: {},
                totaux: {vegetaux: ${vegetaux}, revetements: ${mineraux}}}];
                partie.score = ${vegetaux + mineraux}; afficherBilan();`);
        },
        async envoyer(nom) {
            $('#nom-joueur').value = nom;
            return $('#form-classement').onsubmit({ preventDefault() {} });
        }
    };
}

const flush = () => new Promise(resolve => setImmediate(resolve));
const entree = { nom: 'Camille', score: 4500, vegetaux: 3600, mineraux: 900, date: '2026-11-16T16:00:00.000Z' };

test('envoi de cinq champs seulement, sans cookie ni données du chantier', async () => {
    const back = service(), a = appareil(back);
    await a.api.envoyer({ ...entree, plantes: ['secret'], adresse: 'non transmis' });
    const call = back.calls.find(c => c.url.endsWith('enregistrer_score_parking'));
    assert.deepEqual(call.data, {
        p_nom: 'Camille', p_score_global: 4500, p_score_vegetaux: 3600,
        p_score_mineraux: 900, p_date_heure: entree.date
    });
    assert.equal(call.options.credentials, 'omit');
    assert.equal(call.options.referrerPolicy, 'no-referrer');
    assert.equal(call.options.headers.apikey, config.clePublique);
});

test('bornes, noms et somme des sous-scores contrôlés avant envoi', async () => {
    const back = service(), a = appareil(back);
    for (const patch of [ {score: 5001}, {vegetaux: 4001}, {mineraux: -1}, {score: 1.5},
        {score: '4500'}, {score: 4999}, {date: 'invalide'}, {nom: ''}, {nom: 'x'.repeat(31)}, {nom: 'x\ny'} ]) {
        await assert.rejects(a.api.envoyer({ ...entree, ...patch }));
    }
    assert(!back.calls.some(c => c.url.endsWith('enregistrer_score_parking')));
    await a.api.envoyer({...entree, score: 0, vegetaux: 0, mineraux: 0});
    await a.api.envoyer({...entree, score: 5000, vegetaux: 4000, mineraux: 1000});
});

test('deux appareils voient les scores communs sans sous-scores ni date', async () => {
    const back = service(), a = appareil(back), b = appareil(back);
    a.bilan();
    await a.envoyer('<img src=x>');
    await b.run('afficherClassement()');
    assert.equal(back.rows.length, 1);
    assert.match(b.$('#classement').innerHTML, /&lt;img src=x&gt;/);
    assert(!b.$('#classement').innerHTML.includes('<img src=x>'));
    assert.match(b.$('#classement').innerHTML, /4\s*400/);
    assert(!/3500|Végétaux|Minéraux|2026-/.test(b.$('#classement').innerHTML));
    assert.equal(Object.keys(b.store).length, 0);
    assert.match(a.$('#statut-enregistrement').textContent, /classement partagé/);
    const result = await b.api.lire();
    assert.deepEqual(Object.keys(result[0]).sort(), ['nom', 'score']);
});

test('double clic et réouverture du même bilan ne renvoient pas le score', async () => {
    const back = service(), a = appareil(back);
    a.bilan();
    const first = a.envoyer('Camille');
    await a.envoyer('Camille');
    await first;
    a.run('afficherBilan()');
    await a.envoyer('Camille');
    assert.equal(back.calls.filter(c => c.url.endsWith('enregistrer_score_parking')).length, 1);
    assert.equal(a.$('#form-classement').style.display, 'none');
    a.bilan(3800, 1000);
    await a.envoyer('Camille');
    assert.equal(back.rows.length, 2);
});

test('réponse perdue : copie locale, message honnête et nouvel envoi identique', async () => {
    const back = service(), a = appareil(back);
    a.bilan(); back.failNext();
    await a.envoyer('Camille');
    assert.match(a.$('#statut-enregistrement').textContent, /Score conservé.*échoué/);
    assert.equal(a.$('#nom-joueur').readOnly, true);
    assert.equal(a.$('#form-classement').style.display, 'flex');
    await a.envoyer('Autre nom ignoré après la première tentative');
    const calls = back.calls.filter(c => c.url.endsWith('enregistrer_score_parking'));
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].data, calls[1].data);
    assert.equal(back.rows.length, 1);
    assert.equal(JSON.parse(Object.values(a.store)[0]).length, 1);
    assert.equal(a.$('#form-classement').style.display, 'none');
});

test('un envoi retardé ne modifie pas le formulaire de la partie suivante', async () => {
    const back = service();
    const fetchInitial = back.fetch;
    let release;
    back.fetch = async (url, options) => {
        if (url.endsWith('enregistrer_score_parking')) await new Promise(resolve => { release = resolve; });
        return fetchInitial.call(back, url, options);
    };
    const a = appareil(back); a.bilan();
    const pending = a.envoyer('Camille');
    a.run('preparerNouvellePartie()'); a.bilan(3000, 500);
    release(); await pending;
    assert.equal(a.$('#form-classement').style.display, 'flex');
    assert.equal(a.$('#nom-joueur').readOnly, false);
    assert.match(a.$('#statut-enregistrement').textContent, /Une seule tentative/);
});

test('pagination de tous les résultats et actualisation sans doublons', async () => {
    const back = service();
    for (let i = 0; i < 47; i++) back.rows.push({ p_nom: 'Joueur ' + i, p_score_global: 4000 - i, p_date_heure: entree.date });
    const a = appareil(back);
    await a.run('afficherClassement()');
    assert.equal((a.$('#classement').innerHTML.match(/<li>/g) || []).length, 20);
    assert.equal(a.$('#plus-classement').hidden, false);
    await a.run('afficherClassement(true)'); await a.run('afficherClassement(true)');
    assert.equal((a.$('#classement').innerHTML.match(/<li>/g) || []).length, 47);
    assert.equal(a.$('#plus-classement').hidden, true);
    await a.run('afficherClassement()');
    assert.equal((a.$('#classement').innerHTML.match(/<li>/g) || []).length, 20);
});

test('configuration absente ou secrète refusée, classement local explicite', async () => {
    for (const settings of [{}, {...config, clePublique: 'sb_secret_interdit'}]) {
        const back = service(), a = appareil(back, settings);
        assert.equal(a.api.estConfigure(), false);
        a.bilan(); await a.envoyer('Camille');
        assert.equal(back.calls.length, 0);
        assert.match(a.$('#titre-classement').textContent, /cet appareil/);
        assert.match(a.$('#statut-enregistrement').textContent, /uniquement sur cet appareil/);
    }
});

test('échec de lecture et stockage bloqué ne deviennent pas un faux succès', async () => {
    const back = service(), a = appareil(back, config, true);
    a.bilan(); await a.envoyer('Camille');
    assert.match(a.$('#statut-enregistrement').textContent, /enregistré dans le classement partagé/);
    back.fetch = async () => { throw new Error('Hors ligne'); };
    // Le fetch de l’appareil est fixé à sa création ; utiliser un autre appareil en panne.
    const b = appareil(back); await b.run('afficherClassement()');
    assert.match(b.$('#statut-classement').textContent, /indisponible/);
    const c = appareil(service(), {}, true); c.bilan(); await c.envoyer('Camille');
    assert.match(c.$('#statut-enregistrement').textContent, /non enregistré/);
    await flush();
});

test('réponse HTTP incorrecte, colonnes privées ignorées et contenu invalide rejeté', async () => {
    let payload = [{nom_joueur:'Camille', score_global:4500, score_vegetaux:3600, date_heure:entree.date}];
    const a = appareil({fetch: async () => response(payload)});
    assert.deepEqual(Object.keys((await a.api.lire())[0]).sort(), ['nom','score']);
    payload = [{nom_joueur:'Camille', score_global:'5000'}];
    await assert.rejects(a.api.lire());
    const b = appareil({fetch: async () => ({ok:false, status:500})});
    await assert.rejects(b.api.envoyer(entree));
});
