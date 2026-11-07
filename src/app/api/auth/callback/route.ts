import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Volta do login com Google ou Apple: troca o código recebido por uma sessão
 * e leva a cliente para a página em que ela estava.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/conta';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/conta';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?erro=oauth`);
}
