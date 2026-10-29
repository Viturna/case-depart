# Configuration n8n — Case Départ (phase 3)

Les workflows A et A2 ne contiennent **aucun secret**. Ils lisent leur
configuration dans les **variables personnalisées n8n** (`$vars.*`).

> **Prérequis n8n Cloud :** les variables personnalisées sont disponibles sur
> les plans **Pro** et **Enterprise** (pas sur Starter). Si ton instance n'y a
> pas accès, il faudra passer sur un plan supérieur ou remplacer `$vars.*` par
> un nœud de configuration rempli à la main (moins sûr : les valeurs seraient
> alors stockées dans le workflow).

## Créer les variables

Dans n8n : **Overview → Variables → Add Variable** (ou onglet Variables du
projet). Le nom et la valeur n'acceptent que `A-Z`, `a-z`, `0-9` et `_`.
Une valeur est limitée à **1000 caractères**.

| Variable | Obligatoire | Secret | Rôle |
|---|---|---|---|
| `SUPABASE_URL` | oui | non | URL du projet, ex. `https://abcdefgh.supabase.co` (sans `/` final) |
| `SUPABASE_SERVICE_ROLE_KEY` | oui | **oui** | Clé `service_role` Supabase (Settings → API). Contourne la RLS : ne jamais la publier |
| `PDFSHIFT_API_KEY` | oui | **oui** | Clé API PDFShift |
| `PDFSHIFT_SANDBOX` | non | non | `true` pour générer des PDF gratuits avec filigrane (tests), sinon `false` |
| `SIGNED_URL_TTL_SECONDS` | non | non | Durée des liens PDF signés, en secondes. Défaut : `604800` (7 jours) |
| `NOTIFY_WEBHOOK_URL` | non | oui | Webhook de notification après production (Slack, Telegram via passerelle, interne…) |
| `CARNET_VALIDATION_TOKEN` | oui | **oui** | Token secret protégeant le lien de validation A2 |
| `CASE_DEPART_WEBHOOK_BASE` | oui | non | URL publique de l'instance n8n, ex. `https://mon-instance.app.n8n.cloud` (sans `/` final) |
| `SITE_REVALIDATE_URL` | non | oui | URL de revalidation du site après validation d'un carnet (optionnel) |

## Générer un token de validation

Sur ton poste, dans un terminal :

```bash
openssl rand -hex 32
```

Colle le résultat dans `CARNET_VALIDATION_TOKEN`. Le même token est utilisé par
A (pour construire le lien) et A2 (pour le vérifier).

## Variables facultatives : que se passe-t-il si elles manquent ?

n8n traite une variable absente comme `undefined`, sans faire échouer le
workflow.

- `NOTIFY_WEBHOOK_URL` absente → le workflow A se termine sans notification.
- `SITE_REVALIDATE_URL` absente → A2 valide le carnet sans revalider le site.
- `PDFSHIFT_SANDBOX` absente → `false` (production réelle, crédits consommés).
- `SIGNED_URL_TTL_SECONDS` absente → 7 jours.

## URL de validation produite par A

```text
{CASE_DEPART_WEBHOOK_BASE}/webhook/case-depart-validation?token={CARNET_VALIDATION_TOKEN}&carnet_id={id}
```

Le workflow A2 doit être **actif** pour que cette URL réponde.

## Vérifier avant import

```bash
cd automation
npm run build:workflows
npm test
```
