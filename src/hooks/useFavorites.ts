'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('favorites').select('product_id').eq('profile_id', user.id);
    setFavoriteIds(new Set((data ?? []).map((f) => f.product_id)));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function toggleFavorite(productId: string) {
    if (!user) return { requiresLogin: true };

    if (favoriteIds.has(productId)) {
      await supabase.from('favorites').delete().eq('profile_id', user.id).eq('product_id', productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({ profile_id: user.id, product_id: productId });
      setFavoriteIds((prev) => new Set(prev).add(productId));
    }
    return { requiresLogin: false };
  }

  return { favoriteIds, isFavorite: (id: string) => favoriteIds.has(id), toggleFavorite, loading };
}
