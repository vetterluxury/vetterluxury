'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    // Newsletter é guardada em site_settings como uma lista simples.
    // Para volume maior, crie uma tabela `newsletter_subscribers` dedicada.
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'newsletter_emails').single();
    const current: string[] = Array.isArray(data?.value) ? (data!.value as string[]) : [];

    if (current.includes(email)) {
      setStatus('done');
      return;
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'newsletter_emails', value: [...current, email] });

    setStatus(error ? 'error' : 'done');
    if (!error) setEmail('');
  }

  return (
    <section className="bg-marsala-dark py-20">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="eyebrow">Newsletter</p>
        <h2 className="font-heading text-2xl md:text-3xl text-champagne mt-3 mb-2">Receba em primeira mão</h2>
        <p className="text-champagne/70 text-sm mb-8">Novidades, coleções exclusivas e convites especiais Vetter Luxury.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field sm:max-w-xs"
          />
          <button type="submit" disabled={status === 'loading'} className="btn-primary whitespace-nowrap">
            {status === 'loading' ? 'Enviando...' : 'Quero receber'}
          </button>
        </form>
        {status === 'done' && <p className="text-gold text-xs mt-4">Inscrição confirmada — obrigada!</p>}
        {status === 'error' && <p className="text-red-300 text-xs mt-4">Não foi possível concluir. Tente novamente.</p>}
      </div>
    </section>
  );
}
