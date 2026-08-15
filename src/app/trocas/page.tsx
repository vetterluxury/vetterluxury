import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Trocas e Devoluções' };

export default function TrocasPage() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Institucional</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Trocas e Devoluções</h1>
        <div className="gold-rule" />
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 space-y-5 leading-relaxed">
        <h2 className="font-heading text-xl text-marsala-dark">Direito de arrependimento</h2>
        <p>
          Conforme o Código de Defesa do Consumidor (Art. 49), você tem até 7 dias corridos, a partir do recebimento
          do produto, para solicitar a devolução por arrependimento, desde que a peça esteja em sua embalagem original,
          sem uso e com a etiqueta higiênica intacta — por se tratar de peças íntimas.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">Trocas por defeito</h2>
        <p>
          Caso identifique algum defeito de fabricação, entre em contato em até 30 dias após o recebimento pelo nosso
          WhatsApp ou e-mail, informando o número do pedido e fotos do problema.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">Como solicitar</h2>
        <p>
          Envie uma mensagem para vetterluxury@gmail.com ou pelo WhatsApp +55 51 99676-7044 com o número do pedido e o
          motivo da troca ou devolução. Nossa equipe orientará os próximos passos, incluindo o envio da peça de volta.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">Reembolso</h2>
        <p>
          Após recebermos e avaliarmos a peça devolvida, o reembolso é processado no mesmo método de pagamento
          utilizado na compra, em até 10 dias úteis.
        </p>
        <p className="text-xs text-ink/50 pt-6">
          Este texto é um modelo inicial e não substitui a orientação de um profissional jurídico. Recomendamos revisão
          por um advogado antes da publicação definitiva.
        </p>
      </div>
    </div>
  );
}
