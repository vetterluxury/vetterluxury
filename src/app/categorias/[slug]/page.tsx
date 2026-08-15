import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/ProductGrid';
import type { Product, Category } from '@/types/database';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!data) return { title: 'Categoria não encontrada' };
  return { title: data.name, description: data.description ?? `Categoria ${data.name} — Vetter Luxury` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).eq('is_active', true).single();
  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), collection:collections(*)')
    .eq('category_id', category.id)
    .eq('status', 'active');

  const cat = category as Category;

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="text-center max-w-xl mx-auto mb-12">
        <p className="eyebrow">Categoria</p>
        <h1 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">{cat.name}</h1>
        <div className="gold-rule" />
        {cat.description && <p className="text-[#5c5450] text-sm mt-2">{cat.description}</p>}
      </div>
      <ProductGrid products={(products ?? []) as Product[]} />
    </div>
  );
}
