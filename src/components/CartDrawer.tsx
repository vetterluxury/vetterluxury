'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-marsala-dark/40 z-[1200] transition-opacity duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-champagne z-[1300] flex flex-col shadow-2xl transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrinho de compras"
      >
        <div className="flex justify-between items-center px-7 py-7 border-b border-marsala-dark/10">
          <h3 className="font-heading text-xl text-marsala-dark">Sua Sacola</h3>
          <button onClick={closeCart} aria-label="Fechar carrinho" className="text-2xl text-marsala-dark leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          {items.length === 0 ? (
            <p className="text-ink/50 text-sm">Sua sacola está vazia.</p>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3.5 py-4 border-b border-marsala-dark/10">
                <div className="relative w-16 h-20 bg-champagne-soft rounded-sm flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-marsala/30 font-display text-lg">
                      {item.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm text-marsala-dark">{item.name}</p>
                  <p className="text-xs text-gold mb-1.5">{item.size} · {item.color}</p>
                  <p className="text-sm text-marsala-dark mb-2">
                    {(item.promoPrice ?? item.price) > 0 ? formatPrice(item.promoPrice ?? item.price) : 'R$: '}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="w-6 h-6 border border-marsala-dark/30 rounded text-xs"
                    >
                      −
                    </button>
                    <span className="text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="w-6 h-6 border border-marsala-dark/30 rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.size, item.color)}
                  aria-label="Remover item"
                  className="text-marsala text-lg self-start"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-7 py-6 border-t border-marsala-dark/10">
          <div className="flex justify-between text-sm mb-4">
            <span>Subtotal</span>
            <span className="font-heading">{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/carrinho"
            onClick={closeCart}
            className="btn-primary w-full text-center"
            aria-disabled={items.length === 0}
          >
            Finalizar Compra
          </Link>
        </div>
      </aside>
    </>
  );
}
