import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

export default async function NovoProdutoPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('collections').select('*').order('name'),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Novo Produto</h1>
      <ProductForm categories={categories ?? []} collections={collections ?? []} />
    </div>
  );
}
