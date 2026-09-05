import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caixa Misteriosa',
  description:
    'Cada Caixa Misteriosa é cuidadosamente preparada para proporcionar uma experiência única, elegante e inesperada.',
};

export default function CaixaMisteriosaPage() {
  return (
    <div className="bg-champagne">
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(78,22,38,0.18)]">
              <Image
                src="/caixa-misteriosa-hero.jpg"
                alt="Caixa Misteriosa Vetter Luxury"
                width={1122}
                height={1402}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            <div className="hidden md:block absolute inset-[18px_-18px_-18px_18px] border border-gold -z-10 rounded-sm" />
          </div>

          <div className="text-center md:text-left">
            <p className="eyebrow">Caixa Misteriosa Vetter Luxury</p>
            <h1 className="font-heading text-3xl md:text-[2.6rem] text-marsala-dark leading-tight mt-3">
              Você escolhe viver a experiência.
              <br />
              Nós cuidamos da surpresa.
            </h1>
            <p className="text-[#4a4340] text-[0.98rem] max-w-md mx-auto md:mx-0 mt-6 mb-9 leading-relaxed">
              Cada Caixa Misteriosa é cuidadosamente preparada para proporcionar uma experiência única, elegante e
              inesperada.
            </p>
            <Link href="/produtos?destaque=caixa-misteriosa" className="btn-primary">
              Comprar Agora
            </Link>
            <p className="text-xs text-ink/50 mt-4">
              Escolha seu tamanho e cor de preferência na próxima tela — o conteúdo continua sendo surpresa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
