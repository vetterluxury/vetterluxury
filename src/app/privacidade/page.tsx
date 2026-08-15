import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Política de Privacidade' };

export default function PrivacidadePage() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="eyebrow">Institucional</p>
        <h1 className="font-heading text-3xl text-marsala-dark mt-3">Política de Privacidade</h1>
        <div className="gold-rule" />
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 space-y-5 leading-relaxed">
        <p>
          A Vetter Luxury respeita a privacidade de seus clientes e visitantes. Esta política explica quais dados
          coletamos, como usamos e como você pode exercer seus direitos, em conformidade com a Lei Geral de Proteção
          de Dados (LGPD — Lei nº 13.709/2018).
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">1. Dados que coletamos</h2>
        <p>
          Coletamos dados fornecidos diretamente por você no cadastro (nome, e-mail, telefone, CPF, endereço) e dados
          gerados pelo uso do site (produtos visualizados, itens no carrinho, pedidos realizados).
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">2. Como usamos seus dados</h2>
        <p>
          Utilizamos seus dados para processar pedidos, viabilizar entregas, prestar atendimento, prevenir fraudes e,
          mediante seu consentimento, enviar comunicações de marketing (newsletter).
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">3. Compartilhamento</h2>
        <p>
          Compartilhamos dados estritamente necessários com processadores de pagamento (Mercado Pago) e transportadoras,
          para viabilizar a compra e a entrega. Não vendemos seus dados a terceiros.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">4. Seus direitos</h2>
        <p>
          Você pode solicitar a qualquer momento a confirmação, correção, portabilidade ou exclusão dos seus dados,
          entrando em contato pelo e-mail vetterluxury@gmail.com.
        </p>
        <h2 className="font-heading text-xl text-marsala-dark pt-4">5. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito e
          controle de acesso por autenticação (Supabase Auth) com Row Level Security no banco de dados.
        </p>
        <p className="text-xs text-ink/50 pt-6">
          Este texto é um modelo inicial e não substitui a orientação de um profissional jurídico. Recomendamos revisão
          por um advogado antes da publicação definitiva.
        </p>
      </div>
    </div>
  );
}
