import { createClient } from '@supabase/supabase-js';

/**
 * Client service_role — contourne la RLS. Jamais exposé au client,
 * utilisé uniquement côté serveur (ex: suppression de compte via
 * l'API admin, impossible avec le rôle authenticated).
 */
export function createAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
