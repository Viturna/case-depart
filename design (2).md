# DESIGN.md — Case Départ

> Référence obligatoire pour tout le site e-commerce Case Départ (carnets de sudoku en PDF + jeu en ligne chronométré).
> Applique strictement les codes hex, polices, filets et règles ci-dessous. N'invente aucune couleur, police ou effet absent de ce document. En cas de conflit avec une autre consigne, ce document prime.
> Cette version **remplace** l'ancienne direction pastel (Fredoka / Nunito / #FFF8EE / #1F2340 / #FF8A73).

---

## 1. Intention

**Minimalisme industriel.** Esthétique d'un coffee shop au décor brut : atelier, béton, métal, étiquettes techniques, beaucoup de vide, structure visible.

Le site se lit comme une **grille de sudoku** : des filets fins découpent la page en cases, chaque section est numérotée comme une pièce d'atelier, et le chiffre / le chrono sont traités comme des données techniques.

Trois mots : **brut, structuré, complice.**

---

## 2. Couleurs — palette stricte

Quatre couleurs, **aucune autre**. Pas de teintes intermédiaires, pas de transparence pour fabriquer une nouvelle couleur.

| Token | Hex | Nom | Usage |
|---|---|---|---|
| `--sable` | `#EFDEC2` | Sable | Fond principal de toutes les pages. Texte sur fond vert ou rouge. |
| `--sapin` | `#315A54` | Vert sapin | Texte, filets, grilles, header, footer, sections sombres. |
| `--brique` | `#9F1014` | Rouge brique | Boutons d'achat, prix barrés / promo, erreurs dans le jeu, accents rares. |
| `--rose` | `#FEC2DC` | Rose poudré | Badges ronds, étiquette « Nouveau », survols, **un seul surlignage par section**. |

### Règles d'usage
- Fond de page : toujours `--sable`.
- Texte sur `--sapin` ou `--brique` : toujours `--sable`.
- Texte sur `--rose` : toujours `--sapin`.
- `--brique` est réservé à l'**achat** et à l'**alerte**. Jamais en grande surface décorative.
- `--rose` : **un seul surlignage par section** (un mot dans un titre, une ligne de tableau, une carte mise en avant). Exceptions : survols et badges.
- **Ne jamais** poser `--brique` sur `--sapin` (contraste 1,06:1). Sur une section verte, un prix promo se place dans un encart `--sable`.

### Contrastes vérifiés (WCAG)
| Texte / fond | Ratio | |
|---|---|---|
| Sapin / Sable | 5,84:1 | AA ✓ |
| Brique / Sable | 6,21:1 | AA ✓ |
| Sapin / Rose | 5,13:1 | AA ✓ |
| Brique / Rose | 5,46:1 | AA ✓ |
| Brique / Sapin | 1,06:1 | ✗ interdit |

```css
:root{
  --sable:#EFDEC2;
  --sapin:#315A54;
  --brique:#9F1014;
  --rose:#FEC2DC;
}
```

---

## 3. Typographie

Trois familles, trois rôles. Chargement Google Fonts :

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,700;125,800;125,900&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

| Rôle | Police | Réglages |
|---|---|---|
| **Titres** | Archivo Expanded (`font-stretch:125%`), à défaut Archivo Black | 900, CAPITALES, interlignage 0,9, interlettrage −0,015em |
| **Texte courant** | Inter | 400 (600 pour un gras ponctuel), interlignage 1,55 |
| **Étiquettes, prix, numéros, métadonnées, boutons** | IBM Plex Mono | 500 (600 pour prix et boutons), CAPITALES, interlettrage 0,14em |

### Échelle (desktop 1440)
| Élément | Taille | Police |
|---|---|---|
| Hero H1 | `clamp(52px, 7.4vw, 112px)` | Archivo 900 |
| H2 de section | `clamp(40px, 5.4vw, 80px)` | Archivo 900 |
| H3 carte / niveau | 26–40 px | Archivo 900 |
| Titre de ligne / FAQ | 18–20 px | Archivo 900 |
| Chiffre-clé (spec) | 48 px | Archivo 900 |
| Chrono géant | `clamp(72px, 10vw, 152px)` | IBM Plex Mono 600 |
| Texte d'intro | 18–19 px | Inter 400 |
| Texte courant | 16 px | Inter 400 |
| Texte de carte | 14–15 px | Inter 400 |
| Étiquette mono | 12 px (10–11 px pour légendes) | Plex Mono 500 |
| Bouton | 12–13 px | Plex Mono 600 |
| Prix | 16 px (carte), 52–72 px (fiche / bundle) | Plex Mono 600 / Archivo 900 |

```css
.h{font-family:'Archivo',sans-serif;font-stretch:125%;font-weight:900;text-transform:uppercase;line-height:.9;letter-spacing:-.015em}
.m{font-family:'IBM Plex Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:.14em;font-size:12px}
body{font-family:'Inter',sans-serif;font-weight:400;line-height:1.55;color:#315A54;background:#EFDEC2}
```

---

## 4. Grille, espacements, structure

- **Largeur de référence :** 1440 px, desktop d'abord. Conteneur `max-width:1440px`, centré.
- **Structure visible :** le conteneur porte un filet 1 px `--sapin` à gauche et à droite ; chaque section se ferme par un filet bas ; les colonnes sont séparées par des filets verticaux. La page entière ressemble à une grille.
- **Marges internes :** 48 px horizontal (40 px dans les colonnes étroites, 32 px dans les cartes).
- **Unité :** 8 px. Paliers courants : 8 / 12 / 16 / 24 / 32 / 40 / 48 / 56 / 64 / 72.
- **Respiration :** titre de section avec 64 px au-dessus, 48 px en dessous. Beaucoup de vide : on ne remplit pas une case pour la remplir.
- **Colonnes :** cartes produit 4 par ligne (`minmax(260–300px, 1fr)`), niveaux / citations / étapes 3 par ligne, hero en 2 colonnes (texte | visuel).
- **Responsive :** flex-wrap et `auto-fit` ; les colonnes s'empilent sous ~600 px, les titres utilisent `clamp()`.

---

## 5. Formes et filets

- **Rayon 0 partout.** Seule exception : les **badges ronds** (`border-radius:50%`).
- **Filets 1 px `--sapin`** pour séparer et encadrer. 2 px uniquement pour les séparations de blocs 3×3 de la grille de sudoku et son contour.
- **Aucun dégradé. Aucune ombre** (ni portée, ni décalée, ni intérieure). **Aucun flou.**
- Rotation légère autorisée (−5° à +10°) pour les badges et les carnets posés, comme des objets sur un plan de travail.
- Pointillés 1 px uniquement pour marquer un emplacement à remplir (illustration à venir).

---

## 6. Motif signature : la grille 3×3

Une grille 3×3 en filets fins, utilisée :
- comme **logo** (carré 34 px, case haut-gauche pleine = la « case départ ») ;
- en **fond des visuels** hero et en-têtes (filets `--sable` sur `--sapin`, la case centrale peut être pleine) ;
- en **mini-grille** sur chaque couverture de carnet ;
- en **icône** « noir et blanc OK ».

---

## 7. Système de sections

Chaque section commence par une **bande d'étiquette** en mono :

```
01 / Choisis ton niveau ................................ 3 allures
```
- Gauche : numéro sur 2 chiffres + « / » + nom de section.
- Droite : métadonnée courte (référence, nombre d'éléments, prix…).
- Padding 14 × 48 px, filet bas 1 px.
- Numérotation 00 (hero / ligne de départ) → 10. Sur une page produit, la numérotation reprend à 01.

Sections sombres (`--sapin`, texte `--sable`, filets `--sable`) : mode compétition, bundle La Collection, mur de couvertures, footer, header. Une à deux par page maximum en plus du header et du footer.

---

## 8. Composants

### Bandeau défilant
Fond `--sapin`, hauteur 40 px, texte mono 11 px `--sable`, items séparés par « / ». Défilement linéaire lent (45 s).

### Header
Fond `--sapin`, sticky. Logo grille 3×3 + « CASE DÉPART » (Archivo 20 px). Navigation mono 12 px : Carnets · Carnet Noël · Jeu en ligne · Pass Podium ; à droite Compte · Panier [0]. Lien survolé : fond `--rose`, texte `--sapin`. Page active : fond `--sable`, texte `--sapin`.

### Boutons
| Type | Style | Usage |
|---|---|---|
| **Primaire** | Plein `--brique`, texte `--sable`, mono 600 capitales, hauteur 52 px (44 px en carte, 56 px fiche produit) | Achat, ajout panier, action principale |
| **Secondaire** | Transparent, filet 1 px `--sapin`, texte `--sapin` | Navigation, alternative |
| **Sur fond sombre** | Transparent, filet 1 px `--sable`, texte `--sable` | Action secondaire en section verte |

Survol de tous les boutons : fond `--rose`, texte `--sapin`. Libellés courts et directs : « JE LE VEUX », « AJOUTER », « PRENDRE LE DÉPART », « JE PRENDS TOUT ». Flèche « → » autorisée.

### Chips de filtre
Hauteur 40 px, filet 1 px, mono 11 px. Inactif : fond sable. Actif : fond `--sapin`, texte `--sable`. Survol : rose.

### Badge rond
Cercle `--rose`, texte mono 600 `--sapin`, 84–128 px, légèrement incliné. Contenus : « NOUVEAU », « PRODUIT PHARE », « ÉCONOMISE 18,88 € », « DÉFI CHAQUE LUNDI ». Un seul badge par carte.

### Couverture de carnet (composant)
Ratio 4:5, fond `--sable` (ou `--sapin` en variante), filet 1 px. De haut en bas : bandeau mono « CASE DÉPART — N°02 », mini-grille 3×3 avec quelques chiffres, nom du thème en Archivo 900, sous-titre mono séparé par un filet. Toutes les tailles internes en unités de conteneur (`cqw`).

### Carte produit
Visuel (couverture sur fond sable ou sapin, padding 32 px) | filet | infos : ligne mono (type · niveaux › ›› ›››), titre Archivo 24 px, description 14 px, pied avec prix mono + bouton. Survol : zone infos en `--rose`. Produit à venir : prix remplacé par la date, bouton secondaire « ME PRÉVENIR ».

### Prix
- Standard : mono 600, `--sapin`, « 7,90 € » (virgule, espace insécable avant €).
- Promo : ancien prix mono `--brique` barré + nouveau prix Archivo 900 `--brique` sur fond sable.

### Bloc de spécifications
Grille de cellules séparées par des filets : étiquette mono 10 px + valeur mono 14–15 px 600 (ex. PAGES ≈ 46 / GRILLES 30 + 1 / IMPRESSION N&B OK).

### Liste / tableau technique
Lignes séparées par des filets, colonne de gauche en mono (P. 03—12), titre Archivo 18 px, description Inter. Une ligne maximum surlignée en rose.

### Accordéon FAQ
Ligne cliquable pleine largeur : « Q.01 » mono + question Archivo 20 px + « + / − ». Question ouverte : fond rose, réponse en Inter.

### Formulaires
Champ hauteur 48–56 px, filet 1 px `--sapin`, fond sable, rayon 0, label mono au-dessus. Cases à cocher couleur `--sapin`.

### Footer
Fond `--sapin`. 4 colonnes séparées par des filets `--sable`, puis le mot « CASE DÉPART » en très grand (jusqu'à 154 px), puis une ligne mono 10 px : © 2026 Case Départ · Échauffement · Sprint · Marathon · Fin de grille.

---

## 9. Jeu en ligne

Mise en page en 3 colonnes : **infos course** | **grille 9×9** | **chrono + classement**.

| État de case | Style |
|---|---|
| Case donnée | Plex Mono 600, `--sapin` |
| Case saisie | Plex Mono 400, `--sapin` |
| Case active | Fond `--sapin`, texte `--sable` |
| Ligne / colonne / bloc de la case active | Fond `--rose` |
| Même chiffre ailleurs | Contour intérieur 2 px `--sapin` |
| Conflit | Texte `--brique` |
| Notes | Mini-grille 3×3 mono 10 px dans la case |

- Contour de grille 2 px, séparations de blocs 2 px, cases 1 px.
- Pavé numérique 1–9 en bande filetée, puis 3 boutons secondaires : NOTES · GOMME · PAUSE.
- Chrono géant en Plex Mono 600 sur bloc `--sapin`, avec score et temps à battre.
- Classement : lignes mono filetées, « TOI » surligné en rose. Mini-podium 2 · 1 · 3 (1 plein, 2 et 3 en filet).
- Arrivée : bandeau rose pleine largeur « BRAVO. 08:42 CHRONO. » + « GRILLE SUIVANTE ».

---

## 10. Photographie

- Sujet : **carnets imprimés posés** sur béton, acier brossé ou bois brut.
- Lumière naturelle, latérale, ombres douces réelles (dans la photo uniquement, jamais en CSS).
- Légère désaturation ; pas de filtre coloré, pas de flou d'arrière-plan exagéré.
- Cadrages : à plat (vue du dessus) ou 3/4, beaucoup d'espace autour de l'objet.
- Chaque visuel reçoit une **légende technique** en mono : « FIG. 01 — CARNETS A4 IMPRIMÉS, POSÉS SUR BÉTON BRUT ».
- Tant que les photos n'existent pas : couverture dessinée sur fond `--sapin` + mention « [PHOTO À SHOOTER] ».

---

## 11. Mouvement

- Bandeau défilant et mur de couvertures : translation linéaire lente.
- Survols : changement de fond instantané vers `--rose` (pas d'ombre, pas de mise à l'échelle).
- Badges et carnets : rotation fixe légère, pas d'animation de rotation continue.
- Aucun parallax flou, aucun fondu coloré.
- `@media (prefers-reduced-motion: reduce)` : toutes les animations coupées.

---

## 12. Ton éditorial

- **Tutoiement**, phrases courtes, un peu d'humour sur la course.
- Vocabulaire de marque :

| Terme | Sens |
|---|---|
| **Échauffement ›** | Facile |
| **Sprint ››** | Moyen |
| **Marathon ›››** | Difficile |
| **Ravitaillement** | Page de pause (coloriage ou tirage) entre deux niveaux |
| **Ligne de départ** | Page des règles |
| **Ligne d'arrivée** | Grille finale + récap des scores |
| **Podium / Pass Podium** | Classements et abonnement en ligne |

- Exemples : « Tu t'étires, tu remplis, tu souris. » · « Le crayon chauffe. » · « Pas de raccourci. Juste toi, 81 cases et ce qu'il reste de ta dignité. » · « Faux départ. Aucun carnet ne correspond. »
- Fausses citations : **uniquement des personnages fictifs** (le 9 de la case I9, la gomme, le chrono), jamais de vraies personnes. Mention « Citations 100 % fictives ».
- **Pas d'emoji.** Symboles autorisés : › / → — · ■ □.
- Pas de faux avis : tant qu'il n'y en a pas de vrais, emplacements « [Avis client vérifié à intégrer] ».

---

## 13. Pages

| Page | Contenu clé |
|---|---|
| **Accueil** | Bandeau · header · hero « LE SUDOKU PREND UN NOUVEAU DÉPART » · specs · 01 Niveaux · 02 Thèmes (carrousel 3 visibles) · 03 Carnets + La Collection · 04 Anatomie d'un carnet · 05 Mode compétition · 06 Citations · 07 Avantages · 08 Mur · 09 Starter offert · 10 FAQ · footer |
| **Catalogue** | En-tête · filtres sticky (Thème, Niveau, Tri) · grille 4 colonnes · La Collection · quiz « Trouve ton niveau » |
| **Fiche produit** | Galerie de pages · prix · A4 / A5 livret · option « Version à offrir » +2 € · specs · Parcours en 9 étapes · Feuilletage · Mode en ligne · Avis · Upsell · Associés · FAQ |
| **Jeu en ligne** | Infos course · grille jouable · chrono + podium · teaser Pass Podium |
| **Pass Podium** | Hero podium · 2 formules (3,99 €/mois · 29 €/an) · Comment ça marche · Défi + classement · Comparatif Gratuit / Pass · FAQ |

### Offre et prix
| Offre | Prix |
|---|---|
| Le Starter | 0 € contre e-mail |
| L'Étape | 2,90 € |
| Carnet thématique | 7,90 € (9,90 € en version à offrir) |
| Tour de l'année | 9,90 € |
| La Collection | 34,90 € au lieu de 49,40 € |
| Pass Podium | 3,99 €/mois ou 29 €/an (économie 18,88 €) |

---

## 14. À faire / À éviter

**À faire**
- Fond sable partout, structure en filets visible.
- Numéroter chaque section en mono.
- Titres immenses, serrés, en capitales.
- Laisser du vide.
- Réserver le rouge à l'achat.
- Un seul surlignage rose par section.
- Boutons rectangulaires, libellés courts en mono.

**À éviter**
- Toute couleur hors des 4 tokens (y compris blanc pur et noir pur).
- Coins arrondis (sauf badges ronds).
- Ombres, dégradés, flous, effets de verre.
- Rouge sur vert.
- Plusieurs surlignages roses dans une même section.
- Emojis, illustrations pastel, typographies rondes (Fredoka, Nunito : abandonnées).
- Faux avis ou citations attribuées à de vraies personnes.

---

## 15. Rappel court à coller en tête de chaque prompt d'écran

> Respecte strictement le DESIGN.md Case Départ : fond #EFDEC2, texte et filets #315A54, boutons d'achat #9F1014, badges et survols #FEC2DC, aucune autre couleur. Titres Archivo Expanded 900 en capitales, texte Inter 400, étiquettes et prix IBM Plex Mono en capitales espacées. Rayon 0 sauf badges ronds, filets 1 px visibles, aucune ombre, aucun dégradé, aucun flou. Sections numérotées 01 / 02 / 03. Tutoiement.
