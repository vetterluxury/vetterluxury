'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { formatPrice, whatsappLink } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import type { Product } from '@/types/database';

export default function ProductDetailForm({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes?.[0] ?? '');
  const [color, setColor] = useState(product.colors?.[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const variant = useMemo(
    () => product.variants?.find((v) => v.size === size && v.color === color),
    [product.variants, size, color]
  );
  const stock = variant?.inventory?.quantity;
  const outOfStock = typeof stock === 'number' && stock <= 0;
  const hasPromo = product.promo_price !== null && product.promo_price! < product.price;
  const fav = isFavorite(product.id);

  function handleAddToCart(goToCheckout = false) {
    if (!size || !color) {
      setFeedback('Selecione tamanho e cor antes de continuar.');
      return;
    }
    if (outOfStock) {
      setFeedback('Essa combinação está sem estoque no momento.');
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      promoPrice: hasPromo ? product.promo_price : null,
      image: product.main_image_url,
      size,
      color,
      quantity,
    });
    analytics.addToCart({ id: product.id, name: product.name, price: product.promo_price ?? product.price }, quantity);
    setFeedback('');

    if (goToCheckout) router.push('/carrinho');
  }

  async function handleFavClick() {
    const result = await toggleFavorite(product.id);
    if (result.requiresLogin) router.push('/login');
  }

  return (
    <div>
      <p className="eyebrow">{product.collection?.name ?? product.category?.name ?? 'Vetter Luxury'}</p>
      <h1 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-2 mb-3">{product.name}</h1>

      <p className="font-heading text-xl text-marsala-dark mb-1">
        {product.price > 0 ? (
          hasPromo ? (
            <>
              <span className="line-through text-ink/40 text-base mr-3">{formatPrice(product.price)}</span>
              <span>{formatPrice(product.promo_price)}</span>
            </>
          ) : (
            formatPrice(product.price)
          )
        ) : (
          'R$: '
        )}
      </p>
      {product.price > 0 && (
        <p className="text-xs text-ink/50 mb-6">
          ou em até 3x de {formatPrice((product.promo_price ?? product.price) / 3)} sem juros
        </p>
      )}

      {product.sizes?.length > 0 && (
        <div className="mb-5">
          <p className="label-field mb-2">Tamanho</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 text-sm border rounded-sm transition-colors ${
                  size === s ? 'bg-marsala text-white border-marsala' : 'border-marsala-dark/30 text-marsala-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors?.length > 0 && (
        <div className="mb-5">
          <p className="label-field mb-2">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-4 py-2 text-sm border rounded-sm transition-colors ${
                  color === c ? 'bg-marsala text-white border-marsala' : 'border-marsala-dark/30 text-marsala-dark'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-2">
        <p className="label-field mb-2">Quantidade</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 border border-marsala-dark/30 rounded">−</button>
          <span className="w-6 text-center">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 border border-marsala-dark/30 rounded">+</button>
        </div>
      </div>

      {typeof stock === 'number' && (
        <p className={`text-xs mb-4 ${outOfStock ? 'text-red-600' : 'text-ink/50'}`}>
          {outOfStock ? 'Sem estoque para essa combinação.' : `${stock} unidades disponíveis`}
        </p>
      )}

      {feedback && <p className="text-xs text-marsala mb-3">{feedback}</p>}

      <div className="flex flex-col gap-3 mt-6">
        <button onClick={() => handleAddToCart(false)} disabled={outOfStock} className="btn-outline border-marsala-dark text-marsala-dark">
          Adicionar ao Carrinho
        </button>
        <button onClick={() => handleAddToCart(true)} disabled={outOfStock} className="btn-primary">
          Comprar Agora
        </button>
        <button onClick={handleFavClick} className="text-sm text-marsala-dark flex items-center gap-2 justify-center py-2">
          <span>{fav ? '♥' : '♡'}</span> {fav ? 'Nos favoritos' : 'Adicionar aos favoritos'}
        </button>
        <a
          href={whatsappLink(`Olá! Tenho interesse na peça "${product.name}" (tamanho ${size || '-'}, cor ${color || '-'}) da Vetter Luxury.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white text-center text-sm py-3 rounded-sm hover:brightness-110 transition"
        >
          Comprar pelo WhatsApp
        </a>
      </div>

      {product.description && (
        <div className="mt-10 pt-8 border-t border-marsala-dark/10">
          <h3 className="font-heading text-lg text-marsala-dark mb-2">Descrição</h3>
          <p className="text-sm text-ink/70 leading-relaxed">{product.description}</p>
        </div>
      )}

      {product.additional_info && (
        <div className="mt-6">
          <h3 className="font-heading text-lg text-marsala-dark mb-2">Informações Adicionais</h3>
          <p className="text-sm text-ink/70 leading-relaxed">{product.additional_info}</p>
        </div>
      )}
    </div>
  );
}
