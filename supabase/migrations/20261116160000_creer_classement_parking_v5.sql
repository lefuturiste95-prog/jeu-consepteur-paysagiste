-- Migration initiale, à exécuter une fois dans le SQL Editor de Supabase.
-- Barème parking v5 : 4 000 végétaux + 1 000 minéraux = 5 000.
begin;

create schema if not exists classement_prive;
revoke all on schema classement_prive from public, anon, authenticated;

create table classement_prive.scores_parking_v5 (
    nom_joueur text not null check (
        char_length(nom_joueur) between 1 and 30
        and nom_joueur = btrim(nom_joueur)
        and nom_joueur !~ '[[:cntrl:]]'
    ),
    score_global integer not null check (score_global between 0 and 5000),
    score_vegetaux integer not null check (score_vegetaux between 0 and 4000),
    score_mineraux integer not null check (score_mineraux between 0 and 1000),
    date_heure timestamptz not null check (isfinite(date_heure)),
    constraint scores_coherents check (score_global = score_vegetaux + score_mineraux),
    -- Une nouvelle tentative du même envoi ne crée pas une deuxième ligne.
    unique (nom_joueur, score_global, score_vegetaux, score_mineraux, date_heure)
);
alter table classement_prive.scores_parking_v5 enable row level security;
revoke all on table classement_prive.scores_parking_v5 from public, anon, authenticated;
create index scores_parking_v5_ordre on classement_prive.scores_parking_v5
    (score_global desc, date_heure asc, nom_joueur asc);

-- Deux portes d’entrée limitées. Aucun accès public direct à la table.
create function public.enregistrer_score_parking(
    p_nom text, p_score_global integer, p_score_vegetaux integer,
    p_score_mineraux integer, p_date_heure timestamptz
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
    insert into classement_prive.scores_parking_v5
        (nom_joueur, score_global, score_vegetaux, score_mineraux, date_heure)
    values (btrim(p_nom), p_score_global, p_score_vegetaux, p_score_mineraux, p_date_heure)
    on conflict (nom_joueur, score_global, score_vegetaux, score_mineraux, date_heure) do nothing;
end;
$$;

create function public.lire_classement_parking(p_limite integer default 21, p_decalage integer default 0)
returns table (nom_joueur text, score_global integer)
language plpgsql stable security definer set search_path = ''
as $$
begin
    if p_limite is null or p_limite < 1 or p_limite > 101
        or p_decalage is null or p_decalage < 0 then
        raise exception 'Page invalide' using errcode = '22023';
    end if;
    return query
        select s.nom_joueur, s.score_global
        from classement_prive.scores_parking_v5 s
        order by s.score_global desc, s.date_heure asc, s.nom_joueur asc
        limit p_limite offset p_decalage;
end;
$$;

revoke all on function public.enregistrer_score_parking(text, integer, integer, integer, timestamptz)
    from public, anon, authenticated;
revoke all on function public.lire_classement_parking(integer, integer)
    from public, anon, authenticated;
grant execute on function public.enregistrer_score_parking(text, integer, integer, integer, timestamptz)
    to anon, authenticated;
grant execute on function public.lire_classement_parking(integer, integer) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
