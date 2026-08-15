import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Cliente Mercado Pago — SOMENTE server-side.
 * O MERCADOPAGO_ACCESS_TOKEN nunca deve ser exposto ao navegador
 * (por isso não tem o prefixo NEXT_PUBLIC_).
 *
 * Se a variável não estiver configurada, lançamos um erro claro em vez
 * de inventar um comportamento — assim a rota que chamar isso sem
 * credenciais configuradas falha de forma explícita, não silenciosa.
 */
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      'MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione-o em .env.local (veja .env.example) para habilitar pagamentos.'
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getPreferenceClient() {
  return new Preference(getMercadoPagoClient());
}

export function getPaymentClient() {
  return new Payment(getMercadoPagoClient());
}
