export interface OrderEmailItem {
  name: string;
  format: string;
  isGift?: boolean;
  price: string;
}

export interface EmailOrderDetails {
  customerEmail: string;
  customerName?: string;
  items: OrderEmailItem[];
  totalAmount: string;
  orderNumber: string;
  downloadUrl?: string;
}

export function generateOrderConfirmationHtml(details: EmailOrderDetails): string {
  const { customerEmail, items, totalAmount, orderNumber, downloadUrl } = details;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #315A54; font-family: 'Inter', sans-serif; font-size: 15px; color: #315A54;">
        <strong>${item.name}</strong>
        <div style="font-size: 12px; font-family: 'IBM Plex Mono', monospace; color: #315A54; opacity: 0.8; margin-top: 4px;">
          Format : ${item.format} ${item.isGift ? '· Version à offrir' : ''}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #315A54; font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 600; color: #315A54; text-align: right; white-space: nowrap;">
        ${item.price}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Tes carnets Case Départ sont prêts !</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #EFDEC2; font-family: 'Inter', -apple-system, sans-serif; color: #315A54;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #EFDEC2; border: 2px solid #315A54;">
    <!-- HEADER -->
    <tr>
      <td style="padding: 24px 32px; background-color: #315A54; text-align: left;">
        <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #FEC2DC; text-transform: uppercase; display: block; margin-bottom: 4px;">
          ■ CASE DÉPART · COMMANDE #${orderNumber}
        </span>
        <h1 style="margin: 0; font-family: 'Archivo', sans-serif; font-weight: 900; font-size: 26px; color: #EFDEC2; text-transform: uppercase; letter-spacing: -0.02em;">
          LIGNE D'ARRIVÉE FRANCHIE !
        </h1>
      </td>
    </tr>

    <!-- MESSAGE INTRO -->
    <tr>
      <td style="padding: 32px 32px 16px;">
        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #315A54;">
          Salut à toi !
        </p>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #315A54;">
          Ton paiement est validé. Tes carnets de Sudoku en PDF haute résolution (formats A4 à plat et A5 livret recto-verso) sont immédiatement disponibles ci-dessous.
        </p>
      </td>
    </tr>

    <!-- BOUTON TÉLÉCHARGEMENT -->
    <tr>
      <td style="padding: 0 32px 32px; text-align: center;">
        <a href="${downloadUrl || 'https://case-depart.vercel.app'}" style="display: block; background-color: #9F1014; color: #EFDEC2; text-decoration: none; padding: 18px 24px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 16px; text-align: center; text-transform: uppercase; border: 1px solid #315A54;">
          TÉLÉCHARGER MES CARNETS PDF →
        </a>
        <span style="display: block; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #315A54; margin-top: 10px; opacity: 0.8;">
          Lien permanent valable sans limite de temps.
        </span>
      </td>
    </tr>

    <!-- RECAPITULATIF DE COMMANDE -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #315A54; margin-bottom: 8px;">
          RÉCAPITULATIF DE TA COMMANDE
        </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #315A54; background: #EFDEC2;">
          ${itemsHtml}
          <tr>
            <td style="padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #315A54; background: #FEC2DC;">
              TOTAL RÉGLÉ
            </td>
            <td style="padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 16px; font-weight: 600; text-align: right; color: #315A54; background: #FEC2DC;">
              ${totalAmount}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONSEILS D'IMPRESSION -->
    <tr>
      <td style="padding: 0 32px 32px;">
        <div style="border-left: 3px solid #9F1014; padding: 12px 16px; background-color: rgba(49, 90, 84, 0.05);">
          <div style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9F1014; margin-bottom: 4px;">
            ■ CONSEIL D'IMPRESSION
          </div>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #315A54;">
            • <strong>Format A4</strong> : Idéal pour poser à plat sur la table.<br>
            • <strong>Format A5 Livret</strong> : Coche "Livret / Recto-verso reliure petit côté" dans les options de ton imprimante, plie en deux, et emporte-le partout.
          </p>
        </div>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding: 24px 32px; background-color: #315A54; text-align: center;">
        <p style="margin: 0 0 6px; font-family: 'Archivo', sans-serif; font-size: 16px; color: #EFDEC2; text-transform: uppercase;">
          CASE DÉPART
        </p>
        <p style="margin: 0; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #EFDEC2; opacity: 0.7;">
          Échauffement · Sprint · Marathon · Fin de grille<br>
          Besoin d'aide ? Écris-nous directement à <a href="mailto:contact@viturna.fr" style="color: #FEC2DC; text-decoration: underline;">contact@viturna.fr</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

