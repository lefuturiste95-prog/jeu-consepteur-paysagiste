# Classement partagé du jeu

Le projet Supabase `apprenti-concepteur-scores` centralise les résultats du barème parking sur 5 000. Le site conserve son adresse GitHub Pages. Aucun compte joueur n’est nécessaire.

## Utilisation

Après le bilan, saisir un prénom ou un pseudo puis cliquer sur **Enregistrer mon score**. Le nom et le score global deviennent visibles aux autres joueurs. Le classement se recharge à l’ouverture du bilan et après l’enregistrement. **Actualiser** récupère les nouveaux résultats ; **Voir les résultats suivants** parcourt le classement par pages de 20. Chaque partie enregistrée est une entrée ; le nom n’est pas une identité vérifiée. À score égal, les parties les plus anciennes passent devant.

Les cinq informations métier de score sont envoyées et stockées dans `classement_prive.scores_parking_v5` :

| Champ | Contenu |
|---|---|
| `nom_joueur` | Prénom ou pseudo, 30 caractères maximum |
| `score_global` | Score total sur 5 000 |
| `score_vegetaux` | Végétaux sur 4 000 |
| `score_mineraux` | Revêtements sur 1 000 |
| `date_heure` | Horodatage de l’enregistrement, en UTC |

Depuis le 18 novembre 2026, la liste des choix et les notes par critère sont également réservées à l’enseignant, avec des identifiants techniques de tentative. Voir [TENTATIVE-ET-ADMIN.md](TENTATIVE-ET-ADMIN.md). La lecture publique retourne exclusivement `nom_joueur` et `score_global` : ni les sous-scores ni la date ne sont exposés par l’API du classement. L’horodatage vient de l’appareil au premier envoi et reste identique pendant les tentatives suivantes.

## Configuration actuelle

Le projet est dans l’organisation `lefuturiste95-prog's Org`, région Paris (`eu-west-3`). La migration initiale est conservée dans `supabase/migrations/20261116160000_creer_classement_parking_v5.sql`. Elle est déjà appliquée ; ne pas la relancer sur la même base.

`config-scores.js` contient l’URL et la clé **publishable**, qui est destinée au navigateur. Aucune clé secrète ni `service_role` ne doit être placée dans le projet. `scores.js` utilise l’API REST de Supabase sans bibliothèque supplémentaire. Référence : [clés publiques Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Pour utiliser une autre base : créer un projet Supabase, appliquer la migration initiale dans son SQL Editor, puis remplacer l’URL et la clé publishable dans `config-scores.js` et republier ces fichiers. Le schéma `classement_prive` doit rester hors des schémas exposés par la Data API ; seules les deux fonctions du schéma `public` sont appelées.

## Erreurs et mode hors ligne

Un envoi en cours désactive le bouton. Une nouvelle tentative reprend exactement la même entrée et ne crée pas de doublon dans la base. Le score est aussi copié localement lorsque le navigateur le permet. Si l’envoi échoue, le jeu le dit et propose de réessayer ; il n’annonce pas un partage réussi.

Sans connexion Internet, le jeu reste jouable. Sans configuration Supabase, il affiche explicitement un classement local. Les anciens scores ne sont pas importés automatiquement dans la base : ils ne disposent pas tous des sous-scores nécessaires.

## Gestion

La gestion se fait dans Admin → Classement avec une connexion enseignant réservée à lefuturiste95@gmail.com. Tu peux consulter le bilan synthétique, corriger le nom ou supprimer un résultat pour autoriser une nouvelle tentative. Les premiers pas et les limites sont dans [TENTATIVE-ET-ADMIN.md](TENTATIVE-ET-ADMIN.md).

La table n’accorde aucun accès direct aux visiteurs et RLS est activé. Deux fonctions à privilèges limités autorisent seulement l’ajout et la lecture des deux colonnes publiques. Le serveur impose les bornes et l’égalité total = végétaux + minéraux. Référence : [fonctions et permissions Supabase](https://supabase.com/docs/guides/database/functions).

L’audit Supabase signale intentionnellement les [fonctions publiques à privilèges définis](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) et leur [accès par le rôle authenticated](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) : elles sont les deux portes d’entrée du classement, avec requêtes fixes et `search_path` vide. L’information [RLS sans politique](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) est aussi attendue : aucun accès direct n’est autorisé à la table. Les tests sous le rôle `anon` confirment que lire les cinq colonnes ou supprimer une ligne est refusé.

Les scores sont calculés dans le navigateur : ce classement pédagogique ne certifie pas l’identité ni l’absence de triche. Modifier le JavaScript permet de fabriquer un résultat cohérent avec les bornes ; certifier une partie demanderait un calcul de jeu côté serveur.

## Vérifier l’intégration

Avec Node.js récent, à la racine du projet :

```text
node --test outils/tests/classement.cjs outils/tests/admin-scores.cjs
```

Les tests simulent deux appareils indépendants, les erreurs réseau, les nouvelles tentatives, la pagination et les champs transmis. Ils n’écrivent aucun score dans la base de production. Les permissions réelles et les contraintes SQL ont aussi été vérifiées dans une transaction annulée.
