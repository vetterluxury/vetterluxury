import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { documentoTipo, normalizeDocumento } from '@/lib/documento';

/**
 * Cria a conta da cliente já aprovada (sem precisar confirmar e-mail) e guarda o CPF ou CNPJ,
 * que depois permite recuperar a senha informando só o documento.
 */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; documento?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const documento = normalizeDocumento(String(body.documento ?? ''));

  if (name.length < 3) return NextResponse.json({ error: 'Informe seu nome completo.' }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, { status: 400 });
  if (!documentoTipo(documento)) return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 });

  const supabase = createAdminClient();

  const { data: existing } = await supabase.from('profiles').select('id').eq('cpf', documento).limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Já existe uma conta com este CPF ou CNPJ. Use "Esqueci minha senha" para recuperar o acesso.' },
      { status: 409 }
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error || !data.user) {
    const duplicado = error?.code === 'email_exists' || /already|registered/i.test(error?.message ?? '');
    return NextResponse.json(
      { error: duplicado ? 'Este e-mail já está cadastrado.' : 'Não foi possível concluir o cadastro.' },
      { status: duplicado ? 409 : 500 }
    );
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: data.user.id, full_name: name, cpf: documento });

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id); // desfaz para não ficar conta sem documento
    return NextResponse.json({ error: 'Não foi possível concluir o cadastro.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
