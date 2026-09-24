import Link from 'next/link';
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
          Ao acessar e utilizar o site da Vetter Luxury, você concorda com os termos apresentados nesta página.
          Recomendamos a leitura das informações antes de realizar uma compra.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">1. Cadastro</h2>
        <p>
          Para comprar, é necessário criar uma conta com informações verdadeiras, completas e atualizadas. Você é
          responsável por manter a confidencialidade da sua senha.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">2. Produtos e preços</h2>
        <p>
          Preços, disponibilidade e descrições podem ser alterados sem aviso prévio, respeitando as condições
          aplicáveis à compra já realizada.
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
        <h2 className="font-heading text-xl text-marsala-dark pt-4">5. Trocas, devoluções e reembolsos</h2>
        <p>
          As condições aplicáveis a trocas, devoluções e reembolsos estão descritas na página{' '}
          <Link href="/trocas" className="underline decoration-gold underline-offset-2 hover:text-gold">
            Trocas e Devoluções
          </Link>{' '}
          da Vetter Luxury.
        </p>
      </div>
    </div>
  );
}
