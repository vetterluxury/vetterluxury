'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Provider = 'google' | 'apple';

/**
 * Botões "Continuar com Google" e "Continuar com Apple" (conta iCloud).
 * O botão da Apple só aparece quando a variável NEXT_PUBLIC_ENABLE_APPLE_LOGIN estiver
 * como "true" na Vercel, ou seja, depois que a Apple estiver configurada no Supabase.
 */
export default function SocialLogin({ next = '/conta' }: { next?: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState('');
  const appleEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN === 'true';

  async function handleLogin(provider: Provider) {
    setError('');
    setLoading(provider);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (oauthError) {
      setError('Não foi possível iniciar o login. Tente novamente.');
      setLoading(null);
    }
  }

  const buttonClass =
    'w-full border border-marsala-dark/30 bg-white text-ink text-sm tracking-wide py-3 rounded-sm hover:border-marsala-dark transition-colors disabled:opacity-60';

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => handleLogin('google')} disabled={loading !== null} className={buttonClass}>
        {loading === 'google' ? 'Abrindo o Google...' : 'Continuar com Google'}
      </button>
      {appleEnabled && (
        <button type="button" onClick={() => handleLogin('apple')} disabled={loading !== null} className={buttonClass}>
          {loading === 'apple' ? 'Abrindo a Apple...' : 'Continuar com Apple (iCloud)'}
        </button>
      )}
      {error && <p className="text-sm text-marsala">{error}</p>}
    </div>
  );
}
