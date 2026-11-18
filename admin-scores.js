(() => {
 if(sessionStorage.getItem('adminAutorise')!=='oui')return;
 const el=id=>document.getElementById(id);
 let lignes=[],version=0;
 const statut=el('statut-scores-partages'),corps=el('lignes-scores-partages');
 function detail(r){
  if(!r.bilan)return 'Ce résultat ancien ne contient pas la liste des choix.';
  const b=r.bilan;
  return ['Végétaux : '+r.score_vegetaux+' / 4 000','Minéraux : '+r.score_mineraux+' / 1 000',
   'Date : '+new Date(r.date_heure).toLocaleString('fr-FR'),'',
   ...(Array.isArray(b.revetements)?b.revetements:[]).map(x=>x.zone+' : '+x.nom),
   ...(Array.isArray(b.plantations)?b.plantations:[]).map(x=>x.repere+' : '+x.nom+(x.scientifique?' — '+x.scientifique:'')),
   '',...(Array.isArray(b.criteres)?b.criteres:[]).map(x=>x.nom+' : '+x.points+' / '+x.maximum)].join('\n');
 }
 async function afficher(plus=false){
  const v=++version;
  el('actualiser-scores-partages').disabled=true;el('suite-scores-partages').disabled=true;
  statut.textContent='Chargement sécurisé…';
  try{
   const page=await window.AdminAuth.rpc('admin_lire_scores_parking',{p_limite:51,p_decalage:plus?lignes.length:0});
   if(v!==version)return;
   lignes=(plus?lignes:[]).concat(page.slice(0,50));corps.replaceChildren();
   for(const [i,r] of lignes.entries()){
    const tr=document.createElement('tr');
    for(const x of [i+1,r.nom_joueur,r.score_global+' / 5 000']){const td=document.createElement('td');td.textContent=String(x);tr.appendChild(td);}
    const actions=document.createElement('td'),details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');
    summary.textContent='Voir le bilan';pre.textContent=detail(r);details.appendChild(summary);details.appendChild(pre);actions.appendChild(details);
    for(const [label,fn] of [['Corriger le nom',async()=>{const nom=window.prompt('Nouveau nom',r.nom_joueur);if(nom?.trim())await window.AdminAuth.rpc('admin_renommer_score_parking',{p_id:r.id,p_nom:nom.trim()});}],['Supprimer et autoriser une nouvelle tentative',async()=>{if(window.confirm('Supprimer le résultat de '+r.nom_joueur+' et libérer son nom ? Son navigateur connecté pourra recommencer.'))await window.AdminAuth.rpc('admin_supprimer_score_parking',{p_id:r.id});}]]){
     const button=document.createElement('button');button.type='button';button.className='bouton bouton-fantome';button.textContent=label;
     button.addEventListener('click',async()=>{button.disabled=true;try{await fn();await afficher();}catch(e){statut.textContent=e.message;}finally{button.disabled=false;}});actions.appendChild(button);
    }
    tr.appendChild(actions);corps.appendChild(tr);
   }
   el('table-scores-partages').hidden=lignes.length===0;el('vide-scores-partages').hidden=lignes.length!==0;
   el('suite-scores-partages').hidden=page.length<=50;statut.textContent=lignes.length+' résultat(s) chargé(s).';
  }catch(e){if(v!==version)return;corps.replaceChildren();el('table-scores-partages').hidden=true;el('suite-scores-partages').hidden=true;el('vide-scores-partages').hidden=true;statut.textContent=e.message;}
  finally{if(v===version){el('actualiser-scores-partages').disabled=false;el('suite-scores-partages').disabled=false;}}
 }
 el('connexion-scores').addEventListener('submit',async e=>{
  e.preventDefault();el('connexion-admin-valider').disabled=true;
  try{await window.AdminAuth.connexion(el('email-admin').value,el('motdepasse-admin').value);el('motdepasse-admin').value='';await afficher();}catch(e){statut.textContent=e.message;}finally{el('connexion-admin-valider').disabled=false;}
 });
 el('creer-acces-admin').addEventListener('click',async()=>{
  if(!el('connexion-scores').reportValidity())return;
  el('creer-acces-admin').disabled=true;
  try{await window.AdminAuth.inscription(el('email-admin').value,el('motdepasse-admin').value);el('motdepasse-admin').value='';statut.textContent='Si cet accès peut être créé, un e-mail de confirmation est envoyé. Confirme ton adresse, puis reviens ici te connecter. Ton compte du tableau de bord Supabase est distinct de cet accès au jeu.';}catch(e){statut.textContent=e.message;}finally{el('creer-acces-admin').disabled=false;}
 });
 el('deconnexion-scores').addEventListener('click',async()=>{await window.AdminAuth.deconnexion();await afficher();});
 el('actualiser-scores-partages').addEventListener('click',()=>afficher());
 el('suite-scores-partages').addEventListener('click',()=>afficher(true));
 window.AdminScoresPartages=Object.freeze({afficher});
})();
