'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso em Client Components ("use client").
 * Usa a anon key pública — segura para o navegador, pois toda a
 * segurança real vem das políticas de Row Level Security (RLS)
 * definidas em supabase/schema.sql.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
