/* Une tentative par navigateur ; la suppression des données du navigateur reste un contournement possible. */
(() => {
 const cle='apprenti-tentative-validee-v1';
 let memoire=null, durable=true;
 function charger(){try{const s=JSON.parse(localStorage.getItem(cle))||memoire;return s?.version===1&&s.resultat?.type==='amenagement-parking'&&Number.isInteger(s.resultat.score)&&s.jeton?s:null;}catch{return memoire;}}
 function ecrire(s){memoire=s;try{localStorage.setItem(cle,JSON.stringify(s));durable=true;return true;}catch{durable=false;return false;}}
 function sauver(resultat){const s=charger();if(s)return s;const nouvelle={version:1,jeton:crypto.randomUUID(),resultat,entree:null,publie:false};ecrire(nouvelle);return nouvelle;}
 function actualiser(champs){const s=charger();if(s)ecrire({...s,...champs});}
 function effacer(){memoire=null;try{localStorage.removeItem(cle);}catch{}}
 window.TentativeLocale=Object.freeze({charger,sauver,actualiser,effacer,estDurable:()=>durable});
})();
