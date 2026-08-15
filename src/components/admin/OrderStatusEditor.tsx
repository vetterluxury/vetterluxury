'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const STATUS_OPTIONS = [
  { value: 'payment_pending', label: 'Pagamento pendente' },
  { value: 'payment_approved', label: 'Pagamento aprovado' },
  { value: 'preparing', label: 'Em preparação' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function OrderStatusEditor({
  orderId,
  initialStatus,
  initialTracking,
}: {
  orderId: string;
  initialStatus: string;
  initialTracking: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase.from('orders').update({ order_status: status, tracking_code: tracking || null }).eq('id', orderId);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm space-y-4">
      <h2 className="font-heading text-lg text-marsala-dark">Status do Pedido</h2>
      <label className="label-field">
        Status
        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="label-field">
        Código de rastreamento
        <input className="input-field" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ex: BR123456789" />
      </label>
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
        {saving ? 'Salvando...' : 'Atualizar Pedido'}
      </button>
      {saved && <p className="text-xs text-green-700">Pedido atualizado!</p>}
    </div>
  );
}
