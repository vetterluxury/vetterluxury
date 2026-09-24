import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Propriedade Intelectual' };

export default function PropriedadeIntelectualPage() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Institucional</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Propriedade Intelectual</h1>
        <div className="gold-rule" />
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 space-y-5 leading-relaxed">
        <p>
          Todo o conteúdo disponibilizado no site da Vetter Luxury, incluindo textos, imagens, identidade visual,
          logotipo, elementos gráficos e demais materiais pertencentes à marca, não poderá ser reproduzido,
          distribuído ou utilizado sem autorização, quando protegido pela legislação aplicável.
        </p>
      </div>
    </div>
  );
}
