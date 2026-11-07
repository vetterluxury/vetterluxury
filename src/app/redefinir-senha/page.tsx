'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const router = useRouter();
  const supabase = createClient();

  // O link do e-mail traz o acesso no endereço (#access_token=...). Aqui ele é lido e vira uma sessão.
  useEffect(() => {
    async function prepare() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState(null, '', window.location.pathname);
        if (!error) {
          setReady(true);
          return;
        }
      }

      // Link no formato antigo (?code=) ou sessão já existente
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      else setInvalidLink(true);
    }
    prepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password });
    setStatus(error ? 'error' : 'done');
    if (!error) {
      await supabase.auth.signOut();
      setTimeout(() => router.push('/login'), 2000);
    }
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
      ) : invalidLink ? (
        <div className="text-center text-sm text-ink/70 flex flex-col gap-3">
          <p>Este link expirou ou já foi usado. Peça um novo link para continuar.</p>
          <Link href="/recuperar-senha" className="text-marsala underline">Pedir novo link</Link>
        </div>
      ) : !ready ? (
        <p className="text-center text-sm text-ink/60">Validando seu link...</p>
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
