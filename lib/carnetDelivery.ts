// Relie un produit du site (data/products.json) à un carnet généré et
// validé côté automation (table Supabase `carnets`). Seuls les slugs listés
// ici ont un vrai PDF prêt à livrer ; les autres produits du catalogue
// n'ont pas encore de carnet généré par le workflow n8n A.
const CARNET_SLUG_MAP: Record<string, string> = {
  'carnet-noel': 'noel-edition-2026',
  'carnet-halloween': 'halloween-edition-2026',
  'tour-de-l-annee': 'multi-theme-tour-annee-edition-2026',
};

const CARNET_LABELS: Record<string, string> = {
  'noel-edition-2026': 'Carnet de Noël',
  'halloween-edition-2026': 'Carnet d\'Halloween',
  'multi-theme-tour-annee-edition-2026': 'Tour de l\'année',
  'multi-theme-etape-sprint-edition-2026': 'L\'Étape Sprint',
};

function normalizeFormat(format: string): 'A4' | 'A5-livret' {
  return format.toLowerCase().includes('livret') ? 'A5-livret' : 'A4';
}

async function signPdfPath(pdfPath: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const signRes = await fetch(`${supabaseUrl}/storage/v1/object/sign/pdfs/${pdfPath}`, {
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
  return signedURL ? `${supabaseUrl}/storage/v1${signedURL}` : null;
}

/** Dernier carnet Starter validé (statut pret), pour la capture de lead gratuite. */
export async function getLatestStarterDownloadUrl(): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/carnets?type=eq.starter&statut=eq.pret&order=created_at.desc&limit=1&select=pdf_paths`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  const pdfPath = rows?.[0]?.pdf_paths?.A4;
  return pdfPath ? signPdfPath(pdfPath) : null;
}

export interface StarterLeadInput {
  email: string;
  consentement: boolean;
  theme?: string;
  source?: string;
}

/** Enregistre le lead Starter (idempotent sur l'e-mail, comme le workflow n8n C). */
export async function recordStarterLead(input: StarterLeadInput): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  await fetch(`${supabaseUrl}/rest/v1/leads_starter`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      email: input.email,
      consentement: input.consentement,
      theme: input.theme || null,
      source: input.source || 'site',
    }),
  });
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  carnetLabel: string;
  format: string;
  gift: boolean;
  montantCents: number | null;
  statut: 'recue' | 'livree' | 'erreur';
  downloadUrl: string | null;
}

/** Historique de commandes pour le tableau de bord /compte, par e-mail du compte connecté. */
export async function getOrdersForEmail(email: string): Promise<OrderSummary[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return [];

  const res = await fetch(
    `${supabaseUrl}/rest/v1/commandes?email=eq.${encodeURIComponent(email)}&order=created_at.desc&select=id,created_at,carnet_slug,format,gift,montant_cents,statut,pdf_path`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (!res.ok) return [];
  const rows: Array<{
    id: string; created_at: string; carnet_slug: string; format: string; gift: boolean;
    montant_cents: number | null; statut: 'recue' | 'livree' | 'erreur'; pdf_path: string | null;
  }> = await res.json();

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      createdAt: row.created_at,
      carnetLabel: CARNET_LABELS[row.carnet_slug] || row.carnet_slug,
      format: row.format,
      gift: row.gift,
      montantCents: row.montant_cents,
      statut: row.statut,
      downloadUrl: row.pdf_path ? await signPdfPath(row.pdf_path) : null,
    }))
  );
}

export interface DeliveryItem {
  slug: string;
  format: string;
  gift?: boolean;
  recipientName?: string | null;
}

interface DeliveryResult {
  downloadUrl: string;
  carnetSlug: string;
  format: 'A4' | 'A5-livret';
  pdfPath: string;
}

async function resolveItem(item: DeliveryItem): Promise<DeliveryResult | null> {
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
  const pdfPath = rows?.[0]?.pdf_paths?.[format];
  if (!pdfPath) return null;

  const downloadUrl = await signPdfPath(pdfPath);
  if (!downloadUrl) return null;

  return { downloadUrl, carnetSlug, format, pdfPath };
}

export interface RecordOrderInput {
  stripeSessionId: string;
  email: string;
  items: DeliveryItem[];
  montantCents: number | null;
}

/**
 * Enregistre la commande dans Supabase (idempotent sur stripe_session_id)
 * et renvoie le lien de téléchargement s'il a pu être résolu. N'écrit
 * qu'une ligne résumant le premier article livrable, comme le reste de ce
 * module — un panier multi-articles n'est pas détaillé ligne par ligne.
 */
export async function recordOrder(input: RecordOrderInput): Promise<{ downloadUrl: string | null }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { downloadUrl: null };

  const first = input.items[0];
  if (!first) return { downloadUrl: null };

  let result: DeliveryResult | null = null;
  for (const item of input.items) {
    result = await resolveItem(item);
    if (result) break;
  }

  await fetch(`${supabaseUrl}/rest/v1/commandes`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      stripe_session_id: input.stripeSessionId,
      email: input.email,
      carnet_slug: result?.carnetSlug || first.slug,
      format: result?.format || normalizeFormat(first.format),
      gift: Boolean(first.gift),
      recipient_name: first.recipientName || null,
      montant_cents: input.montantCents,
      statut: result ? 'livree' : 'recue',
      pdf_path: result?.pdfPath || null,
    }),
  });

  return { downloadUrl: result?.downloadUrl || null };
}
