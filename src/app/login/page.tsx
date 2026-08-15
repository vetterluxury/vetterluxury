'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError('E-mail ou senha incorretos.');
      return;
    }
    router.push(searchParams.get('redirect') || '/conta');
    router.refresh();
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Entrar</h1>
        <div className="gold-rule" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="label-field">
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </label>
        <label className="label-field">
          Senha
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </label>
        {error && <p className="text-sm text-marsala">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="text-center mt-6 flex flex-col gap-2">
        <Link href="/recuperar-senha" className="text-xs text-marsala-dark underline">Esqueci minha senha</Link>
        <p className="text-sm text-ink/60 mt-2">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="text-marsala underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
