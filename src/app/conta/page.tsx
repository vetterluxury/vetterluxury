'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Address } from '@/types/database';

export default function ContaPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setCpf(profile.cpf ?? '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', user.id)
      .then(({ data }) => setAddresses((data ?? []) as Address[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone, cpf }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function handleAddAddress() {
    if (!user) return;
    const label = prompt('Nome do endereço (ex: Casa, Trabalho):', 'Principal');
    const recipient = prompt('Nome do destinatário:');
    const street = prompt('Rua:');
    const number = prompt('Número:');
    const neighborhood = prompt('Bairro:');
    const city = prompt('Cidade:');
    const state = prompt('Estado (UF):');
    const zip = prompt('CEP:');
    if (!recipient || !street || !city) return;

    const { data } = await supabase
      .from('addresses')
      .insert({
        profile_id: user.id,
        label: label || 'Principal',
        recipient_name: recipient,
        street,
        number: number || 'S/N',
        neighborhood: neighborhood || '',
        city,
        state: state || '',
        zip_code: zip || '',
      })
      .select()
      .single();

    if (data) setAddresses((prev) => [...prev, data as Address]);
  }

  async function handleDeleteAddress(id: string) {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <div className="pt-40 pb-32 text-center">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Olá, {fullName || 'Cliente'}</h1>
        <div className="gold-rule" />
      </div>

      <div className="flex justify-center gap-4 mb-14 flex-wrap">
        <Link href="/conta/pedidos" className="btn-outline border-marsala-dark text-marsala-dark">Meus Pedidos</Link>
        <Link href="/favoritos" className="btn-outline border-marsala-dark text-marsala-dark">Favoritos</Link>
        <button onClick={handleLogout} className="btn-outline border-marsala-dark text-marsala-dark">Sair</button>
      </div>

      <section className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)] mb-10">
        <h2 className="font-heading text-xl text-marsala-dark mb-5">Dados Pessoais</h2>
        <form onSubmit={handleSaveProfile} className="grid sm:grid-cols-2 gap-5">
          <label className="label-field sm:col-span-2">
            Nome completo
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
          </label>
          <label className="label-field">
            Telefone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          </label>
          <label className="label-field">
            CPF
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} className="input-field" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {saved && <span className="text-xs text-green-700">Salvo!</span>}
          </div>
        </form>
      </section>

      <section className="bg-white p-8 rounded-sm shadow-[0_6px_20px_rgba(78,22,38,0.06)]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-heading text-xl text-marsala-dark">Endereços</h2>
          <button onClick={handleAddAddress} className="text-xs text-marsala underline">+ Adicionar</button>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-ink/50">Nenhum endereço cadastrado.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((a) => (
              <div key={a.id} className="flex justify-between items-start border-b border-marsala-dark/10 pb-4">
                <div className="text-sm">
                  <p className="font-medium text-marsala-dark">{a.label}</p>
                  <p className="text-ink/60">{a.recipient_name}</p>
                  <p className="text-ink/60">{a.street}, {a.number} — {a.neighborhood}</p>
                  <p className="text-ink/60">{a.city}/{a.state} — {a.zip_code}</p>
                </div>
                <button onClick={() => handleDeleteAddress(a.id)} className="text-xs text-marsala underline">Remover</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
