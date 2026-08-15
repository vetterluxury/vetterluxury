'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types/database';

const STATUS_LABELS: Record<string, string> = {
  payment_pending: 'Pagamento pendente',
  payment_approved: 'Pagamento aprovado',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  payment_pending: 'bg-amber-100 text-amber-800',
  payment_approved: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MeusPedidosPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoadingOrders(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || loadingOrders) return <div className="pt-40 pb-32 text-center">Carregando...</div>;

  if (!user) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <p className="font-heading text-2xl text-marsala-dark mb-4">Entre para ver seus pedidos.</p>
        <Link href="/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Meus Pedidos</h1>
        <div className="gold-rule" />
      </div>

      {orders.length === 0 ? (
        <div className="text-center">
          <p className="text-ink/60 mb-6">Você ainda não fez nenhum pedido.</p>
          <Link href="/produtos" className="btn-primary">Explorar Coleções</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-heading text-marsala-dark">Pedido {order.order_number}</p>
                  <p className="text-xs text-ink/50">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.order_status]}`}>
                  {STATUS_LABELS[order.order_status]}
                </span>
              </div>
              <div className="text-sm text-ink/70 mb-3">
                {order.items?.map((item) => (
                  <p key={item.id}>{item.quantity}x {item.product_name} ({item.size}, {item.color})</p>
                ))}
              </div>
              {order.tracking_code && (
                <p className="text-xs text-marsala-dark mb-2">Rastreamento: <span className="font-medium">{order.tracking_code}</span></p>
              )}
              <p className="font-heading text-marsala-dark">{formatPrice(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
