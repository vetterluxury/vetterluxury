'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/redefinir-senha`,
    });
    setStatus(error ? 'error' : 'done');
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Recuperar Senha</h1>
        <div className="gold-rule" />
      </div>

      {status === 'done' ? (
        <p className="text-center text-sm text-ink/70">
          Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="label-field">
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </label>
          {status === 'error' && <p className="text-sm text-marsala">Não foi possível enviar o e-mail. Tente novamente.</p>}
          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}
    </div>
  );
}
