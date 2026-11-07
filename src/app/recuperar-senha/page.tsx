'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarSenhaPage() {
  const [identificador, setIdentificador] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || 'Não foi possível enviar o e-mail. Tente novamente.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setMessage('Erro de conexão. Tente novamente.');
      setStatus('error');
    }
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      <div className="text-center mb-10">
        <p className="eyebrow">Minha Conta</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Recuperar Senha</h1>
        <div className="gold-rule" />
      </div>

      {status === 'done' ? (
        <div className="text-center text-sm text-ink/70 flex flex-col gap-3">
          <p>
            Se encontrarmos uma conta com esses dados, enviaremos um link para redefinir a senha no e-mail cadastrado nela.
          </p>
          <p>O e-mail pode levar alguns minutos. Confira também a caixa de spam.</p>
          <Link href="/login" className="text-marsala underline mt-2">Voltar para o login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="label-field">
            E-mail, CPF ou CNPJ
            <input
              type="text"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="seu@email.com ou CPF/CNPJ"
              className="input-field"
            />
            <span className="text-[0.7rem] text-ink/45 mt-1 block">
              Por segurança, o link é sempre enviado para o e-mail cadastrado na conta.
            </span>
          </label>
          {status === 'error' && <p className="text-sm text-marsala">{message}</p>}
          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}
    </div>
  );
}
