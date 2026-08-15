import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentClient } from '@/lib/mercadopago';

/**
 * Webhook chamado pelo Mercado Pago quando o status de um pagamento muda.
 * Configure esta URL em: Mercado Pago > Painel do desenvolvedor > Webhooks
 *   https://SEU-DOMINIO/api/mercadopago/webhook
 *
 * Usa a service role key (ignora RLS) porque é uma chamada server-to-server
 * autenticada pelo próprio Mercado Pago, não por um usuário logado.
 */

/**
 * Valida a assinatura do webhook conforme a documentação do Mercado Pago:
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks#editor_5
 *
 * O cabeçalho x-signature vem no formato "ts=...,v1=...". O manifesto
 * assinado é `id:{data.id};request-id:{x-request-id};ts:{ts};` e deve
 * bater com um HMAC-SHA256 usando MERCADOPAGO_WEBHOOK_SECRET.
 *
 * Se MERCADOPAGO_WEBHOOK_SECRET não estiver configurado, a validação é
 * pulada (com um aviso no log) para não travar ambientes de desenvolvimento
 * sem essa credencial — mas em produção ela deve sempre estar definida.
 */
function isValidSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      'MERCADOPAGO_WEBHOOK_SECRET não configurado — pulando validação de assinatura do webhook. Configure-o em produção.'
    );
    return true;
  }

  const signatureHeader = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [key, value] = p.split('=').map((s) => s.trim());
      return [key, value];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(v1, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  let body: { type?: string; data?: { id?: string } };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // O Mercado Pago envia diferentes formatos de notificação; tratamos o
  // formato "payment" que é o relevante para atualizar pedidos.
  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(request, body.data.id)) {
    console.error('Webhook do Mercado Pago rejeitado: assinatura inválida.');
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  try {
    const paymentClient = getPaymentClient();
    const payment = await paymentClient.get({ id: body.data.id });

    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const supabase = createAdminClient();

    const statusMap: Record<string, { payment_status: string; order_status?: string }> = {
      approved: { payment_status: 'approved', order_status: 'payment_approved' },
      pending: { payment_status: 'pending' },
      in_process: { payment_status: 'pending' },
      rejected: { payment_status: 'rejected' },
      refunded: { payment_status: 'refunded' },
      cancelled: { payment_status: 'rejected' },
    };

    const mapped = statusMap[payment.status ?? ''] ?? { payment_status: 'pending' };

    await supabase
      .from('orders')
      .update({
        payment_status: mapped.payment_status,
        ...(mapped.order_status ? { order_status: mapped.order_status } : {}),
        mp_payment_id: String(payment.id),
      })
      .eq('id', orderId);

    await supabase.from('payments').insert({
      order_id: orderId,
      provider: 'mercado_pago',
      provider_payment_id: String(payment.id),
      status: payment.status ?? 'unknown',
      amount: payment.transaction_amount ?? 0,
      raw_payload: payment as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro ao processar webhook do Mercado Pago:', err);
    // Retorna 200 mesmo em erro interno para evitar reenvio agressivo do MP;
    // o erro fica registrado no log do servidor (Vercel > Logs) para investigação.
    return NextResponse.json({ received: true });
  }
}
