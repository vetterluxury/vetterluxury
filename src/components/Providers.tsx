'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/contexts/CartContext';
import CartDrawer from './CartDrawer';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
