'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminNewsletterPage() {
  const supabase = createClient();
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'newsletter_emails').single();
      const list = Array.isArray(data?.value) ? (data!.value as string[]) : [];
      setEmails([...list].reverse()); // mais recente primeiro
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copiarTodos() {
    navigator.clipboard.writeText(emails.join(', '));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-2xl text-marsala-dark">Newsletter</h1>
        {emails.length > 0 && (
          <button onClick={copiarTodos} className="btn-outline border-marsala-dark text-marsala-dark text-sm">
            Copiar todos os e-mails
          </button>
        )}
      </div>
      <p className="text-sm text-ink/60 mb-8">
        {loading ? 'Carregando...' : `${emails.length} e-mail${emails.length === 1 ? '' : 's'} inscrito${emails.length === 1 ? '' : 's'}.`}
      </p>

      {loading ? null : emails.length === 0 ? (
        <p className="text-ink/50 bg-white p-8 rounded-sm text-center">Nenhum e-mail inscrito ainda.</p>
      ) : (
        <div className="bg-white rounded-sm shadow-sm divide-y divide-champagne">
          {emails.map((email, i) => (
            <div key={i} className="px-5 py-3 text-sm text-ink/80">
              {email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
