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

  const [step, setStep] = useState<Step>('endereco');
  const [couponInput, setCouponInput] = useState(searchParams.get('cupom') ?? '');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
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

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Não foi possível aplicar o cupom.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.code, discount: data.discount });
        setCouponError('');
      }
    } catch {
      setCouponError('Erro de conexão. Tente novamente.');
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
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
          couponCode: appliedCoupon?.code,
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
          <label className="label-field">
            Número
            <input required className="input-field" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
          </label>
          <label className="label-field">
            Complemento
            <input className="input-field" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
          </label>
          <label className="label-field">
            Bairro
            <input required className="input-field" value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} />
          </label>
          <label className="label-field">
            CEP
            <input required className="input-field" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
          </label>
          <label className="label-field">
            Cidade
            <input required className="input-field" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          </label>
          <label className="label-field">
            Estado (UF)
            <input required maxLength={2} className="input-field uppercase" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
          </label>
          <button type="submit" className="btn-primary sm:col-span-2 mt-2">Continuar para Entrega</button>
        </form>
      )}

      {step === 'entrega' && (
        <div className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
          <h2 className="font-heading text-lg text-marsala-dark mb-3">Frete</h2>
          <p className="text-sm text-ink/60 mb-6">
            O cálculo de frete em tempo real (Correios / Melhor Envio) está preparado na arquitetura do projeto, mas
            requer credenciais de uma transportadora para ser ativado — veja o README. Por enquanto, o frete é
            combinado diretamente com a cliente.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep('endereco')} className="btn-outline border-marsala-dark text-marsala-dark">Voltar</button>
            <button onClick={() => setStep('pagamento')} className="btn-primary">Continuar para Pagamento</button>
          </div>
        </div>
      )}

      {step === 'pagamento' && (
        <div className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Forma de Pagamento</h2>
          <div className="flex flex-col gap-3 mb-6">
            <label className="flex items-center gap-3 border border-marsala-dark/20 rounded-sm p-4 cursor-pointer">
              <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
              <span className="text-sm">Pix (aprovação instantânea)</span>
            </label>
            <label className="flex items-center gap-3 border border-marsala-dark/20 rounded-sm p-4 cursor-pointer">
              <input type="radio" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
              <span className="text-sm">Cartão de Crédito (em até 3x sem juros)</span>
            </label>
          </div>
          <p className="text-xs text-ink/50 mb-6">
            Você será redirecionada ao ambiente seguro do Mercado Pago para concluir o pagamento.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep('entrega')} className="btn-outline border-marsala-dark text-marsala-dark">Voltar</button>
            <button onClick={() => setStep('revisao')} className="btn-primary">Continuar para Revisão</button>
          </div>
        </div>
      )}

      {step === 'revisao' && (
        <div className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Revisão do Pedido</h2>

          <div className="mb-6 space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name} ({item.size}, {item.color})</span>
                <span>{formatPrice((item.promoPrice ?? item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-marsala-dark/10 pt-4 mb-6">
            <p className="text-sm text-ink/70 mb-1">
              <strong>Entrega para:</strong> {address.recipientName} — {address.street}, {address.number}, {address.neighborhood}, {address.city}/{address.state}
            </p>
            <p className="text-sm text-ink/70">
              <strong>Pagamento:</strong> {paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito'}
            </p>
          </div>

          <div className="border-t border-marsala-dark/10 pt-4 mb-6">
            <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Cupom de desconto</p>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-champagne-soft rounded-sm px-4 py-3">
                <span className="text-sm text-marsala-dark font-medium">
                  {appliedCoupon.code} aplicado — -{formatPrice(appliedCoupon.discount)}
                </span>
                <button onClick={handleRemoveCoupon} className="text-xs text-marsala underline">
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 uppercase"
                  placeholder="Digite seu cupom"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="btn-outline border-marsala-dark text-marsala-dark whitespace-nowrap"
                >
                  {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-marsala mt-2">{couponError}</p>}
          </div>

          <div className="border-t border-marsala-dark/10 pt-4 mb-6 space-y-1.5">
            <div className="flex justify-between text-sm text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-marsala">
                <span>Desconto ({appliedCoupon.code})</span>
                <span>-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-heading text-lg text-marsala-dark pt-2">
              <span>Total</span>
              <span>{formatPrice(subtotal - (appliedCoupon?.discount ?? 0) + shipping)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-marsala mb-4">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('pagamento')} className="btn-outline border-marsala-dark text-marsala-dark">Voltar</button>
            <button onClick={handleConfirmOrder} disabled={submitting} className="btn-primary">
              {submitting ? 'Processando...' : 'Confirmar e Pagar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="pt-40 pb-32 text-center">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
