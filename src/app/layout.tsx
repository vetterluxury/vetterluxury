import type { Metadata } from 'next';
import { Cinzel, Playfair_Display, Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cinzel' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-playfair' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-cormorant' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-montserrat' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Vetter Luxury | Lingeries Exclusivas de Luxo',
    template: '%s | Vetter Luxury',
  },
  description:
    'Descubra a Vetter Luxury, referência em lingeries exclusivas que unem elegância, sensualidade e sofisticação. Uma experiência premium para mulheres que valorizam qualidade, autoestima e exclusividade.',
  openGraph: {
    title: 'Vetter Luxury | Lingeries Exclusivas de Luxo',
    description: 'Luxo, exclusividade e feminilidade em cada detalhe.',
    url: siteUrl,
    siteName: 'Vetter Luxury',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vetter Luxury | Lingeries Exclusivas de Luxo',
    description: 'Luxo, exclusividade e feminilidade em cada detalhe.',
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${playfair.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <body className="font-body font-light text-ink bg-champagne">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
