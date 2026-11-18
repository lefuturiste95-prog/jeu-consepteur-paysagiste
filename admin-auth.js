(() => {
 const cfg=window.CONFIG_SCORES;
 const cle='apprenti-session-admin';
 let session;
 try{session=JSON.parse(sessionStorage.getItem(cle));}catch{}
 async function auth(route,body){
  const r=await fetch(cfg.url+'/auth/v1/'+route,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{apikey:cfg.clePublique,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await r.json();if(!r.ok)throw Error(data.msg||data.error_description||'Connexion refusée');return data;
 }
 function conserver(s){session={...s,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)};sessionStorage.setItem(cle,JSON.stringify(session));}
 async function connexion(email,password){conserver(await auth('token?grant_type=password',{email,password}));}
 async function inscription(email,password){await auth('signup',{email,password});}
 async function token(){
  if(!session?.access_token)throw Error('Connecte-toi avec ton compte administrateur.');
  if(session.expires_at*1000<Date.now()+30000)conserver(await auth('token?grant_type=refresh_token',{refresh_token:session.refresh_token}));
  return session.access_token;
 }
 async function rpc(nom,params){
  const jwt=await token();
  const r=await fetch(cfg.url+'/rest/v1/rpc/'+nom,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{apikey:cfg.clePublique,Authorization:'Bearer '+jwt,'Content-Type':'application/json'},body:JSON.stringify(params)});
  const data=await r.json().catch(()=>null);
  if(!r.ok)throw Error(data?.code==='23505'?'Ce nom est déjà utilisé.':'Accès refusé ou session expirée. Vérifie ton compte administrateur.');return data;
 }
 async function deconnexion(){
  try{if(session?.access_token)await fetch(cfg.url+'/auth/v1/logout',{method:'POST',headers:{apikey:cfg.clePublique,Authorization:'Bearer '+session.access_token}});}finally{session=null;sessionStorage.removeItem(cle);}
 }
 window.AdminAuth=Object.freeze({connexion,inscription,rpc,deconnexion});
})();
