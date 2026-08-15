import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Termos de Uso' };

export default function TermosPage() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Institucional</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Termos de Uso</h1>
        <div className="gold-rule" />
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 space-y-5 leading-relaxed">
        <p>
          Ao acessar e utilizar o site da Vetter Luxury, você concorda com os termos descritos abaixo. Recomendamos a
          leitura completa antes de realizar uma compra.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">1. Cadastro</h2>
        <p>
          Para comprar, é necessário criar uma conta com informações verdadeiras, completas e atualizadas. Você é
          responsável por manter a confidencialidade da sua senha.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">2. Produtos e preços</h2>
        <p>
          Preços, disponibilidade e descrições podem ser alterados sem aviso prévio. Reservamo-nos o direito de
          corrigir eventuais erros de precificação antes da confirmação do pagamento.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">3. Pagamento</h2>
        <p>
          Os pagamentos são processados por meio do Mercado Pago (Pix e cartão de crédito). A Vetter Luxury não
          armazena dados completos de cartão de crédito.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">4. Entrega</h2>
        <p>
          Os prazos de entrega são estimados no momento do checkout e podem variar conforme a transportadora e a
          região de destino.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">5. Propriedade intelectual</h2>
        <p>
          Todo o conteúdo do site — textos, imagens, identidade visual e logotipo — pertence à Vetter Luxury e não pode
          ser reproduzido sem autorização.
        </p>
        <p className="text-xs text-ink/50 pt-6">
          Este texto é um modelo inicial e não substitui a orientação de um profissional jurídico. Recomendamos revisão
          por um advogado antes da publicação definitiva.
        </p>
      </div>
    </div>
  );
}
