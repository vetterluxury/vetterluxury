'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types/database';

interface FavoriteRow {
  product: Product | null;
}

export default function FavoritosPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('product:products(*, category:categories(*), collection:collections(*))')
      .eq('profile_id', user.id)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as FavoriteRow[];
        setProducts(rows.map((f) => f.product).filter((p): p is Product => Boolean(p)));
        setLoadingProducts(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || loadingProducts) return <div className="pt-40 pb-32 text-center">Carregando...</div>;

  if (!user) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <p className="font-heading text-2xl text-marsala-dark mb-4">Entre para ver seus favoritos.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Meus Favoritos</h1>
        <div className="gold-rule" />
      </div>

      {products.length === 0 ? (
        <div className="text-center">
          <p className="text-ink/60 mb-6">Você ainda não favoritou nenhuma peça.</p>
          <Link href="/produtos" className="btn-primary">Explorar Coleções</Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
