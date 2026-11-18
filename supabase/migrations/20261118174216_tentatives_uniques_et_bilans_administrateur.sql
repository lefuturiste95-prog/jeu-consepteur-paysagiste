begin;
create function classement_prive.cle_nom(p_nom text) returns text language sql immutable set search_path='' as $$
 select lower(regexp_replace(btrim(translate(lower(p_nom),'àâäéèêëîïôöùûüç','aaaeeeeiioouuuc')), '\s+', ' ', 'g'));
$$;
alter table classement_prive.scores_parking_v5 add column id uuid not null default gen_random_uuid(),
 add column jeton uuid not null default gen_random_uuid(), add column bilan jsonb;
alter table classement_prive.scores_parking_v5 add primary key(id), add unique(jeton),
 add constraint bilan_taille check(bilan is null or (jsonb_typeof(bilan)='object' and octet_length(bilan::text)<=20000));
create unique index scores_nom_unique on classement_prive.scores_parking_v5 (classement_prive.cle_nom(nom_joueur));

create function public.enregistrer_bilan_parking(p_nom text,p_score_global integer,p_score_vegetaux integer,p_score_mineraux integer,p_date_heure timestamptz,p_jeton uuid,p_bilan jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_jeton is null then raise exception 'Jeton requis'; end if;
 if exists(select 1 from classement_prive.scores_parking_v5 s where s.jeton=p_jeton) then
   if exists(select 1 from classement_prive.scores_parking_v5 s where s.jeton=p_jeton and s.nom_joueur=btrim(p_nom) and s.score_global=p_score_global and s.score_vegetaux=p_score_vegetaux and s.score_mineraux=p_score_mineraux and s.date_heure=p_date_heure and s.bilan=p_bilan) then return; end if;
   raise exception 'Tentative deja enregistree' using errcode='23505';
 end if;
 insert into classement_prive.scores_parking_v5(nom_joueur,score_global,score_vegetaux,score_mineraux,date_heure,jeton,bilan)
 values(btrim(p_nom),p_score_global,p_score_vegetaux,p_score_mineraux,p_date_heure,p_jeton,p_bilan);
end; $$;
create function public.statut_tentative_parking(p_jeton uuid) returns boolean
language sql stable security definer set search_path='' as $$ select exists(select 1 from classement_prive.scores_parking_v5 where jeton=p_jeton); $$;

create function classement_prive.verifier_admin() returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users u where u.id=auth.uid() and lower(u.email)='lefuturiste95@gmail.com' and u.email_confirmed_at is not null
   and exists(select 1 from auth.sessions s where s.user_id=u.id and s.id=(auth.jwt()->>'session_id')::uuid)) then
 raise exception 'Acces administrateur refuse' using errcode='42501'; end if;
end; $$;
create function classement_prive.lire_admin(p_limite integer,p_decalage integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare resultat jsonb;
begin
 perform classement_prive.verifier_admin();
 if p_limite<1 or p_limite>101 or p_limite is null or p_decalage<0 or p_decalage is null then raise exception 'Page invalide'; end if;
 select coalesce(jsonb_agg(x),'[]'::jsonb) into resultat from
 (select id,nom_joueur,score_global,score_vegetaux,score_mineraux,date_heure,bilan from classement_prive.scores_parking_v5 order by score_global desc,date_heure,id limit p_limite offset p_decalage) x;
 return resultat;
end; $$;
create function classement_prive.supprimer_admin(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin perform classement_prive.verifier_admin(); delete from classement_prive.scores_parking_v5 where id=p_id; end; $$;
create function classement_prive.renommer_admin(p_id uuid,p_nom text) returns void language plpgsql security definer set search_path='' as $$
begin perform classement_prive.verifier_admin(); update classement_prive.scores_parking_v5 set nom_joueur=btrim(p_nom) where id=p_id; end; $$;
create function public.admin_lire_scores_parking(p_limite integer default 51,p_decalage integer default 0) returns jsonb language sql security invoker set search_path='' as $$select classement_prive.lire_admin(p_limite,p_decalage);$$;
create function public.admin_supprimer_score_parking(p_id uuid) returns void language sql security invoker set search_path='' as $$select classement_prive.supprimer_admin(p_id);$$;
create function public.admin_renommer_score_parking(p_id uuid,p_nom text) returns void language sql security invoker set search_path='' as $$select classement_prive.renommer_admin(p_id,p_nom);$$;

revoke all on all functions in schema classement_prive from public,anon,authenticated;
grant usage on schema classement_prive to authenticated;
grant execute on function classement_prive.lire_admin(integer,integer),classement_prive.supprimer_admin(uuid),classement_prive.renommer_admin(uuid,text) to authenticated;
revoke all on function public.enregistrer_bilan_parking(text,integer,integer,integer,timestamptz,uuid,jsonb),public.statut_tentative_parking(uuid) from public,anon,authenticated;
grant execute on function public.enregistrer_bilan_parking(text,integer,integer,integer,timestamptz,uuid,jsonb),public.statut_tentative_parking(uuid) to anon,authenticated;
revoke all on function public.admin_lire_scores_parking(integer,integer),public.admin_supprimer_score_parking(uuid),public.admin_renommer_score_parking(uuid,text) from public,anon,authenticated;
grant execute on function public.admin_lire_scores_parking(integer,integer),public.admin_supprimer_score_parking(uuid),public.admin_renommer_score_parking(uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
