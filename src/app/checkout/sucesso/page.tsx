'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { analytics } from '@/lib/analytics';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('pedido');
  const isPending = searchParams.get('status') === 'pending';
  const hasWarning = searchParams.get('aviso') === '1';
  const supabase = createClient();

  useEffect(() => {
    if (!orderNumber) return;
    supabase
      .from('orders')
      .select('id, total')
      .eq('order_number', orderNumber)
      .single()
      .then(({ data }) => {
        if (data) analytics.purchase(data.id, data.total);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return (
    <div className="pt-40 pb-32 max-w-md mx-auto px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/20 text-gold text-3xl flex items-center justify-center mx-auto mb-6">
        &#10003;
      </div>
      <h1 className="font-heading text-3xl text-marsala-dark mb-3">
        {isPending ? 'Pagamento em Análise' : 'Pedido Confirmado!'}
      </h1>
      {orderNumber && (
        <p className="text-ink/70 mb-2">
          Número do pedido: <strong className="text-marsala-dark">{orderNumber}</strong>
        </p>
      )}
      <p className="text-sm text-ink/60 mb-8">
        {hasWarning
          ? 'Seu pedido foi registrado. Entraremos em contato para combinar o pagamento, já que o pagamento online não pôde ser iniciado.'
          : isPending
          ? 'Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.'
          : 'Obrigada por comprar na Vetter Luxury! Você pode acompanhar o status do seu pedido a qualquer momento em "Meus Pedidos".'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/conta/pedidos" className="btn-primary">Ver Meus Pedidos</Link>
        <Link href="/produtos" className="btn-outline border-marsala-dark text-marsala-dark">Continuar Comprando</Link>
      </div>
    </div>
  );
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
