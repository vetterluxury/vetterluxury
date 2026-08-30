import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// E-mail que recebe as notificações do formulário de contato.
// Pode trocar por variável de ambiente CONTACT_EMAIL_TO se quiser mudar sem editar código.
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || 'vetterluxury@gmail.com';

export async function POST(request: Request) {
  const { nome, email, telefone, mensagem } = await request.json();

  if (!nome || !email || !mensagem) {
    return NextResponse.json({ error: 'Preencha nome, e-mail e mensagem.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1) Salva a mensagem no banco (histórico, visível em /admin/mensagens)
  const { data: existing } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_messages')
    .single();

  const current = Array.isArray(existing?.value) ? existing!.value : [];
  const novaMensagem = { nome, email, telefone, mensagem, sentAt: new Date().toISOString() };

  const { error: dbError } = await supabase
    .from('site_settings')
    .upsert({ key: 'contact_messages', value: [...current, novaMensagem] });

  if (dbError) {
    return NextResponse.json({ error: 'Não foi possível salvar a mensagem.' }, { status: 500 });
  }

  // 2) Tenta enviar por e-mail (se RESEND_API_KEY estiver configurada).
  // Se falhar ou não estiver configurada, a mensagem já foi salva no passo acima mesmo assim.
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Vetter Luxury <onboarding@resend.dev>',
          to: [CONTACT_EMAIL_TO],
          reply_to: email,
          subject: `Nova mensagem de ${nome} — Site Vetter Luxury`,
          html: `
            <div style="font-family: sans-serif; color: #2E2E2E;">
              <h2 style="color: #6A1E32;">Nova mensagem pelo site</h2>
              <p><strong>Nome:</strong> ${nome}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>Telefone:</strong> ${telefone || 'não informado'}</p>
              <p><strong>Mensagem:</strong></p>
              <p style="white-space: pre-wrap;">${mensagem}</p>
            </div>
          `,
        }),
      });
    } catch {
      // Falha no envio de e-mail não deve impedir a resposta de sucesso —
      // a mensagem já está salva e visível em /admin/mensagens.
    }
  }

  return NextResponse.json({ success: true });
}
