import { generateOrderConfirmationHtml, EmailOrderDetails } from './emailTemplates';

export async function sendOrderConfirmationEmail(details: EmailOrderDetails): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Case Départ <contact@viturna.fr>';

  const htmlContent = generateOrderConfirmationHtml(details);

  if (!apiKey) {
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH SIMULÉ - RESEND_API_KEY non fournie]`);
    console.log(`Destinataire : ${details.customerEmail}`);
    console.log(`Commande     : #${details.orderNumber}`);
    console.log(`Articles     : ${details.items.map((i) => i.name).join(', ')}`);
    console.log(`Montant      : ${details.totalAmount}`);
    console.log('---------------------------------------------------------');
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: details.customerEmail,
        subject: `■ Commande #${details.orderNumber} confirmée · Tes carnets Case Départ sont prêts !`,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Erreur API Resend:', data);
      return { success: false, error: data.message || 'Erreur lors de l’envoi' };
    }

    console.log('Email envoyé avec succès via Resend, id:', data.id);
    return { success: true };
  } catch (err: unknown) {
    console.error('Erreur réseau lors de l’envoi de l’email:', err);
    return { success: false, error: 'Erreur réseau' };
  }
}

