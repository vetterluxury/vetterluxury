import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types/database';

export const revalidate = 0;

const STATUS_LABELS: Record<string, string> = {
  payment_pending: 'Pagamento pendente',
  payment_approved: 'Pagamento aprovado',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

type OrderRow = Order & { profile: { full_name: string | null } | null };

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, profile:profiles(full_name)')
    .order('created_at', { ascending: false });

  const rows = (orders ?? []) as unknown as OrderRow[];

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Pedidos</h1>

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Status</th>
              <th className="p-4">Data</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-marsala-dark/5">
                <td className="p-4 font-medium text-marsala-dark">{o.order_number}</td>
                <td className="p-4 text-ink/70">{o.profile?.full_name ?? '—'}</td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4 text-ink/70 capitalize">{o.payment_status}</td>
                <td className="p-4 text-ink/70">{STATUS_LABELS[o.order_status]}</td>
                <td className="p-4 text-ink/50">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-marsala underline text-xs">Ver detalhes</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-ink/50">Nenhum pedido registrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
