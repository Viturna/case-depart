#!/usr/bin/env node
/**
 * Télécharge les polices du design et génère fonts.css + fonts.js.
 *
 * Polices : Anton 400 (titre du site, --font-title) + Inter 400/500.
 * 'BDO Grotesk' (--font-body du site) n'existe pas sur Google Fonts — Inter
 * sert de repli fiable pour le corps de texte du PDF.
 * Les fichiers sont intégrés en base64 pour que le HTML soit autonome.
 *
 * Exécution : npm run build:fonts
 * En cas d'absence de réseau, le script s'arrête avec un message explicite ;
 * il ne produit jamais de fichier partiel.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const GOOGLE_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500&display=swap';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const ALLOWED_SUBSETS = ['latin', 'latin-ext'];
const OUTPUT_CSS = path.join(__dirname, '..', 'src', 'html', 'fonts.css');
const OUTPUT_JS = path.join(__dirname, '..', 'src', 'html', 'fonts.js');

async function fetchText(url, label) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!response.ok) {
    throw new Error(`${label} : HTTP ${response.status} pour ${url}`);
  }
  return response.text();
}

async function fetchBase64(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!response.ok) {
    throw new Error(`Téléchargement de police : HTTP ${response.status} pour ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('base64');
}

function parseFontFaces(css) {
  const blocks = [];
  const regex = /\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    const subset = match[1].trim();
    const body = match[2];
    const familyMatch = body.match(/font-family:\s*'([^']+)'/);
    const weightMatch = body.match(/font-weight:\s*(\d+)/);
    const stretchMatch = body.match(/font-stretch:\s*([^;]+);/);
    const urlMatch = body.match(/url\((https:\/\/[^)]+)\)/);

    if (!familyMatch || !urlMatch) {
      continue;
    }

    blocks.push({
      subset,
      body,
      family: familyMatch[1],
      weight: weightMatch ? weightMatch[1] : '400',
      stretch: stretchMatch ? stretchMatch[1].trim() : 'normal',
      url: urlMatch[1]
    });
  }

  return blocks;
}

async function main() {
  console.log('Téléchargement de la feuille de style Google Fonts…');
  const css = await fetchText(GOOGLE_CSS_URL, 'Google Fonts');

  const faces = parseFontFaces(css).filter((face) =>
    ALLOWED_SUBSETS.includes(face.subset)
  );

  if (faces.length === 0) {
    throw new Error(
      'Aucune police latine trouvée dans la réponse Google Fonts. ' +
        'Vérifie la connexion réseau ou la feuille de style.'
    );
  }

  console.log(`${faces.length} fichiers de police à intégrer…`);

  const cache = new Map();
  const output = [];

  for (const face of faces) {
    if (!cache.has(face.url)) {
      process.stdout.write(`  · ${face.family} ${face.weight} (${face.subset})… `);
      const base64 = await fetchBase64(face.url);
      cache.set(face.url, base64);
      console.log(`${Math.round(base64.length / 1024)} Ko`);
    }

    const dataUri = `url(data:font/woff2;base64,${cache.get(face.url)}) format('woff2')`;
    const body = face.body.replace(
      /src:\s*url\(https:\/\/[^)]+\)\s*format\('woff2'\);/,
      `src: ${dataUri};`
    );

    if (body.indexOf('data:font/woff2;base64,') === -1) {
      throw new Error(`Impossible d'intégrer la police ${face.family} ${face.weight}.`);
    }

    output.push(
      `/* ${face.subset} — ${face.family} ${face.weight} ${face.stretch} */\n` +
        `@font-face {\n${body.trim()}\n}`
    );
  }

  const finalCss =
    '/* GÉNÉRÉ PAR scripts/build-fonts.js — NE PAS ÉDITER À LA MAIN. */\n' +
    '/* Anton 400 · Inter 400/500 */\n\n' +
    output.join('\n\n') +
    '\n';

  const js =
    '/* GÉNÉRÉ PAR scripts/build-fonts.js — NE PAS ÉDITER À LA MAIN. */\n' +
    '(function (root, factory) {\n' +
    '  var css = factory();\n' +
    '  if (typeof module !== "undefined" && module.exports) { module.exports = { css: css }; }\n' +
    '  if (typeof globalThis !== "undefined") { globalThis.CaseDepartFonts = { css: css }; }\n' +
    '})(typeof globalThis !== "undefined" ? globalThis : this, function () {\n' +
    '  return ' +
    JSON.stringify(finalCss) +
    ';\n' +
    '});\n';

  fs.mkdirSync(path.dirname(OUTPUT_CSS), { recursive: true });
  fs.writeFileSync(OUTPUT_CSS, finalCss, 'utf8');
  fs.writeFileSync(OUTPUT_JS, js, 'utf8');

  console.log('');
  console.log(`Écrit : ${path.relative(process.cwd(), OUTPUT_CSS)}`);
  console.log(`Écrit : ${path.relative(process.cwd(), OUTPUT_JS)}`);
  console.log(`Taille CSS : ${Math.round(finalCss.length / 1024)} Ko`);
}

main().catch((error) => {
  console.error('');
  console.error('ÉCHEC DU TÉLÉCHARGEMENT DES POLICES');
  console.error(error.message);
  console.error('');
  console.error('Marche à suivre manuelle :');
  console.error('1. Ouvrir la feuille Google Fonts du projet dans un navigateur.');
  console.error('2. Télécharger les woff2 latins et latin-ext.');
  console.error('3. Les convertir en base64 et compléter src/html/fonts.css.');
  console.error('4. Ou relancer npm run build:fonts avec une connexion réseau.');
  process.exit(1);
});
