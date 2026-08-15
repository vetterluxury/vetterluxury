'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : 'Não foi possível concluir o cadastro.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 2500);
  }

  if (done) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <p className="font-heading text-2xl text-marsala-dark mb-3">Cadastro realizado!</p>
        <p className="text-sm text-ink/60">
          Verifique seu e-mail para confirmar a conta. Você será redirecionada para o login.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Criar Conta</h1>
        <div className="gold-rule" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="label-field">
          Nome completo
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </label>
        <label className="label-field">
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </label>
        <label className="label-field">
          Senha
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </label>
        {error && <p className="text-sm text-marsala">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-marsala underline">Entrar</Link>
      </p>
    </div>
  );
}
