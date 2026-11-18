# Une tentative et gestion des bilans

## Élèves

La première validation de l’aménagement enregistre et verrouille son résultat dans le navigateur. Le retour aux choix et une nouvelle partie renvoient au bilan. Le bilan, les choix et l’état d’enregistrement sont conservés localement pour retrouver le résultat après fermeture. Un navigateur partagé entre plusieurs élèves retrouvera le même bilan. Effacer ses données ou changer de navigateur contourne ce verrou ; ce dispositif sans compte élève ne certifie pas une identité.

L’envoi à la base utilise un jeton aléatoire par tentative. Le même envoi peut être réessayé après une coupure réseau sans créer de doublon ni modifier le résultat initial. Un index unique en base interdit deux noms identiques, en ignorant la casse, les espaces en trop et les accents français courants. Utiliser prénom et initiale du nom pour les homonymes.

## Données

Les cinq champs historiques sont conservés. S’ajoutent un identifiant technique, un jeton privé de tentative et un bilan synthétique : noms des matériaux, plantes et repères, détail des notes et version de barème. Aucune image ni copie complète de la page n’est envoyée. La lecture publique reste limitée au nom et au score global. Les résultats antérieurs sont conservés ; leur liste de choix ne peut pas être reconstruite et apparaît comme indisponible.

## Premier accès de l’enseignant

1. Sur le jeu, ouvrir Admin avec le code habituel, puis l’onglet Classement.
2. Dans le nouveau formulaire, choisir un mot de passe d’au moins 12 caractères et cliquer sur **Créer mon accès enseignant**. L’adresse autorisée est `lefuturiste95@gmail.com`.
3. Confirmer l’adresse depuis l’e-mail Supabase. Si la page de destination de confirmation ne s’ouvre pas, revenir manuellement à la page Admin du jeu.
4. Saisir le mot de passe choisi et cliquer sur **Se connecter aux bilans**.

Cet accès au jeu est distinct du compte propriétaire du tableau de bord Supabase. Le mot de passe n’est pas stocké dans les fichiers du projet. Si l’e-mail de confirmation n’arrive pas, vérifier les indésirables et les limites d’envoi du projet Supabase avant de réessayer. Ne pas désactiver la confirmation d’adresse.

## Gérer la liste

Chaque ligne propose **Voir le bilan**, **Corriger le nom** et **Supprimer et autoriser une nouvelle tentative**. La suppression libère le nom et supprime le résultat. Au prochain accès en ligne au bilan, le navigateur ayant publié cette tentative constate l’autorisation et peut recommencer. Hors ligne, il garde le verrou. Une tentative validée mais jamais publiée ne peut pas être débloquée à distance : le navigateur doit être réinitialisé localement par l’enseignant.

Fermer l’accès aux bilans ou se déconnecter révoque la session Supabase. Les jetons sont conservés uniquement dans le stockage de session du navigateur, jamais dans le code source. Les fonctions administrateur contrôlent côté serveur l’utilisateur connecté, son adresse confirmée et l’existence de sa session. Un autre compte Supabase n’a pas accès aux bilans.

## Vérification

`node outils/tests/tentative.cjs` teste la validation, le retour au bilan, la restauration locale et le déblocage.

`node --test outils/tests/admin-scores.cjs outils/tests/classement.cjs` teste l’interface et les appels.

Les permissions et les contraintes ont été testées dans une transaction annulée, sans laisser de compte ni score de test. Les fonctions d’ajout et de statut restent volontairement publiques ; les fonctions privilégiées de gestion sont dans le schéma privé avec vérification d’identité. Les alertes d’audit sur les RPC publics attendus sont expliquées ici : [fonctions publiques](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [RLS sans accès direct](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
