# LAB·2AC — 15 séances d’informatique

## Version 2

- propositions mélangées automatiquement dans les exercices, défis et QCM ;
- réponses reçues enrichies avec la question, le choix de l’élève et la réponse attendue ;
- tableau professeur complété par un aperçu des réponses, les pourcentages et les statistiques par élève ;
- export CSV lisible dans Excel avec une ligne par question et des colonnes distinctes pour les scores.

Parcours bilingue français–arabe destiné aux élèves de 2AC. Chaque séance dure deux heures et privilégie la manipulation : exercices progressifs, situations-problèmes, ateliers, images réelles, évaluations et trace écrite.

## Accès

- Espace élève : <https://tabdellah.github.io/informatique-2ac-15-seances/>
- Espace professeur : <https://tabdellah.github.io/informatique-2ac-15-seances/enseignant/>

L’espace professeur est protégé par mot de passe. Il affiche les élèves et binômes, chaque tentative avec sa date et son heure au Maroc, les réponses détaillées, les scores, la progression et l’export CSV.

## Architecture

- Next.js 16 en export statique
- GitHub Pages via GitHub Actions
- Supabase pour les inscriptions et les tentatives
- fonction Supabase Edge pour la validation, l’écriture et l’accès professeur
- RLS activé et accès direct `anon` / `authenticated` refusé sur les tables

Les clés privées Supabase ne sont jamais incluses dans le frontend. Seule la clé publiable est utilisée par le navigateur ; toutes les opérations passent par la fonction Edge validée côté serveur.

## Développement

```bash
pnpm install
pnpm dev
```

Compilation de production :

```bash
pnpm build
```

Les migrations et la fonction Supabase sont conservées dans `supabase/`.

## Auteur

Prof. Abdellah TAHTOH — Collège Othmane Ibn Affane
