'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SocialLogin from '@/components/SocialLogin';
import { documentoTipo, maskDocumento } from '@/lib/documento';

function CadastroForm() {
  const [name, setName] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectParam = searchParams.get('redirect') || '';
  const next = redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/conta';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!documentoTipo(documento)) {
      setError('CPF ou CNPJ inválido. Confira os números.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, documento }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Não foi possível concluir o cadastro.');
        setLoading(false);
        return;
      }

      // Conta criada e já aprovada: entra direto, sem confirmar e-mail.
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signInError) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2500);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <p className="font-heading text-2xl text-marsala-dark mb-3">Cadastro realizado!</p>
        <p className="text-sm text-ink/60">Agora é só entrar com seu e-mail e senha. Você será redirecionada para o login.</p>
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

      <SocialLogin next={next} />

      <div className="flex items-center gap-3 my-7 text-xs text-ink/40 uppercase tracking-widest">
        <span className="flex-1 h-px bg-marsala-dark/15" />
        ou
        <span className="flex-1 h-px bg-marsala-dark/15" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="label-field">
          Nome completo
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </label>
        <label className="label-field">
          CPF ou CNPJ
          <input
            type="text"
            inputMode="text"
            required
            value={documento}
            onChange={(e) => setDocumento(maskDocumento(e.target.value))}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className="input-field"
          />
          <span className="text-[0.7rem] text-ink/45 mt-1 block">Usado para recuperar sua senha caso você esqueça.</span>
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
        <Link href={next === '/conta' ? '/login' : `/login?redirect=${encodeURIComponent(next)}`} className="text-marsala underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
