'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Banner } from '@/types/database';

export default function AdminBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [placement, setPlacement] = useState<'home' | 'collection' | 'category'>('home');
  const [image, setImage] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('banners').select('*').order('display_order');
    setBanners((data ?? []) as Banner[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setTitle(b.title ?? '');
    setSubtitle(b.subtitle ?? '');
    setLinkUrl(b.link_url ?? '');
    setPlacement(b.placement);
    setImage([b.image_url]);
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setLinkUrl('');
    setPlacement('home');
    setImage([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (image.length === 0) return;
    setSaving(true);

    const payload = {
      title: title || null,
      subtitle: subtitle || null,
      link_url: linkUrl || null,
      placement,
      image_url: image[0],
    };

    if (editingId) {
      await supabase.from('banners').update(payload).eq('id', editingId);
    } else {
      await supabase.from('banners').insert(payload);
    }
    await load();
    resetForm();
    setSaving(false);
  }

  async function toggleActive(b: Banner) {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Banners</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {loading ? (
            <p className="text-ink/50">Carregando...</p>
          ) : banners.length === 0 ? (
            <p className="text-ink/50 bg-white p-8 rounded-sm text-center">Nenhum banner cadastrado ainda.</p>
          ) : (
            banners.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-sm shadow-sm flex gap-4 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image_url} alt={b.title ?? ''} className="w-28 h-16 object-cover rounded-sm" />
                <div className="flex-1">
                  <p className="font-medium text-marsala-dark">{b.title || '(sem título)'}</p>
                  <p className="text-xs text-ink/50">{b.placement}</p>
                </div>
                <button
                  onClick={() => toggleActive(b)}
                  className={`text-xs px-2.5 py-1 rounded-full ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  {b.is_active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => startEdit(b)} className="text-marsala underline text-xs">Editar</button>
                <button onClick={() => handleDelete(b.id)} className="text-marsala underline text-xs">Excluir</button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm h-fit space-y-4">
          <h2 className="font-heading text-lg text-marsala-dark">{editingId ? 'Editar Banner' : 'Novo Banner'}</h2>
          <label className="label-field">
            Título
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="label-field">
            Subtítulo
            <input className="input-field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
          <label className="label-field">
            Link (opcional)
            <input className="input-field" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/produtos" />
          </label>
          <label className="label-field">
            Posição
            <select className="input-field" value={placement} onChange={(e) => setPlacement(e.target.value as 'home' | 'collection' | 'category')}>
              <option value="home">Página Inicial</option>
              <option value="collection">Coleção</option>
              <option value="category">Categoria</option>
            </select>
          </label>
          <div>
            <p className="label-field mb-2">Imagem</p>
            <ImageUploader bucket="banners" value={image} onChange={setImage} multiple={false} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving || image.length === 0} className="btn-primary flex-1">
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
