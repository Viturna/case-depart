/**
 * Gabarit HTML complet d'un carnet — Case Départ
 *
 * buildHtml(carnet, options) renvoie un HTML autonome :
 *   - CSS inline, polices en base64, SVG inline ;
 *   - aucune ressource externe ;
 *   - formats A4, A5 et A5-livret (imposition sur A4 paysage).
 */

(function (root, factory) {
  function load(localPath, globalName) {
    var value = null;
    if (typeof require === 'function') {
      try {
        value = require(localPath);
      } catch (error) {
        value = null;
      }
    }
    if (!value && typeof globalThis !== 'undefined') {
      value = globalThis[globalName];
    }
    return value;
  }

  var deps = {
    H: load('./helpers.js', 'CaseDepartHtmlHelpers'),
    Couverture: load('./pages/couverture.js', 'CaseDepartPageCouverture'),
    LigneDepart: load('./pages/ligne-depart.js', 'CaseDepartPageLigneDepart'),
    Grilles: load('./pages/grilles.js', 'CaseDepartPageGrilles'),
    Ravitaillement: load('./pages/ravitaillement.js', 'CaseDepartPageRavitaillement'),
    Arrivee: load('./pages/arrivee.js', 'CaseDepartPageArrivee'),
    Corrections: load('./pages/corrections.js', 'CaseDepartPageCorrections'),
    CarteCadeau: load('./pages/carte-cadeau.js', 'CaseDepartPageCarteCadeau'),
    Notes: load('./pages/notes.js', 'CaseDepartPageNotes'),
    Imposition: load('./imposition.js', 'CaseDepartImposition')
  };

  var Fonts = load('./fonts.js', 'CaseDepartFonts');
  var api = factory(deps, Fonts);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartTemplate = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (deps, Fonts) {
  'use strict';

  var H = deps.H;
  var Couverture = deps.Couverture;
  var LigneDepart = deps.LigneDepart;
  var Grilles = deps.Grilles;
  var Ravitaillement = deps.Ravitaillement;
  var Arrivee = deps.Arrivee;
  var Corrections = deps.Corrections;
  var CarteCadeau = deps.CarteCadeau;
  var Notes = deps.Notes;
  var Imposition = deps.Imposition;

  var FORMATS = ['A4', 'A5', 'A5-livret'];

  function fallbackFontsCss() {
    return (
      '/* Polices non intégrées : lancer npm run build:fonts. */\n' +
      '/* Les piles de repli utilisent les polices locales si présentes. */\n'
    );
  }

  function baseCss(format) {
    var pageSize = format === 'A5-livret' ? 'A4 landscape' : format;
    var formatClass =
      format === 'A4' ? 'format-a4' : format === 'A5' ? 'format-a5' : 'format-livret';
    var fontCss = Fonts && Fonts.css ? Fonts.css : fallbackFontsCss();

    return `
/* ===== Case Départ — gabarit carnet ===== */
:root{
  --sable:#EFDEC2;
  --sapin:#315A54;
  --brique:#9F1014;
  --rose:#FEC2DC;
  --font-title:'Archivo','Archivo Black',sans-serif;
  --font-body:'Inter',Arial,sans-serif;
  --font-mono:'IBM Plex Mono','SFMono-Regular',monospace;
}
${fontCss}

@page{size:${pageSize};margin:0}

*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:var(--sable);
  color:var(--sapin);
  font-family:var(--font-body);
  font-weight:400;
  font-size:10pt;
  line-height:1.55;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
h1,h2,h3,p,blockquote,figure{margin:0}
table{border-collapse:collapse}

.h{
  font-family:var(--font-title);
  font-stretch:125%;
  font-weight:900;
  text-transform:uppercase;
  line-height:.9;
  letter-spacing:-.015em;
}
.mono{
  font-family:var(--font-mono);
  font-weight:500;
  text-transform:uppercase;
  letter-spacing:.14em;
  font-size:6.5pt;
}
.highlight{background:var(--rose);padding:0 .06em;box-decoration-break:clone;-webkit-box-decoration-break:clone}

.page{
  width:210mm;
  height:297mm;
  position:relative;
  overflow:hidden;
  background:var(--sable);
  color:var(--sapin);
}
.format-a5 .page{width:148mm;height:210mm;font-size:8pt}
.format-livret .page{width:148.5mm;height:210mm;font-size:8pt}

.page-inner{position:absolute;inset:0;padding:14mm;display:flex;flex-direction:column}
.format-a5 .page-inner,.format-livret .page-inner{padding:9mm}

.page-head{display:flex;justify-content:space-between;gap:6mm;line-height:1.2;font-size:6.5pt}
.page-head-right{text-align:right}
.hairline{border-top:1px solid var(--sapin);margin-top:2.5mm}
.page-content{flex:1;min-height:0;display:flex;flex-direction:column;padding-top:5mm;position:relative}
.page-foot{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:4mm;
  border-top:1px solid var(--sapin);
  padding-top:2mm;
  font-size:6pt;
  line-height:1.2;
}
.foot-number{font-weight:600}
.buyer-email{
  font-size:5.5pt;
  letter-spacing:.04em;
  text-transform:none;
  max-width:62mm;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  text-align:center;
}

/* ---------- Couverture ---------- */
.page-cover{background:var(--sable)}
.cover-inner{position:absolute;inset:0;padding:16mm;display:flex;flex-direction:column}
.cover-top{display:flex;justify-content:space-between;gap:4mm;font-size:6.5pt;line-height:1.2}
.cover-rule{border-top:1px solid var(--sapin);margin-top:2.5mm}
.cover-badge{
  position:absolute;
  top:28mm;
  right:16mm;
  width:30mm;
  height:30mm;
  border-radius:50%;
  background:var(--rose);
  color:var(--sapin);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:1mm;
  transform:rotate(-6deg);
  text-align:center;
  z-index:2;
}
.cover-badge .mono{font-size:6.5pt;font-weight:600;letter-spacing:.1em}
.cover-badge-year{font-family:var(--font-title);font-stretch:125%;font-weight:900;font-size:11pt;line-height:1}
.cover-gift{
  align-self:flex-start;
  border:1px solid var(--sapin);
  padding:2mm 4mm;
  margin-top:7mm;
  font-size:7pt;
  font-weight:600;
}
.cover-title{font-size:54pt;margin-top:8mm;max-width:135mm;position:relative;z-index:1}
.cover-sub{font-size:6.5pt;margin-top:5mm;padding-top:2mm;border-top:1px solid var(--sapin);max-width:120mm;line-height:1.35}
.cover-art{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:4mm 0}
.cover-art .art{height:100mm;width:auto;max-width:100%}
.cover-bottom{flex:0 0 auto}
.cover-phrase{font-size:12pt;line-height:1.35;margin:0 0 4mm;max-width:135mm}
.cover-foot{display:flex;justify-content:space-between;border-top:1px solid var(--sapin);padding-top:2mm;font-size:6pt}

/* ---------- Ligne de départ ---------- */
.rules-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:6mm}
.rules-title{font-size:40pt;margin-top:2mm}
.rules-lead{font-size:10.5pt;max-width:155mm;margin:5mm 0}
.rules-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  border-top:1px solid var(--sapin);
  border-left:1px solid var(--sapin);
}
.rule-block{border-right:1px solid var(--sapin);border-bottom:1px solid var(--sapin);padding:4.5mm}
.rule-number{font-size:7pt;font-weight:600}
.rule-title{font-size:12.5pt;margin:2mm 0}
.rule-text{font-size:8.5pt;line-height:1.45}
.level-table{margin-top:6mm;border-top:1px solid var(--sapin)}
.level-table-head,.level-row{
  display:grid;
  grid-template-columns:42mm 28mm 1fr;
  gap:4mm;
  padding:2.5mm 0;
  border-bottom:1px solid var(--sapin);
  align-items:baseline;
}
.level-table-head{font-size:6pt}
.level-name{font-size:10.5pt}
.level-name .arrows{font-size:.55em;letter-spacing:.05em;vertical-align:.1em}
.level-clues{font-size:6.5pt;font-weight:600}
.level-tagline{font-size:8pt;line-height:1.4}
.departure-time{
  border:1px solid var(--sapin);
  padding:4mm 5mm;
  margin-top:6mm;
  display:flex;
  align-items:baseline;
  gap:5mm;
}
.time-write{
  font-family:var(--font-mono);
  font-size:18pt;
  letter-spacing:.1em;
  border-bottom:1px solid var(--sapin);
  min-width:48mm;
}
.time-hint{font-size:5.5pt;margin-left:auto}
.rules-foot{font-size:6.5pt;margin-top:auto;border-top:1px solid var(--sapin);padding-top:2mm;line-height:1.5}

/* ---------- Grilles ---------- */
.grid-page{flex:1;min-height:0;display:flex;flex-direction:column}
.grid-title{font-size:32pt;margin-top:3mm}
.grid-title .arrows{font-size:.5em;letter-spacing:.05em;vertical-align:.1em}
.grid-meta{font-size:6.5pt;margin-top:2mm}
.grid-wrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:2mm 0}
.sudoku-grid{width:158mm;height:158mm;max-width:100%;max-height:100%;overflow:visible}
.grid-note{font-size:6pt;margin:2mm 0;min-height:7mm;line-height:1.4}
.grid-counters{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  border-top:1px solid var(--sapin);
  border-left:1px solid var(--sapin);
}
.counter-box{
  border-right:1px solid var(--sapin);
  border-bottom:1px solid var(--sapin);
  padding:2.5mm 3mm;
  display:flex;
  flex-direction:column;
  gap:1mm;
}
.counter-box .mono{font-size:5.5pt}
.counter-line{font-family:var(--font-mono);font-size:11pt;line-height:1.1}

/* ---------- Ravitaillements ---------- */
.ravito-page{flex:1;min-height:0;display:flex;flex-direction:column}
.ravito-title{font-size:32pt;margin:1mm 0 2mm}
.ravito-consigne{font-size:9pt;max-width:155mm;line-height:1.45}
.ravito-art{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:3mm 0}
.ravito-coloring .ravito-art .art{height:152mm;width:auto;max-width:100%}
.palette-row{display:flex;gap:5mm;align-items:flex-end;border-top:1px solid var(--sapin);padding-top:3mm}
.palette-swatch{display:flex;flex-direction:column;gap:1.5mm;font-size:5.5pt}
.swatch{width:11mm;height:11mm;border:1px solid var(--sapin)}
.palette-note{font-size:5.5pt;margin-left:auto;text-align:right;line-height:1.4}
.ravito-foot{font-size:5.5pt;margin-top:auto;border-top:1px solid var(--sapin);padding-top:2mm}
.key-box{
  display:flex;
  gap:6mm;
  align-items:center;
  border:2px solid var(--sapin);
  padding:4mm;
  margin:3mm 0;
}
.key-left{
  display:flex;
  flex-direction:column;
  align-items:center;
  border-right:1px solid var(--sapin);
  padding-right:6mm;
  min-width:30mm;
}
.key-left .mono{font-size:5.5pt}
.key-digit{font-size:42pt;line-height:.9;margin-top:1mm}
.key-right .mono{font-size:5.5pt;font-weight:600}
.key-right p{font-size:8.5pt;line-height:1.4;margin-top:1mm}
.tirage-list{flex:1;display:flex;flex-direction:column;border-top:1px solid var(--sapin);min-height:0}
.tirage-row{
  flex:1;
  display:grid;
  grid-template-columns:9mm 1fr auto;
  gap:3mm;
  align-items:center;
  border-bottom:1px solid var(--sapin);
  padding:1.8mm 2mm;
  min-height:0;
}
.tirage-row.is-key{background:var(--rose)}
.tirage-digit{font-size:7pt;font-weight:600}
.tirage-text{font-size:7.8pt;line-height:1.35}
.tirage-flag{font-size:5pt;font-weight:600;text-align:right}

/* ---------- Arrivée ---------- */
.arrival-title{font-size:38pt;margin:2mm 0}
.arrival-lead{font-size:9pt;max-width:155mm;line-height:1.45}
.arrival-layout{display:flex;gap:7mm;flex:1;min-height:0;margin-top:4mm}
.arrival-grid{width:52%;display:flex;flex-direction:column;border:1px solid var(--sapin);padding:3mm}
.arrival-grid-head,.arrival-grid-foot{display:flex;justify-content:space-between;font-size:5.5pt}
.arrival-grid-svg{width:100%;height:auto;flex:1;min-height:0}
.arrival-grid-foot{margin-top:2mm}
.arrival-scores{flex:1;display:flex;flex-direction:column;min-width:0}
.score-head{display:flex;justify-content:space-between;border-bottom:1px solid var(--sapin);padding-bottom:2mm;font-size:5.5pt}
.score-table{width:100%;font-size:7pt}
.score-table th,.score-table td{border-bottom:1px solid var(--sapin);padding:2.4mm 1mm;text-align:left;vertical-align:top}
.score-table th{font-size:5pt}
.score-count{display:block;font-size:6pt}
.score-blank{font-family:var(--font-mono);font-size:8pt;letter-spacing:.08em}
.score-final{background:var(--rose)}
.score-done{text-align:center;font-family:var(--font-mono)}
.score-total{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--sapin);padding:3mm 0;margin-top:auto}
.score-total-line{font-family:var(--font-mono);font-size:13pt;letter-spacing:.08em}
.score-sign{font-size:5pt;margin-top:3mm;line-height:1.4}
.sign-line{display:block;border-bottom:1px solid var(--sapin);height:9mm;margin-top:1mm}
.arrival-quote{border-top:1px solid var(--sapin);padding-top:3mm;margin-top:3mm;font-size:9pt;line-height:1.45}
.arrival-quote cite{display:block;font-size:5.5pt;font-style:normal;margin-top:1.5mm}

/* ---------- Corrections ---------- */
.corrections-head{display:flex;justify-content:space-between;align-items:flex-end;gap:6mm}
.corrections-title{font-size:30pt}
.corrections-meta{font-size:7pt;font-weight:600}
.corrections-lead{font-size:8pt;max-width:150mm;margin:3mm 0}
.mini-grids{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:2mm;min-height:0}
.correction-block{border:1px solid var(--sapin);padding:2mm;display:flex;flex-direction:column;min-height:0}
.correction-head{display:flex;justify-content:space-between;font-size:5pt;margin-bottom:1mm}
.mini-grid{width:58mm;height:58mm;max-width:100%;align-self:center}

/* ---------- Carte cadeau ---------- */
.gift-page{flex:1;min-height:0;display:flex;flex-direction:column}
.gift-title{font-size:48pt;margin:5mm 0}
.gift-body{display:flex;gap:10mm;flex:1;align-items:center;min-height:0}
.gift-message{flex:1;font-size:13pt;line-height:1.5}
.gift-signature{font-size:6.5pt;margin-top:6mm}
.gift-art{width:68mm;flex:0 0 auto}
.gift-motif{width:100%;height:auto}
.gift-strip{
  display:flex;
  gap:4mm;
  border-top:1px solid var(--sapin);
  border-bottom:1px solid var(--sapin);
  padding:3mm 0;
  font-size:6.5pt;
  justify-content:center;
}
.gift-foot{font-size:5.5pt;margin-top:auto;padding-top:3mm}

/* ---------- Notes ---------- */
.notes-page{flex:1;min-height:0;display:flex;flex-direction:column}
.notes-title{font-size:36pt;margin:2mm 0}
.notes-lead{font-size:9pt;max-width:150mm}
.notes-lines{flex:1;display:flex;flex-direction:column;justify-content:space-between;margin-top:5mm;min-height:0}
.note-line{border-bottom:1px solid var(--sapin);height:6mm}

/* ---------- A5 : ajustements ---------- */
.format-a5 .cover-inner,.format-livret .cover-inner{padding:10mm}
.format-a5 .cover-badge,.format-livret .cover-badge{top:20mm;right:10mm;width:22mm;height:22mm}
.format-a5 .cover-badge .mono,.format-livret .cover-badge .mono{font-size:5pt}
.format-a5 .cover-badge-year,.format-livret .cover-badge-year{font-size:8pt}
.format-a5 .cover-title,.format-livret .cover-title{font-size:32pt;max-width:100mm;margin-top:5mm}
.format-a5 .cover-sub,.format-livret .cover-sub{font-size:5pt;max-width:95mm;margin-top:3mm}
.format-a5 .cover-art .art,.format-livret .cover-art .art{height:66mm}
.format-a5 .cover-phrase,.format-livret .cover-phrase{font-size:8.5pt;max-width:105mm}
.format-a5 .cover-foot,.format-livret .cover-foot{font-size:5pt}
.format-a5 .cover-gift,.format-livret .cover-gift{font-size:5.5pt;padding:1.5mm 3mm;margin-top:4mm}

.format-a5 .page-head,.format-livret .page-head{font-size:5.5pt}
.format-a5 .page-foot,.format-livret .page-foot{font-size:5pt}
.format-a5 .mono,.format-livret .mono{font-size:5.5pt}

.format-a5 .rules-title,.format-livret .rules-title{font-size:26pt}
.format-a5 .rules-lead,.format-livret .rules-lead{font-size:8pt;margin:3mm 0}
.format-a5 .rules-grid,.format-livret .rules-grid{grid-template-columns:1fr 1fr}
.format-a5 .rule-block,.format-livret .rule-block{padding:3mm}
.format-a5 .rule-title,.format-livret .rule-title{font-size:8.5pt}
.format-a5 .rule-text,.format-livret .rule-text{font-size:6.5pt;line-height:1.35}
.format-a5 .rule-number,.format-livret .rule-number{font-size:5.5pt}
.format-a5 .level-table,.format-livret .level-table{margin-top:3mm}
.format-a5 .level-table-head,.format-livret .level-table-head,
.format-a5 .level-row,.format-livret .level-row{grid-template-columns:31mm 17mm 1fr;padding:1.5mm 0;gap:2mm}
.format-a5 .level-name,.format-livret .level-name{font-size:7.5pt}
.format-a5 .level-clues,.format-livret .level-clues{font-size:4.5pt}
.format-a5 .level-tagline,.format-livret .level-tagline{font-size:6pt}
.format-a5 .departure-time,.format-livret .departure-time{padding:3mm;margin-top:3mm;gap:3mm}
.format-a5 .time-write,.format-livret .time-write{font-size:12pt;min-width:32mm}
.format-a5 .time-hint,.format-livret .time-hint{font-size:4.5pt}
.format-a5 .rules-foot,.format-livret .rules-foot{font-size:5pt}

.format-a5 .grid-title,.format-livret .grid-title{font-size:22pt}
.format-a5 .grid-meta,.format-livret .grid-meta{font-size:5pt}
.format-a5 .sudoku-grid,.format-livret .sudoku-grid{width:108mm;height:108mm}
.format-a5 .grid-note,.format-livret .grid-note{font-size:4.5pt;min-height:5mm}
.format-a5 .counter-line,.format-livret .counter-line{font-size:8pt}

.format-a5 .ravito-title,.format-livret .ravito-title{font-size:22pt}
.format-a5 .ravito-consigne,.format-livret .ravito-consigne{font-size:7pt}
.format-a5 .ravito-coloring .ravito-art .art,.format-livret .ravito-coloring .ravito-art .art{height:102mm}
.format-a5 .swatch,.format-livret .swatch{width:7mm;height:7mm}
.format-a5 .palette-swatch,.format-livret .palette-swatch{font-size:4.5pt}
.format-a5 .key-digit,.format-livret .key-digit{font-size:28pt}
.format-a5 .tirage-text,.format-livret .tirage-text{font-size:6pt}
.format-a5 .tirage-row,.format-livret .tirage-row{padding:1.2mm;grid-template-columns:7mm 1fr auto}
.format-a5 .tirage-flag,.format-livret .tirage-flag{font-size:4pt}

.format-a5 .arrival-title,.format-livret .arrival-title{font-size:26pt}
.format-a5 .arrival-lead,.format-livret .arrival-lead{font-size:6.5pt}
.format-a5 .arrival-layout,.format-livret .arrival-layout{gap:4mm}
.format-a5 .score-table,.format-livret .score-table{font-size:5.5pt}
.format-a5 .score-table th,.format-livret .score-table th,
.format-a5 .score-table td,.format-livret .score-table td{padding:1.5mm .5mm}
.format-a5 .score-blank,.format-livret .score-blank{font-size:6pt}
.format-a5 .arrival-quote,.format-livret .arrival-quote{font-size:7pt}

.format-a5 .corrections-title,.format-livret .corrections-title{font-size:22pt}
.format-a5 .corrections-lead,.format-livret .corrections-lead{font-size:6pt}
.format-a5 .mini-grids,.format-livret .mini-grids{gap:3mm}
.format-a5 .mini-grid,.format-livret .mini-grid{width:54mm;height:54mm}
.format-a5 .correction-block,.format-livret .correction-block{padding:1.5mm}

.format-a5 .gift-title,.format-livret .gift-title{font-size:32pt}
.format-a5 .gift-message,.format-livret .gift-message{font-size:9pt}
.format-a5 .gift-art,.format-livret .gift-art{width:50mm}
.format-a5 .gift-strip,.format-livret .gift-strip{font-size:5pt}

.format-a5 .notes-title,.format-livret .notes-title{font-size:24pt}
.format-a5 .notes-lead,.format-livret .notes-lead{font-size:6.5pt}
.format-a5 .note-line,.format-livret .note-line{height:7mm}

/* ---------- Livret ---------- */
.sheet{
  width:297mm;
  height:210mm;
  display:flex;
  background:var(--sable);
  overflow:hidden;
  position:relative;
}
.slot{width:148.5mm;height:210mm;overflow:hidden;position:relative}
.slot .page{width:148.5mm;height:210mm;margin:0}

/* ---------- Écran / impression ---------- */
@media screen{
  body{padding:8mm 0}
  .page,.sheet{margin:0 auto 8mm}
}
@media print{
  body{padding:0}
  .page,.sheet{margin:0;break-after:page;page-break-after:always}
  .page:last-child,.sheet:last-child{break-after:auto;page-break-after:auto}
  .slot .page{break-after:auto;page-break-after:auto;margin:0}
}
`;
  }

  function validateFormat(format) {
    if (FORMATS.indexOf(format) === -1) {
      throw new Error(
        'Format inconnu : ' + format + '. Valeurs possibles : ' + FORMATS.join(', ') + '.'
      );
    }
  }

  /**
   * Construit le HTML complet d'un carnet.
   *
   * @param {object} carnet données produites par carnet.js
   * @param {{
   *   format?: 'A4'|'A5'|'A5-livret',
   *   gift?: {recipientName?: string, message?: string},
   *   buyerEmail?: string,
   *   includeCorrections?: boolean
   * }} [options]
   * @returns {string}
   */
  function buildHtml(carnet, options) {
    options = options || {};
    var format = options.format || 'A4';
    validateFormat(format);

    if (!carnet || !carnet.sections || !Array.isArray(carnet.sections)) {
      throw new Error('Carnet invalide : sections manquantes.');
    }

    var pages = [];
    var pageNumber = 1;

    pages.push(Couverture.page(carnet));
    pageNumber++;

    if (carnet.gift && carnet.gift.recipientName) {
      pages.push(CarteCadeau.page(carnet, options, pageNumber));
      pageNumber++;
    }

    pages.push(LigneDepart.page(carnet, options, pageNumber));
    pageNumber++;

    carnet.sections.forEach(function (section) {
      if (section.kind === 'grids') {
        section.grids.forEach(function (grid) {
          pages.push(Grilles.page(carnet, options, section, grid, pageNumber));
          pageNumber++;
        });
      } else if (section.kind === 'theme') {
        var themeSection = {
          title: 'THÈME ' + section.index + ' · ' + section.theme.nom,
          arrows: ''
        };
        section.grids.forEach(function (grid) {
          pages.push(Grilles.page(carnet, options, themeSection, grid, pageNumber));
          pageNumber++;
        });
      } else if (section.kind === 'coloriage') {
        pages.push(Ravitaillement.coloringPage(carnet, options, section, pageNumber));
        pageNumber++;
      } else if (section.kind === 'tirage') {
        pages.push(Ravitaillement.tiragePage(carnet, options, section, pageNumber));
        pageNumber++;
      }
    });

    if (carnet.finalGrid) {
      pages.push(Arrivee.page(carnet, options, pageNumber));
      pageNumber++;
    }

    if (options.includeCorrections !== false) {
      var perPage = format === 'A4' ? 6 : 4;
      var correctionPages = Corrections.pages(carnet, options, pageNumber, perPage);
      correctionPages.forEach(function (correctionPage) {
        pages.push(correctionPage);
        pageNumber++;
      });
    }

    var body;

    if (format === 'A5-livret') {
      var padded = Imposition.padToMultipleOf4(pages.length);
      while (pages.length < padded) {
        pages.push(Notes.page(carnet, options, pageNumber));
        pageNumber++;
      }

      var sides = Imposition.impositionOrder(pages.length);
      body = sides
        .map(function (pair) {
          return (
            '<div class="sheet">' +
            '<div class="slot">' +
            pages[pair[0] - 1] +
            '</div>' +
            '<div class="slot">' +
            pages[pair[1] - 1] +
            '</div>' +
            '</div>'
          );
        })
        .join('\n');
    } else {
      body = pages.join('\n');
    }

    var formatClass =
      format === 'A4' ? 'format-a4' : format === 'A5' ? 'format-a5' : 'format-livret';
    var title = carnet.title + ' — ' + carnet.edition;

    return (
      '<!doctype html>\n' +
      '<html lang="fr">\n' +
      '<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<meta name="generator" content="Case Départ — automation">\n' +
      '<title>' +
      H.escapeHtml(title) +
      '</title>\n' +
      '<style>\n' +
      baseCss(format) +
      '\n</style>\n' +
      '</head>\n' +
      '<body class="' +
      formatClass +
      '">\n' +
      body +
      '\n</body>\n</html>\n'
    );
  }

  return {
    FORMATS: FORMATS,
    buildHtml: buildHtml,
    baseCss: baseCss
  };
});
