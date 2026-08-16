import Image from 'next/image';
import Link from 'next/link';

export default function MysteryBox() {
  return (
    <section className="py-24 md:py-32 bg-champagne-soft/50">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        <div className="relative order-2 md:order-1">
          <div className="aspect-[4/5] rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(78,22,38,0.18)]">
            <Image
              src="/mystery-box.jpg"
              alt="Caixa Misteriosa Vetter Luxury"
              width={800}
              height={1000}
              className="object-cover w-full h-full"
              priority={false}
            />
          </div>
          <div className="hidden md:block absolute inset-[18px_-18px_-18px_18px] border border-gold -z-10 rounded-sm" />
        </div>

        <div className="order-1 md:order-2 text-center md:text-left">
          <p className="eyebrow">Caixa Misteriosa Vetter Luxury</p>
          <h2 className="font-heading text-3xl md:text-4xl text-marsala-dark leading-tight mt-3">
            O mistério é o<br />primeiro luxo.
          </h2>
          <p className="font-heading italic text-marsala text-lg mt-3 mb-5">
            O restante... você descobre ao abrir.
          </p>
          <p className="text-[#4a4340] text-[0.96rem] max-w-md mx-auto md:mx-0 mb-8">
            Dentro da Caixa Misteriosa você encontrará uma lingerie totalmente exclusiva, cuidadosamente escolhida
            para surpreender você. Cada caixa é única e nunca haverá duas experiências iguais.
          </p>
          <Link href="/produtos?destaque=caixa-misteriosa" className="btn-primary">
            Quero Descobrir Meu Luxo
          </Link>
        </div>
      </div>
    </section>
  );
}
