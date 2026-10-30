#!/usr/bin/env node
/**
 * Génère les workflows n8n de production — Case Départ.
 *
 * Source de vérité : le code de src/ et config/themes.json.
 * Les JSON de workflows/ sont générés : ne pas les éditer à la main.
 *
 * Usage :
 *   node scripts/build-workflows.js          # écrit workflows/*.json
 *   node scripts/build-workflows.js --check  # échoue si les JSON sont périmés
 *
 * Aucune dépendance npm. Les nœuds Code reçoivent le code des modules
 * concaténé (UMD + globalThis), car n8n Cloud ne sait pas résoudre
 * les require() relatifs.
 *
 * Configuration : les workflows lisent leurs réglages via $env.* (variables
 * personnalisées n8n Cloud, plans Pro/Enterprise). Aucun secret n'est écrit
 * dans les JSON. Voir docs/configuration-n8n.md.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT, 'workflows');

/**
 * Ordre de concaténation : chaque module ne dépend que des précédents.
 */
const MODULE_FILES = [
  'src/prng.js',
  'src/sudoku.js',
  'src/carnet.js',
  'src/html/helpers.js',
  'src/html/pages/illustrations.js',
  'src/html/cover-illustrations.js',
  'src/html/pages/grilles.js',
  'src/html/pages/couverture.js',
  'src/html/pages/ligne-depart.js',
  'src/html/pages/ravitaillement.js',
  'src/html/pages/arrivee.js',
  'src/html/pages/corrections.js',
  'src/html/pages/carte-cadeau.js',
  'src/html/pages/notes.js',
  'src/html/imposition.js',
  'src/html/fonts.js',
  'src/html/template.js'
];

const THEMES_PATH = 'config/themes.json';
const PRODUCTS_PATH = 'config/products.json';

/**
 * Variables personnalisées n8n ($vars). Elles se créent dans
 * n8n Cloud → Variables (plans Pro/Enterprise), jamais dans le JSON.
 * Les valeurs sont limitées à 1000 caractères par n8n.
 */
const CONFIG_VARIABLES = [
  { name: 'SUPABASE_URL', required: true, secret: false },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, secret: true },
  { name: 'PDFSHIFT_API_KEY', required: true, secret: true },
  { name: 'PDFSHIFT_SANDBOX', required: false, secret: false },
  { name: 'SIGNED_URL_TTL_SECONDS', required: false, secret: false },
  { name: 'NOTIFY_WEBHOOK_URL', required: false, secret: true },
  { name: 'CARNET_VALIDATION_TOKEN', required: true, secret: true },
  { name: 'CASE_DEPART_WEBHOOK_BASE', required: true, secret: false },
  { name: 'SITE_REVALIDATE_URL', required: false, secret: true },
  // Workflow B — Commande Stripe
  { name: 'STRIPE_SECRET_KEY', required: true, secret: true },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, secret: true },
  { name: 'EMAIL_FROM', required: true, secret: false },
  { name: 'EMAIL_PROVIDER_URL', required: true, secret: false },
  { name: 'EMAIL_PROVIDER_API_KEY', required: true, secret: true },
  { name: 'BUYER_EMAIL_IN_FOOTER', required: false, secret: false }
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readThemes() {
  return JSON.parse(read(THEMES_PATH));
}

function readProducts() {
  return JSON.parse(read(PRODUCTS_PATH));
}

/**
 * Assemble le code autonome injecté dans un nœud Code n8n.
 * Les thèmes sont exposés via CASE_DEPART_THEMES.
 */
function buildBundle() {
  const modules = MODULE_FILES.map((file) => read(file)).join('\n\n');
  const themes = read(THEMES_PATH).trim();

  return [
    '/* ============================================================',
    ' * CASE DÉPART — bundle généré par scripts/build-workflows.js',
    ' * Ne pas éditer à la main. Modules : PRNG, sudoku, carnet, HTML.',
    ' * ============================================================ */',
    'var CASE_DEPART_THEMES = ' + themes + ';',
    '',
    modules,
    ''
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Helpers de construction n8n
// ---------------------------------------------------------------------------

function node(id, name, type, typeVersion, position, parameters, extra) {
  return Object.assign(
    {
      id,
      name,
      type,
      typeVersion,
      position,
      parameters: parameters || {}
    },
    extra || {}
  );
}

function link(connections, from, to, outputIndex) {
  const index = typeof outputIndex === 'number' ? outputIndex : 0;
  if (!connections[from]) {
    connections[from] = { main: [] };
  }
  while (connections[from].main.length <= index) {
    connections[from].main.push([]);
  }
  connections[from].main[index].push({ node: to, type: 'main', index: 0 });
}

function chain(connections, names) {
  for (let i = 0; i < names.length - 1; i++) {
    link(connections, names[i], names[i + 1]);
  }
}

function variable(name) {
  return '={{ $env.' + name + ' }}';
}

function variableBearer(name) {
  return '={{ "Bearer " + $env.' + name + ' }}';
}

function supabaseUrl(pathExpression) {
  return '={{ $env.SUPABASE_URL + ' + pathExpression + ' }}';
}

function supabaseHeaders(extraHeaders) {
  return {
    parameters: [
      { name: 'apikey', value: variable('SUPABASE_SERVICE_ROLE_KEY') },
      { name: 'Authorization', value: variableBearer('SUPABASE_SERVICE_ROLE_KEY') }
    ].concat(extraHeaders || [])
  };
}

function httpRequest(options) {
  const parameters = {
    method: options.method || 'GET',
    url: options.url,
    authentication: 'none',
    options: options.options || {}
  };

  if (options.headers) {
    parameters.sendHeaders = true;
    parameters.headerParameters = options.headers;
  }

  if (options.body != null || options.bodyType === 'binary') {
    parameters.sendBody = true;
    if (options.bodyType === 'binary') {
      parameters.contentType = 'binaryData';
      parameters.inputDataFieldName = options.inputDataFieldName || 'data';
    } else {
      parameters.specifyBody = 'json';
      parameters.jsonBody = options.body;
    }
  }

  const extra = {};
  if (options.retry) {
    extra.retryOnFail = true;
    extra.maxTries = options.maxTries || 2;
    extra.waitBetweenTries = options.waitBetweenTries || 5000;
  }
  if (options.onError) {
    extra.onError = options.onError;
  }
  if (options.notes) {
    extra.notes = options.notes;
    extra.notesInFlow = !!options.notesInFlow;
  }

  return node(
    options.id,
    options.name,
    'n8n-nodes-base.httpRequest',
    options.typeVersion || 4.2,
    options.position,
    parameters,
    extra
  );
}

function codeNode(options) {
  return node(
    options.id,
    options.name,
    'n8n-nodes-base.code',
    2,
    options.position,
    {
      mode: options.mode || 'runOnceForAllItems',
      jsCode: options.jsCode
    },
    options.notes
      ? { notes: options.notes, notesInFlow: !!options.notesInFlow }
      : undefined
  );
}

function ifNode(options) {
  return node(
    options.id,
    options.name,
    'n8n-nodes-base.if',
    2.2,
    options.position,
    {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 2
        },
        conditions: [
          {
            id: options.id + '-condition',
            leftValue: options.left,
            rightValue: options.right == null ? '' : options.right,
            operator: options.operator
          }
        ],
        combinator: 'and'
      },
      options: {}
    },
    options.notes
      ? { notes: options.notes, notesInFlow: !!options.notesInFlow }
      : undefined
  );
}

function respondNode(options) {
  return node(
    options.id,
    options.name,
    'n8n-nodes-base.respondToWebhook',
    1.1,
    options.position,
    {
      respondWith: 'text',
      responseBody: options.body,
      options: options.responseCode ? { responseCode: options.responseCode } : {}
    },
    options.notes ? { notes: options.notes } : undefined
  );
}

// ---------------------------------------------------------------------------
// Code du nœud « Générer les carnets »
// ---------------------------------------------------------------------------

const GENERATE_NODE_CODE = `
// ---------------------------------------------------------------------------
// Génération des grilles et du HTML, à partir du formulaire.
// Le bundle Case Départ est injecté au-dessus de ce code par build-workflows.js.
// ---------------------------------------------------------------------------
const input = $input.first().json;

const THEMES = CASE_DEPART_THEMES;
const Carnet = CaseDepartCarnet;
const Template = CaseDepartTemplate;

const TYPE_MAP = {
  'Carnet thématique': 'thematique',
  'Tour de l\\'année': 'tour-annee',
  'L\\'Étape': 'etape',
  'Starter': 'starter'
};
const LEVEL_MAP = {
  'Échauffement': 'echauffement',
  'Sprint': 'sprint',
  'Marathon': 'marathon'
};
const FORMAT_MAP = {
  'A4 + A5 livret': ['A4', 'A5-livret'],
  'A4 seulement': ['A4'],
  'A5 livret seulement': ['A5-livret']
};

function normalizeSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Le formulaire n8n renvoie le libellé exact du champ comme clé JSON
// (pas de fieldName défini sur les nœuds Form Trigger générés).
const rawType = input['Type de carnet'];
const rawLevel = input["Niveau (uniquement pour L'Étape)"];
const rawFormats = input['Formats'];
const rawEdition = input['Édition'];
const rawTheme = input['Thème'];

const type = TYPE_MAP[rawType] || (Carnet.TYPES.indexOf(rawType) !== -1 ? rawType : 'thematique');
const level = LEVEL_MAP[rawLevel] || rawLevel || null;

if (type === 'etape' && !level) {
  throw new Error("Choisis un niveau (Échauffement, Sprint ou Marathon) pour un carnet L'Étape.");
}
const formats = FORMAT_MAP[rawFormats] || ['A4', 'A5-livret'];
const edition = String(rawEdition || 'Édition 2026').trim();

const requestedTheme = String(rawTheme || '').trim();
let themeKey = Object.keys(THEMES).find(function (key) {
  return (
    key === requestedTheme ||
    THEMES[key].slug === requestedTheme ||
    THEMES[key].nom === requestedTheme
  );
});

if (type === 'tour-annee') {
  themeKey = 'multi-theme';
}
if (!themeKey) {
  throw new Error('Thème inconnu : ' + requestedTheme);
}

const theme = Carnet.getTheme(THEMES, themeKey);
const themeSlug = theme.slug;
const editionSlug = normalizeSlug(edition);
const slug =
  type === 'thematique'
    ? themeSlug + '-' + editionSlug
    : themeSlug + '-' + type + '-' + (type === 'etape' && level ? level + '-' : '') + editionSlug;
const version = String(input.version || '1.0.0').trim();

const carnet = Carnet.buildCarnet({
  theme: theme,
  type: type,
  level: level,
  catalog: THEMES,
  slug: slug,
  edition: edition,
  version: version,
  counts: type === 'thematique' ? { echauffement: 10, sprint: 10, marathon: 10 } : null
});

const allGrids = carnet.corrections;
const gridRows = allGrids.map(function (grid) {
  return {
    niveau: grid.label === 'FIN' ? 'finale' : grid.level,
    position: grid.label === 'FIN' ? 1 : grid.position,
    label: grid.label,
    seed: grid.seed,
    puzzle: grid.puzzle,
    solution: grid.solution,
    clues: grid.clues,
    techniques: grid.techniques
  };
});

const documents = formats.map(function (format) {
  const fileName = slug + '-' + format + '.pdf';
  return {
    format: format,
    fileName: fileName,
    path: 'carnets/' + slug + '/' + version + '/' + fileName,
    html: Template.buildHtml(carnet, { format: format })
  };
});

return [
  {
    json: {
      slug: slug,
      version: version,
      titre: carnet.title + ' — ' + carnet.edition,
      theme: themeSlug,
      type: type,
      edition: edition,
      formats: formats,
      stats: {
        grilles: carnet.grids.length,
        finale: !!carnet.finalGrid,
        pages: documents.map(function (doc) {
          return { format: doc.format, ko: Math.round(doc.html.length / 1024) };
        })
      },
      carnetRow: {
        slug: slug,
        titre: carnet.title + ' — ' + carnet.edition,
        theme: themeSlug,
        type: type,
        statut: 'brouillon',
        formats_disponibles: formats,
        version: version,
        edition: edition
      },
      gridRows: gridRows,
      documents: documents
    }
  }
];
`;

const SPLIT_NODE_CODE = `
// Découpe les documents HTML en un item par format.
const carnet = $('Générer les carnets').first().json;
const carnetId = $('Enregistrer le carnet').first().json.id;

return carnet.documents.map(function (doc) {
  return {
    json: {
      carnetId: carnetId,
      slug: carnet.slug,
      version: carnet.version,
      format: doc.format,
      fileName: doc.fileName,
      path: doc.path,
      html: doc.html
    }
  };
});
`;

const GRIDS_NODE_CODE = `
// Prépare l'insertion en masse des grilles, une fois le carnet créé.
const rows = $('Générer les carnets').first().json.gridRows;
const carnetId = $('Enregistrer le carnet').first().json.id;

return [
  {
    json: {
      rows: rows.map(function (row) {
        return Object.assign({ carnet_id: carnetId }, row);
      })
    }
  }
];
`;

const PREPARE_LINKS_CODE = `
// Conserve format et chemin pour le nœud de signature (items appariés).
const doc = $('Découper les formats').item.json;
return {
  json: {
    format: doc.format,
    path: doc.path,
    fileName: doc.fileName
  }
};
`;

const KEEP_SIGNED_CODE = `
// Réassocie l'URL signée à son document.
const doc = $('Préparer les liens signés').item.json;
return {
  json: {
    format: doc.format,
    path: doc.path,
    fileName: doc.fileName,
    signedURL: $json.signedURL
  }
};
`;

const AGGREGATE_CODE = `
// Agrège les PDF produits : chemins pour Supabase + URLs signées de prévisualisation.
const items = $input.all();
const pdfPaths = {};
const previews = [];

items.forEach(function (item) {
  pdfPaths[item.json.format] = item.json.path;
  previews.push({
    format: item.json.format,
    url: $env.SUPABASE_URL + '/storage/v1' + item.json.signedURL
  });
});

return [
  {
    json: {
      pdf_paths: pdfPaths,
      previews: previews
    }
  }
];
`;

// ---------------------------------------------------------------------------
// Workflow A — Usine à carnets
// ---------------------------------------------------------------------------

function buildWorkflowA() {
  const themes = readThemes();
  const themeOptions = Object.keys(themes)
    .filter((key) => key !== 'multi-theme')
    .map((key) => ({ option: themes[key].nom }));
  themeOptions.push({ option: themes['multi-theme'].nom });

  const nodes = [
    node(
      'form-production',
      'Formulaire de production',
      'n8n-nodes-base.formTrigger',
      2.2,
      [-200, 300],
      {
        formTitle: 'Case Départ — Usine à carnets',
        formDescription:
          'Choisis le thème, le type de carnet et les formats. Le workflow génère les grilles, les PDF et les envoie dans Supabase.',
        formFields: {
          values: [
            {
              fieldLabel: 'Thème',
              fieldType: 'dropdown',
              requiredField: true,
              fieldOptions: { values: themeOptions }
            },
            {
              fieldLabel: 'Type de carnet',
              fieldType: 'dropdown',
              requiredField: true,
              fieldOptions: {
                values: [
                  { option: 'Carnet thématique' },
                  { option: 'Tour de l\'année' },
                  { option: 'L\'Étape' },
                  { option: 'Starter' }
                ]
              }
            },
            {
              fieldLabel: 'Niveau (uniquement pour L\'Étape)',
              fieldType: 'dropdown',
              requiredField: false,
              fieldOptions: {
                values: [
                  { option: 'Échauffement' },
                  { option: 'Sprint' },
                  { option: 'Marathon' }
                ]
              }
            },
            {
              fieldLabel: 'Édition',
              fieldType: 'text',
              requiredField: false,
              placeholder: 'Édition 2026'
            },
            {
              fieldLabel: 'Formats',
              fieldType: 'dropdown',
              requiredField: true,
              fieldOptions: {
                values: [
                  { option: 'A4 + A5 livret' },
                  { option: 'A4 seulement' },
                  { option: 'A5 livret seulement' }
                ]
              }
            }
          ]
        },
        options: {}
      },
      {
        notes:
          'Formulaire manuel de production. Pour un lancement automatisé, dupliquer ce workflow et remplacer ce nœud par un Webhook.',
        webhookId: 'a0000000-0000-4000-8000-000000000001'
      }
    ),

    codeNode({
      id: 'code-generer',
      name: 'Générer les carnets',
      position: [20, 300],
      mode: 'runOnceForAllItems',
      jsCode: buildBundle() + '\n' + GENERATE_NODE_CODE,
      notes:
        'Bundle autonome : PRNG + sudoku + carnet + HTML + polices. Aucun module npm externe. Génère 30 grilles et le HTML de chaque format.',
      notesInFlow: true
    }),

    httpRequest({
      id: 'http-carnet',
      name: 'Enregistrer le carnet',
      position: [240, 300],
      method: 'POST',
      url: supabaseUrl("'/rest/v1/carnets'"),
      headers: supabaseHeaders([
        { name: 'Prefer', value: 'return=representation' },
        { name: 'Accept', value: 'application/vnd.pgrst.object+json' }
      ]),
      body: '={{ JSON.stringify($json.carnetRow) }}',
      retry: true,
      options: { response: { response: { responseFormat: 'json' } } },
      notes: 'Crée le carnet au statut brouillon et renvoie son id.'
    }),

    codeNode({
      id: 'code-grilles',
      name: 'Préparer les grilles',
      position: [460, 300],
      jsCode: GRIDS_NODE_CODE
    }),

    httpRequest({
      id: 'http-grilles',
      name: 'Enregistrer les grilles',
      position: [680, 300],
      method: 'POST',
      url: supabaseUrl("'/rest/v1/grilles'"),
      headers: supabaseHeaders([{ name: 'Prefer', value: 'return=minimal' }]),
      body: '={{ JSON.stringify($json.rows) }}',
      retry: true,
      notes:
        'Insertion en masse. Les solutions restent privées (RLS + service_role uniquement).'
    }),

    codeNode({
      id: 'code-split',
      name: 'Découper les formats',
      position: [900, 300],
      jsCode: SPLIT_NODE_CODE
    }),

    httpRequest({
      id: 'http-pdf',
      name: 'Convertir en PDF (PDFShift)',
      position: [1120, 300],
      method: 'POST',
      url: 'https://api.pdfshift.io/v3/convert/pdf',
      headers: {
        parameters: [{ name: 'X-API-Key', value: variable('PDFSHIFT_API_KEY') }]
      },
      body:
        "={{ JSON.stringify({ source: $json.html, format: 'A4', landscape: $json.format === 'A5-livret', margin: { top: '0', right: '0', bottom: '0', left: '0' }, use_print: true, timeout: 30, sandbox: String($env.PDFSHIFT_SANDBOX || 'false') === 'true' }) }}",
      retry: true,
      maxTries: 2,
      waitBetweenTries: 5000,
      options: {
        timeout: 180000,
        response: {
          response: {
            responseFormat: 'file',
            outputPropertyName: 'data'
          }
        }
      },
      notes:
        'Seul nœud dépendant du fournisseur PDF. Endpoint, auth et options vérifiés dans la doc PDFShift (X-API-Key, source, format, landscape, margin, use_print, timeout, sandbox). Pour changer de fournisseur, remplacer ce nœud et conserver une sortie binaire nommée data.'
    }),

    httpRequest({
      id: 'http-upload',
      name: 'Uploader dans Supabase Storage',
      position: [1340, 300],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/pdfs/' + $json.path"),
      headers: supabaseHeaders([{ name: 'x-upsert', value: 'true' }]),
      bodyType: 'binary',
      inputDataFieldName: 'data',
      retry: true,
      options: { timeout: 120000 },
      notes:
        'Bucket privé pdfs. Le chemin est carnets/{slug}/{version}/{slug}-{format}.pdf. x-upsert permet de régénérer une version.'
    }),

    codeNode({
      id: 'code-prepare-links',
      name: 'Préparer les liens signés',
      position: [1560, 300],
      mode: 'runOnceForEachItem',
      jsCode: PREPARE_LINKS_CODE
    }),

    httpRequest({
      id: 'http-sign',
      name: 'Créer un lien signé',
      position: [1780, 300],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/sign/pdfs/' + $json.path"),
      headers: supabaseHeaders(),
      body:
        '={{ JSON.stringify({ expiresIn: Number($env.SIGNED_URL_TTL_SECONDS || 604800) }) }}',
      retry: true,
      notes:
        'URL signée temporaire (7 jours par défaut, configurable via SIGNED_URL_TTL_SECONDS).'
    }),

    codeNode({
      id: 'code-keep-signed',
      name: 'Conserver les liens signés',
      position: [2000, 300],
      mode: 'runOnceForEachItem',
      jsCode: KEEP_SIGNED_CODE
    }),

    codeNode({
      id: 'code-aggregate',
      name: 'Agréger les PDF',
      position: [2220, 300],
      jsCode: AGGREGATE_CODE
    }),

    httpRequest({
      id: 'http-statut',
      name: 'Marquer le carnet à valider',
      position: [2440, 300],
      method: 'PATCH',
      url:
        "={{ $env.SUPABASE_URL + '/rest/v1/carnets?id=eq.' + $('Enregistrer le carnet').first().json.id }}",
      headers: supabaseHeaders([
        { name: 'Prefer', value: 'return=representation' },
        { name: 'Accept', value: 'application/vnd.pgrst.object+json' }
      ]),
      body: '={{ JSON.stringify({ statut: \'a_valider\', pdf_paths: $json.pdf_paths }) }}',
      retry: true,
      options: { response: { response: { responseFormat: 'json' } } }
    }),

    ifNode({
      id: 'if-notify',
      name: 'Notification configurée ?',
      position: [2660, 300],
      left: '={{ Boolean($env.NOTIFY_WEBHOOK_URL) }}',
      operator: { type: 'boolean', operation: 'true', singleValue: true },
      notes:
        'Brancher ici Slack, Telegram ou un e-mail. Sans NOTIFY_WEBHOOK_URL, le workflow se termine sans notification.'
    }),

    httpRequest({
      id: 'http-notify',
      name: 'Notifier la validation',
      position: [2880, 200],
      method: 'POST',
      url: variable('NOTIFY_WEBHOOK_URL'),
      body:
        "={{ JSON.stringify({ text: 'Carnet à valider : ' + $('Générer les carnets').first().json.titre + ' — ' + $('Générer les carnets').first().json.slug, carnet_id: $('Enregistrer le carnet').first().json.id, formats: $('Générer les carnets').first().json.formats, previews: $('Agréger les PDF').first().json.previews, validation_url: $env.CASE_DEPART_WEBHOOK_BASE + '/webhook/case-depart-validation?token=' + encodeURIComponent($env.CARNET_VALIDATION_TOKEN) + '&carnet_id=' + $('Enregistrer le carnet').first().json.id }) }}",
      options: { timeout: 30000 },
      onError: 'continueRegularOutput',
      notes:
        'TODO_PROVIDER : ce POST générique marche avec Slack, Telegram (via passerelle) ou tout webhook interne. Adapter le corps si besoin.'
    })
  ];

  const connections = {};
  chain(connections, [
    'Formulaire de production',
    'Générer les carnets',
    'Enregistrer le carnet',
    'Préparer les grilles',
    'Enregistrer les grilles',
    'Découper les formats',
    'Convertir en PDF (PDFShift)',
    'Uploader dans Supabase Storage',
    'Préparer les liens signés',
    'Créer un lien signé',
    'Conserver les liens signés',
    'Agréger les PDF',
    'Marquer le carnet à valider',
    'Notification configurée ?'
  ]);
  link(connections, 'Notification configurée ?', 'Notifier la validation', 0);

  return workflow(
    'A — Usine à carnets',
    nodes,
    connections,
    'Produit un carnet complet (grilles + PDF A4/A5 livret), le stocke dans Supabase et notifie pour validation.'
  );
}

// ---------------------------------------------------------------------------
// Workflow A2 — Validation d'un carnet
// ---------------------------------------------------------------------------

const A2_SUCCESS_BODY = `Carnet validé.

Le carnet est maintenant au statut « prêt ». Il peut être livré aux clients.
Tu peux fermer cette page.`;

const A2_BAD_TOKEN_BODY = `Lien de validation invalide.

Vérifie que le token correspond à CARNET_VALIDATION_TOKEN dans n8n,
puis régénère le lien depuis le workflow A.`;

const A2_MISSING_ID_BODY = `Paramètre manquant.

Le lien doit contenir carnet_id. Régénère-le depuis la notification du workflow A.`;

function buildWorkflowA2() {
  const nodes = [
    node(
      'webhook-validation',
      'Webhook de validation',
      'n8n-nodes-base.webhook',
      2,
      [-200, 300],
      {
        path: 'case-depart-validation',
        httpMethod: 'GET',
        responseMode: 'responseNode',
        options: {}
      },
      {
        notes:
          'Appelé par le lien de notification du workflow A : /webhook/case-depart-validation?token=...&carnet_id=...',
        webhookId: 'a0000000-0000-4000-8000-000000000002'
      }
    ),

    ifNode({
      id: 'if-token',
      name: 'Token valide ?',
      position: [20, 300],
      left: '={{ $json.query.token }}',
      right: '={{ $env.CARNET_VALIDATION_TOKEN }}',
      operator: { type: 'string', operation: 'equals' },
      notes:
        'Protection par token secret. Le token ne doit jamais apparaître dans un dépôt public.'
    }),

    respondNode({
      id: 'respond-token',
      name: 'Refuser le token',
      position: [240, 460],
      body: A2_BAD_TOKEN_BODY,
      responseCode: 401
    }),

    ifNode({
      id: 'if-carnet',
      name: 'Carnet fourni ?',
      position: [240, 180],
      left: '={{ $json.query.carnet_id }}',
      right: '',
      operator: { type: 'string', operation: 'notEmpty', singleValue: true }
    }),

    respondNode({
      id: 'respond-missing',
      name: 'Refuser sans carnet',
      position: [460, 320],
      body: A2_MISSING_ID_BODY,
      responseCode: 400
    }),

    httpRequest({
      id: 'http-valider',
      name: 'Marquer le carnet prêt',
      position: [460, 120],
      method: 'PATCH',
      url:
        "={{ $env.SUPABASE_URL + '/rest/v1/carnets?id=eq.' + $json.query.carnet_id }}",
      headers: supabaseHeaders([
        { name: 'Prefer', value: 'return=representation' },
        { name: 'Accept', value: 'application/vnd.pgrst.object+json' }
      ]),
      body:
        '={{ JSON.stringify({ statut: \'pret\', valide_le: new Date().toISOString() }) }}',
      retry: true,
      options: { response: { response: { responseFormat: 'json' } } },
      notes: 'Passe le carnet de a_valider à pret et horodate la validation.'
    }),

    ifNode({
      id: 'if-revalidate',
      name: 'Revalidation site configurée ?',
      position: [680, 120],
      left: '={{ Boolean($env.SITE_REVALIDATE_URL) }}',
      operator: { type: 'boolean', operation: 'true', singleValue: true }
    }),

    httpRequest({
      id: 'http-revalidate',
      name: 'Revalider le site',
      position: [900, 40],
      method: 'GET',
      url: variable('SITE_REVALIDATE_URL'),
      options: { timeout: 30000 },
      onError: 'continueRegularOutput',
      notes:
        'Optionnel. À brancher sur une route de revalidation (Next.js on-demand revalidation) si le site met les carnets en cache.'
    }),

    respondNode({
      id: 'respond-success',
      name: 'Confirmer la validation',
      position: [1120, 140],
      body: A2_SUCCESS_BODY,
      responseCode: 200
    })
  ];

  const connections = {};
  link(connections, 'Webhook de validation', 'Token valide ?');
  link(connections, 'Token valide ?', 'Refuser le token', 1);
  link(connections, 'Token valide ?', 'Carnet fourni ?', 0);
  link(connections, 'Carnet fourni ?', 'Refuser sans carnet', 1);
  link(connections, 'Carnet fourni ?', 'Marquer le carnet prêt', 0);
  link(connections, 'Marquer le carnet prêt', 'Revalidation site configurée ?');
  link(connections, 'Revalidation site configurée ?', 'Revalider le site', 0);
  link(connections, 'Revalidation site configurée ?', 'Confirmer la validation', 1);
  link(connections, 'Revalider le site', 'Confirmer la validation');

  return workflow(
    'A2 — Validation d’un carnet',
    nodes,
    connections,
    'Valide un carnet produit par A : passe le statut à pret, puis revalide le site si SITE_REVALIDATE_URL est configurée.'
  );
}

// ---------------------------------------------------------------------------
// Assemblage

// ---------------------------------------------------------------------------
// Workflow B — Commande Stripe
// ---------------------------------------------------------------------------

/**
 * Nœud Code : vérification de la signature Stripe (optionnelle) + extraction des données.
 * Utilise uniquement crypto (module Node natif disponible dans les nœuds Code n8n).
 * Si STRIPE_WEBHOOK_SECRET n'est pas défini, passe directement à la re-lecture Stripe.
 */
const B_CHECK_SIGNATURE_CODE = `
// ---------------------------------------------------------------------------
// Vérification optionnelle de la signature Stripe-Signature
// Utilise uniquement le module crypto natif (disponible dans n8n Code).
// Si STRIPE_WEBHOOK_SECRET est vide, on ne vérifie pas ici : la re-lecture
// de la session via l'API Stripe suffit à garantir l'authenticité.
// ---------------------------------------------------------------------------
const rawBody = $input.first().json.body; // Corps brut du webhook (string JSON)
const secret  = $env.STRIPE_WEBHOOK_SECRET || '';
const sigHeader = $input.first().headers && $input.first().headers['stripe-signature'];

let verified = false;
let signatureError = null;

if (secret && sigHeader) {
  try {
    const crypto = require('crypto');
    // Stripe signature = "t=timestamp,v1=hmac1,v1=hmac2,..."
    const parts = String(sigHeader).split(',');
    const tPart = parts.find(function(p) { return p.startsWith('t='); });
    const v1Parts = parts.filter(function(p) { return p.startsWith('v1='); });

    if (!tPart || v1Parts.length === 0) {
      throw new Error('En-tête Stripe-Signature malformé.');
    }

    const timestamp = tPart.slice(2);
    const payload = timestamp + '.' + rawBody;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    const tolerance = 300; // 5 minutes
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (age > tolerance) {
      throw new Error('Webhook Stripe trop ancien (' + age + 's). Possible rejeu.');
    }

    const signatureMatches = v1Parts.some(function(part) {
      return part.slice(3) === expected;
    });
    if (!signatureMatches) {
      throw new Error('Signature Stripe invalide.');
    }
    verified = true;
  } catch (e) {
    signatureError = e.message;
  }
}

// On laisse passer dans tous les cas : la re-lecture Stripe est la vraie garantie.
// signatureError est loggé mais pas bloquant (certains proxies modifient le body).
const event = JSON.parse(rawBody || JSON.stringify($input.first().json));
return [{
  json: {
    stripe_session_id: event.data && event.data.object && event.data.object.id,
    event_type: event.type,
    signature_verified: verified,
    signature_warning: signatureError || null
  }
}];
`;

/**
 * Nœud Code : mappe le price_id Stripe vers les infos produit + extrait les metadata.
 * Le catalogue products.json est injecté dans le bundle.
 */
const B_MAP_PRODUCT_CODE = `
// ---------------------------------------------------------------------------
// Mappe le price_id vers le produit, et extrait les infos de livraison.
// CASE_DEPART_PRODUCTS est injecté par build-workflows.js.
// ---------------------------------------------------------------------------
const session = $('Re-lire la session Stripe').first().json;

// payment_status doit être 'paid'
if (session.payment_status !== 'paid') {
  throw new Error('Session non payée (status=' + session.payment_status + '). Arrêt.');
}

// Récupère le premier line_item
const lineItems = (session.line_items && session.line_items.data) || [];
if (lineItems.length === 0) {
  throw new Error('Aucun line_item dans la session Stripe.');
}
const priceId = lineItems[0].price && lineItems[0].price.id;
const amountTotal = session.amount_total || 0; // en centimes

// Catalogue produits
const PRODUCTS = CASE_DEPART_PRODUCTS;
const product = PRODUCTS[priceId];
if (!product) {
  throw new Error('price_id inconnu dans products.json : ' + priceId + '. Ajoute-le dans config/products.json.');
}

// Metadata et custom_fields de la session Stripe
// Le site doit envoyer dans session.metadata :
//   - gift_message  (string, optionnel)
//   - recipient_name (string, si cadeau)
// et/ou dans custom_fields :
//   - key "recipient_name" avec le nom du destinataire (si cadeau)
//   - key "gift_message" avec le message (si cadeau)
const meta = session.metadata || {};
const customFields = session.custom_fields || [];

function cfValue(key) {
  const field = customFields.find(function(f) {
    return f.key === key || f.label && f.label.custom === key;
  });
  if (!field) return null;
  return (field.text && field.text.value) ||
         (field.dropdown && field.dropdown.value) ||
         null;
}

const recipientName = meta.recipient_name || cfValue('recipient_name') || '';
const giftMessage   = meta.gift_message   || cfValue('gift_message')   || '';
const buyerEmail    = session.customer_details && session.customer_details.email || session.customer_email || '';
const customerEmail = buyerEmail;

// Format peut aussi être surchargé depuis les metadata du site
const format = meta.format || product.format;

return [{
  json: {
    stripe_session_id: session.id,
    email: customerEmail,
    carnet_slug: product.carnet_slug,
    format: format,
    gift: product.gift || Boolean(meta.gift === 'true' || meta.gift === true),
    recipient_name: recipientName,
    gift_message: giftMessage,
    buyer_email: buyerEmail,
    montant_cents: amountTotal,
    label: product.label,
    price_id: priceId
  }
}];
`;

/**
 * Nœud Code : génère le HTML personnalisé pour les versions cadeau.
 * Le bundle complet (PRNG + sudoku + carnet + HTML + fonts) est injecté.
 */
const B_GIFT_HTML_CODE = `
// ---------------------------------------------------------------------------
// Génère un PDF cadeau personnalisé (nom du destinataire + message).
// Le bundle Case Départ est injecté au-dessus par build-workflows.js.
// ---------------------------------------------------------------------------
const order  = $('Mapper le produit').first().json;
const Carnet   = CaseDepartCarnet;
const Template = CaseDepartTemplate;
const THEMES   = CASE_DEPART_THEMES;

// Récupère le carnet prêt depuis Supabase (nœud précédent)
const carnetRow = $('Lire le carnet').first().json;
if (!carnetRow || !carnetRow.id) {
  throw new Error('Carnet introuvable en base : ' + order.carnet_slug);
}

const themeKey = Object.keys(THEMES).find(function(k) {
  return THEMES[k].slug === carnetRow.theme || k === carnetRow.theme;
}) || carnetRow.theme;

const theme = Carnet.getTheme(THEMES, themeKey);

// Reconstruit le carnet depuis la BDD (metadata uniquement, pas les grilles)
const carnet = Carnet.buildCarnet({
  theme: theme,
  type: carnetRow.type,
  level: carnetRow.level || null,
  catalog: THEMES,
  slug: carnetRow.slug,
  edition: carnetRow.edition || 'Édition 2026',
  version: carnetRow.version || '1.0.0',
  counts: carnetRow.type === 'thematique' ? { echauffement: 10, sprint: 10, marathon: 10 } : null
});

const showBuyerEmail = String($env.BUYER_EMAIL_IN_FOOTER || 'false') === 'true';

const html = Template.buildHtml(carnet, {
  format: order.format,
  gift: {
    recipientName: order.recipient_name,
    message: order.gift_message
  },
  buyerEmail: showBuyerEmail ? order.buyer_email : null
});

const sessionId = order.stripe_session_id;
const fileName  = carnetRow.slug + '-' + order.format + '-gift-' + sessionId.slice(-8) + '.pdf';
const path      = 'commandes/' + sessionId + '/' + fileName;

return [{
  json: {
    html: html,
    fileName: fileName,
    path: path,
    format: order.format
  }
}];
`;

/**
 * Corps de l'e-mail de livraison — en français, tutoiement, ton de la marque.
 * Champs injectés dynamiquement via expression n8n.
 */
function deliveryEmailBody(label, ttlDays) {
  return (
    '=<p>Hello ! 🎉</p>' +
    '<p>Ton carnet <strong>' + label + '</strong> est prêt à télécharger.</p>' +
    '<p><a href="{{ $json.signed_url }}" style="background:#1F2340;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">📥 Télécharger mon carnet</a></p>' +
    '<p>Le lien est valable <strong>' + ttlDays + ' jours</strong>. Après ça, envoie un petit message à contact@casedepart.fr et on s\'arrange.</p>' +
    '<p>Bonne course ! 🏁</p>' +
    '<p style="font-size:0.85em;color:#888;">Case Départ · Sudokus modernes</p>'
  );
}

function buildWorkflowB() {
  const products = readProducts();
  const productsJson = JSON.stringify(products);

  // Bundle complet (pour nœud de génération cadeau)
  const bundle = buildBundle();
  const giftBundle = bundle + '\nvar CASE_DEPART_PRODUCTS = ' + productsJson + ';\n' + B_MAP_PRODUCT_CODE;
  const mapBundle = 'var CASE_DEPART_PRODUCTS = ' + productsJson + ';\n' + B_MAP_PRODUCT_CODE;

  const nodes = [
    // 1. Webhook Stripe
    node(
      'webhook-stripe',
      'Webhook Stripe (checkout.session.completed)',
      'n8n-nodes-base.webhook',
      2,
      [-200, 300],
      {
        path: 'case-depart-stripe',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        options: { rawBody: true }
      },
      {
        notes:
          'Configuré dans Stripe Dashboard → Webhooks → Événements : checkout.session.completed.\nURL : {BASE_URL}/webhook/case-depart-stripe\nActive rawBody pour la vérification de signature.',
        webhookId: 'b0000000-0000-4000-8000-000000000001'
      }
    ),

    // 2. Vérifier la signature (optionnel)
    codeNode({
      id: 'code-check-sig',
      name: 'Vérifier la signature Stripe',
      position: [40, 300],
      jsCode: B_CHECK_SIGNATURE_CODE,
      notes:
        'Vérifie Stripe-Signature avec crypto (Node natif). Si STRIPE_WEBHOOK_SECRET est vide, passe directement. La re-lecture de la session Stripe est la vraie garantie.',
      notesInFlow: true
    }),

    // 3. Re-lire la session Stripe (garantie d'authenticité + line_items)
    httpRequest({
      id: 'http-stripe-session',
      name: 'Re-lire la session Stripe',
      position: [280, 300],
      method: 'GET',
      url: "={{ 'https://api.stripe.com/v1/checkout/sessions/' + $json.stripe_session_id + '?expand[]=line_items&expand[]=customer_details' }}",
      headers: {
        parameters: [
          { name: 'Authorization', value: variableBearer('STRIPE_SECRET_KEY') }
        ]
      },
      retry: true,
      notes:
        'Re-lecture directe depuis l\'API Stripe. Seul Stripe peut renvoyer payment_status=paid. expand[]=line_items donne le price_id.'
    }),

    // 4. Vérifier l'idempotence (commande déjà traitée ?)
    httpRequest({
      id: 'http-check-idempotent',
      name: 'Vérifier l\'idempotence',
      position: [520, 300],
      method: 'GET',
      url: supabaseUrl("'/rest/v1/commandes?stripe_session_id=eq.' + $json.id + '&select=id,statut'"),
      headers: supabaseHeaders([
        { name: 'Accept', value: 'application/json' }
      ]),
      options: {},
      notes:
        'Renvoie un tableau. Si un enregistrement existe déjà, la commande est un doublon à ignorer.'
    }),

    // 5. Commande déjà traitée ?
    ifNode({
      id: 'if-idempotent',
      name: 'Commande déjà traitée ?',
      position: [760, 300],
      left: '={{ $json.length }}',
      right: 0,
      operator: { type: 'number', operation: 'gt' },
      notes: 'Si la commande existe déjà, on s\'arrête sans rien faire (idempotence).'
    }),

    // 5b. Arrêt silencieux si doublon
    respondNode({
      id: 'respond-doublon',
      name: 'Ignorer le doublon',
      position: [1000, 460],
      body: 'ok',
      responseCode: 200
    }),

    // 6. Mapper le produit (price_id → carnet_slug, format, gift)
    codeNode({
      id: 'code-map-product',
      name: 'Mapper le produit',
      position: [1000, 140],
      jsCode: 'var CASE_DEPART_PRODUCTS = ' + productsJson + ';\n' + B_MAP_PRODUCT_CODE,
      notes:
        'Associe le price_id Stripe au carnet et au format. Extrait recipient_name et gift_message des metadata/custom_fields de la session.',
      notesInFlow: true
    }),

    // 7. Enregistrer la commande (statut: recue)
    httpRequest({
      id: 'http-save-order',
      name: 'Enregistrer la commande',
      position: [1240, 140],
      method: 'POST',
      url: supabaseUrl("'/rest/v1/commandes'"),
      headers: supabaseHeaders([
        { name: 'Prefer', value: 'return=representation' },
        { name: 'Accept', value: 'application/vnd.pgrst.object+json' }
      ]),
      body:
        '={{ JSON.stringify({ stripe_session_id: $json.stripe_session_id, email: $json.email, carnet_slug: $json.carnet_slug, format: $json.format, gift: $json.gift, recipient_name: $json.recipient_name || null, gift_message: $json.gift_message || null, buyer_email: $json.buyer_email || null, montant_cents: $json.montant_cents, statut: \'recue\', metadata: { price_id: $json.price_id, label: $json.label } }) }}',
      retry: true,
      options: { response: { response: { responseFormat: 'json' } } },
      notes: 'Enregistrement de la commande avant toute livraison.'
    }),

    // 8. Lire le carnet prêt dans Supabase
    httpRequest({
      id: 'http-read-carnet',
      name: 'Lire le carnet',
      position: [1480, 140],
      method: 'GET',
      url: supabaseUrl("'/rest/v1/carnets?slug=eq.' + $('Mapper le produit').first().json.carnet_slug + '&statut=eq.pret&select=*'"),
      headers: supabaseHeaders([{ name: 'Accept', value: 'application/json' }]),
      retry: true,
      notes:
        'Le carnet doit être au statut pret. Sinon la commande passe en erreur.'
    }),

    // 9. Carnet cadeau ou standard ?
    ifNode({
      id: 'if-gift',
      name: 'Version à offrir ?',
      position: [1720, 140],
      left: '={{ $("Mapper le produit").first().json.gift }}',
      operator: { type: 'boolean', operation: 'true', singleValue: true },
      notes: 'Branche True = PDF cadeau personnalisé à générer. Branche False = PDF standard déjà prêt.'
    }),

    // ── Branche STANDARD ───────────────────────────────────────────────────

    // 10a. Lire le chemin du PDF standard
    codeNode({
      id: 'code-std-path',
      name: 'Récupérer le chemin PDF standard',
      position: [1960, 60],
      mode: 'runOnceForEachItem',
      jsCode: `
// Récupère le chemin du PDF standard depuis les pdf_paths du carnet.
const carnet = $('Lire le carnet').first().json;
const format = $('Mapper le produit').first().json.format;
const pdfPaths = carnet.pdf_paths || {};
const pdfPath = pdfPaths[format];
if (!pdfPath) {
  throw new Error('PDF non trouvé pour le format ' + format + ' dans le carnet ' + carnet.slug + '. Vérifie que le carnet a bien été produit et validé.');
}
return [{ json: { pdf_path: pdfPath } }];
`,
      notes: 'Extrait le chemin du PDF depuis le champ pdf_paths du carnet Supabase.'
    }),

    // 10b. Créer un lien signé pour le PDF standard
    httpRequest({
      id: 'http-sign-std',
      name: 'Signer le lien PDF standard',
      position: [2200, 60],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/sign/pdfs/' + $json.pdf_path"),
      headers: supabaseHeaders(),
      body:
        '={{ JSON.stringify({ expiresIn: Number($env.SIGNED_URL_TTL_SECONDS || 604800) }) }}',
      retry: true,
      notes: 'Lien signé valable 7 jours (configurable via SIGNED_URL_TTL_SECONDS).'
    }),

    // ── Branche CADEAU ────────────────────────────────────────────────────

    // 11a. Générer le HTML cadeau
    codeNode({
      id: 'code-gift-html',
      name: 'Générer le HTML cadeau',
      position: [1960, 220],
      jsCode: bundle + '\n' + B_GIFT_HTML_CODE,
      notes:
        'Bundle autonome : génère le HTML personnalisé avec nom du destinataire, message et page carte-cadeau. Aucun module npm externe.',
      notesInFlow: true
    }),

    // 11b. Convertir le HTML cadeau en PDF (PDFShift)
    httpRequest({
      id: 'http-pdf-gift',
      name: 'Convertir le PDF cadeau (PDFShift)',
      position: [2200, 220],
      method: 'POST',
      url: 'https://api.pdfshift.io/v3/convert/pdf',
      headers: {
        parameters: [{ name: 'X-API-Key', value: variable('PDFSHIFT_API_KEY') }]
      },
      body:
        "={{ JSON.stringify({ source: $json.html, format: 'A4', landscape: false, margin: { top: '0', right: '0', bottom: '0', left: '0' }, use_print: true, timeout: 30, sandbox: String($env.PDFSHIFT_SANDBOX || 'false') === 'true' }) }}",
      retry: true,
      maxTries: 2,
      waitBetweenTries: 5000,
      options: {
        timeout: 180000,
        response: { response: { responseFormat: 'file', outputPropertyName: 'data' } }
      },
      notes:
        'Seul nœud dépendant du fournisseur PDF (PDFShift). Pour changer de fournisseur, remplacer ce nœud et conserver une sortie binaire nommée data.'
    }),

    // 11c. Uploader le PDF cadeau dans Supabase Storage
    httpRequest({
      id: 'http-upload-gift',
      name: 'Uploader le PDF cadeau',
      position: [2440, 220],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/pdfs/' + $('Générer le HTML cadeau').first().json.path"),
      headers: supabaseHeaders([{ name: 'x-upsert', value: 'true' }]),
      bodyType: 'binary',
      inputDataFieldName: 'data',
      retry: true,
      options: { timeout: 120000 },
      notes: 'Bucket privé pdfs. Chemin : commandes/{session_id}/{fichier}.pdf'
    }),

    // 11d. Signer le lien PDF cadeau
    httpRequest({
      id: 'http-sign-gift',
      name: 'Signer le lien PDF cadeau',
      position: [2680, 220],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/sign/pdfs/' + $('Générer le HTML cadeau').first().json.path"),
      headers: supabaseHeaders(),
      body:
        '={{ JSON.stringify({ expiresIn: Number($env.SIGNED_URL_TTL_SECONDS || 604800) }) }}',
      retry: true,
      notes: 'Lien signé pour le PDF cadeau personnalisé.'
    }),

    // 12. Normaliser le lien signé (merge des branches std + gift)
    codeNode({
      id: 'code-merge-signed',
      name: 'Normaliser le lien signé',
      position: [2920, 140],
      mode: 'runOnceForEachItem',
      jsCode: `
// Normalise le lien signé quelle que soit la branche (standard ou cadeau).
// Les deux nœuds de signature renvoient { signedURL: '/storage/v1/...' }.
const signedURL = $json.signedURL;
if (!signedURL) throw new Error('Pas de lien signé dans la réponse Supabase Storage.');
const fullUrl = $env.SUPABASE_URL + '/storage/v1' + signedURL;

// Détermine le chemin stocké
let pdfPath;
try {
  pdfPath = $('Récupérer le chemin PDF standard').first().json.pdf_path;
} catch(e) {
  pdfPath = $('Générer le HTML cadeau').first().json.path;
}

return [{ json: { signed_url: fullUrl, pdf_path: pdfPath } }];
`,
      notes: 'Fusionne les branches standard et cadeau en une URL signée normalisée.'
    }),

    // 13. Envoyer l'e-mail de livraison
    httpRequest({
      id: 'http-email-delivery',
      name: 'Envoyer l\'e-mail de livraison',
      position: [3160, 140],
      method: 'POST',
      url: variable('EMAIL_PROVIDER_URL'),
      headers: {
        parameters: [
          { name: 'Authorization', value: variableBearer('EMAIL_PROVIDER_API_KEY') },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      body:
        '={{ JSON.stringify({ from: $env.EMAIL_FROM, to: $("Mapper le produit").first().json.email, subject: "🎉 Ton carnet Case Départ est prêt !", html: "<div style=\\"font-family:Arial,Helvetica,sans-serif;color:#161616;max-width:480px;margin:0 auto;padding:32px 24px;\\"><p style=\\"font-family:\'Arial Black\',Impact,Arial,sans-serif;font-size:24px;font-weight:900;letter-spacing:-0.01em;margin:0 0 20px;\\">Ton carnet est prêt</p><p style=\\"font-size:16px;line-height:1.5;\\">Ton carnet <strong>" + $("Mapper le produit").first().json.label + "</strong> est prêt à télécharger.</p><p style=\\"margin:28px 0;\\"><a href=\\"" + $json.signed_url + "\\" style=\\"display:inline-block;background:#041735;color:#ffffff;padding:14px 28px;border-radius:2px;text-decoration:none;font-weight:700;letter-spacing:0.02em;\\">Télécharger mon carnet</a></p><p style=\\"font-size:16px;line-height:1.5;\\">Le lien est valable <strong>7 jours</strong>. Après ça, envoie un petit message à contact@casedepart.fr et on s\'arrange.</p><p style=\\"font-size:16px;\\">Bonne course ! 🏁</p><p style=\\"font-size:13px;color:#6B6B6B;margin-top:32px;border-top:1px solid #EFEFEF;padding-top:16px;\\">Case Départ · Sudokus modernes</p></div>" }) }}',
      retry: true,
      maxTries: 2,
      waitBetweenTries: 3000,
      options: { timeout: 30000 },
      notes:
        'TODO_PROVIDER : corps de requête au format générique (from, to, subject, html).\nAdapte EMAIL_PROVIDER_URL et le corps selon ton fournisseur :\n  - Brevo : https://api.brevo.com/v3/smtp/email  (champs: sender, to, subject, htmlContent)\n  - Resend : https://api.resend.com/emails\n  - MailerLite : https://connect.mailerlite.com/api/subscribers\nVoir docs/configuration-n8n.md pour les exemples par fournisseur.'
    }),

    // 14. Marquer la commande livrée
    httpRequest({
      id: 'http-order-livree',
      name: 'Marquer la commande livrée',
      position: [3400, 140],
      method: 'PATCH',
      url: supabaseUrl("'/rest/v1/commandes?stripe_session_id=eq.' + $('Mapper le produit').first().json.stripe_session_id"),
      headers: supabaseHeaders([{ name: 'Prefer', value: 'return=minimal' }]),
      body:
        "={{ JSON.stringify({ statut: 'livree', pdf_path: $('Normaliser le lien signé').first().json.pdf_path, livree_le: new Date().toISOString() }) }}",
      retry: true,
      notes: 'Mise à jour finale : statut livree + chemin du PDF.'
    }),

    // 15. Marquer la commande en erreur (nœud d'erreur branché sur le workflow)
    httpRequest({
      id: 'http-order-erreur',
      name: 'Marquer la commande en erreur',
      position: [3400, 460],
      method: 'PATCH',
      url: supabaseUrl("'/rest/v1/commandes?stripe_session_id=eq.' + $('Mapper le produit').first().json.stripe_session_id"),
      headers: supabaseHeaders([{ name: 'Prefer', value: 'return=minimal' }]),
      body:
        "={{ JSON.stringify({ statut: 'erreur' }) }}",
      onError: 'continueRegularOutput',
      notes:
        'À brancher sur un nœud Error Trigger (workflow d\'erreur) ou sur les sorties d\'erreur des nœuds critiques.'
    }),

    // 16. Notifier l'erreur
    ifNode({
      id: 'if-notify-err',
      name: 'Notification erreur configurée ?',
      position: [3640, 460],
      left: '={{ Boolean($env.NOTIFY_WEBHOOK_URL) }}',
      operator: { type: 'boolean', operation: 'true', singleValue: true }
    }),

    httpRequest({
      id: 'http-notify-err',
      name: 'Notifier l\'erreur de livraison',
      position: [3880, 400],
      method: 'POST',
      url: variable('NOTIFY_WEBHOOK_URL'),
      body:
        "={{ JSON.stringify({ text: '🚨 Erreur de livraison Case Départ', session_id: $('Mapper le produit').first().json.stripe_session_id, email: $('Mapper le produit').first().json.email, label: $('Mapper le produit').first().json.label, error: $json.error || 'Inconnue' }) }}",
      options: { timeout: 15000 },
      onError: 'continueRegularOutput',
      notes: 'TODO_PROVIDER : même webhook générique que le workflow A.'
    })
  ];

  const connections = {};

  // Flux principal
  chain(connections, [
    'Webhook Stripe (checkout.session.completed)',
    'Vérifier la signature Stripe',
    'Re-lire la session Stripe',
    "Vérifier l'idempotence",
    'Commande déjà traitée ?'
  ]);

  link(connections, 'Commande déjà traitée ?', 'Ignorer le doublon', 0); // True → length > 0 → doublon
  link(connections, 'Commande déjà traitée ?', 'Mapper le produit', 1); // False → length == 0 → nouveau

  chain(connections, [
    'Mapper le produit',
    'Enregistrer la commande',
    'Lire le carnet',
    'Version à offrir ?'
  ]);

  // Branche standard (False = 1)
  link(connections, 'Version à offrir ?', 'Récupérer le chemin PDF standard', 1);
  chain(connections, ['Récupérer le chemin PDF standard', 'Signer le lien PDF standard']);
  link(connections, 'Signer le lien PDF standard', 'Normaliser le lien signé');

  // Branche cadeau (True = 0)
  link(connections, 'Version à offrir ?', 'Générer le HTML cadeau', 0);
  chain(connections, [
    'Générer le HTML cadeau',
    'Convertir le PDF cadeau (PDFShift)',
    'Uploader le PDF cadeau',
    'Signer le lien PDF cadeau'
  ]);
  link(connections, 'Signer le lien PDF cadeau', 'Normaliser le lien signé');

  // Suite commune
  chain(connections, [
    'Normaliser le lien signé',
    'Envoyer l\'e-mail de livraison',
    'Marquer la commande livrée'
  ]);

  // Branche erreur (à brancher manuellement sur les nœuds critiques ou Error Trigger)
  link(connections, 'Marquer la commande en erreur', 'Notification erreur configurée ?');
  link(connections, 'Notification erreur configurée ?', 'Notifier l\'erreur de livraison', 0);

  return workflow(
    'B — Commande Stripe',
    nodes,
    connections,
    'Traite un webhook checkout.session.completed : vérifie le paiement, génère le PDF (standard ou cadeau), envoie le lien signé par e-mail, marque la commande livrée.'
  );
}

// ---------------------------------------------------------------------------
// Workflow C — Starter gratuit
// ---------------------------------------------------------------------------

const C_VALIDATE_CODE = `
// ---------------------------------------------------------------------------
// Valide l'e-mail et le consentement envoyés par le formulaire du site.
// ---------------------------------------------------------------------------
const body = $input.first().json.body || $input.first().json;

const email = String(body.email || '').trim().toLowerCase();
const consent = body.consentement === true || body.consentement === 'true' || body.consentement === '1';

// Validation basique de l'e-mail
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('E-mail invalide : ' + email);
}
if (!consent) {
  throw new Error('Consentement absent. Le contact ne peut pas être ajouté.');
}

const source = String(body.source || 'site').trim();
const theme  = String(body.theme  || '').trim();

return [{ json: { email, consentement: true, source, theme } }];
`;

const C_FIND_STARTER_CODE = `
// ---------------------------------------------------------------------------
// Cherche le PDF Starter le plus récent au statut 'pret'.
// Le nœud HTTP précédent a renvoyé le carnet Supabase.
// ---------------------------------------------------------------------------
const rows = $input.all().map(function(i) { return i.json; });
if (rows.length === 0) {
  throw new Error('Aucun carnet Starter au statut pret. Lance le workflow A avec le type Starter d\'abord.');
}
// Supabase renvoie déjà trié par created_at desc (voir l'URL du nœud précédent)
const carnet = rows[0];
const format = 'A4'; // le Starter est toujours en A4
const pdfPaths = carnet.pdf_paths || {};
const pdfPath  = pdfPaths[format] || pdfPaths['A4'];
if (!pdfPath) {
  throw new Error('PDF A4 introuvable dans le carnet Starter : ' + carnet.slug);
}
return [{ json: { carnet_slug: carnet.slug, pdf_path: pdfPath, titre: carnet.titre } }];
`;

function buildWorkflowC() {
  const nodes = [
    // 1. Webhook depuis le formulaire du site
    node(
      'webhook-starter',
      'Webhook Formulaire Starter',
      'n8n-nodes-base.webhook',
      2,
      [-200, 300],
      {
        path: 'case-depart-starter',
        httpMethod: 'POST',
        responseMode: 'responseNode',
        options: {}
      },
      {
        notes:
          'Appelé par le formulaire de téléchargement du Starter sur le site.\nURL : {BASE_URL}/webhook/case-depart-starter\nLe site envoie : { email, consentement: true|false, theme?, source? }',
        webhookId: 'c0000000-0000-4000-8000-000000000001'
      }
    ),

    // 2. Valider e-mail + consentement
    codeNode({
      id: 'code-validate-starter',
      name: 'Valider l\'e-mail et le consentement',
      position: [40, 300],
      jsCode: C_VALIDATE_CODE,
      notes: 'Rejette les e-mails invalides et les contacts sans consentement.',
      notesInFlow: true
    }),

    // 3. Enregistrer le lead dans Supabase
    httpRequest({
      id: 'http-upsert-lead',
      name: 'Enregistrer le lead Starter',
      position: [280, 300],
      method: 'POST',
      url: supabaseUrl("'/rest/v1/leads_starter'"),
      headers: supabaseHeaders([
        { name: 'Prefer', value: 'return=minimal,resolution=ignore-duplicates' }
      ]),
      body:
        '={{ JSON.stringify({ email: $json.email, consentement: $json.consentement, theme: $json.theme || null, source: $json.source || null }) }}',
      retry: true,
      notes: 'on conflict do nothing (resolution=ignore-duplicates) : un e-mail déjà inscrit n\'est pas dupliqué.'
    }),

    // 4. Ajouter à la liste e-mail (fournisseur à configurer)
    httpRequest({
      id: 'http-add-to-list',
      name: 'Ajouter à la liste e-mail',
      position: [520, 300],
      method: 'POST',
      url: variable('EMAIL_PROVIDER_URL'),
      headers: {
        parameters: [
          { name: 'Authorization', value: variableBearer('EMAIL_PROVIDER_API_KEY') },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      body:
        '={{ JSON.stringify({ email: $json.email }) }}',
      onError: 'continueRegularOutput',
      options: { timeout: 15000 },
      notes:
        'TODO_PROVIDER : adapte l\'URL et le corps à ton fournisseur.\n  - Brevo : POST https://api.brevo.com/v3/contacts  { email, listIds: [ID], updateEnabled: true }\n  - MailerLite : POST https://connect.mailerlite.com/api/subscribers  { email, groups: ["ID"] }\n  - Resend : POST https://api.resend.com/audiences/{id}/contacts  { email }\nVoir docs/configuration-n8n.md.'
    }),

    // 5. Récupérer le carnet Starter le plus récent
    httpRequest({
      id: 'http-find-starter',
      name: 'Chercher le carnet Starter',
      position: [760, 300],
      method: 'GET',
      url: supabaseUrl("'/rest/v1/carnets?type=eq.starter&statut=eq.pret&select=*&order=created_at.desc&limit=1'"),
      headers: supabaseHeaders([{ name: 'Accept', value: 'application/json' }]),
      retry: true,
      notes: 'Renvoie le Starter le plus récent au statut pret. Trié par created_at desc.'
    }),

    // 6. Extraire le chemin du PDF
    codeNode({
      id: 'code-find-starter-path',
      name: 'Trouver le chemin PDF Starter',
      position: [1000, 300],
      jsCode: C_FIND_STARTER_CODE,
      notes: 'Extrait le chemin A4 du Starter depuis le champ pdf_paths.'
    }),

    // 7. Créer un lien signé
    httpRequest({
      id: 'http-sign-starter',
      name: 'Signer le lien Starter',
      position: [1240, 300],
      method: 'POST',
      url: supabaseUrl("'/storage/v1/object/sign/pdfs/' + $json.pdf_path"),
      headers: supabaseHeaders(),
      body:
        '={{ JSON.stringify({ expiresIn: Number($env.SIGNED_URL_TTL_SECONDS || 604800) }) }}',
      retry: true,
      notes: 'Lien signé valable 7 jours.'
    }),

    // 8. Envoyer l'e-mail avec le lien Starter
    httpRequest({
      id: 'http-email-starter',
      name: 'Envoyer l\'e-mail du Starter',
      position: [1480, 300],
      method: 'POST',
      url: variable('EMAIL_PROVIDER_URL'),
      headers: {
        parameters: [
          { name: 'Authorization', value: variableBearer('EMAIL_PROVIDER_API_KEY') },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      body:
        '={{ JSON.stringify({ from: $env.EMAIL_FROM, to: $("Valider l\'e-mail et le consentement").first().json.email, subject: "🎁 Ton Starter Case Départ est là !", html: "<div style=\\"font-family:Arial,Helvetica,sans-serif;color:#161616;max-width:480px;margin:0 auto;padding:32px 24px;\\"><p style=\\"font-family:\'Arial Black\',Impact,Arial,sans-serif;font-size:24px;font-weight:900;letter-spacing:-0.01em;margin:0 0 20px;\\">Ton Starter est là</p><p style=\\"font-size:16px;line-height:1.5;\\">Ton Starter Case Départ est prêt. C\'est un mini-carnet de 3 grilles pour tester le concept avant de plonger dans le grand bain !</p><p style=\\"margin:28px 0;\\"><a href=\\"" + $env.SUPABASE_URL + "/storage/v1" + $json.signedURL + "\\" style=\\"display:inline-block;background:#041735;color:#ffffff;padding:14px 28px;border-radius:2px;text-decoration:none;font-weight:700;letter-spacing:0.02em;\\">Télécharger le Starter</a></p><p style=\\"font-size:16px;line-height:1.5;\\">Le lien est valable <strong>7 jours</strong>.</p><p style=\\"font-size:16px;\\">Bonne course ! 🏁</p><p style=\\"font-size:13px;color:#6B6B6B;margin-top:32px;border-top:1px solid #EFEFEF;padding-top:16px;\\">Case Départ · Sudokus modernes</p></div>" }) }}',
      retry: true,
      maxTries: 2,
      waitBetweenTries: 3000,
      options: { timeout: 30000 },
      notes:
        'TODO_PROVIDER : adapte l\'URL et le corps à ton fournisseur e-mail (voir nœud "Ajouter à la liste e-mail" pour les exemples).'
    }),

    // 9. Répondre au site — succès
    respondNode({
      id: 'respond-ok',
      name: 'Répondre : succès',
      position: [1720, 200],
      body: '={{ JSON.stringify({ ok: true, message: "Ton Starter est en route !" }) }}',
      responseCode: 200
    }),

    // 10. Répondre au site — erreur de validation
    respondNode({
      id: 'respond-err',
      name: 'Répondre : erreur de validation',
      position: [280, 500],
      body: '={{ JSON.stringify({ ok: false, error: $json.message || "Erreur de validation" }) }}',
      responseCode: 400
    })
  ];

  const connections = {};

  chain(connections, [
    'Webhook Formulaire Starter',
    'Valider l\'e-mail et le consentement'
  ]);

  // En cas d'erreur de validation, n8n redirige automatiquement vers le nœud d'erreur
  // (à configurer en liant la sortie d'erreur de "Valider..." vers "Répondre : erreur de validation")
  // Note : n8n ne supporte pas encore les sorties d'erreur inline sur les nœuds Code ;
  // utilise un Error Workflow ou entoure d'un Try/Catch via IF.

  chain(connections, [
    'Valider l\'e-mail et le consentement',
    'Enregistrer le lead Starter',
    'Ajouter à la liste e-mail',
    'Chercher le carnet Starter',
    'Trouver le chemin PDF Starter',
    'Signer le lien Starter',
    'Envoyer l\'e-mail du Starter',
    'Répondre : succès'
  ]);

  return workflow(
    'C — Starter gratuit',
    nodes,
    connections,
    'Reçoit une inscription au Starter gratuit : valide, enregistre le lead, ajoute à la liste e-mail, envoie le PDF Starter par lien signé.'
  );
}

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------

function workflow(name, nodes, connections, description) {
  return {
    name,
    nodes,
    connections,
    active: false,
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true
    },
    staticData: null,
    pinData: {},
    meta: {
      generatedBy: 'automation/scripts/build-workflows.js',
      description
    },
    tags: []
  };
}

function buildAll() {
  return {
    'A-usine-a-carnets.json': buildWorkflowA(),
    'A2-validation-carnet.json': buildWorkflowA2(),
    'B-commande-stripe.json': buildWorkflowB(),
    'C-starter-gratuit.json': buildWorkflowC()
  };
}

function writeAll(files) {
  fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
  Object.keys(files).forEach((fileName) => {
    const target = path.join(WORKFLOWS_DIR, fileName);
    fs.writeFileSync(target, JSON.stringify(files[fileName], null, 2) + '\n', 'utf8');
    console.log('Écrit : ' + path.relative(ROOT, target));
  });
}

function checkAll(files) {
  let stale = 0;
  Object.keys(files).forEach((fileName) => {
    const target = path.join(WORKFLOWS_DIR, fileName);
    const expected = JSON.stringify(files[fileName], null, 2) + '\n';
    const actual = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (actual !== expected) {
      console.error('Périmé : ' + path.relative(ROOT, target));
      stale++;
    }
  });
  if (stale > 0) {
    console.error('');
    console.error('Relance npm run build:workflows.');
    process.exit(1);
  }
  console.log('Workflows à jour.');
}

function main() {
  const check = process.argv.indexOf('--check') !== -1;
  const files = buildAll();
  if (check) {
    checkAll(files);
    return;
  }

  writeAll(files);
  const a = files['A-usine-a-carnets.json'];
  console.log('');
  console.log('Workflow A : ' + a.nodes.length + ' nœuds');
  console.log(
    'Taille du nœud de génération : ' +
      Math.round(
        Buffer.byteLength(
          a.nodes.find((n) => n.name === 'Générer les carnets').parameters.jsCode,
          'utf8'
        ) / 1024
      ) +
      ' Ko'
  );
  console.log('Workflow A2 : ' + files['A2-validation-carnet.json'].nodes.length + ' nœuds');
  console.log('Workflow B  : ' + files['B-commande-stripe.json'].nodes.length + ' nœuds');
  console.log('Workflow C  : ' + files['C-starter-gratuit.json'].nodes.length + ' nœuds');
}

module.exports = {
  MODULE_FILES,
  CONFIG_VARIABLES,
  buildBundle,
  buildWorkflowA,
  buildWorkflowA2,
  buildWorkflowB,
  buildWorkflowC,
  buildAll
};

if (require.main === module) {
  main();
}
