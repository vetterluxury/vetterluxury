import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 0;

interface LowStockRow {
  quantity: number;
  low_stock_threshold: number;
  variant: { size: string; color: string; product: { name: string } | null } | null;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: approvedOrders },
    { data: lowStock },
    { data: bestSellers },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('payment_status', 'approved'),
    supabase
      .from('inventory')
      .select('quantity, low_stock_threshold, variant:product_variants(size, color, product:products(name))')
      .order('quantity', { ascending: true })
      .limit(6),
    supabase
      .from('order_items')
      .select('product_name, quantity')
      .limit(500),
  ]);

  const revenue = (approvedOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  const salesByProduct = new Map<string, number>();
  (bestSellers ?? []).forEach((item) => {
    salesByProduct.set(item.product_name, (salesByProduct.get(item.product_name) ?? 0) + item.quantity);
  });
  const topProducts = [...salesByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stockRows = (lowStock ?? []) as unknown as LowStockRow[];
  const stockAlerts = stockRows.filter((i) => i.quantity <= (i.low_stock_threshold ?? 3));

  const cards = [
    { label: 'Faturamento (aprovado)', value: formatPrice(revenue) },
    { label: 'Total de Pedidos', value: totalOrders ?? 0 },
    { label: 'Produtos Ativos', value: totalProducts ?? 0 },
    { label: 'Clientes Cadastrados', value: totalCustomers ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-6 rounded-sm shadow-sm">
            <p className="text-xs text-ink/50 uppercase tracking-wide mb-2">{c.label}</p>
            <p className="font-heading text-2xl text-marsala-dark">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-4">Produtos Mais Vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ink/50">Ainda não há vendas registradas.</p>
          ) : (
            <ul className="space-y-2.5">
              {topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-marsala-dark font-medium">{qty} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-lg text-marsala-dark">Estoque Baixo</h2>
            <Link href="/admin/estoque" className="text-xs text-marsala underline">Ver tudo</Link>
          </div>
          {stockAlerts.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhum alerta de estoque no momento.</p>
          ) : (
            <ul className="space-y-2.5">
              {stockAlerts.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{item.variant?.product?.name} — {item.variant?.size}/{item.variant?.color}</span>
                  <span className="text-red-600 font-medium">{item.quantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
