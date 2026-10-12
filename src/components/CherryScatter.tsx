/**
 * CherryScatter: cerejinhas decorativas e discretas no fundo das seções.
 *
 * COMO USAR
 *   1. A seção que recebe as cerejas precisa ter as classes  "relative overflow-hidden".
 *   2. O conteúdo da seção precisa ter "relative z-10" (para ficar sempre acima das cerejas).
 *   3. Coloque <CherryScatter variant="hero" /> como PRIMEIRO filho da seção.
 *
 * COMO AJUSTAR (tudo fica neste arquivo)
 *   - OPACITY_MULTIPLIER: deixa todas mais claras (ex.: 0.7) ou mais fortes (ex.: 1.4).
 *   - SIZE_MULTIPLIER:    aumenta ou diminui todas as cerejas (ex.: 0.8 ou 1.3).
 *   - Quantidade/posição:  edite (ou apague linhas) da lista do tipo desejado em PRESETS.
 *       top / left / right: posição em porcentagem dentro da seção
 *       size:    tamanho em pixels
 *       rotate:  inclinação em graus
 *       opacity: transparência individual (0 a 1)
 *       mobile:  true = também aparece em celular (as demais ficam só em telas maiores)
 *
 * As cerejas ficam sempre nas margens laterais, longe do texto, e não bloqueiam cliques.
 */

const OPACITY_MULTIPLIER = 1.6;
const SIZE_MULTIPLIER = 1.2;

type Dot = {
  top: string;
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  opacity: number;
  mobile?: boolean;
};

const PRESETS: Record<'hero' | 'sobre' | 'caixa' | 'diferenciais', Dot[]> = {
  hero: [
    { top: '10%', left: '6%', size: 20, rotate: -18, opacity: 0.16, mobile: true },
    { top: '20%', right: '9%', size: 16, rotate: 14, opacity: 0.14 },
    { top: '36%', left: '12%', size: 14, rotate: 8, opacity: 0.12 },
    { top: '46%', right: '5%', size: 22, rotate: -10, opacity: 0.15 },
    { top: '62%', left: '4%', size: 18, rotate: 20, opacity: 0.14 },
    { top: '72%', right: '13%', size: 14, rotate: -24, opacity: 0.12 },
    { top: '86%', left: '15%', size: 16, rotate: 10, opacity: 0.13, mobile: true },
    { top: '90%', right: '7%', size: 20, rotate: -6, opacity: 0.15, mobile: true },
  ],
  sobre: [
    { top: '8%', left: '3%', size: 18, rotate: -12, opacity: 0.14 },
    { top: '30%', right: '2%', size: 16, rotate: 16, opacity: 0.12 },
    { top: '70%', left: '2%', size: 14, rotate: 22, opacity: 0.12 },
    { top: '88%', right: '4%', size: 20, rotate: -8, opacity: 0.14, mobile: true },
  ],
  caixa: [
    { top: '10%', right: '3%', size: 18, rotate: 12, opacity: 0.14 },
    { top: '55%', left: '2%', size: 16, rotate: -16, opacity: 0.12 },
    { top: '90%', right: '6%', size: 14, rotate: 6, opacity: 0.12, mobile: true },
  ],
  diferenciais: [
    { top: '12%', left: '4%', size: 16, rotate: 10, opacity: 0.12 },
    { top: '25%', right: '3%', size: 20, rotate: -14, opacity: 0.14 },
    { top: '82%', left: '3%', size: 18, rotate: -6, opacity: 0.12, mobile: true },
    { top: '90%', right: '5%', size: 14, rotate: 18, opacity: 0.12 },
  ],
};

export default function CherryScatter({ variant }: { variant: keyof typeof PRESETS }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {PRESETS[variant].map((dot, i) => {
        const size = Math.round(dot.size * SIZE_MULTIPLIER);
        return (
          <span
            key={i}
            className={`cherry-dot ${dot.mobile ? '' : 'hidden md:block'}`}
            style={{
              top: dot.top,
              left: dot.left,
              right: dot.right,
              width: size,
              height: size,
              opacity: Math.min(1, dot.opacity * OPACITY_MULTIPLIER),
              transform: `rotate(${dot.rotate}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
