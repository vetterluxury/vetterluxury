import Script from 'next/script';

/**
 * Só renderiza se NEXT_PUBLIC_GA_MEASUREMENT_ID estiver configurado.
 * Eventos de e-commerce (view_item, add_to_cart, begin_checkout, purchase)
 * são disparados em src/lib/analytics.ts, chamados nos pontos relevantes
 * do fluxo (página de produto, carrinho, checkout, confirmação de pedido).
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
