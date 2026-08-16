'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

type Step = 'endereco' | 'entrega' | 'pagamento' | 'revisao';

function CheckoutContent() {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get('cupom') ?? undefined;

  const [step, setStep] = useState<Step>('endereco');
  const [address, setAddress] = useState({
    recipientName: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Frete: estrutura pronta para integração futura (Correios / Melhor Envio).
  // Nenhum valor real é calculado ainda — ver README, seção "Frete".
  const shipping = 0;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/carrinho');
    }
  }, [loading, items, router]);

  useEffect(() => {
    if (subtotal > 0) analytics.beginCheckout(subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep('entrega');
  }

  async function handleConfirmOrder() {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            price: i.price,
            promoPrice: i.promoPrice,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          shippingAddress: address,
          paymentMethod,
          couponCode,
          shipping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Não foi possível concluir o pedido.');
        setSubmitting(false);
        return;
      }

      clearCart();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Pagamento não configurado — pedido registrado mesmo assim.
        router.push(`/checkout/sucesso?pedido=${data.orderNumber}${data.warning ? '&aviso=1' : ''}`);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  }

  if (loading || !user || items.length === 0) {
    return <div className="pt-40 pb-32 text-center">Carregando...</div>;
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'endereco', label: '1. Endereço' },
    { id: 'entrega', label: '2. Entrega' },
    { id: 'pagamento', label: '3. Pagamento' },
    { id: 'revisao', label: '4. Revisão' },
  ];

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Checkout</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Finalizar Compra</h1>
        <div className="gold-rule" />
      </div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap text-[0.7rem] tracking-wide uppercase">
        {steps.map((s) => (
          <span
            key={s.id}
            className={`px-3 py-1.5 rounded-full ${step === s.id ? 'bg-marsala text-white' : 'bg-champagne-soft text-marsala-dark/60'}`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {step === 'endereco' && (
        <form onSubmit={handleAddressSubmit} className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)] grid sm:grid-cols-2 gap-5">
          <label className="label-field sm:col-span-2">
            Nome do destinatário
            <input required className="input-field" value={address.recipientName} onChange={(e) => setAddress({ ...address, recipientName: e.target.value })} />
          </label>
          <label className="label-field sm:col-span-2">
            Rua
            <input required className="input-field" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          </label>
