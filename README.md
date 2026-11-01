# Case Départ

Site e-commerce + jeu en ligne de sudoku thématique, construit avec Next.js 14 (App Router), Supabase et Stripe. Chaque fête de l'année a son carnet de sudoku en PDF (Halloween, Noël, Saint-Valentin, Pâques...), et une grille jouable en ligne gratuite est proposée chaque jour, avec un mode classé payant.

Live : [case-depart.viturna.fr](https://case-depart.viturna.fr)

## Sommaire

1. [Stack technique](#stack-technique)
2. [Structure du projet](#structure-du-projet)
3. [Fonctionnalités](#fonctionnalités)
4. [Lancer le projet en local](#lancer-le-projet-en-local)
5. [Pipeline de génération des carnets PDF](#pipeline-de-génération-des-carnets-pdf)
6. [App mobile (iOS / Android)](#app-mobile-ios--android)
7. [Design system](#design-system)

## Stack technique

- **Next.js 14** (App Router, Server Components, Route Handlers)
- **Supabase** — authentification (email/mot de passe), base Postgres (profils, commandes, scores, classement), stockage des PDF
- **Stripe** — paiement des carnets PDF et du Pass Podium (checkout + webhooks)
- **Resend** — envoi des e-mails transactionnels (confirmation de commande, livraison des PDF)
- **n8n + PDFShift** — chaîne d'automatisation qui génère les PDF des carnets à partir de templates HTML et les livre après paiement (voir [automation/](automation/README.md))
- **Capacitor** — wrapper natif iOS/Android du site (voir plus bas)

## Structure du projet

```
app/                     Routes Next.js (App Router)
  ├─ page.tsx             Accueil
  ├─ carnets/             Catalogue + fiche produit par carnet ([slug])
  ├─ jouer/                Jeu en ligne (partie libre + défi classé du jour)
  ├─ compte/              Authentification, profil, historique de commandes
  ├─ politique-confidentialite/
  ├─ styleguide/          Page de référence des composants UI
  └─ api/                 Route handlers : checkout Stripe, webhooks, classement,
                           jeu (nouvelle partie / statut), Pass Podium, starter (lead magnet)

components/              Composants UI partagés (Header, Footer, Button, Tag, Accordion,
                         Tabs, ProductCard, GridPattern, Reveal, CustomCursor, ...)

lib/                     Logique métier côté serveur
  ├─ supabase/            Clients Supabase (browser / server)
  ├─ sudoku.ts            Génération et validation de grilles
  ├─ dailyChallenge.ts     Logique du défi classé quotidien (seed du jour, score)
  ├─ classement.ts         Classement des joueurs
  ├─ podium.ts             Pass Podium (déblocage illimité)
  ├─ carnetDelivery.ts     Livraison des PDF après paiement
  ├─ emailTemplates.ts / mailer.ts   E-mails transactionnels
  └─ themes.ts / realCovers.ts       Thèmes saisonniers et couvertures réelles des carnets

automation/              Chaîne n8n + Supabase + PDFShift : génération et livraison
                         automatique des carnets PDF (voir son propre README)

styles/                  tokens.css (design tokens) + globals.css
mobile/                  Projet Capacitor iOS/Android (non versionné, voir plus bas)
```

## Fonctionnalités

### Catalogue et commande
- Carnets de sudoku thématiques (Halloween, Noël, Saint-Valentin, Pâques, édition "La Collection") en PDF, 3 niveaux de difficulté (Échauffement, Sprint, Marathon), format A4 ou A5, option emballage cadeau.
- Paiement Stripe, livraison du PDF par e-mail juste après l'achat (via la chaîne n8n).
- Historique des commandes consultable depuis l'espace "Mon compte".

### Jeu en ligne
- **Partie libre** : grilles jouables directement dans le navigateur, 3 parties gratuites par jour pour les comptes non abonnés.
- **Défi classé du jour** : une grille unique par jour, identique pour tous les joueurs, avec classement des temps (anti-triche côté serveur : la grille et la validation sont calculées côté serveur, jamais exposées en clair au client).
- **Pass Podium** (4,99 €, paiement unique) : débloque les parties illimitées en mode classé. Achat uniquement disponible sur le site web (volontairement masqué dans l'app mobile native, voir plus bas).

### Comptes utilisateurs
- Authentification Supabase (inscription, connexion, mot de passe oublié/réinitialisation, Sign in with Apple).
- Suppression de compte, changement de mot de passe, consultation des commandes passées.

### PWA et app mobile
- Le site est une PWA installable (manifest, icônes, favicon adaptatif).
- Wrapper natif iOS et Android via Capacitor (le wrapper charge le site en direct, il n'embarque pas de copie statique).

## Lancer le projet en local

```bash
npm install
npm run dev
```

Le site tourne sur `http://localhost:3000`. Un fichier `.env.local` (jamais commité) avec les clés Supabase, Stripe et Resend est nécessaire pour que l'authentification, le paiement et les e-mails fonctionnent en local.

Scripts disponibles : `dev`, `build`, `start`, `lint`.

## Pipeline de génération des carnets PDF

La fabrication des PDF (grilles de sudoku, mise en page thématique, corrections) est entièrement automatisée via n8n + PDFShift + Supabase Storage, déclenchée par les webhooks Stripe. Le détail complet (mise en place du projet Supabase, configuration PDFShift, import des workflows n8n, ajout d'un nouveau thème) est documenté dans [`automation/README.md`](automation/README.md).

## App mobile (iOS / Android)

Le dossier `mobile/` (non versionné — voir `.gitignore`) contient un projet Capacitor qui wrap le site en direct (`server.url` pointe vers `case-depart.viturna.fr`) pour produire une app iOS et Android quasi sans code natif supplémentaire.

Points notables :
- **Pass Podium masqué côté app native** : Apple et Google imposent leur propre système de paiement pour tout contenu numérique débloqué dans l'app (IAP / Play Billing). Pour rester conforme sans développer l'intégration IAP, le bouton d'achat du Pass Podium est masqué quand l'app tourne dans Capacitor (`window.Capacitor.isNativePlatform()`) — l'achat ne se fait que sur le site web, l'app reflète juste le statut déjà payé.
- **`allowNavigation`** configuré dans `capacitor.config.json` pour que les redirections OAuth (Supabase, Sign in with Apple) restent dans la WebView de l'app plutôt que de basculer sur le navigateur système.
- **Build iOS** : publié sur TestFlight puis soumis en review Apple (App Store Connect, build signé avec un certificat Apple Distribution, upload via `xcrun altool`).
- **Build Android** : AAB signé avec un keystore de release dédié (`~/.android-keystores/case-depart-release.jks` côté machine de build — **à sauvegarder précieusement, sa perte empêche toute mise à jour future de l'app sur le même listing Play Store**).

## Design system

Toutes les règles visuelles (couleurs, typographie, espacements, composants, contrastes WCAG) sont centralisées dans [`design.md`](design.md) et les tokens CSS dans `styles/tokens.css`. Aucune valeur de design ne doit être codée en dur dans les modules CSS en dehors des points de rupture de media queries.
