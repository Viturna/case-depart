import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Anti-spam en mémoire vive pour éviter les renvois multiples si rafraîchissement
const sentSessions = new Set<string>();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Clé Stripe non configurée' }, { status: 500 });
    }

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const session = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: session.error?.message || 'Erreur Stripe' }, { status: res.status });
    }

    if (session.payment_status === 'paid') {
      const customerEmail = session.customer_details?.email || session.customer_email || session.metadata?.customer_email;
      const orderNumber = session.id.slice(-8).toUpperCase();
      const totalAmount = session.amount_total ? (session.amount_total / 100).toFixed(2).replace('.', ',') + ' €' : '0,00 €';
      const itemsSummary = session.metadata?.items_summary || 'Carnets Case Départ (PDF)';

      if (customerEmail) {
        // Envoi de l'e-mail avec template complet
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

      return NextResponse.json({
        paid: true,
        orderNumber,
        customerEmail,
        totalAmount,
      });
    }

    return NextResponse.json({ paid: false, status: session.payment_status });
  } catch (err) {
    console.error('Confirmation check error:', err);
    return NextResponse.json({ error: 'Erreur lors de la confirmation' }, { status: 500 });
  }
}
