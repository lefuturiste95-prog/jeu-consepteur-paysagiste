const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=fs.existsSync(path.join(__dirname,'admin-auth.js'))?__dirname:path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function element(){return {children:[],value:'',textContent:'',hidden:false,appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},addEventListener(k,fn){this['on'+k]=fn;},reportValidity(){return true;}};}
function page(rows=[]){const els=new Map(),calls=[];const el=id=>{if(!els.has(id))els.set(id,element());return els.get(id);};let fail=false;
 const ctx=vm.createContext({sessionStorage:{getItem:()=> 'oui'},document:{getElementById:el,createElement:element},window:{prompt:()=> 'Nom corrigé',confirm:()=>true,AdminAuth:{rpc:async(n,p)=>{calls.push({n,p});if(fail)throw Error('Accès refusé');return rows;},connexion:async()=>{},inscription:async()=>{},deconnexion:async()=>{fail=true;}}}});
 vm.runInContext(read('admin-scores.js'),ctx);return {el,calls,api:ctx.window.AdminScoresPartages,fail:()=>{fail=true;}};}
test('affiche notes, liste de choix et date sans exécuter le contenu saisi',async()=>{
 const p=page([{id:'id1',nom_joueur:'Elève',score_global:4400,score_vegetaux:3500,score_mineraux:900,date_heure:'2026-11-18T12:00:00Z',bilan:{plantations:[{repere:'A1',nom:'<script>test</script>'}],revetements:[{zone:'Voies',nom:'Stabilisé'}],criteres:[]}}]);
 await p.api.afficher();const actions=p.el('lignes-scores-partages').children[0].children[3];
 const pre=actions.children[0].children[1];assert.match(pre.textContent,/A1 : <script>test<\/script>/);assert.equal(pre.children.length,0);assert.match(pre.textContent,/3500/);assert.match(pre.textContent,/Stabilisé/);
 await actions.children[1].onclick();assert(p.calls.some(c=>c.n==='admin_renommer_score_parking'));
 await actions.children[2].onclick();assert(p.calls.some(c=>c.n==='admin_supprimer_score_parking'));
});
test('une session refusée efface les anciennes données affichées',async()=>{const p=page([{id:'id1',nom_joueur:'Elève',score_global:0,bilan:null}]);await p.api.afficher();p.fail();await p.api.afficher();assert.equal(p.el('lignes-scores-partages').children.length,0);assert.equal(p.el('table-scores-partages').hidden,true);});
test('session Supabase en mémoire de session, refresh et déconnexion',async()=>{
 const store={},calls=[];let connexion=0;
 const ctx=vm.createContext({Date,sessionStorage:{getItem:k=>store[k],setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},window:{CONFIG_SCORES:{url:'https://test.supabase.co',clePublique:'sb_publishable_test'}},fetch:async(url,options)=>{calls.push({url,options});const body=url.includes('/token')?{access_token:'jeton-'+(++connexion),refresh_token:'refresh',expires_in:3600}:[];return {ok:true,json:async()=>body};}});
 vm.runInContext(read('admin-auth.js'),ctx);await ctx.window.AdminAuth.connexion('prof@test.fr','secret-non-enregistre');
 assert(!JSON.stringify(store).includes('secret-non-enregistre'));await ctx.window.AdminAuth.rpc('admin_lire_scores_parking',{});
 assert.equal(calls[1].options.headers.Authorization,'Bearer jeton-1');await ctx.window.AdminAuth.deconnexion();await assert.rejects(ctx.window.AdminAuth.rpc('admin_lire_scores_parking',{}));assert.equal(Object.keys(store).length,0);
});
test('HTML contient création du compte et aucun mot de passe prédéfini',()=>{const h=read('admin.html');assert(h.includes('creer-acces-admin'));assert(h.includes('lefuturiste95@gmail.com'));assert(!/type="password"[^>]*value=/.test(h));});
