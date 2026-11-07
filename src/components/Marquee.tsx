import Image from 'next/image';

/**
 * Letreiro em movimento (marquee): a logo, o nome da loja e as palavras da marca passam
 * sem parar, da direita para a esquerda. Para mudar as palavras, edite a lista abaixo.
 * Para mudar a velocidade, veja "--marquee-speed" em src/app/globals.css (maior = mais lento).
 */
const PALAVRAS = ['Luxo', 'Exclusividade', 'Sensualidade', 'Poder Feminino', 'Deslumbrante', 'Envolvente'];

function Cereja() {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 w-4 h-5 bg-contain bg-no-repeat bg-center opacity-80"
      style={{ backgroundImage: "url('/cherry-dot.png')" }}
    />
  );
}

function Grupo({ oculto = false }: { oculto?: boolean }) {
  return (
    <div className="flex items-center shrink-0" aria-hidden={oculto || undefined}>
      {[0, 1].map((rep) => (
        <div key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1 || undefined}>
          <div className="flex items-center gap-4 px-8">
            <Image src="/logo-vetter.png" alt="" width={45} height={40} className="h-10 w-auto" />
            <span className="font-brand text-3xl text-marsala-dark whitespace-nowrap">Vetter Luxury</span>
          </div>
          {PALAVRAS.map((palavra) => (
            <div key={palavra} className="flex items-center shrink-0">
              <Cereja />
              <span className="font-label text-[0.8rem] md:text-sm tracking-[0.32em] uppercase text-marsala whitespace-nowrap px-8">
                {palavra}
              </span>
            </div>
          ))}
          <Cereja />
        </div>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section
      aria-label="Vetter Luxury: luxo, exclusividade, sensualidade, poder feminino, deslumbrante e envolvente"
      className="bg-ivory border-y border-gold/40 py-5"
    >
      <div className="marquee">
        <div className="marquee-track">
          <Grupo />
          <Grupo oculto />
        </div>
      </div>
    </section>
  );
}
