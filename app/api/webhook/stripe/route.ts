import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    if (webhookSecret && signature) {
      // Si le secret webhook est configuré, on pourrait valider la signature avec crypto
      // Ou parser l'événement JSON directement
      event = JSON.parse(rawBody);
    } else {
      // Mode direct / dev
      event = JSON.parse(rawBody);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const customerEmail = session?.customer_details?.email || session?.customer_email || session?.metadata?.customer_email;
      const orderNumber = session?.id?.slice(-8).toUpperCase() || 'CD-001';
      const totalAmount = session?.amount_total ? (session.amount_total / 100).toFixed(2).replace('.', ',') + ' €' : '0,00 €';
      const itemsSummary = session?.metadata?.items_summary || 'Carnets Case Départ (PDF)';

      if (customerEmail) {
        console.log(`Paiement Stripe reçu pour ${customerEmail}. Envoi de l'email de confirmation...`);
        await sendOrderConfirmationEmail({
          customerEmail,
          orderNumber,
          totalAmount,
          items: [
            {
              name: itemsSummary,
              format: 'A4 & A5 livret',
              price: totalAmount,
            },
          ],
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 400 });
  }
}

