# design.md — Case Départ

Référence unique du site. Remplace l'ancienne DA « sable / brique ». Toute valeur (couleur, taille, espace, rayon, durée) vient de `styles/tokens.css`. Aucune valeur en dur dans les modules CSS, sauf les points de rupture des media queries (les variables CSS n'y sont pas permises).

## 1. Intention

Minimalisme industriel et éditorial. Beaucoup de blanc, structure visible, rien de superflu.
- Contraste d'échelle extrême : titres énormes en Anton, texte courant petit et sobre.
- Structure en filets de 1px. La grille de sudoku est le système visuel.
- Ton décalé, drôle, complice. Jamais criard.

Interdits : dégradés, ombres portées, coins arrondis au-delà de `--radius-s`, illustrations « SaaS », emojis décoratifs.

## 2. Couleurs

### Marque
| Token | Hex | Usage |
|---|---|---|
| `--blanc` | `#FFFFFF` | Fond de page par défaut |
| `--noir` | `#161616` | Texte courant |
| `--nuit` | `#041735` | Texte fort, boutons, sections pleines |
| `--dore` | `#E8D48A` | Étiquettes, survols, surlignage (1 par section) |
| `--gris` | `#EFEFEF` | Fonds de sections, cartes |
| `--gris-texte` | `#6B6B6B` | Texte secondaire (thème sous un nom, métadonnées) |

### Contrastes (WCAG 2.1)
| Texte / fond | Ratio | |
|---|---|---|
| Noir / Blanc | 18:1 | AA |
| Nuit / Blanc | 17,9:1 | AA |
| Blanc / Nuit | 17,9:1 | AA |
| Nuit / Gris | 14,7:1 | AA |
| Nuit / Doré | 12,1:1 | AA |
| Noir / Doré | 11,4:1 | AA |
| Doré / Nuit | 12,1:1 | AA |
| Gris-texte / Blanc | 5,3:1 | AA |
| Blanc / Doré | 1,5:1 | **interdit** |

### Couleurs de thème
| Thème | Token | Hex | Texte posé dessus |
|---|---|---|---|
| Halloween | `--theme-halloween` | `#E8631C` | `--noir` (5,4:1) |
| Día de los Muertos | `--theme-muertos` | `#6A2C8A` | `--blanc` (9:1) |
| Noël | `--theme-noel` | `#1F6B45` | `--blanc` (6,5:1) |
| Saint-Valentin | `--theme-valentin` | `#A3134F` | `--blanc` (7,2:1) |
| Pâques | `--theme-paques` | `#9BD17E` | `--noir` (9:1) |
| Multi-thèmes / autres | `--theme-multi` | `= --gris` | `--nuit` |

Chaque thème a un couple `--theme-x` / `--theme-x-ink`. Règles :
- Une couleur de thème n'apparaît **que** sur la carte ou la page de ce thème. Jamais dans la nav, le footer ou une section générique.
- Elle teinte le visuel de la carte, pas le bloc texte sous le visuel.
- Noël n'est pas en bleu (trop proche de `--nuit`), Pâques n'est pas en jaune (trop proche de `--dore`).

## 3. Typographie

| Rôle | Police | Graisse |
|---|---|---|
| Titres, wordmark, gros chiffres | Anton | 400 (graisse unique), capitales, interlignage 1 |
| Texte, libellés, prix | BDO Grotesk | 400–500, chiffres tabulaires pour prix et chrono |

Échelle (fluide, `clamp`) : `--fs-display` (wordmark, hero), `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-body` 16px, `--fs-small` 14px, `--fs-label` 12px.

Libellés : `--fs-label`, capitales, `--tracking-label`. Étiquettes de section entre crochets : `[ À la une ]`.

## 4. Espacements, rayons, mouvement

- Espaces : `--space-1` (4px) à `--space-10` (160px), base 8px.
- Gouttières : `--gutter` = 16px mobile, 24px tablette, 48px à 1440px.
- Conteneur : `--container` 1440px.
- Rayons : `--radius-0` partout, `--radius-s` (2px) pour champs et pastilles.
- Filets : `--line` 1px, `--line-strong` 2px (repère 3×3).
- Durées : `--dur-fast` survols, `--dur-base` apparitions, `--dur-split` lettres, `--dur-curtain` rideaux.
- Courbes : `--ease` (apparitions), `--ease-out` (lettres, rideaux).

### Animations (inspirées de Dex Harlan)
| Effet | Où | Composant |
|---|---|---|
| Preloader : compteur 000 → 100 sur fond nuit, puis le rideau monte | 1er chargement de la session | `Preloader` |
| Lettres qui montent une à une derrière un masque | Titre du hero (au chargement), titres de section et wordmark (au scroll) | `Split` |
| Texte qui s'allume mot à mot avec le scroll (0,2 → 1) | Manifeste de l'accueil | `ScrollText` |
| Rideau vertical sur le visuel + grille qui se resserre | Cartes produit | `ProductCard` |
| Fondu + 8px en cascade | Blocs `data-reveal` | `Reveal` |
| Lettre qui s'étire au survol | Wordmark du footer | `Footer` |

Les animations ne tournent que si `html.js-anim` est posée (script en `<head>`). Sans JS ou en `prefers-reduced-motion`, tout est visible tout de suite, sans preloader. Le marquee s'arrête aussi.

Points de rupture : 768px (tablette), 1440px (grand écran). Mobile d'abord.

## 5. Motif grille

Grille de sudoku : filets 1px, repère 3×3 en 2px. Usages autorisés uniquement :
1. Hero (fond en grille).
2. Visuel des cartes produit.
3. Séparateurs de sections.
4. Grille de jeu.

## 6. Composants

| Composant | Fichier | Notes |
|---|---|---|
| Header + nav numérotée | `components/Header` | `01 Accueil · 02 Carnets · 03 Jouer · 04 Pass Podium`, panier à droite |
| Bouton | `components/Button` | `primary` (nuit plein), `secondary` (contour), `dark` (blanc sur nuit) |
| Étiquette | `components/Tag` | `[ Libellé ]`, capitales |
| Carte produit | `components/ProductCard` | visuel teinté, nom + prix sur une ligne, thème en gris |
| Onglets | `components/Tabs` | menu façon carte de café, prix alignés à droite |
| Accordéon | `components/Accordion` | FAQ, `+` / `−` |
| Marquee | `components/Bandeau` | boucle des thèmes, s'arrête au survol et en mouvement réduit |
| Footer | `components/Footer` | infos pratiques en colonnes + wordmark géant |
| Apparition | `components/Reveal` | attribut `data-reveal`, fondu + 8px |

Focus visible : contour 2px `--nuit` décalé de 2px, sur fond nuit contour `--dore`.

## 7. Ton éditorial

Tutoiement. Phrases courtes. Humour de comptoir, jamais moqueur.
- Les niveaux sont des allures de course : Échauffement › / Sprint ›› / Marathon ›››.
- Les pauses coloriage et « tirage astro » sont des « ravitaillements ».
- Les faux avis sont clairement signalés comme fictifs.
- Exemples : « Remplis les cases, vide ta tête. » · « Le 9 arrive toujours en dernier. »
