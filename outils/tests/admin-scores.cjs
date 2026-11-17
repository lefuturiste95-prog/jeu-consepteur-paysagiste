const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = fs.existsSync(path.join(__dirname, 'admin-scores.js')) ? __dirname : path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const html = read('admin.html');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));

function element() {
    const classes = new Set();
    return {
        children: [], style: {}, dataset: {}, value: '', textContent:'', hidden:false,
        classList: {add:s=>classes.add(s), remove:s=>classes.delete(s), toggle:(s,b)=>b?classes.add(s):classes.delete(s)},
        addEventListener(type, fn) {this['on'+type]=fn;},
        appendChild(child) {this.children.push(child);},
        replaceChildren(...children) {this.children=children;},
        setAttribute() {}, focus() {},
        set innerHTML(value) {this.markup=value;this.children=[];},
        get innerHTML() {return this.markup || this.textContent.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
    };
}

function page(options={}) {
    const elements = new Map(), calls = [], store={};
    let rows = options.rows || [];
    let failure = false;
    const byId=id=>{
        assert(ids.has(id),'Élément absent du HTML : '+id);
        if(!elements.has(id)) elements.set(id,element());
        return elements.get(id);
    };
    const tab = element(); tab.dataset.panneau='classement';
    const panneau = element(); panneau.dataset.panneauContenu='classement';
    const context=vm.createContext({
        window:{location:{replace(){}}, ScoresPartages:{
            estConfigure:()=>options.configured!==false,
            lire:async(limite,decalage)=>{
                calls.push({limite,decalage});
                if(failure) throw new Error('Hors ligne');
                if(options.read) return options.read(limite,decalage);
                return rows.slice(decalage,decalage+limite);
            }
        }},
        document:{
            getElementById:byId,
            querySelector:s=>byId(s.slice(1)),
            querySelectorAll:s=>s==='.onglet-admin'?[tab]:s==='[data-panneau-contenu]'?[panneau]:[],
            createElement:element,addEventListener(){}
        },
        sessionStorage:{getItem:()=>options.authorized===false?null:'oui',removeItem(){}},
        localStorage:{getItem:k=>store[k] || null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
        setTimeout:()=>0,clearTimeout(){},console
    });
    const run=code=>vm.runInContext(code,context);
    run(read('admin-scores.js'));
    return {byId,context,run,calls,tab,store,
        api:context.window.AdminScoresPartages,
        fail:()=>{failure=true;}, recover:()=>{failure=false;}, rows:value=>{rows=value;}
    };
}
const data=n=>Array.from({length:n},(_,i)=>({nom:'Joueur '+i,score:5000-i}));
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('charge le classement de tous les appareils et affiche uniquement nom et total',async()=>{
    const p=page({rows:[{nom:'Camille',score:4720,vegetaux:3800,date:'privée'}]});
    await p.api.afficher();
    assert.deepEqual(p.calls,[{limite:51,decalage:0}]);
    const cells=p.byId('lignes-scores-partages').children[0].children;
    assert.equal(cells.length,3);
    assert.equal(cells[0].textContent,'1');
    assert.equal(cells[1].textContent,'Camille');
    assert.match(cells[2].textContent,/4\s*720 \/ 5 000/);
    assert.equal(p.byId('table-scores-partages').hidden,false);
    assert.match(p.byId('statut-scores-partages').textContent,/1 résultat affiché/);
});

test('parcourt tous les scores par pages de 50 et actualise la première page',async()=>{
    const p=page({rows:data(107)});
    await p.api.afficher();
    assert.equal(p.byId('lignes-scores-partages').children.length,50);
    await p.byId('suite-scores-partages').onclick();
    assert.equal(p.byId('lignes-scores-partages').children.length,100);
    await p.byId('suite-scores-partages').onclick();
    assert.equal(p.byId('lignes-scores-partages').children.length,107);
    assert.equal(p.byId('suite-scores-partages').hidden,true);
    assert.equal(p.byId('lignes-scores-partages').children[106].children[0].textContent,'107');
    p.rows([{nom:'Nouveau meilleur',score:5000},...data(107)]);
    await p.byId('actualiser-scores-partages').onclick();
    assert.equal(p.byId('lignes-scores-partages').children.length,50);
    assert.equal(p.byId('lignes-scores-partages').children[0].children[1].textContent,'Nouveau meilleur');
});

test('indique un classement vide et une erreur réseau sans mélanger les copies locales',async()=>{
    const p=page();
    await p.api.afficher();
    assert.equal(p.byId('vide-scores-partages').hidden,false);
    assert.equal(p.byId('table-scores-partages').hidden,true);
    p.fail(); await p.api.afficher();
    assert.match(p.byId('statut-scores-partages').textContent,/Impossible de charger/);
    assert.equal(p.byId('vide-scores-partages').hidden,true);
    assert.equal(p.byId('actualiser-scores-partages').disabled,false);
    p.recover();p.rows(data(1));await p.api.afficher();
    p.fail();await p.api.afficher();
    assert.match(p.byId('statut-scores-partages').textContent,/peuvent être anciens/);
    assert.equal(p.byId('lignes-scores-partages').children.length,1);
});

test('un nom contenant du HTML est inséré comme texte',async()=>{
    const p=page({rows:[{nom:'<img src=x onerror=alert(1)>',score:12}]});
    await p.api.afficher();
    const name=p.byId('lignes-scores-partages').children[0].children[1];
    assert.equal(name.textContent,'<img src=x onerror=alert(1)>');
    assert.equal(name.children.length,0);
    assert.match(name.innerHTML,/&lt;img/);
});

test('configuration manquante et accès non autorisé ne déclenchent pas de requête',async()=>{
    const p=page({configured:false});await p.api.afficher();
    assert.equal(p.calls.length,0);
    assert.match(p.byId('statut-scores-partages').textContent,/pas configurée/);
    assert.equal(page({authorized:false}).api,undefined);
});

test('une réponse ancienne ne remplace pas la plus récente',async()=>{
    const resolvers=[];
    const p=page({read:()=>new Promise(resolve=>resolvers.push(resolve))});
    const first=p.api.afficher(),second=p.api.afficher();
    resolvers[1]([{nom:'Récent',score:4000}]);await second;
    resolvers[0]([{nom:'Ancien',score:20}]);await first;
    assert.equal(p.byId('lignes-scores-partages').children[0].children[1].textContent,'Récent');
    assert.equal(p.byId('actualiser-scores-partages').disabled,false);
});

test('l’administration charge les scores au démarrage et à l’ouverture de l’onglet',async()=>{
    const p=page({rows:data(2)});
    p.run(read('admin.js'));
    await flush();
    assert.equal(p.calls.length,1);
    await p.tab.onclick();await flush();
    assert.equal(p.calls.length,2);
    p.store['apprenti-concepteur-classement-5000-v5']='{"invalide":true}';
    await p.run('afficherClassementAdmin()');
    assert.equal(p.calls.length,3);
    assert.match(p.byId('admin-classement').innerHTML,/Aucun score enregistré sur cet appareil/);
    // Effacer les copies locales ne déclenche aucune suppression distante.
    p.store['apprenti-concepteur-classement-5000-v5']=JSON.stringify([{nom:'Local',score:5}]);
    p.byId('effacer-classement').onclick();p.byId('confirmation-valider').onclick();
    assert.equal(p.calls.length,3);
    assert.equal(p.store['apprenti-concepteur-classement-5000-v5'],undefined);
});

test('les scripts partagés sont chargés avant les scripts admin',()=>{
    const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(scripts,['config-scores.js','scores.js','admin-scores.js','admin.js']);
    assert.match(html,/https:\/\/supabase.com\/dashboard\/project\/uvlyhpccalxcjsqervan/);
});
