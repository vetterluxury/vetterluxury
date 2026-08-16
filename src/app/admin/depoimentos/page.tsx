'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Testimonial } from '@/types/database';

export default function AdminTestimonialsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('testimonials').select('*').order('display_order');
    setItems((data ?? []) as Testimonial[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(t: Testimonial) {
    setEditingId(t.id);
    setName(t.customer_name);
    setLocation(t.customer_location ?? '');
    setQuote(t.quote);
    setRating(t.rating);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setLocation('');
    setQuote('');
    setRating(5);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !quote) return;
    setSaving(true);

    const payload = {
      customer_name: name,
      customer_location: location || null,
      quote,
      rating,
    };

    if (editingId) {
      await supabase.from('testimonials').update(payload).eq('id', editingId);
    } else {
      const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 1;
      await supabase.from('testimonials').insert({ ...payload, display_order: nextOrder });
    }
    await load();
    resetForm();
    setSaving(false);
  }

  async function toggleActive(t: Testimonial) {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este depoimento?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Depoimentos</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {loading ? (
            <p className="text-ink/50">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-ink/50 bg-white p-8 rounded-sm text-center">Nenhum depoimento cadastrado ainda.</p>
          ) : (
            items.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-sm shadow-sm flex gap-4 items-start">
                <div className="flex-1">
                  <p className="text-gold text-sm mb-1">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>
                  <p className="text-sm text-ink/80 italic mb-2">&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-medium text-marsala-dark text-sm">
                    {t.customer_name}{t.customer_location ? ` — ${t.customer_location}` : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <button
                    onClick={() => toggleActive(t)}
                    className={`text-xs px-2.5 py-1 rounded-full ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {t.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button onClick={() => startEdit(t)} className="text-marsala underline text-xs">Editar</button>
                  <button onClick={() => handleDelete(t.id)} className="text-marsala underline text-xs">Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm h-fit space-y-4">
          <h2 className="font-heading text-lg text-marsala-dark">{editingId ? 'Editar Depoimento' : 'Novo Depoimento'}</h2>
          <label className="label-field">
            Nome da cliente
            <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Camila R." />
          </label>
          <label className="label-field">
            Cidade (opcional)
            <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Porto Alegre" />
          </label>
          <label className="label-field">
            Depoimento
            <textarea required rows={4} className="input-field resize-y" value={quote} onChange={(e) => setQuote(e.target.value)} />
          </label>
          <label className="label-field">
            Estrelas
            <select className="input-field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} estrela{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-outline border-marsala-dark text-marsala-dark">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
