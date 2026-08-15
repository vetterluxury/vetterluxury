import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/types/database';

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: collections }] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*, inventory(quantity, low_stock_threshold))')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('collections').select('*').order('name'),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Editar Produto</h1>
      <ProductForm
        categories={categories ?? []}
        collections={collections ?? []}
        initialProduct={product as Product}
      />
    </div>
  );
}
