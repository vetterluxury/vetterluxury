'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Coupon } from '@/types/database';

export default function AdminCuponsPage() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data ?? []) as Coupon[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setCode('');
    setDiscountValue('');
    setMinOrderValue('');
    setExpiresAt('');
    setUsageLimit('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      min_order_value: minOrderValue ? parseFloat(minOrderValue) : 0,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
    });

    await load();
    resetForm();
    setSaving(false);
  }

  async function toggleActive(c: Coupon) {
    await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cupom?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Cupons</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
                <th className="p-4">Código</th>
                <th className="p-4">Desconto</th>
                <th className="p-4">Validade</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-ink/50">Carregando...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-ink/50">Nenhum cupom criado ainda.</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-marsala-dark/5">
                    <td className="p-4 font-medium text-marsala-dark">{c.code}</td>
                    <td className="p-4 text-ink/70">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${c.discount_value.toFixed(2)}`}
                    </td>
                    <td className="p-4 text-ink/50">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : 'Sem validade'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`text-xs px-2.5 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {c.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-marsala underline text-xs">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm h-fit space-y-4">
          <h2 className="font-heading text-lg text-marsala-dark">Novo Cupom</h2>
          <label className="label-field">
            Código
            <input required className="input-field uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VETTER10" />
          </label>
          <label className="label-field">
            Tipo de desconto
            <select className="input-field" value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}>
              <option value="percentage">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </label>
          <label className="label-field">
            Valor do desconto
            <input required type="number" step="0.01" min="0" className="input-field" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </label>
          <label className="label-field">
            Pedido mínimo (R$)
            <input type="number" step="0.01" min="0" className="input-field" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} />
          </label>
          <label className="label-field">
            Validade
            <input type="date" className="input-field" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          <label className="label-field">
            Limite de usos
            <input type="number" min="0" className="input-field" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Ilimitado" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Criando...' : 'Criar Cupom'}
          </button>
        </form>
      </div>
    </div>
  );
}
