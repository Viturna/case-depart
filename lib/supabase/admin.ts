import { createClient } from '@supabase/supabase-js';

// Ce client n'utilise jamais Realtime, mais @supabase/supabase-js construit
// quand même un RealtimeClient dans son constructeur, qui plante aussitôt
// si `WebSocket` n'existe pas en global (vrai sur Node < 22 sans polyfill).
// Un faux transport évite cet appel sans rien changer au reste du client.
class NoopWebSocket {}

/**
 * Client service_role — contourne la RLS. Jamais exposé au client,
 * utilisé uniquement côté serveur (ex: suppression de compte via
 * l'API admin, impossible avec le rôle authenticated).
 */
export function createAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: NoopWebSocket as never },
  });
}
