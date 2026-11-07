import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Inscrição na newsletter.
 * Roda no servidor (com a chave de serviço) porque a tabela site_settings
 * só aceita gravação de administradores. Assim qualquer visitante consegue se inscrever.
 */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'newsletter_emails').maybeSingle();
  const current: string[] = Array.isArray(data?.value) ? (data!.value as string[]) : [];

  if (!current.includes(email)) {
    const { error } = await supabase.from('site_settings').upsert({ key: 'newsletter_emails', value: [...current, email] });
    if (error) {
      return NextResponse.json({ error: 'Não foi possível concluir a inscrição.' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
