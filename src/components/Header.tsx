'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Coleções' },
  { href: '/produtos?destaque=caixa-misteriosa', label: 'Caixa Misteriosa' },
  { href: '/#sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdminArea = pathname?.startsWith('/admin');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isAdminArea) return null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-champagne/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-6">
        <nav className="hidden lg:flex gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.78rem] tracking-[0.12em] uppercase font-medium text-marsala-dark hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="mx-auto lg:mx-0">
          <Image
            src="/logo-vetter.png"
            alt="Vetter Luxury"
            width={140}
            height={140}
            className={`w-auto transition-all duration-300 ${scrolled ? 'h-11' : 'h-16'}`}
            priority
          />
        </Link>

        <div className="flex items-center gap-5">
          <button
            aria-label="Buscar"
            title="Buscar"
            onClick={() => setSearchOpen((s) => !s)}
            className="text-marsala-dark hover:text-gold transition-colors"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>
          <Link
            href={user ? '/favoritos' : '/login'}
            aria-label="Favoritos"
            title="Favoritos"
            className="text-marsala-dark hover:text-gold transition-colors"
          >
            <Heart size={19} strokeWidth={1.5} />
          </Link>
          <Link
            href={user ? '/conta' : '/login'}
            aria-label="Minha conta"
            title="Minha conta"
            className="text-marsala-dark hover:text-gold transition-colors"
          >
            <User size={19} strokeWidth={1.5} />
          </Link>
          <button
            aria-label="Carrinho"
            title="Carrinho"
            onClick={openCart}
            className="relative text-marsala-dark hover:text-gold transition-colors"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-marsala text-white text-[0.6rem] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <Link href="/produtos" className="btn-primary hidden lg:inline-block">
            Comprar Agora
          </Link>
          <button
            className="lg:hidden flex flex-col gap-1.5"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((m) => !m)}
          >
            <span className="w-6 h-px bg-marsala-dark" />
            <span className="w-6 h-px bg-marsala-dark" />
            <span className="w-6 h-px bg-marsala-dark" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="max-w-6xl mx-auto px-6 mt-4">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar peça, coleção, cor..."
            className="input-field"
          />
        </form>
      )}

      {menuOpen && (
        <nav className="lg:hidden fixed inset-0 top-0 right-0 h-screen w-4/5 max-w-xs bg-champagne-soft shadow-2xl flex flex-col gap-7 p-12 pt-24">
          <button
            className="absolute top-6 right-6 text-2xl text-marsala-dark"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            &times;
          </button>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-[0.1em] uppercase text-marsala-dark"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/produtos" onClick={() => setMenuOpen(false)} className="btn-primary text-center">
            Comprar Agora
          </Link>
        </nav>
      )}
    </header>
  );
}
