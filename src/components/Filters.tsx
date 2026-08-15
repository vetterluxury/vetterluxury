'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Category, Collection } from '@/types/database';

interface FiltersProps {
  categories: Category[];
  collections: Collection[];
  colors: string[];
  sizes: string[];
}

export default function Filters({ categories, collections, colors, sizes }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3.5 justify-center mb-12">
      <select
        className="input-field !w-auto min-w-[150px]"
        value={searchParams.get('categoria') ?? ''}
        onChange={(e) => updateParam('categoria', e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        className="input-field !w-auto min-w-[150px]"
        value={searchParams.get('colecao') ?? ''}
        onChange={(e) => updateParam('colecao', e.target.value)}
      >
        <option value="">Todas as coleções</option>
        {collections.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        className="input-field !w-auto min-w-[130px]"
        value={searchParams.get('cor') ?? ''}
        onChange={(e) => updateParam('cor', e.target.value)}
      >
        <option value="">Todas as cores</option>
        {colors.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="input-field !w-auto min-w-[130px]"
        value={searchParams.get('tamanho') ?? ''}
        onChange={(e) => updateParam('tamanho', e.target.value)}
      >
        <option value="">Todos os tamanhos</option>
        {sizes.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className="input-field !w-auto min-w-[170px]"
        value={searchParams.get('ordenar') ?? ''}
        onChange={(e) => updateParam('ordenar', e.target.value)}
      >
        <option value="">Ordenar por</option>
        <option value="preco-asc">Menor preço</option>
        <option value="preco-desc">Maior preço</option>
        <option value="recentes">Mais recentes</option>
      </select>

      <input
        type="text"
        placeholder="Buscar peça..."
        defaultValue={searchParams.get('busca') ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') updateParam('busca', (e.target as HTMLInputElement).value);
        }}
        className="input-field !w-auto min-w-[200px]"
      />
    </div>
  );
}
