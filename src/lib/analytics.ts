declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(event: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
}

export const analytics = {
  viewItem: (product: { id: string; name: string; price: number }) =>
    track('view_item', {
      currency: 'BRL',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price }],
    }),

  addToCart: (product: { id: string; name: string; price: number }, quantity: number) =>
    track('add_to_cart', {
      currency: 'BRL',
      value: product.price * quantity,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
    }),

  beginCheckout: (value: number) => track('begin_checkout', { currency: 'BRL', value }),

  purchase: (orderId: string, value: number) =>
    track('purchase', { transaction_id: orderId, currency: 'BRL', value }),
};
