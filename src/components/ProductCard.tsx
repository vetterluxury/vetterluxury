'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, whatsappLink } from '@/lib/utils';
import type { Product } from '@/types/database';
import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const fav = isFavorite(product.id);
  const hasPromo = product.promo_price !== null && product.promo_price! < product.price;

  async function handleFavClick(e: React.MouseEvent) {
    e.preventDefault();
    const result = await toggleFavorite(product.id);
    if (result.requiresLogin) router.push('/login');
  }

  return (
    <div className="bg-white rounded-sm overflow-hidden shadow-[0_6px_20px_rgba(78,22,38,0.06)] hover:shadow-[0_20px_40px_rgba(78,22,38,0.14)] hover:-translate-y-1.5 transition-all duration-300 group">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-[4/5] bg-gradient-to-br from-champagne-soft to-[#e9dcc7] overflow-hidden">
          {product.main_image_url ? (
            <Image
              src={product.main_image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-5xl text-marsala/25">
                {product.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </span>
            </div>
          )}

          {product.collection && (
            <span className="absolute top-3.5 left-3.5 bg-champagne/90 text-marsala-dark font-label text-[0.62rem] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full">
              {product.collection.name}
            </span>
          )}
          {product.is_new && (
            <span className="absolute top-3.5 right-14 bg-marsala text-white font-label text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full">
              Novo
            </span>
          )}

          <button
            onClick={handleFavClick}
            aria-label="Favoritar"
            className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              fav ? 'bg-white text-marsala' : 'bg-white/85 text-marsala hover:bg-gold hover:text-white'
            }`}
          >
            {fav ? '♥' : '♡'}
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-heading text-[1.15rem] text-marsala-dark mb-1.5">{product.name}</h3>
          {product.sizes?.length > 0 && (
            <p className="text-[0.74rem] text-gold tracking-wide mb-1.5">Tamanhos: {product.sizes.join(' · ')}</p>
          )}
          <p className="font-heading text-[1rem] text-marsala-dark min-h-[1.4em] mb-4">
            {product.price > 0 ? (
              hasPromo ? (
                <>
                  <span className="line-through text-ink/40 text-sm mr-2">{formatPrice(product.price)}</span>
                  <span className="text-marsala">{formatPrice(product.promo_price)}</span>
                </>
              ) : (
                formatPrice(product.price)
              )
            ) : (
              'R$: '
            )}
          </p>
        </div>
      </Link>
      <div className="px-6 pb-6 flex flex-col gap-2.5">
        <Link href={`/produtos/${product.slug}`} className="btn-outline text-center text-[0.7rem] py-2.5">
          Ver Detalhes
        </Link>
        <a
          href={whatsappLink(`Olá! Tenho interesse na peça "${product.name}" da Vetter Luxury.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white text-center text-[0.7rem] tracking-[0.08em] uppercase py-2.5 rounded-sm hover:brightness-110 transition"
        >
          Comprar pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
