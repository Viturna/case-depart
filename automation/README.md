# Case Départ — Automatisation de production des carnets PDF

Guide pas à pas pour mettre en place la chaîne complète : génération des grilles, fabrication des PDF, stockage Supabase et livraison automatique après achat Stripe.

> [!IMPORTANT]
> **Pré-requis avant de commencer :** le site Case Départ est déjà en ligne, Stripe est configuré avec des produits et un checkout, les e-mails transactionnels sont déjà testés. Ce guide ajoute uniquement la partie **génération → PDF → livraison automatique**.

---

## Sommaire

1. [Créer le projet Supabase](#1-créer-le-projet-supabase)
2. [Configurer PDFShift](#2-configurer-pdfshift)
3. [Configurer n8n Cloud](#3-configurer-n8n-cloud)
4. [Importer les 4 workflows](#4-importer-les-4-workflows)
5. [Configurer le webhook Stripe](#5-configurer-le-webhook-stripe)
6. [Ce que le site doit envoyer](#6-ce-que-le-site-doit-envoyer)
7. [Produire le Carnet Noël](#7-produire-le-carnet-noël)
8. [Tester une commande Stripe](#8-tester-une-commande-stripe)
9. [Checklist de passage en production](#9-checklist-de-passage-en-production)
10. [Architecture des workflows](#10-architecture-des-workflows)
11. [Ajouter un thème ou un produit](#11-ajouter-un-thème-ou-un-produit)
12. [Référence des variables n8n](#12-référence-des-variables-n8n)
13. [Points de vigilance](#13-points-de-vigilance)

---

## 1. Créer le projet Supabase

### 1a. Créer le projet

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Choisis un nom (ex. `case-depart`), une région proche de tes clients, un mot de passe fort.
3. Note l'**URL du projet** (format `https://xxxxxxxxxxx.supabase.co`) et la **clé `service_role`** (Project Settings → API).

### 1b. Exécuter le schéma SQL

1. Dans Supabase → **SQL Editor**, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql).
2. Clique **Run**. Si tu vois des erreurs `already exists`, c'est normal (idempotent).
3. Vérifie dans **Table Editor** que les tables `carnets`, `grilles`, `commandes`, `leads_starter` existent.

### 1c. Créer le bucket privé `pdfs`

Le bucket est créé automatiquement par le SQL (`insert into storage.buckets`). Vérifie dans **Storage** que le bucket `pdfs` existe avec le flag **Public = false**.

> [!NOTE]
> Si le bucket apparaît comme public, clique dessus → Edit → désactive "Public bucket".

---

## 2. Configurer PDFShift

1. Crée un compte sur [pdfshift.io](https://pdfshift.io).
2. Dans Dashboard → **API Keys**, copie ta clé.
3. En mode test, ajoute `sandbox: true` dans la variable `PDFSHIFT_SANDBOX` → les PDF générés auront un filigrane mais ne consomment pas de crédits.

> [!TIP]
> Commence toujours en mode sandbox (`PDFSHIFT_SANDBOX=true`) pour valider le rendu avant de passer en production.

---

## 3. Configurer n8n Cloud

### 3a. Variables personnalisées

Dans n8n Cloud → **Settings → Variables**, crée les variables suivantes. Elles remplacent les valeurs dans `.env.example`.

| Variable | Obligatoire | Secret | Description |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | non | URL de ton projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **oui** | Clé service_role Supabase |
| `PDFSHIFT_API_KEY` | ✅ | **oui** | Clé API PDFShift |
| `PDFSHIFT_SANDBOX` | — | non | `true` en test, `false` en prod |
| `SIGNED_URL_TTL_SECONDS` | — | non | Durée liens signés (défaut : `604800` = 7 jours) |
| `CARNET_VALIDATION_TOKEN` | ✅ | **oui** | Token secret de validation A2 (ex. `openssl rand -hex 32`) |
| `CASE_DEPART_WEBHOOK_BASE` | ✅ | non | URL de base n8n (ex. `https://monequipe.app.n8n.cloud`) |
| `SITE_REVALIDATE_URL` | — | non | URL de revalidation site Next.js (optionnel) |
| `NOTIFY_WEBHOOK_URL` | — | **oui** | Webhook Slack/Telegram pour les notifications (optionnel) |
| `STRIPE_SECRET_KEY` | ✅ | **oui** | Clé secrète Stripe (`sk_test_...` ou `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | — | **oui** | Secret de signature webhook Stripe (recommandé) |
| `EMAIL_FROM` | ✅ | non | Adresse d'envoi (ex. `contact@casedepart.fr`) |
| `EMAIL_PROVIDER_URL` | ✅ | non | URL API fournisseur e-mail (voir section 3b) |
| `EMAIL_PROVIDER_API_KEY` | ✅ | **oui** | Clé API fournisseur e-mail |
| `BUYER_EMAIL_IN_FOOTER` | — | non | `true` pour imprimer l'e-mail en pied de page PDF |

> [!CAUTION]
> Les variables marquées **oui** dans la colonne Secret ne doivent jamais apparaître dans un dépôt Git, un log ou une URL publique.

### 3b. Adapter le nœud e-mail à ton fournisseur

Les nœuds **"Envoyer l'e-mail de livraison"** (workflow B) et **"Envoyer l'e-mail du Starter"** (workflow C) sont marqués `TODO_PROVIDER`. Le corps de requête est au format générique. Adapte `EMAIL_PROVIDER_URL` et le corps JSON selon ton fournisseur :

**Brevo (ex-Sendinblue)**
```
EMAIL_PROVIDER_URL = https://api.brevo.com/v3/smtp/email
```
Corps (remplace dans le nœud n8n) :
```json
{
  "sender": { "email": "contact@casedepart.fr" },
  "to": [{ "email": "{{ email }}" }],
  "subject": "...",
  "htmlContent": "..."
}
```

**Resend**
```
EMAIL_PROVIDER_URL = https://api.resend.com/emails
```
Corps :
```json
{
  "from": "contact@casedepart.fr",
  "to": ["{{ email }}"],
  "subject": "...",
  "html": "..."
}
```

**MailerLite**
```
EMAIL_PROVIDER_URL = https://connect.mailerlite.com/api/subscribers
```
Pour le Starter (ajout à la liste), corps :
```json
{ "email": "{{ email }}", "groups": ["<ID_GROUPE>"] }
```
Pour la livraison transactionnelle, utilise un autre endpoint MailerLite ou ajoute un second nœud HTTP.

---

## 4. Importer les 4 workflows

1. Dans n8n Cloud → **Workflows** → bouton **Import**.
2. Importe dans cet ordre :
   - [`workflows/A-usine-a-carnets.json`](workflows/A-usine-a-carnets.json)
   - [`workflows/A2-validation-carnet.json`](workflows/A2-validation-carnet.json)
   - [`workflows/B-commande-stripe.json`](workflows/B-commande-stripe.json)
   - [`workflows/C-starter-gratuit.json`](workflows/C-starter-gratuit.json)
3. **N'active pas encore les workflows B et C** — attends d'avoir configuré Stripe et de tester.
4. Note les URLs de webhook affichées dans les nœuds déclencheurs (format `https://monequipe.app.n8n.cloud/webhook/...`).

> [!NOTE]
> Les workflows sont **désactivés** (`active: false`) à l'import. Il faut les activer manuellement après configuration.

---

## 5. Configurer le webhook Stripe

1. Stripe Dashboard → **Développeurs → Webhooks → Add endpoint**.
2. URL : `{CASE_DEPART_WEBHOOK_BASE}/webhook/case-depart-stripe`
3. Événement à écouter : `checkout.session.completed`
4. Copie le **Signing secret** et place-le dans la variable `STRIPE_WEBHOOK_SECRET`.
5. Active d'abord en mode **Test** (les événements test commencent par `evt_1...`).

---

## 6. Ce que le site doit envoyer

Le workflow B lit les informations de livraison depuis la **session Stripe**. Le site doit les passer au moment de la création du checkout.

### Metadata de la session (`metadata`)

| Champ | Type | Exemple | Description |
|---|---|---|---|
| `format` | string | `A4` ou `A5-livret` | Format demandé (si non déduit du price_id) |
| `gift` | string | `true` ou `false` | Version à offrir ? |
| `recipient_name` | string | `Marie Dupont` | Prénom/nom du destinataire (si cadeau) |
| `gift_message` | string | `Bonne chance !` | Message à imprimer dans la carte cadeau |

### Alternative : Custom Fields Stripe

Si tu utilises les **custom_fields** de Stripe Checkout, le nœud "Mapper le produit" les lit automatiquement avec les clés `recipient_name` et `gift_message`.

### Price ID → produit

La correspondance `price_id → carnet_slug + format + gift` se configure dans [`config/products.json`](config/products.json).

```json
{
  "price_XXXXX": {
    "carnet_slug": "noel-edition-2026",
    "format": "A4",
    "gift": false,
    "label": "Carnet Noël — A4"
  }
}
```

Remplace les `price_PLACEHOLDER_...` par tes vrais price_id Stripe, puis relance `npm run build:workflows` pour regénérer les JSON.

> [!IMPORTANT]
> Le carnet_slug doit correspondre exactement au slug dans la table `carnets` de Supabase. Il est visible après avoir produit un carnet avec le workflow A.

---

## 7. Produire le Carnet Noël

### 7a. Prévisualisation locale (optionnel)

```bash
cd automation
npm install       # installe uniquement les devDependencies (Node test runner)
npm run preview -- --theme noel --format A4
# Ouvre out/carnet-noel-edition-2026-thematique-A4.html dans Chrome
# → Ctrl+P → Enregistrer en PDF pour vérifier le rendu
```

### 7b. Télécharger les polices

```bash
npm run build:fonts
```

Si le réseau est indisponible, un message explique la marche à suivre manuelle.

### 7c. Lancer le workflow A

1. Dans n8n → Workflow A → **Execute Workflow** (ou ouvre le Form Trigger).
2. Remplis le formulaire :
   - **Thème** : Noël
   - **Type** : Carnet thématique
   - **Édition** : Édition 2026
   - **Formats** : A4 + A5 livret
3. Le workflow tourne environ 2-3 minutes (génération des grilles + 2 conversions PDF).
4. À la fin, une notification arrive sur ton webhook (si configuré) avec :
   - Des liens signés de prévisualisation
   - Un lien de validation `https://...n8n.cloud/webhook/case-depart-validation?token=...&carnet_id=...`

### 7d. Valider le carnet

1. Vérifie les PDF dans les liens de prévisualisation.
2. Clique sur le lien de validation → la page affiche "Carnet validé."
3. Le carnet passe au statut `pret` dans Supabase.

---

## 8. Tester une commande Stripe

1. Active le workflow B dans n8n.
2. Dans Stripe → **Développeurs → API keys → Test mode** → utilise `sk_test_...`.
3. Passe une commande test sur le site (carte `4242 4242 4242 4242`, date future, CVC `123`).
4. Stripe déclenche le webhook → n8n traite la commande.
5. Vérifie :
   - La table `commandes` dans Supabase a un enregistrement au statut `livree`.
   - L'e-mail de livraison est arrivé avec un lien valide.
   - Le lien pointe bien vers le PDF dans Supabase Storage.
   - Rejouer le même webhook Stripe → la commande est ignorée (idempotence).

---

## 9. Checklist de passage en production

- [ ] **Clés Stripe** : remplace `sk_test_...` par `sk_live_...` dans `STRIPE_SECRET_KEY`.
- [ ] **Webhook Stripe** : crée un endpoint en mode **Live** (URL identique) et mets à jour `STRIPE_WEBHOOK_SECRET`.
- [ ] **PDFShift** : passe `PDFSHIFT_SANDBOX=false`.
- [ ] **Test d'impression réel** : imprime un PDF A4 et un A5-livret (plié) → vérifie les marges, la lisibilité des grilles, les polices.
- [ ] **Vérification des liens signés** : télécharge un PDF depuis un lien signé, attends 7 jours et vérifie qu'il est expiré.
- [ ] **Idempotence** : simule un doublon de webhook Stripe (replay dans le Dashboard) → vérifie qu'un seul e-mail est envoyé.
- [ ] **Erreur de livraison** : coupe temporairement l'API e-mail et déclenche une commande → vérifie que la commande passe en statut `erreur` et qu'une alerte est envoyée.
- [ ] **RLS Supabase** : depuis un client anonyme (ex. `curl` avec la clé `anon`), vérifie que `select * from grilles` renvoie 0 lignes (les solutions sont protégées).
- [ ] **Droit de rétractation** : le checkout Stripe contient bien la case de renonciation au droit de rétractation pour les biens numériques (voir point de vigilance ci-dessous).

---

## 10. Architecture des workflows

```
Site web (Stripe Checkout)
        │
        │ checkout.session.completed
        ▼
┌─────────────────────────────────────────────────────┐
│ B — Commande Stripe                                 │
│                                                     │
│  Webhook → Vérif. sig. → Re-lire session Stripe     │
│    → Idempotence → Mapper produit                   │
│    → Enregistrer commande                           │
│    → Lire carnet (Supabase)                         │
│    ┌── Standard ──────────────────────────────┐     │
│    │  PDF déjà prêt → Lien signé              │     │
│    └───────────────────────────────────────── ┘     │
│    ┌── Cadeau ────────────────────────────────┐     │
│    │  Générer HTML → PDFShift → Upload        │     │
│    │  → Lien signé                            │     │
│    └───────────────────────────────────────── ┘     │
│    → E-mail livraison → Marquer livrée              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ A — Usine à carnets (Form Trigger manuel)           │
│  Formulaire → Générer grilles + HTML                │
│  → Supabase (carnets + grilles) → PDFShift          │
│  → Upload → Lien signé → Notification → A2          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ A2 — Validation (Webhook GET + token)               │
│  Token valide ? → PATCH statut=pret → Revalidation  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ C — Starter gratuit (Webhook POST depuis le site)   │
│  Valider → Enregistrer lead → Liste e-mail          │
│  → Chercher Starter prêt → Lien signé → E-mail      │
└─────────────────────────────────────────────────────┘
```

---

## 11. Ajouter un thème ou un produit

### Ajouter un thème

1. Édite [`config/themes.json`](config/themes.json) en suivant la structure des thèmes existants.
2. Relance `npm run preview -- --theme <slug> --format A4` pour vérifier le rendu.
3. Relance `npm run build:workflows` pour que le formulaire du workflow A inclue le nouveau thème.
4. Produis le carnet avec le workflow A.

### Ajouter un produit Stripe

1. Crée le produit et le price dans Stripe Dashboard.
2. Ajoute l'entrée dans [`config/products.json`](config/products.json) :
   ```json
   "price_XXXXX": {
     "carnet_slug": "mon-carnet-edition-2026",
     "format": "A4",
     "gift": false,
     "label": "Mon Carnet — A4"
   }
   ```
3. Relance `npm run build:workflows` et réimporte `B-commande-stripe.json` dans n8n.

---

## 12. Référence des variables n8n

Voir aussi [`.env.example`](.env.example) pour la description complète de chaque variable.

Les variables se lisent dans les nœuds n8n via `$vars.NOM_VARIABLE`.
Sur le plan **Starter** de n8n Cloud, les variables personnalisées ne sont pas disponibles (`$vars` est indisponible). Dans ce cas, utilise des **Set nodes** en début de workflow pour centraliser les valeurs, ou passe au plan **Pro**.

---

## 13. Points de vigilance

### Droit de rétractation

> [!CAUTION]
> Pour les biens numériques téléchargeables, la réglementation européenne exige que le client renonce explicitement à son droit de rétractation avant le téléchargement. **Ce checkout doit déjà contenir cette case.** Si ce n'est pas le cas, consults un juriste avant de mettre en production.
> Le workflow B ne gère pas les remboursements : ils doivent être traités manuellement depuis le Dashboard Stripe.

### Idempotence et rejeux Stripe

Le workflow B utilise `stripe_session_id` comme clé d'idempotence : un rejeu webhook ne déclenche jamais un second envoi. La vérification est faite **avant** tout traitement.

### Solutions jamais publiques

La colonne `solution` de la table `grilles` est protégée par RLS. Seule la clé `service_role` (utilisée par n8n) peut la lire. Le jeu en ligne utilisera la vue `grilles_publiques` (commentée dans le SQL) qui exclut cette colonne.

### Timeout PDFShift

Le workflow A génère 2 PDF de ~50 pages en une même exécution. Le timeout est fixé à 180 secondes par nœud. Si PDFShift est lent (serveurs chargés), l'exécution peut échouer : relance le workflow A — il recréera le carnet (statut `brouillon` → nouveau slug si tu changes la version).

### Coûts Supabase Storage

Les liens signés temporaires ne consomment pas de quota supplémentaire. Les PDF volumineux (A5-livret complet peut faire 10-15 Mo) consomment du stockage. Archive ou supprime les vieilles versions si nécessaire.

### n8n Cloud et taille des nœuds Code

Le nœud "Générer les carnets" du workflow A fait ~570 Ko (bundle complet). n8n Cloud accepte des nœuds Code jusqu'à ~1 Mo. Si le bundle grossit trop, déplace les fonts dans un nœud Set séparé.

---

## Scripts disponibles

```bash
# Génère fonts.css avec Fredoka 700 et Nunito 500 en base64
npm run build:fonts

# Prévisualise un carnet localement (HTML dans out/)
npm run preview -- --theme noel --format A4
npm run preview -- --theme halloween --format A5-livret

# Régénère les 4 JSON de workflows depuis le code source
npm run build:workflows

# Lance tous les tests (65 assertions)
npm test
```

---

*Généré par [`automation/scripts/build-workflows.js`](scripts/build-workflows.js) — ne pas éditer les JSON de `workflows/` à la main.*

