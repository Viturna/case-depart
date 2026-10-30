/**
 * Tests des workflows n8n et du schéma Supabase — Case Départ
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const builder = require('../scripts/build-workflows.js');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS = path.join(ROOT, 'workflows');
const SCHEMA = path.join(ROOT, 'supabase', 'schema.sql');

const files = builder.buildAll();
const workflowA = files['A-usine-a-carnets.json'];
const workflowA2 = files['A2-validation-carnet.json'];
const workflowB = files['B-commande-stripe.json'];
const workflowC = files['C-starter-gratuit.json'];

function nodeByName(workflow, name) {
  const found = workflow.nodes.find((node) => node.name === name);
  assert.ok(found, `nœud introuvable : ${name}`);
  return found;
}

function codeOf(workflow, name) {
  return nodeByName(workflow, name).parameters.jsCode;
}

/**
 * Simule un nœud Code n8n : require existe mais échoue sur les chemins
 * relatifs, seul globalThis permet aux modules de se retrouver.
 */
function runGeneration(input) {
  const code = codeOf(workflowA, 'Générer les carnets');
  const sandbox = {
    console,
    require: () => {
      throw new Error('require relatif indisponible dans n8n');
    },
    $input: { first: () => ({ json: input }) }
  };
  vm.createContext(sandbox);
  const output = new vm.Script('(function(){\n' + code + '\n})()').runInContext(sandbox);
  return output[0].json;
}

test('workflows — JSON valides, nœuds complets et connexions cohérentes', () => {
  for (const [fileName, workflow] of Object.entries(files)) {
    assert.ok(workflow.name, fileName);
    assert.ok(Array.isArray(workflow.nodes) && workflow.nodes.length > 0, fileName);
    assert.ok(workflow.connections && typeof workflow.connections === 'object', fileName);

    const ids = new Set();
    const names = new Set();

    for (const node of workflow.nodes) {
      assert.ok(node.id, `${fileName} : id manquant`);
      assert.ok(node.name, `${fileName} : nom manquant`);
      assert.ok(node.type, `${fileName} : type manquant pour ${node.name}`);
      assert.ok(node.typeVersion, `${fileName} : typeVersion manquant pour ${node.name}`);
      assert.ok(Array.isArray(node.position), `${fileName} : position manquante`);
      assert.ok(node.parameters && typeof node.parameters === 'object');
      assert.ok(!ids.has(node.id), `id dupliqué : ${node.id}`);
      assert.ok(!names.has(node.name), `nom dupliqué : ${node.name}`);
      ids.add(node.id);
      names.add(node.name);
    }

    for (const [source, output] of Object.entries(workflow.connections)) {
      assert.ok(names.has(source), `${fileName} : connexion depuis un nœud inconnu ${source}`);
      output.main.forEach((targets) => {
        targets.forEach((target) => {
          assert.ok(names.has(target.node), `${fileName} : cible inconnue ${target.node}`);
          assert.equal(target.type, 'main');
        });
      });
    }
  }
});

test('workflows — aucun secret en dur, configuration via $vars', () => {
  const secretPatterns = [/sk_live_/, /sk_test_/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]+PRIVATE KEY-----/];

  function walk(value, trail) {
    if (typeof value === 'string') {
      for (const pattern of secretPatterns) {
        assert.ok(!pattern.test(value), `secret potentiel dans ${trail}`);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${trail}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, entry] of Object.entries(value)) {
        if (key === 'jsCode') {
          continue; // code généré : contrôlé séparément ci-dessous
        }
        walk(entry, `${trail}.${key}`);
      }
    }
  }

  for (const [fileName, workflow] of Object.entries(files)) {
    walk(workflow, fileName);
    for (const node of workflow.nodes) {
      if (node.parameters && node.parameters.jsCode) {
        for (const pattern of secretPatterns) {
          assert.ok(!pattern.test(node.parameters.jsCode), `${fileName}/${node.name} : secret en dur`);
        }
      }
    }
  }

  const serialized = JSON.stringify(workflowA) + JSON.stringify(workflowA2) +
    JSON.stringify(workflowB) + JSON.stringify(workflowC);

  // Toutes les variables déclarées doivent être utilisées quelque part dans les workflows.
  for (const variable of builder.CONFIG_VARIABLES) {
    assert.ok(
      serialized.includes('$env.' + variable.name),
      `variable absente dans tous les workflows : ${variable.name}`
    );
  }
  const used = new Set((serialized.match(/\$env\.[A-Z0-9_]+/g) || []).map((v) => v.slice(5)));
  const declared = new Set(builder.CONFIG_VARIABLES.map((variable) => variable.name));
  for (const u of used) {
    assert.ok(declared.has(u), `variable utilisée mais non documentée dans CONFIG_VARIABLES : $env.${u}`);
  }
});

test('workflow A — formulaire, génération et étapes d’usine', () => {
  const form = nodeByName(workflowA, 'Formulaire de production');
  assert.equal(form.type, 'n8n-nodes-base.formTrigger');
  const labels = form.parameters.formFields.values.map((field) => field.fieldLabel);
  assert.deepEqual(labels, [
    'Thème',
    'Type de carnet',
    'Niveau (uniquement pour L\'Étape)',
    'Édition',
    'Formats'
  ]);

  const code = codeOf(workflowA, 'Générer les carnets');
  assert.ok(code.includes('var CASE_DEPART_THEMES'));
  assert.ok(code.includes('CaseDepartPrng'));
  assert.ok(code.includes('CaseDepartSudoku'));
  assert.ok(code.includes('CaseDepartCarnet'));
  assert.ok(code.includes('CaseDepartTemplate'));
  assert.ok(code.includes('src/html/fonts.js') || code.includes('CaseDepartFonts'));

  const names = workflowA.nodes.map((node) => node.name);
  for (const expected of [
    'Enregistrer le carnet',
    'Enregistrer les grilles',
    'Convertir en PDF (PDFShift)',
    'Uploader dans Supabase Storage',
    'Marquer le carnet à valider',
    'Notifier la validation'
  ]) {
    assert.ok(names.includes(expected), `nœud attendu : ${expected}`);
  }
});

test('workflow A — PDFShift et Supabase configurés selon la doc', () => {
  const pdf = nodeByName(workflowA, 'Convertir en PDF (PDFShift)');
  assert.equal(pdf.parameters.url, 'https://api.pdfshift.io/v3/convert/pdf');
  assert.equal(pdf.parameters.method, 'POST');
  const apiKey = pdf.parameters.headerParameters.parameters.find(
    (header) => header.name === 'X-API-Key'
  );
  assert.ok(apiKey);
  assert.ok(apiKey.value.includes('$env.PDFSHIFT_API_KEY'));
  assert.equal(pdf.parameters.options.response.response.responseFormat, 'file');
  assert.equal(pdf.parameters.options.response.response.outputPropertyName, 'data');
  assert.ok(pdf.parameters.options.timeout >= 120000, 'timeout PDF ≥ 120 s');
  assert.equal(pdf.retryOnFail, true);
  assert.ok(pdf.parameters.jsonBody.includes("format: 'A4'"));
  assert.ok(pdf.parameters.jsonBody.includes("landscape: $json.format === 'A5-livret'"));
  assert.ok(pdf.parameters.jsonBody.includes('use_print: true'));
  assert.ok(pdf.parameters.jsonBody.includes('sandbox:'));

  const upload = nodeByName(workflowA, 'Uploader dans Supabase Storage');
  assert.equal(upload.parameters.method, 'POST');
  assert.ok(upload.parameters.url.includes('/storage/v1/object/pdfs/'));
  assert.equal(upload.parameters.contentType, 'binaryData');
  assert.equal(upload.parameters.inputDataFieldName, 'data');
  assert.ok(
    upload.parameters.headerParameters.parameters.some(
      (header) => header.name === 'x-upsert' && header.value === 'true'
    )
  );

  const update = nodeByName(workflowA, 'Marquer le carnet à valider');
  assert.equal(update.parameters.method, 'PATCH');
  assert.ok(update.parameters.jsonBody.includes("'a_valider'"));
  assert.ok(update.parameters.jsonBody.includes('pdf_paths'));
});

test('workflow A — le bundle génère un carnet valide hors Node', () => {
  const starter = runGeneration({
    'Thème': 'Noël',
    'Type de carnet': 'Starter',
    "Niveau (uniquement pour L'Étape)": '',
    'Édition': 'Édition 2026',
    'Formats': 'A4 + A5 livret'
  });

  assert.equal(starter.slug, 'noel-starter-edition-2026');
  assert.equal(starter.type, 'starter');
  assert.equal(starter.gridRows.length, 3);
  assert.equal(starter.formats.join(','), 'A4,A5-livret');
  assert.equal(starter.documents.length, 2);
  assert.equal(starter.carnetRow.statut, 'brouillon');
  assert.equal(starter.carnetRow.formats_disponibles.join(','), 'A4,A5-livret');

  for (const grid of starter.gridRows) {
    assert.match(grid.puzzle, /^[0-9]{81}$/);
    assert.match(grid.solution, /^[1-9]{81}$/);
    assert.ok(grid.clues >= 24 && grid.clues <= 45);
  }

  const a4 = starter.documents.find((doc) => doc.format === 'A4');
  assert.match(a4.html, /^<!doctype html>/i);
  assert.ok(a4.html.includes('data:font/woff2;base64,'));
  assert.ok(a4.html.includes('page-cover'));
  assert.ok(!/<link\b/i.test(a4.html));
  assert.ok(!/(src|href)="https?:/i.test(a4.html));
  assert.equal(a4.path, 'carnets/noel-starter-edition-2026/1.0.0/noel-starter-edition-2026-A4.pdf');

  const livret = starter.documents.find((doc) => doc.format === 'A5-livret');
  assert.match(livret.html, /@page\{size:A4 landscape;margin:0\}/);
  const sheets = (livret.html.match(/<div class="sheet">/g) || []).length;
  const slots = (livret.html.match(/<div class="slot">/g) || []).length;
  assert.equal(slots, sheets * 2);
  assert.equal(slots % 4, 0);
  assert.ok(sheets >= 2);
});

test('workflow A — carnet thématique complet : 30 grilles + finale, déterministe', () => {
  const input = {
    'Thème': 'Noël',
    'Type de carnet': 'Carnet thématique',
    "Niveau (uniquement pour L'Étape)": '',
    'Édition': 'Édition 2026',
    'Formats': 'A4 seulement'
  };
  const first = runGeneration(input);
  const second = runGeneration(input);

  assert.equal(first.gridRows.length, 31);
  assert.equal(first.gridRows.filter((grid) => grid.niveau === 'finale').length, 1);
  assert.equal(first.type, 'thematique');
  assert.equal(
    first.gridRows.map((grid) => grid.puzzle).join('|'),
    second.gridRows.map((grid) => grid.puzzle).join('|'),
    'même formulaire = mêmes grilles'
  );

  const puzzles = new Set(first.gridRows.map((grid) => grid.puzzle));
  assert.equal(puzzles.size, first.gridRows.length, 'aucune grille en double');
});

test('workflow A2 — validation protégée par token', () => {
  const webhook = nodeByName(workflowA2, 'Webhook de validation');
  assert.equal(webhook.type, 'n8n-nodes-base.webhook');
  assert.equal(webhook.parameters.httpMethod, 'GET');
  assert.equal(webhook.parameters.path, 'case-depart-validation');
  assert.equal(webhook.parameters.responseMode, 'responseNode');

  const tokenCheck = nodeByName(workflowA2, 'Token valide ?');
  const condition = tokenCheck.parameters.conditions.conditions[0];
  assert.ok(condition.leftValue.includes('$json.query.token'));
  assert.ok(condition.rightValue.includes('$env.CARNET_VALIDATION_TOKEN'));
  assert.equal(condition.operator.operation, 'equals');

  const update = nodeByName(workflowA2, 'Marquer le carnet prêt');
  assert.equal(update.parameters.method, 'PATCH');
  assert.ok(update.parameters.jsonBody.includes("'pret'"));
  assert.ok(update.parameters.jsonBody.includes('valide_le'));

  const revalidate = nodeByName(workflowA2, 'Revalider le site');
  assert.equal(revalidate.parameters.method, 'GET');
  assert.ok(revalidate.parameters.url.includes('$env.SITE_REVALIDATE_URL'));

  const refused = nodeByName(workflowA2, 'Refuser le token');
  assert.equal(refused.type, 'n8n-nodes-base.respondToWebhook');
  assert.equal(refused.parameters.options.responseCode, 401);
});

test('build-workflows — les fichiers générés sont à jour', () => {
  for (const [fileName, workflow] of Object.entries(files)) {
    const target = path.join(WORKFLOWS, fileName);
    assert.ok(fs.existsSync(target), `fichier manquant : ${fileName}`);
    const actual = fs.readFileSync(target, 'utf8');
    assert.equal(actual, JSON.stringify(workflow, null, 2) + '\n', `${fileName} périmé`);
  }
});

test('schema.sql — tables, RLS et bucket privé', () => {
  const sql = fs.readFileSync(SCHEMA, 'utf8');

  for (const table of ['carnets', 'grilles', 'commandes', 'leads_starter']) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`, 'i'), table);
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'), table);
  }

  assert.match(sql, /stripe_session_id text not null unique/i);
  assert.match(sql, /revoke all on public\.grilles from anon, authenticated/i);
  assert.match(sql, /grant all on public\.grilles to service_role/i);
  assert.match(sql, /values \('pdfs', 'pdfs', false\)/i);
  assert.match(sql, /-- create or replace view public\.grilles_publiques/i);
  assert.match(sql, /never|jamais/i);
});

// ---------------------------------------------------------------------------
// Tests workflow B — Commande Stripe
// ---------------------------------------------------------------------------

test('workflow B — structure générale et nœuds obligatoires', () => {
  assert.equal(workflowB.name, 'B — Commande Stripe');

  const names = workflowB.nodes.map((n) => n.name);
  for (const expected of [
    'Webhook Stripe (checkout.session.completed)',
    'Vérifier la signature Stripe',
    'Re-lire la session Stripe',
    "Vérifier l'idempotence",
    'Commande déjà traitée ?',
    'Mapper le produit',
    'Enregistrer la commande',
    'Lire le carnet',
    'Version à offrir ?',
    'Récupérer le chemin PDF standard',
    'Signer le lien PDF standard',
    'Générer le HTML cadeau',
    'Convertir le PDF cadeau (PDFShift)',
    'Uploader le PDF cadeau',
    'Signer le lien PDF cadeau',
    'Normaliser le lien signé',
    "Envoyer l'e-mail de livraison",
    'Marquer la commande livrée',
    'Marquer la commande en erreur'
  ]) {
    assert.ok(names.includes(expected), `nœud manquant dans B : ${expected}`);
  }
});

test('workflow B — webhook Stripe correctement configuré', () => {
  const webhook = nodeByName(workflowB, 'Webhook Stripe (checkout.session.completed)');
  assert.equal(webhook.type, 'n8n-nodes-base.webhook');
  assert.equal(webhook.parameters.httpMethod, 'POST');
  assert.equal(webhook.parameters.path, 'case-depart-stripe');
  assert.equal(webhook.parameters.responseMode, 'onReceived');
  assert.equal(webhook.parameters.options.rawBody, true);
});

test('workflow B — re-lecture Stripe avec expand line_items', () => {
  const http = nodeByName(workflowB, 'Re-lire la session Stripe');
  assert.equal(http.parameters.method, 'GET');
  assert.ok(http.parameters.url.includes('checkout/sessions'));
  assert.ok(http.parameters.url.includes('expand'));
  assert.ok(http.parameters.url.includes('line_items'));
  const authHeader = http.parameters.headerParameters.parameters.find(
    (h) => h.name === 'Authorization'
  );
  assert.ok(authHeader, 'header Authorization absent');
  assert.ok(authHeader.value.includes('$env.STRIPE_SECRET_KEY'));
  assert.ok(http.retryOnFail, 'retry absent sur re-lecture Stripe');
});

test('workflow B — idempotence via stripe_session_id unique', () => {
  const checkNode = nodeByName(workflowB, "Vérifier l'idempotence");
  assert.equal(checkNode.parameters.method, 'GET');
  assert.ok(checkNode.parameters.url.includes('commandes'));
  assert.ok(checkNode.parameters.url.includes('stripe_session_id'));

  const ifNode = nodeByName(workflowB, 'Commande déjà traitée ?');
  assert.equal(ifNode.type, 'n8n-nodes-base.if');
  const condition = ifNode.parameters.conditions.conditions[0];
  assert.ok(condition.leftValue.includes('$json.length'));

  // La connexion doit aller vers 'Ignorer le doublon' sur la branche True (0)
  const conns = workflowB.connections["Commande déjà traitée ?"];
  assert.ok(conns, 'pas de connexions depuis "Commande déjà traitée ?"');
  const trueTargets = conns.main[0] || [];
  assert.ok(
    trueTargets.some((t) => t.node === 'Ignorer le doublon'),
    'doublon doit aller vers Ignorer le doublon'
  );
});

test('workflow B — mapping produit contient le catalogue products.json', () => {
  const mapNode = nodeByName(workflowB, 'Mapper le produit');
  const code = mapNode.parameters.jsCode;
  assert.ok(code.includes('CASE_DEPART_PRODUCTS'), 'catalogue produits absent du nœud');
  const products = require('../config/products.json');
  const firstPriceId = Object.keys(products).find((k) => k !== '_comment');
  assert.ok(code.includes(firstPriceId), 'products.json non injecté');
  assert.ok(code.includes('carnet_slug'), 'champ carnet_slug absent');
  assert.ok(code.includes('payment_status'), 'vérification payment_status absente');
  assert.ok(code.includes('recipient_name'), 'extraction recipient_name absente');
  assert.ok(code.includes('gift_message'), 'extraction gift_message absente');
  assert.ok(code.includes('custom_fields'), 'custom_fields non gérés');
});

test('workflow B — branche cadeau : HTML + PDF + upload + lien signé', () => {
  const giftNode = nodeByName(workflowB, 'Générer le HTML cadeau');
  const code = giftNode.parameters.jsCode;
  assert.ok(code.includes('CaseDepartCarnet'), 'bundle absent du nœud cadeau');
  assert.ok(code.includes('CaseDepartTemplate'), 'template absent du nœud cadeau');
  assert.ok(code.includes('recipient_name'), 'recipient_name absent du nœud cadeau');
  assert.ok(code.includes('gift_message'), 'gift_message absent du nœud cadeau');

  const pdfNode = nodeByName(workflowB, 'Convertir le PDF cadeau (PDFShift)');
  assert.equal(pdfNode.parameters.url, 'https://api.pdfshift.io/v3/convert/pdf');
  assert.ok(pdfNode.parameters.options.timeout >= 120000);

  const uploadNode = nodeByName(workflowB, 'Uploader le PDF cadeau');
  assert.ok(uploadNode.parameters.url.includes('pdfs/'));
  assert.equal(uploadNode.parameters.contentType, 'binaryData');

  const signNode = nodeByName(workflowB, 'Signer le lien PDF cadeau');
  assert.equal(signNode.parameters.method, 'POST');
  assert.ok(signNode.parameters.url.includes('/sign/pdfs/'));
});

test('workflow B — e-mail de livraison marqué TODO_PROVIDER', () => {
  const emailNode = nodeByName(workflowB, "Envoyer l'e-mail de livraison");
  assert.equal(emailNode.parameters.method, 'POST');
  assert.ok(emailNode.parameters.url.includes('$env.EMAIL_PROVIDER_URL'));
  const note = emailNode.notes || '';
  assert.ok(note.includes('TODO_PROVIDER'), 'note TODO_PROVIDER absente');
  assert.ok(emailNode.retryOnFail, 'retry absent sur e-mail');
});

test('workflow B — commande marquée livrée puis erreur si échec', () => {
  const livreeNode = nodeByName(workflowB, 'Marquer la commande livrée');
  assert.equal(livreeNode.parameters.method, 'PATCH');
  assert.ok(livreeNode.parameters.url.includes('commandes'));
  assert.ok(livreeNode.parameters.jsonBody.includes("'livree'"));
  assert.ok(livreeNode.parameters.jsonBody.includes('pdf_path'));
  assert.ok(livreeNode.parameters.jsonBody.includes('livree_le'));

  const errNode = nodeByName(workflowB, 'Marquer la commande en erreur');
  assert.equal(errNode.parameters.method, 'PATCH');
  assert.ok(errNode.parameters.jsonBody.includes("'erreur'"));
});

// ---------------------------------------------------------------------------
// Tests workflow C — Starter gratuit
// ---------------------------------------------------------------------------

test('workflow C — structure et nœuds obligatoires', () => {
  assert.equal(workflowC.name, 'C — Starter gratuit');

  const names = workflowC.nodes.map((n) => n.name);
  for (const expected of [
    'Webhook Formulaire Starter',
    "Valider l'e-mail et le consentement",
    'Enregistrer le lead Starter',
    'Ajouter à la liste e-mail',
    'Chercher le carnet Starter',
    'Trouver le chemin PDF Starter',
    'Signer le lien Starter',
    "Envoyer l'e-mail du Starter",
    'Répondre : succès'
  ]) {
    assert.ok(names.includes(expected), `nœud manquant dans C : ${expected}`);
  }
});

test('workflow C — webhook répondant au site (responseNode)', () => {
  const webhook = nodeByName(workflowC, 'Webhook Formulaire Starter');
  assert.equal(webhook.parameters.httpMethod, 'POST');
  assert.equal(webhook.parameters.responseMode, 'responseNode');
  assert.equal(webhook.parameters.path, 'case-depart-starter');
});

test('workflow C — validation e-mail et consentement (code autonome)', () => {
  const validate = nodeByName(workflowC, "Valider l'e-mail et le consentement");
  const code = validate.parameters.jsCode;
  assert.ok(code.includes('emailRegex'), 'validation e-mail absente');
  assert.ok(code.includes('consentement'), 'vérification consentement absente');
  // Aucun module npm
  assert.ok(!code.includes("require('nodemailer')"));
});

test('workflow C — upsert lead avec ignore duplicates (idempotence)', () => {
  const upsert = nodeByName(workflowC, 'Enregistrer le lead Starter');
  const prefer = upsert.parameters.headerParameters.parameters.find(
    (h) => h.name === 'Prefer'
  );
  assert.ok(prefer, 'header Prefer absent');
  assert.ok(prefer.value.includes('ignore-duplicates'), 'resolution=ignore-duplicates absent');
});

test('workflow C — cherche le Starter le plus récent (statut pret)', () => {
  const http = nodeByName(workflowC, 'Chercher le carnet Starter');
  assert.ok(http.parameters.url.includes('starter'));
  assert.ok(http.parameters.url.includes('pret'));
  assert.ok(http.parameters.url.includes('order=created_at.desc'));
});

test('workflow C — lien signé + e-mail Starter (TODO_PROVIDER)', () => {
  const sign = nodeByName(workflowC, 'Signer le lien Starter');
  assert.equal(sign.parameters.method, 'POST');
  assert.ok(sign.parameters.url.includes('/sign/pdfs/'));

  const email = nodeByName(workflowC, "Envoyer l'e-mail du Starter");
  assert.equal(email.parameters.method, 'POST');
  assert.ok(email.parameters.url.includes('$env.EMAIL_PROVIDER_URL'));
  assert.ok((email.notes || '').includes('TODO_PROVIDER'));

  const respond = nodeByName(workflowC, 'Répondre : succès');
  assert.equal(respond.type, 'n8n-nodes-base.respondToWebhook');
  assert.equal(respond.parameters.options.responseCode, 200);
});

test('config/products.json — structure valide', () => {
  const products = require('../config/products.json');
  const entries = Object.entries(products).filter(([k]) => !k.startsWith('_'));
  assert.ok(entries.length > 0, 'products.json vide');
  for (const [priceId, product] of entries) {
    assert.ok(priceId.startsWith('price_'), `price_id mal formé : ${priceId}`);
    assert.ok(typeof product.carnet_slug === 'string', `carnet_slug manquant pour ${priceId}`);
    assert.ok(['A4', 'A5', 'A5-livret'].includes(product.format), `format invalide pour ${priceId}`);
    assert.ok(typeof product.gift === 'boolean', `gift doit être boolean pour ${priceId}`);
    assert.ok(typeof product.label === 'string', `label manquant pour ${priceId}`);
  }
});
