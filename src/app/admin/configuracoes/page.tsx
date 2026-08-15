'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ContactMessage {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  sentAt: string;
}

export default function AdminConfiguracoesPage() {
  const supabase = createClient();
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'contact_email', 'instagram_handle', 'contact_messages', 'newsletter_emails']);

      (data ?? []).forEach((row) => {
        if (row.key === 'whatsapp_number') setWhatsapp(String(row.value).replace(/"/g, ''));
        if (row.key === 'contact_email') setEmail(String(row.value).replace(/"/g, ''));
        if (row.key === 'instagram_handle') setInstagram(String(row.value).replace(/"/g, ''));
        if (row.key === 'contact_messages' && Array.isArray(row.value)) setMessages((row.value as ContactMessage[]).slice().reverse());
        if (row.key === 'newsletter_emails' && Array.isArray(row.value)) setNewsletterCount(row.value.length);
      });
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'whatsapp_number', value: whatsapp }),
      supabase.from('site_settings').upsert({ key: 'contact_email', value: email }),
      supabase.from('site_settings').upsert({ key: 'instagram_handle', value: instagram }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Configurações</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSave} className="bg-white p-7 rounded-sm shadow-sm space-y-4 h-fit">
          <h2 className="font-heading text-lg text-marsala-dark mb-2">Contato</h2>
          <p className="text-xs text-ink/50 mb-4">
            Estes dados ficam salvos e disponíveis para consulta, mas os botões de WhatsApp do site (header, produtos,
            rodapé) usam hoje a variável de ambiente <code className="bg-marsala/5 px-1 rounded">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
            Para trocar o número usado nesses botões, atualize essa variável na Vercel e redeploy — ver README.
          </p>
          <label className="label-field">
            Número do WhatsApp (formato internacional, sem +)
            <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5551996767044" />
          </label>
          <label className="label-field">
            E-mail de contato
            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="label-field">
            Instagram (@usuário)
            <input className="input-field" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </label>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          {saved && <p className="text-xs text-green-700">Salvo!</p>}
        </form>

        <div className="space-y-6">
          <div className="bg-white p-7 rounded-sm shadow-sm">
            <h2 className="font-heading text-lg text-marsala-dark mb-1">Newsletter</h2>
            <p className="text-sm text-ink/60">{newsletterCount} e-mails inscritos.</p>
          </div>

          <div className="bg-white p-7 rounded-sm shadow-sm">
            <h2 className="font-heading text-lg text-marsala-dark mb-4">Mensagens de Contato</h2>
            {messages.length === 0 ? (
              <p className="text-sm text-ink/50">Nenhuma mensagem recebida ainda.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className="text-sm border-b border-marsala-dark/5 pb-3">
                    <p className="font-medium text-marsala-dark">{m.nome} — {m.email}</p>
                    <p className="text-ink/60">{m.mensagem}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
