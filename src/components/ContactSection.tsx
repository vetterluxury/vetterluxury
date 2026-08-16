'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { whatsappLink } from '@/lib/utils';

export default function ContactSection() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const { data } = await supabase.from('site_settings').select('value').eq('key', 'contact_messages').single();
    const current = Array.isArray(data?.value) ? data!.value : [];

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'contact_messages', value: [...current, { ...form, sentAt: new Date().toISOString() }] });

    setStatus(error ? 'error' : 'done');
    if (!error) setForm({ nome: '', email: '', telefone: '', mensagem: '' });
  }

  return (
    <section id="contato" className="py-24 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="eyebrow">Contato</p>
          <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark mt-3">Fale com a Vetter Luxury</h2>
          <div className="gold-rule" />
          <p className="text-[#5c5450] text-sm mt-2">
            Atendimento personalizado para escolher a peça certa, tirar dúvidas sobre tamanhos ou acompanhar seu
            pedido.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-14">
          <div className="flex flex-col gap-6">
            <a
              href={whatsappLink('Olá! Conheci a Vetter Luxury pelo site e gostaria de receber atendimento.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <span className="w-12 h-12 rounded-full border border-gold flex items-center justify-center text-marsala flex-shrink-0">
                &#128222;
              </span>
              <span className="text-sm text-marsala-dark group-hover:text-gold transition-colors">+55 51 99676-7044</span>
            </a>
            <a href="mailto:vetterluxury@gmail.com" className="flex items-center gap-4 group">
              <span className="w-12 h-12 rounded-full border border-gold flex items-center justify-center text-marsala flex-shrink-0">
                &#9993;
              </span>
              <span className="text-sm text-marsala-dark group-hover:text-gold transition-colors">vetterluxury@gmail.com</span>
            </a>
            <a
              href="https://instagram.com/vetterluxury"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <span className="w-12 h-12 rounded-full border border-gold flex items-center justify-center text-marsala flex-shrink-0">
                &#9737;
              </span>
              <span className="text-sm text-marsala-dark group-hover:text-gold transition-colors">@vetterluxury</span>
            </a>
          </div>

          {status === 'done' ? (
            <p className="text-sm text-green-700 self-start">Mensagem enviada! Em breve entraremos em contato.</p>
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
              <p className="text-xs text-[#8a7d73]">
                Respondemos em até 24h úteis. Para atendimento imediato, use o WhatsApp.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
