import { NextResponse } from 'next/server';

interface CartItem {
  id: string;
  title: string;
  format: 'A4' | 'A5';
  gift: boolean;
  price: number;
}

export async function POST(req: Request) {
  try {
    const { items, email } = (await req.json()) as { items: CartItem[]; email?: string };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Clé Stripe non configurée' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Build URL-encoded form body for Stripe API
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/?canceled=true`);
    if (email) {
      params.append('customer_email', email);
    }

    // Pass metadata to identify the items in webhooks or verification
    params.append('metadata[items_summary]', items.map((i) => `${i.title} (${i.format})`).join(', ').slice(0, 490));
    params.append('metadata[customer_email]', email || '');

    items.forEach((item, index) => {
      const unitAmountInCents = Math.round(item.price * 100);
      const name = `${item.title} (Format ${item.format})${item.gift ? ' + Emballage Cadeau' : ''}`;

      params.append(`line_items[${index}][price_data][currency]`, 'eur');
      params.append(`line_items[${index}][price_data][unit_amount]`, unitAmountInCents.toString());
      params.append(`line_items[${index}][price_data][product_data][name]`, name);
      params.append(`line_items[${index}][quantity]`, '1');
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Erreur lors de la création de la session Stripe' },
        { status: stripeRes.status }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

