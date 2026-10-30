// Relie un produit du site (data/products.json) à un carnet généré et
// validé côté automation (table Supabase `carnets`). Seuls les slugs listés
// ici ont un vrai PDF prêt à livrer ; les autres produits du catalogue
// n'ont pas encore de carnet généré par le workflow n8n A.
const CARNET_SLUG_MAP: Record<string, string> = {
  'carnet-noel': 'noel-edition-2026',
  'carnet-halloween': 'halloween-edition-2026',
  'tour-de-l-annee': 'multi-theme-tour-annee-edition-2026',
};

function normalizeFormat(format: string): 'A4' | 'A5-livret' {
  return format.toLowerCase().includes('livret') ? 'A5-livret' : 'A4';
}

export interface DeliveryItem {
  slug: string;
  format: string;
  gift?: boolean;
  recipientName?: string | null;
}

export async function getSignedDownloadUrl(item: DeliveryItem): Promise<string | null> {
  const carnetSlug = CARNET_SLUG_MAP[item.slug];
  if (!carnetSlug) return null;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const format = normalizeFormat(item.format);

  const carnetRes = await fetch(
    `${supabaseUrl}/rest/v1/carnets?slug=eq.${carnetSlug}&statut=eq.pret&select=pdf_paths`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (!carnetRes.ok) return null;
  const rows = await carnetRes.json();
  const path = rows?.[0]?.pdf_paths?.[format];
  if (!path) return null;

  const signRes = await fetch(`${supabaseUrl}/storage/v1/object/sign/pdfs/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 604800 }),
  });
  if (!signRes.ok) return null;
  const { signedURL } = await signRes.json();
  if (!signedURL) return null;

  return `${supabaseUrl}/storage/v1${signedURL}`;
}

/** Première commande livrable d'un panier (plusieurs articles non géré). */
export async function resolveFirstDownloadUrl(items: DeliveryItem[]): Promise<string | null> {
  for (const item of items) {
    const url = await getSignedDownloadUrl(item);
    if (url) return url;
  }
  return null;
}
