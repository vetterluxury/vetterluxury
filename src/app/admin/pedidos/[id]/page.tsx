import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import OrderStatusEditor from '@/components/admin/OrderStatusEditor';
import type { OrderItem } from '@/types/database';

export default async function AdminPedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*), profile:profiles(full_name, phone, cpf)')
    .eq('id', id)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as Record<string, string> | null;
  const items = (order.items ?? []) as OrderItem[];

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Pedido {order.order_number}</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h2 className="font-heading text-lg text-marsala-dark mb-4">Itens</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b border-marsala-dark/5 pb-3">
                  <span>{item.quantity}x {item.product_name} ({item.size}, {item.color})</span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-marsala-dark/10 space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Desconto</span><span>− {formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between"><span>Frete</span><span>{formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-heading text-marsala-dark text-base pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h2 className="font-heading text-lg text-marsala-dark mb-4">Cliente</h2>
            <p className="text-sm text-ink/70">{order.profile?.full_name ?? '—'}</p>
            <p className="text-sm text-ink/70">{order.profile?.phone ?? ''}</p>
          </div>

          {address && (
            <div className="bg-white p-6 rounded-sm shadow-sm">
              <h2 className="font-heading text-lg text-marsala-dark mb-4">Endereço de Entrega</h2>
              <p className="text-sm text-ink/70">
                {address.recipientName} — {address.street}, {address.number} {address.complement ? `(${address.complement})` : ''}
              </p>
              <p className="text-sm text-ink/70">{address.neighborhood}, {address.city}/{address.state} — {address.zipCode}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-sm shadow-sm">
            <h2 className="font-heading text-lg text-marsala-dark mb-4">Pagamento</h2>
            <p className="text-sm text-ink/70">Método: {order.payment_method === 'pix' ? 'Pix' : order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'Dinheiro'}</p>
            <p className="text-sm text-ink/70">Status: {order.payment_status}</p>
            {order.mp_payment_id && <p className="text-sm text-ink/70">ID Mercado Pago: {order.mp_payment_id}</p>}
          </div>
        </div>

        <OrderStatusEditor orderId={order.id} initialStatus={order.order_status} initialTracking={order.tracking_code} />
      </div>
    </div>
  );
}
