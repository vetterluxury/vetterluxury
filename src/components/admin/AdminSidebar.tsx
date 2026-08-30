'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '◆' },
  { href: '/admin/produtos', label: 'Produtos', icon: '✦' },
  { href: '/admin/categorias', label: 'Categorias', icon: '▤' },
  { href: '/admin/colecoes', label: 'Coleções', icon: '❖' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '⛁' },
  { href: '/admin/clientes', label: 'Clientes', icon: '☺' },
  { href: '/admin/cupons', label: 'Cupons', icon: '⌗' },
  { href: '/admin/banners', label: 'Banners', icon: '▭' },
  { href: '/admin/depoimentos', label: 'Depoimentos', icon: '❝' },
  { href: '/admin/mensagens', label: 'Mensagens', icon: '✉' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '✦' },
  { href: '/admin/estoque', label: 'Estoque', icon: '⚑' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-marsala-dark text-champagne min-h-screen flex flex-col">
      <div className="p-7 border-b border-champagne/10">
        <p className="font-heading text-xl text-champagne">Vetter Luxury</p>
        <p className="text-[0.68rem] tracking-[0.2em] uppercase text-gold mt-1">Painel Admin</p>
      </div>
      <nav className="flex-1 py-4">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin' && pathname?.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-7 py-3 text-sm transition-colors ${
                active ? 'bg-champagne/10 text-gold border-r-2 border-gold' : 'text-champagne/75 hover:text-gold'
              }`}
            >
              <span className="w-4 text-center">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-7 border-t border-champagne/10 flex flex-col gap-3">
        <Link href="/" className="text-xs text-champagne/60 hover:text-gold">← Voltar para o site</Link>
        <button onClick={handleLogout} className="text-xs text-champagne/60 hover:text-gold text-left">
          Sair
        </button>
      </div>
    </aside>
  );
}
