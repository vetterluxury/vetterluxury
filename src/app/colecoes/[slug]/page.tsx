import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/ProductGrid';
import type { Product, Collection } from '@/types/database';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('collections').select('*').eq('slug', slug).single();
  if (!data) return { title: 'Coleção não encontrada' };
  return {
    title: data.name,
    description: data.description ?? `Coleção ${data.name} — Vetter Luxury`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase.from('collections').select('*').eq('slug', slug).eq('is_active', true).single();
  if (!collection) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), collection:collections(*)')
    .eq('collection_id', collection.id)
    .eq('status', 'active');

  const col = collection as Collection;

  return (
    <div className="pt-24 pb-24">
      <div className="relative h-[46vh] min-h-[320px] flex items-center justify-center text-center overflow-hidden">
        {col.banner_url ? (
          <Image src={col.banner_url} alt={col.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-champagne-soft to-[#e6d8c0]" />
        )}
        <div className="absolute inset-0 bg-marsala-dark/40" />
        <div className="relative z-10 px-6">
          <p className="eyebrow text-champagne-soft">Coleção</p>
          <h1 className="font-heading text-4xl md:text-5xl text-white mt-3">{col.name}</h1>
          {col.description && <p className="text-white/85 text-sm max-w-md mx-auto mt-3">{col.description}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16">
        <ProductGrid products={(products ?? []) as Product[]} />
      </div>
    </div>
  );
}
