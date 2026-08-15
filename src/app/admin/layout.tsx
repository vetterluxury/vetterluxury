import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: { default: 'Painel Admin', template: '%s | Admin Vetter Luxury' },
  robots: { index: false, follow: false },
};

/**
 * O acesso a /admin/** já é validado em src/middleware.ts:
 *  - usuário precisa estar autenticado
 *  - profiles.is_admin precisa ser true
 * Este layout assume que, se chegou até aqui, o acesso é válido.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#faf6ef]">
      <AdminSidebar />
      <main className="flex-1 p-8 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
