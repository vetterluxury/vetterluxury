import { NextResponse } from 'next/server';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { documentoTipo, normalizeDocumento } from '@/lib/documento';

/**
 * Recuperação de senha por e-mail, CPF ou CNPJ.
 *
 * SEGURANÇA: o CPF/CNPJ nunca redefine a senha diretamente. Ele só serve para achar a conta,
 * e o link de redefinição é enviado para o e-mail JÁ CADASTRADO na conta.
 * A resposta é sempre a mesma, exista a conta ou não, para ninguém descobrir quem tem cadastro.
 */
export async function POST(request: Request) {
  let body: { identificador?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const entrada = String(body.identificador ?? '').trim();
  let email: string | null = null;

  if (entrada.includes('@')) {
    if (!/^\S+@\S+\.\S+$/.test(entrada)) {
      return NextResponse.json({ error: 'Informe um e-mail, CPF ou CNPJ válido.' }, { status: 400 });
    }
    email = entrada.toLowerCase();
  } else {
    const documento = normalizeDocumento(entrada);
    if (!documentoTipo(documento)) {
      return NextResponse.json({ error: 'Informe um e-mail, CPF ou CNPJ válido.' }, { status: 400 });
    }
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin.from('profiles').select('id').eq('cpf', documento).maybeSingle();
      if (profile) {
        const { data } = await admin.auth.admin.getUserById(profile.id);
        email = data?.user?.email ?? null;
      }
    } catch (err) {
      console.error('Erro ao localizar conta pelo documento:', err);
    }
  }

  if (email) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      // Cliente sem sessão: o link do e-mail traz o acesso no endereço e funciona em qualquer aparelho.
      const publico = createPublicClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      await publico.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/redefinir-senha` });
    } catch (err) {
      console.error('Erro ao enviar e-mail de recuperação:', err);
    }
  }

  return NextResponse.json({ success: true });
}
