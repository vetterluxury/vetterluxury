'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types/database';

export default function AdminCategoriasPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description ?? '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { name, slug: slugify(name), description: description || null };

    if (editingId) {
      await supabase.from('categories').update(payload).eq('id', editingId);
    } else {
      await supabase.from('categories').insert(payload);
    }
    await load();
    resetForm();
    setSaving(false);
  }

  async function toggleActive(cat: Category) {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria? Produtos associados ficarão sem categoria.')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Categorias</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
                <th className="p-4">Nome</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-ink/50">Carregando...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-ink/50">Nenhuma categoria criada ainda.</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b border-marsala-dark/5">
                    <td className="p-4 font-medium text-marsala-dark">{c.name}</td>
                    <td className="p-4 text-ink/50">{c.slug}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`text-xs px-2.5 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {c.is_active ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => startEdit(c)} className="text-marsala underline text-xs">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-marsala underline text-xs">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm h-fit space-y-4">
          <h2 className="font-heading text-lg text-marsala-dark">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <label className="label-field">
            Nome
            <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="label-field">
            Descrição
            <textarea rows={3} className="input-field resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
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
