'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ContactMessage = {
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  sentAt: string;
};

export default function AdminMensagensPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'contact_messages').single();
      const list = Array.isArray(data?.value) ? (data!.value as ContactMessage[]) : [];
      setMessages([...list].reverse()); // mais recente primeiro
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-2">Mensagens de Contato</h1>
      <p className="text-sm text-ink/60 mb-8">Mensagens enviadas pelo formulário da página "Contato" do site.</p>

      {loading ? (
        <p className="text-ink/50">Carregando...</p>
      ) : messages.length === 0 ? (
        <p className="text-ink/50 bg-white p-8 rounded-sm text-center">Nenhuma mensagem recebida ainda.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className="bg-white p-5 rounded-sm shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <p className="font-medium text-marsala-dark">{m.nome}</p>
                <p className="text-xs text-ink/50">
                  {new Date(m.sentAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
              <p className="text-sm text-ink/70 mb-1">
                <a href={`mailto:${m.email}`} className="underline decoration-gold underline-offset-2">
                  {m.email}
                </a>
                {m.telefone ? ` • ${m.telefone}` : ''}
              </p>
              <p className="text-sm text-ink/80 mt-3 whitespace-pre-wrap">{m.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
