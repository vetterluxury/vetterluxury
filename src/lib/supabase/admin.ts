import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com a SERVICE ROLE KEY — ignora RLS por completo.
 *
 * USO EXCLUSIVO em código server-side de confiança:
 *  - webhook do Mercado Pago (src/app/api/mercadopago/webhook/route.ts)
 *  - rotinas administrativas pontuais que precisem ignorar RLS
 *
 * NUNCA importe este arquivo em um Client Component ("use client")
 * nem exponha SUPABASE_SERVICE_ROLE_KEY com o prefixo NEXT_PUBLIC_.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não está definida. Configure-a em .env.local (nunca no frontend).'
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
