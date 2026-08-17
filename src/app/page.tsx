import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import MysteryBox from '@/components/MysteryBox';
import CollectionsShowcase from '@/components/CollectionsShowcase';
import Differentials from '@/components/Differentials';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import ContactSection from '@/components/ContactSection';
import type { Product, Collection, Banner, Testimonial } from '@/types/database';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: banner }, { data: showcase }, { data: collections }, { data: testimonialData }] = await Promise.all([
    supabase.from('banners').select('*').eq('placement', 'home').eq('is_active', true).order('display_order').limit(1).maybeSingle(),
    supabase
      .from('products')
      .select('*, category:categories(*), collection:collections(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase.from('collections').select('*').eq('is_active', true).order('display_order').limit(6),
    supabase.from('testimonials').select('*').eq('is_active', true).order('display_order').limit(10),
  ]);

  const heroBanner = banner as Banner | null;
  const showcaseProducts = (showcase ?? []) as Product[];
  const collectionList = (collections ?? []) as Collection[];
  const testimonials = (testimonialData ?? []) as Testimonial[];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-b from-champagne-soft via-champagne to-champagne">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(900px,130vw)] h-[min(900px,130vw)] opacity-[0.16] pointer-events-none"
          style={{
            backgroundImage: "url('/logo-vetter.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-3xl px-6">
          <p className="eyebrow">Vetter Luxury</p>
          <h1 className="font-display font-normal text-[clamp(3.4rem,9vw,6.4rem)] text-marsala-dark leading-none mt-4 mb-2">
            Vetter Luxury
          </h1>
          <p className="font-heading italic text-marsala text-lg md:text-xl mb-4">
            {heroBanner?.subtitle ?? 'Lingerie de luxo, exclusividade e feminilidade em cada detalhe.'}
          </p>
          <p className="text-[#5c4f47] text-sm max-w-md mx-auto mb-10">
            Descubra coleções exclusivas criadas para mulheres que desejam sentir-se únicas, confiantes e sofisticadas.
          </p>
          <div className="flex gap-5 justify-center flex-wrap">
            <Link href="/produtos" className="btn-primary">Conheça a Coleção</Link>
            <Link href="/produtos?destaque=caixa-misteriosa" className="btn-outline border-marsala-dark text-marsala-dark">
              Caixa Misteriosa
              
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- INSTITUCIONAL ---------- */}
      <section id="sobre" className="py-28 md:py-32">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-champagne-soft rounded-sm flex items-center justify-center p-10">
              <Image src="/logo-vetter.png" alt="Vetter Luxury" width={400} height={400} className="object-contain w-full h-full" />
            </div>
            <div className="hidden md:block absolute inset-[18px_-18px_-18px_18px] border border-gold -z-10 rounded-sm" />
          </div>
          <div>
            <p className="eyebrow">A Marca</p>
            <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark leading-tight mt-3">
              Muito além de<br />uma lingerie de luxo.
            </h2>
            <div className="gold-rule !mx-0" />
            <p className="text-[#4a4340] text-[0.96rem] mb-3.5 max-w-md">
              Na Vetter Luxury acreditamos que vestir-se bem começa pela lingerie de luxo. Cada peça de lingerie é cuidadosamente selecionada
              para proporcionar elegância, conforto, sensualidade e autoestima.
            </p>
            <p className="text-[#4a4340] text-[0.96rem] max-w-md">
              Mais do que produtos, entregamos experiências exclusivas para mulheres que valorizam o luxo em cada detalhe.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- CAIXA MISTERIOSA ---------- */}
      <MysteryBox />

      {/* ---------- COLEÇÕES ---------- */}
      <CollectionsShowcase collections={collectionList} products={showcaseProducts} />

      {/* ---------- DIFERENCIAIS ---------- */}
      <Differentials />

      {/* ---------- DEPOIMENTOS ---------- */}
      <Testimonials testimonials={testimonials} />

      {/* ---------- INSTAGRAM ---------- */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="eyebrow">Instagram</p>
          <h2 className="font-heading text-3xl text-marsala-dark mt-3">@vetterluxury</h2>
          <div className="gold-rule" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3.5 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-champagne-soft to-[#e6d8c0] flex items-center justify-center text-marsala/30 text-xl">
                &#10022;
              </div>
            ))}
          </div>
          <a
            href="https://instagram.com/vetterluxury"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline border-marsala-dark text-marsala-dark inline-block mt-9"
          >
            Seguir no Instagram
          </a>
        </div>
      </section>

      <Newsletter />

      {/* ---------- CONTATO ---------- */}
      <ContactSection />
    </>
  );
}
