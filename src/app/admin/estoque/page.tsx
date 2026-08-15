'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InventoryRow {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  lowStockThreshold: number;
}

interface SupabaseInventoryRow {
  quantity: number;
  low_stock_threshold: number;
  variant: { id: string; size: string; color: string; product: { name: string } | null } | null;
}

export default function AdminEstoquePage() {
  const supabase = createClient();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  async function load() {
    const { data } = await supabase
      .from('inventory')
      .select('quantity, low_stock_threshold, variant:product_variants(id, size, color, product:products(name))');

    const typedData = (data ?? []) as unknown as SupabaseInventoryRow[];
    const mapped: InventoryRow[] = typedData
      .filter((row) => row.variant)
      .map((row) => ({
        variantId: row.variant!.id,
        productName: row.variant!.product?.name ?? '—',
        size: row.variant!.size,
        color: row.variant!.color,
        quantity: row.quantity,
        lowStockThreshold: row.low_stock_threshold,
      }));
    mapped.sort((a, b) => a.quantity - b.quantity);
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQuantity(variantId: string, quantity: number) {
    setRows((prev) => prev.map((r) => (r.variantId === variantId ? { ...r, quantity } : r)));
    await supabase.from('inventory').update({ quantity }).eq('variant_id', variantId);
  }

  const filtered = rows.filter((r) => r.productName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Estoque</h1>

      <input
        type="text"
        placeholder="Buscar produto..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="input-field !w-auto min-w-[240px] mb-6"
      />

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="p-4">Produto</th>
              <th className="p-4">Tamanho</th>
              <th className="p-4">Cor</th>
              <th className="p-4">Quantidade</th>
              <th className="p-4">Alerta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-ink/50">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-ink/50">Nenhuma variante de estoque encontrada.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.variantId} className="border-b border-marsala-dark/5">
                  <td className="p-4 font-medium text-marsala-dark">{r.productName}</td>
                  <td className="p-4 text-ink/70">{r.size}</td>
                  <td className="p-4 text-ink/70">{r.color}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={r.quantity}
                      onChange={(e) => updateQuantity(r.variantId, parseInt(e.target.value) || 0)}
                      className="input-field !w-20"
                    />
                  </td>
                  <td className="p-4">
                    {r.quantity <= r.lowStockThreshold && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700">Estoque baixo</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
