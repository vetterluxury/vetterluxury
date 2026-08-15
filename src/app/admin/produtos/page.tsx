import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import ProductStatusToggle from '@/components/admin/ProductStatusToggle';

export const revalidate = 0;

export default async function AdminProdutosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name), collection:collections(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-2xl text-marsala-dark">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-primary">+ Novo Produto</Link>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="p-4">Produto</th>
              <th className="p-4">Categoria / Coleção</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Status</th>
              <th className="p-4">Destaques</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-marsala-dark/5">
                <td className="p-4">
                  <p className="font-medium text-marsala-dark">{p.name}</p>
                  <p className="text-xs text-ink/40">{p.sku || 'sem SKU'}</p>
                </td>
                <td className="p-4 text-ink/70">
                  {p.category?.name ?? '—'} {p.collection?.name ? `/ ${p.collection.name}` : ''}
                </td>
                <td className="p-4">{p.price > 0 ? formatPrice(p.promo_price ?? p.price) : 'R$: '}</td>
                <td className="p-4">
                  <ProductStatusToggle productId={p.id} status={p.status} />
                </td>
                <td className="p-4 text-xs text-ink/50">
                  {p.is_featured && <span className="mr-1.5">Destaque</span>}
                  {p.is_new && <span className="mr-1.5">Novo</span>}
                  {p.is_on_sale && <span>Promoção</span>}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/produtos/${p.id}`} className="text-marsala underline text-xs">Editar</Link>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink/50">Nenhum produto cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
