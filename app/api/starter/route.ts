import { NextResponse } from 'next/server';
import { getLatestStarterDownloadUrl, recordStarterLead } from '@/lib/carnetDelivery';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email, consentement } = (await req.json()) as { email?: string; consentement?: boolean };
    const trimmedEmail = String(email || '').trim();

    if (!EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json({ error: 'E-mail invalide' }, { status: 400 });
    }
    if (!consentement) {
      return NextResponse.json({ error: 'Consentement requis' }, { status: 400 });
    }

    await recordStarterLead({ email: trimmedEmail, consentement: true, theme: 'noel', source: 'site' });

    const downloadUrl = await getLatestStarterDownloadUrl();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'Case Départ <contact@viturna.fr>';

    if (apiKey && downloadUrl) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: trimmedEmail,
          subject: '🎁 Ton Starter Case Départ est là !',
          html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#161616;max-width:480px;margin:0 auto;padding:32px 24px;"><p style="font-family:'Arial Black',Impact,Arial,sans-serif;font-size:24px;font-weight:900;letter-spacing:-0.01em;margin:0 0 20px;">Ton Starter est là</p><p style="font-size:16px;line-height:1.5;">Ton Starter Case Départ est prêt. C'est un mini-carnet de 3 grilles pour tester le concept avant de plonger dans le grand bain !</p><p style="margin:28px 0;"><a href="${downloadUrl}" style="display:inline-block;background:#041735;color:#ffffff;padding:14px 28px;border-radius:2px;text-decoration:none;font-weight:700;letter-spacing:0.02em;">Télécharger le Starter</a></p><p style="font-size:16px;line-height:1.5;">Le lien est valable <strong>7 jours</strong>.</p><p style="font-size:16px;">Bonne course ! 🏁</p><p style="font-size:13px;color:#6B6B6B;margin-top:32px;border-top:1px solid #EFEFEF;padding-top:16px;">Case Départ · Sudokus modernes</p></div>`,
        }),
      });
    }

    return NextResponse.json({ ok: true, delivered: Boolean(downloadUrl) });
  } catch (err) {
    console.error('Starter lead error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
