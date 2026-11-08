import Image from 'next/image';

/**
 * Letreiro em movimento (marquee): as palavras da marca passam sem parar, da direita para a esquerda,
 * separadas pela logo da loja. Para mudar as palavras, edite a lista abaixo.
 * Para mudar a velocidade, veja "--marquee-speed" em src/app/globals.css (maior = mais lento).
 */
const PALAVRAS = ['Luxo', 'Exclusividade', 'Sensualidade', 'Poder Feminino', 'Deslumbrante', 'Envolvente'];

function Grupo({ oculto = false }: { oculto?: boolean }) {
  return (
    <div className="flex items-center shrink-0" aria-hidden={oculto || undefined}>
      {[0, 1].map((rep) => (
        <div key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1 || undefined}>
          {PALAVRAS.map((palavra) => (
            <div key={palavra} className="flex items-center shrink-0">
              <Image src="/logo-vetter.png" alt="" width={49} height={44} className="h-11 w-auto mx-10" />
              <span className="font-label text-[0.8rem] md:text-sm tracking-[0.32em] uppercase text-marsala whitespace-nowrap">
                {palavra}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section
      aria-label="Vetter Luxury: luxo, exclusividade, sensualidade, poder feminino, deslumbrante e envolvente"
      className="bg-ivory border-y border-gold/40 py-4"
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
