'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password });
    setStatus(error ? 'error' : 'done');
    if (!error) setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Nova Senha</h1>
        <div className="gold-rule" />
      </div>

      {status === 'done' ? (
        <p className="text-center text-sm text-ink/70">Senha atualizada! Redirecionando para o login...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="label-field">
            Nova senha
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </label>
          {status === 'error' && <p className="text-sm text-marsala">Não foi possível atualizar a senha. O link pode ter expirado.</p>}
          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )}
    </div>
  );
}
