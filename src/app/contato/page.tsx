'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { whatsappLink } from '@/lib/utils';

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    // Mensagens de contato são registradas em site_settings->contact_messages
    // para não exigir uma tabela extra. Para grande volume, crie uma tabela dedicada.
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'contact_messages').single();
    const current = Array.isArray(data?.value) ? data!.value : [];

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'contact_messages', value: [...current, { ...form, sentAt: new Date().toISOString() }] });

    setStatus(error ? 'error' : 'done');
    if (!error) setForm({ nome: '', email: '', telefone: '', mensagem: '' });
  }

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Contato</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Fale com a Vetter</h1>
        <div className="gold-rule" />
        <p className="text-[#5c5450] text-sm mt-2">
          Está com alguma dúvida ou quer atendimento personalizado? Respondemos com o mesmo cuidado de cada peça que
          criamos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-14">
        <div>
          <div className="mb-6">
            <p className="text-sm text-marsala-dark mb-1">
              <strong>WhatsApp:</strong>{' '}
              <a href={whatsappLink('Olá! Conheci a Vetter Luxury pelo site e gostaria de receber atendimento.')} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
                +55 51 99676-7044
              </a>
            </p>
            <p className="text-sm text-marsala-dark mb-1">
              <strong>Instagram:</strong>{' '}
              <a href="https://instagram.com/vetterluxury" target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
                @vetterluxury
              </a>
            </p>
            <p className="text-sm text-marsala-dark">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:vetterluxury@gmail.com" className="underline decoration-gold underline-offset-2 hover:text-gold">
                vetterluxury@gmail.com
              </a>
            </p>
          </div>
        </div>

        {status === 'done' ? (
          <p className="text-sm text-green-700">Mensagem enviada! Em breve entraremos em contato.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="label-field">
              Nome
              <input required type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input-field" />
            </label>
            <label className="label-field">
              E-mail
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </label>
            <label className="label-field">
              Telefone
              <input type="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="input-field" />
            </label>
            <label className="label-field">
              Mensagem
              <textarea required rows={4} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} className="input-field resize-y" />
            </label>
            {status === 'error' && <p className="text-sm text-marsala">Não foi possível enviar. Tente novamente.</p>}
            <button type="submit" disabled={status === 'loading'} className="btn-primary">
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
