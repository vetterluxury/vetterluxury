import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import type { Product, Category, Collection } from '@/types/database';

export const metadata: Metadata = {
  title: 'Coleções',
  description: 'Explore as coleções exclusivas de lingerie de luxo da Vetter Luxury.',
};

export const revalidate = 60;

interface SearchParams {
  categoria?: string;
  colecao?: string;
  cor?: string;
  tamanho?: string;
  ordenar?: string;
  busca?: string;
  destaque?: string;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, category:categories(*), collection:collections(*)')
    .eq('status', 'active');

  if (params.busca) query = query.ilike('name', `%${params.busca}%`);
  if (params.cor) query = query.contains('colors', [params.cor]);
  if (params.tamanho) query = query.contains('sizes', [params.tamanho]);

  if (params.ordenar === 'preco-asc') query = query.order('price', { ascending: true });
  else if (params.ordenar === 'preco-desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const [{ data: products }, { data: categories }, { data: collections }] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase.from('collections').select('*').eq('is_active', true).order('name'),
  ]);

  let filtered = (products ?? []) as Product[];
  const categoryList = (categories ?? []) as Category[];
  const collectionList = (collections ?? []) as Collection[];

  // Filtro por slug de categoria/coleção (aplicado em memória pois envolve relação)
  if (params.categoria) filtered = filtered.filter((p) => p.category?.slug === params.categoria);
  if (params.colecao) filtered = filtered.filter((p) => p.collection?.slug === params.colecao);
  if (params.destaque) {
    filtered = filtered.filter(
      (p) => p.category?.slug === params.destaque || p.collection?.slug === params.destaque
    );
  }

  const allColors = [...new Set(filtered.flatMap((p) => p.colors ?? []))];
  const allSizes = [...new Set(filtered.flatMap((p) => p.sizes ?? []))];

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="text-center max-w-xl mx-auto mb-12">
        <p className="eyebrow">Coleções</p>
        <h1 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">Nossas Coleções</h1>
        <div className="gold-rule" />
        <p className="text-[#5c5450] text-sm mt-2">
          Cada uma com sua própria assinatura, cor, caimento e luxo, todas com o mesmo padrão de exclusividade pra você
          se sentir única.
        </p>
      </div>

      <Filters categories={categoryList} collections={collectionList} colors={allColors} sizes={allSizes} />

      <ProductGrid products={filtered} />
    </div>
  );
}
