import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: orderCounts } = await supabase.from('orders').select('profile_id');
  const countsByProfile = new Map<string, number>();
  (orderCounts ?? []).forEach((o) => {
    if (o.profile_id) countsByProfile.set(o.profile_id, (countsByProfile.get(o.profile_id) ?? 0) + 1);
  });

  return (
    <div>
      <h1 className="font-heading text-2xl text-marsala-dark mb-8">Clientes</h1>

      <div className="bg-white rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-marsala-dark/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="p-4">Nome</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Pedidos</th>
              <th className="p-4">Cadastro</th>
              <th className="p-4">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-b border-marsala-dark/5">
                <td className="p-4 font-medium text-marsala-dark">{p.full_name ?? '—'}</td>
                <td className="p-4 text-ink/70">{p.phone ?? '—'}</td>
                <td className="p-4 text-ink/70">{countsByProfile.get(p.id) ?? 0}</td>
                <td className="p-4 text-ink/50">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  {p.is_admin ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-marsala/10 text-marsala-dark">Admin</span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Cliente</span>
                  )}
                </td>
              </tr>
            ))}
            {(profiles ?? []).length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-ink/50">Nenhum cliente cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink/40 mt-4">
        Para tornar um cliente administrador, execute a instrução SQL indicada no README (seção Supabase) usando o
        e-mail da conta dela.
      </p>
    </div>
  );
}
