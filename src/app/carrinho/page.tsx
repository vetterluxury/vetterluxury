'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [applying, setApplying] = useState(false);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponMessage('');
    try {
      const res = await fetch('/api/cupom/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.coupon.code, discount: data.discount });
        setCouponMessage('Cupom aplicado com sucesso!');
      } else {
        setCoupon(null);
        setCouponMessage(data.message);
      }
    } catch {
      setCouponMessage('Não foi possível validar o cupom agora.');
    } finally {
      setApplying(false);
    }
  }

  const discount = coupon?.discount ?? 0;
  const total = Math.max(subtotal - discount, 0);

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <p className="font-heading text-2xl text-marsala-dark mb-4">Sua sacola está vazia.</p>
        <Link href="/produtos" className="btn-primary">Explorar Coleções</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6">
      <h1 className="font-heading text-3xl text-marsala-dark mb-10 text-center">Sua Sacola</h1>

      <div className="grid md:grid-cols-[1fr_340px] gap-14">
        <div>
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-5 py-6 border-b border-marsala-dark/10">
              <div className="relative w-24 h-28 bg-champagne-soft rounded-sm flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-marsala/30 font-display text-xl">
                    {item.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-heading text-lg text-marsala-dark">{item.name}</p>
                <p className="text-xs text-gold mb-2">{item.size} · {item.color}</p>
                <p className="text-sm text-marsala-dark mb-3">
                  {(item.promoPrice ?? item.price) > 0 ? formatPrice(item.promoPrice ?? item.price) : 'R$: '}
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="w-7 h-7 border border-marsala-dark/30 rounded">−</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="w-7 h-7 border border-marsala-dark/30 rounded">+</button>
                  <button onClick={() => removeItem(item.productId, item.size, item.color)} className="ml-4 text-xs text-marsala underline">
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white p-7 rounded-sm h-fit shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
          <h2 className="font-heading text-xl text-marsala-dark mb-5">Resumo</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="input-field"
            />
            <button onClick={handleApplyCoupon} disabled={applying} className="btn-outline border-marsala-dark text-marsala-dark whitespace-nowrap">
              Aplicar
            </button>
          </div>
          {couponMessage && (
            <p className={`text-xs mb-4 ${coupon ? 'text-green-700' : 'text-marsala'}`}>{couponMessage}</p>
          )}

          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-2 text-green-700">
              <span>Desconto ({coupon?.code})</span>
              <span>− {formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-5 text-ink/50">
            <span>Frete</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="flex justify-between font-heading text-lg text-marsala-dark border-t border-marsala-dark/10 pt-4 mb-6">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Link
            href={`/checkout${coupon ? `?cupom=${coupon.code}` : ''}`}
            className="btn-primary w-full text-center block"
          >
            Ir para o Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
