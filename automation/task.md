# Case Départ — Automatisation PDF : Liste des tâches

> Statut global : **✅ COMPLET** — 65/65 tests passent, 4 workflows générés.

---

## Phase 1 — Générateur de sudoku ✅

- [x] `src/prng.js` — PRNG seedé mulberry32 (`CaseDepartPrng`)
- [x] `src/sudoku.js` — génération par backtracking + unicité de la solution + notation de difficulté (`CaseDepartSudoku`)
  - [x] Niveaux : Échauffement (38-45 indices, naked singles), Sprint (30-36, hidden singles), Marathon (24-29, paires/pointing)
  - [x] Déterminisme : même seed → même grille, toujours
  - [x] Régénération automatique si grille hors niveau (`-retry1`, etc.)
  - [x] Garantie zéro doublon dans un carnet
- [x] `tests/prng.test.js` — 6 tests PRNG
- [x] `tests/sudoku.test.js` — 11 tests (déterminisme, niveaux, unicité, performance, doublon)

---

## Phase 2 — Gabarit HTML + prévisualisation ✅

- [x] `src/carnet.js` — construction des données carnet à partir d'un thème (`CaseDepartCarnet`)
  - [x] Types : `thematique`, `tour-annee`, `etape`, `starter`
  - [x] Chiffre clé du tirage (case étoilée dans la dernière grille du niveau précédent)
  - [x] Version à offrir (nom destinataire, message)
- [x] `config/themes.json` — 6 thèmes : Noël, Halloween, Saint-Valentin, Pâques, Fête de la musique, Tour de l'année (multi-thème)
- [x] `src/html/helpers.js` — utilitaires CSS/SVG, palette de couleurs
- [x] `src/html/pages/illustrations.js` — SVG vectoriels paramétrés par couleur de thème
- [x] `src/html/pages/couverture.js` — couverture illustrée au thème
- [x] `src/html/pages/ligne-depart.js` — règles, niveaux, case temps total
- [x] `src/html/pages/ravitaillement.js` — coloriage (Ravi. n°1) + tirage dépendant du chiffre clé (Ravi. n°2)
- [x] `src/html/pages/grilles.js` — grilles SVG noir et blanc imprimables
- [x] `src/html/pages/arrivee.js` — grille finale + récapitulatif des scores
- [x] `src/html/pages/corrections.js` — mini-grilles de solutions
- [x] `src/html/pages/carte-cadeau.js` — page personnalisée (nom, message)
- [x] `src/html/pages/notes.js` — pages de remplissage (livret)
- [x] `src/html/imposition.js` — ordre d'imposition A5 livret, feuilles A4 paysage recto-verso
- [x] `src/html/fonts.js` — polices Fredoka 700 + Nunito 500 encodées base64 (HTML autonome)
- [x] `src/html/template.js` — `buildHtml(carnet, options)` → HTML complet autonome (`CaseDepartTemplate`)
- [x] `scripts/build-fonts.js` — télécharge les woff2 et génère `src/html/fonts.css`
- [x] `scripts/preview.js` — génère `out/carnet-{theme}-{edition}-{type}-{format}.html`
- [x] `tests/carnet.test.js` — 8 tests (structure, chiffre clé, types de carnet)
- [x] `tests/html.test.js` — 10 tests (autonomie, palette, polices, livret, version cadeau)
- [x] `tests/imposition.test.js` — 6 tests (ordre 8/12/48 pages, feuilles recto-verso, multiple de 4)

---

## Phase 3 — Supabase + Workflows A et A2 ✅

- [x] `supabase/schema.sql` — tables, index, RLS, bucket privé
  - [x] Tables : `carnets`, `grilles`, `commandes`, `leads_starter`
  - [x] RLS : solutions jamais lisibles publiquement (seul `service_role`)
  - [x] Vue publique future `grilles_publiques` en commentaire (pour le jeu en ligne)
  - [x] Bucket Storage privé `pdfs` créé par le SQL
- [x] `scripts/build-workflows.js` — génère les JSON de workflows depuis `src/`
  - [x] Bundle autonome (PRNG + sudoku + carnet + HTML + fonts) injecté dans les nœuds Code
  - [x] Aucun module npm externe dans les nœuds Code
  - [x] Toutes les clés via `$vars.*` (pas de secrets en dur)
- [x] `workflows/A-usine-a-carnets.json` — 15 nœuds
  - [x] Form Trigger → génération 30 grilles + HTML → Supabase → PDFShift → upload → lien signé → notification → A2
- [x] `workflows/A2-validation-carnet.json` — 9 nœuds
  - [x] Webhook GET + token → PATCH statut=pret → revalidation site (optionnel)
- [x] `tests/workflows.test.js` — tests A et A2

---

## Phase 4 — Workflows B et C ✅

- [x] `config/products.json` — catalogue price_id Stripe → carnet_slug + format + gift
- [x] `workflows/B-commande-stripe.json` — 22 nœuds
  - [x] Webhook `checkout.session.completed` (rawBody pour signature)
  - [x] Vérification signature Stripe avec `crypto` (module Node natif)
  - [x] Re-lecture session Stripe (garantie d'authenticité + `expand[]=line_items`)
  - [x] Idempotence via `stripe_session_id` unique
  - [x] Mapping price_id → produit depuis `products.json` injecté
  - [x] Extraction des metadata ET custom_fields de la session Stripe
  - [x] Branche **standard** : PDF prêt → lien signé → e-mail
  - [x] Branche **cadeau** : HTML personnalisé → PDFShift → upload → lien signé → e-mail
  - [x] E-mail livraison (nœud `TODO_PROVIDER` documenté pour Brevo, Resend, MailerLite)
  - [x] Commande `livree` / `erreur` + notification d'erreur
- [x] `workflows/C-starter-gratuit.json` — 10 nœuds
  - [x] Webhook POST depuis le site
  - [x] Validation e-mail + consentement (code autonome)
  - [x] Upsert lead Supabase (ignore-duplicates)
  - [x] Ajout à la liste e-mail (`TODO_PROVIDER`)
  - [x] Récupération du Starter le plus récent au statut `pret`
  - [x] Lien signé + e-mail
  - [x] Réponse au site (responseNode)
- [x] Tests B et C ajoutés dans `workflows.test.js` (15 nouveaux tests)

---

## Phase 5 — README et documentation ✅

- [x] `automation/README.md` — guide pas à pas complet (9 sections, checklist production)
- [x] `automation/.env.example` — toutes les variables documentées
- [x] `docs/configuration-n8n.md` — configuration détaillée n8n Cloud

---

## Ce qu'il reste à faire manuellement

- [ ] **Renseigner `config/products.json`** : remplacer les `price_PLACEHOLDER_...` par les vrais price_id Stripe
- [ ] **Créer les variables n8n Cloud** (cf. README section 3a)
- [ ] **Adapter le nœud e-mail** à ton fournisseur (cf. README section 3b)
- [ ] **Importer les 4 JSON** dans n8n Cloud
- [ ] **Configurer le webhook Stripe** (pointer vers l'URL du workflow B)
- [ ] **Produire le Carnet Noël** avec le workflow A et le valider
- [ ] **Tester une commande Stripe** en mode test bout en bout
- [ ] **Checklist production** (README section 9) avant de passer en live

---

## Commandes utiles

```bash
cd automation

# Tests
npm test

# Prévisualisation HTML locale
npm run preview -- --theme noel --format A4
npm run preview -- --theme halloween --format A5-livret

# Polices base64
npm run build:fonts

# Régénérer les workflows (après modif de src/ ou config/)
npm run build:workflows
```

