#!/usr/bin/env node
/**
 * Prévisualisation locale d'un carnet — Case Départ
 *
 * Usage :
 *   node scripts/preview.js --theme noel --format A4
 *   node scripts/preview.js --theme noel --format A5
 *   node scripts/preview.js --theme noel --format A5-livret
 *   node scripts/preview.js --theme noel --format A4 --gift-name "Camille"
 *   node scripts/preview.js --theme noel --type starter --format A5
 *
 * Le fichier est écrit dans out/. Ouvre-le dans Chrome puis « Imprimer » →
 * « Enregistrer au format PDF ».
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { getTheme, buildCarnet } = require('../src/carnet.js');
const { buildHtml } = require('../src/html/template.js');

const ROOT = path.join(__dirname, '..');
const THEMES_PATH = path.join(ROOT, 'config', 'themes.json');
const OUT_DIR = path.join(ROOT, 'out');

function parseArgs(argv) {
  const args = {
    theme: 'noel',
    format: 'A4',
    type: 'thematique',
    level: null,
    giftName: null,
    giftMessage: null,
    buyerEmail: null,
    out: null
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      i++;
      if (i >= argv.length) {
        throw new Error(`Valeur manquante pour ${arg}`);
      }
      return argv[i];
    };

    switch (arg) {
      case '--theme':
        args.theme = next();
        break;
      case '--format':
        args.format = next();
        break;
      case '--type':
        args.type = next();
        break;
      case '--level':
        args.level = next();
        break;
      case '--gift-name':
        args.giftName = next();
        break;
      case '--gift-message':
        args.giftMessage = next();
        break;
      case '--buyer-email':
        args.buyerEmail = next();
        break;
      case '--out':
        args.out = next();
        break;
      case '--help':
      case '-h':
        console.log(
          [
            'Usage : node scripts/preview.js [options]',
            '',
            '  --theme noel|halloween|saint-valentin|paques|fete-musique|multi-theme',
            '  --format A4|A5|A5-livret',
            '  --type thematique|starter|etape|tour-annee',
            '  --level echauffement|sprint|marathon (pour type=etape)',
            '  --gift-name "Camille"',
            '  --gift-message "Bonne grille."',
            '  --buyer-email "acheteur@exemple.fr"',
            '  --out out/mon-fichier.html'
          ].join('\n')
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Option inconnue : ${arg}`);
    }
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(fs.readFileSync(THEMES_PATH, 'utf8'));
  const theme = getTheme(catalog, args.theme);

  const gift =
    args.giftName || args.giftMessage
      ? {
          recipientName: args.giftName || 'Camille',
          message: args.giftMessage || undefined
        }
      : null;

  const carnet = buildCarnet({
    theme,
    type: args.type,
    level: args.level,
    catalog,
    edition: theme.sousTitre,
    gift,
    buyerEmail: args.buyerEmail
  });

  const html = buildHtml(carnet, {
    format: args.format,
    buyerEmail: args.buyerEmail
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const defaultName = `carnet-${carnet.slug}-${carnet.type}-${args.format}.html`;
  const outputPath = args.out ? path.resolve(args.out) : path.join(OUT_DIR, defaultName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');

  const pageCount = (html.match(/<section class="page/g) || []).length;
  const sizeKo = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

  console.log('');
  console.log('CASE DÉPART — PRÉVISUALISATION');
  console.log('==============================');
  console.log(`Thème    : ${theme.nom}`);
  console.log(`Type     : ${carnet.type}`);
  console.log(`Format   : ${args.format}`);
  console.log(`Carnet   : ${carnet.title} — ${carnet.edition}`);
  console.log(`Grilles  : ${carnet.grids.length}${carnet.finalGrid ? ' + finale' : ''}`);
  console.log(
    `Chiffre clé : ${
      carnet.starred ? carnet.starred.digit + ' (grille ' + carnet.starred.gridLabel + ')' : '—'
    }`
  );
  console.log(`Pages    : ${pageCount}`);
  console.log(`Taille   : ${sizeKo} Ko`);
  console.log('');
  console.log(`Fichier  : ${path.relative(process.cwd(), outputPath)}`);
  console.log('');
  console.log('Ouvre ce fichier dans Chrome, puis Imprimer → Enregistrer au format PDF.');
  console.log('Pour le livret A5, imprime en recto-verso et plie au centre.');
  console.log('');
}

try {
  main();
} catch (error) {
  console.error('');
  console.error('ÉCHEC DE LA PRÉVISUALISATION');
  console.error(error.message);
  console.error('');
  process.exit(1);
}
