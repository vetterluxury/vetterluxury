'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Collection, Product } from '@/types/database';
import ProductGrid from './ProductGrid';

interface CollectionsShowcaseProps {
  collections: Collection[];
  products: Product[];
}

export default function CollectionsShowcase({ collections, products }: CollectionsShowcaseProps) {
  const [active, setActive] = useState<string>('todas');

  const filtered = useMemo(() => {
    if (active === 'todas') return products;
    return products.filter((p) => p.collection?.slug === active);
  }, [active, products]);

  if (products.length === 0) return null;

  return (
    <section id="colecoes" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-4">
          <p className="eyebrow">Coleções</p>
          <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">Peças que vestem confiança</h2>
          <div className="gold-rule" />
          <p className="text-[#5c5450] text-sm mt-2">
            Cada uma com sua própria assinatura, cor, caimento e luxo, todas com o mesmo padrão de exclusividade pra
            você se sentir única.
          </p>
        </div>

        {collections.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center mb-12">
            <button
              onClick={() => setActive('todas')}
              className={`text-[0.78rem] tracking-[0.14em] uppercase pb-1.5 border-b-2 transition-colors ${
                active === 'todas' ? 'text-marsala-dark border-marsala-dark' : 'text-[#8a7d73] border-transparent hover:text-marsala'
              }`}
            >
              Todas
            </button>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.slug)}
                className={`text-[0.78rem] tracking-[0.14em] uppercase pb-1.5 border-b-2 transition-colors ${
                  active === c.slug ? 'text-marsala-dark border-marsala-dark' : 'text-[#8a7d73] border-transparent hover:text-marsala'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <ProductGrid products={filtered.slice(0, 6)} />

        <div className="text-center mt-14">
          <Link href="/produtos" className="btn-outline border-marsala-dark text-marsala-dark">
            Ver Coleção Completa
          </Link>
        </div>
      </div>
    </section>
  );
}
