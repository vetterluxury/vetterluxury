'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProductStatusToggle({ productId, status }: { productId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(newStatus: string) {
    setCurrent(newStatus);
    await supabase.from('products').update({ status: newStatus }).eq('id', productId);
    startTransition(() => router.refresh());
  }

  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    draft: 'bg-amber-100 text-amber-800',
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className={`text-xs px-2.5 py-1.5 rounded-full border-0 font-medium ${colors[current]}`}
    >
      <option value="active">Ativo</option>
      <option value="inactive">Inativo</option>
      <option value="draft">Rascunho</option>
    </select>
  );
}
