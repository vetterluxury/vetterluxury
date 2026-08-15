import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPreferenceClient } from '@/lib/mercadopago';
import { generateOrderNumber } from '@/lib/utils';

interface CheckoutItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  promoPrice: number | null;
  size: string;
  color: string;
  quantity: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  shippingAddress: {
    recipientName: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: 'pix' | 'credit_card';
  couponCode?: string;
  shipping?: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'É necessário estar logado para finalizar a compra.' }, { status: 401 });
  }

  const body: CheckoutBody = await request.json();

  if (!body.items?.length) {
    return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
  }

  const subtotal = body.items.reduce((sum, i) => sum + (i.promoPrice ?? i.price) * i.quantity, 0);
  const shipping = body.shipping ?? 0;

  // ---------- Validação e aplicação do cupom (revalidado no servidor) ----------
  let discount = 0;
  let couponId: string | null = null;

  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', body.couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (coupon) {
      const now = new Date();
      const validPeriod =
        (!coupon.starts_at || new Date(coupon.starts_at) <= now) &&
        (!coupon.expires_at || new Date(coupon.expires_at) >= now);
      const meetsMinimum = !coupon.min_order_value || subtotal >= coupon.min_order_value;

      if (validPeriod && meetsMinimum) {
        discount =
          coupon.discount_type === 'percentage' ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value;
        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }
  }

  const total = Math.max(subtotal - discount + shipping, 0);
  const orderNumber = generateOrderNumber();

  // ---------- Cria o pedido (status inicial: pagamento pendente) ----------
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: user.id,
      subtotal,
      discount,
      shipping,
      total,
      coupon_id: couponId,
      payment_method: body.paymentMethod,
      payment_status: 'pending',
      order_status: 'payment_pending',
      shipping_address: body.shippingAddress,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Não foi possível criar o pedido.' }, { status: 500 });
  }

  // ---------- Itens do pedido ----------
  const orderItems = body.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_name: item.name,
    size: item.size,
    color: item.color,
    unit_price: item.promoPrice ?? item.price,
    quantity: item.quantity,
  }));
  await supabase.from('order_items').insert(orderItems);

  if (couponId) {
    await supabase.from('coupon_usages').insert({ coupon_id: couponId, profile_id: user.id, order_id: order.id });
  }

  // ---------- Cria a preferência de pagamento no Mercado Pago ----------
  // Se as credenciais não estiverem configuradas, o pedido fica registrado
  // como "payment_pending" e retornamos um erro claro — não inventamos um
  // link de pagamento falso.
  try {
    const preferenceClient = getPreferenceClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const preference = await preferenceClient.create({
      body: {
        items: body.items.map((item) => ({
          id: item.productId,
          title: `${item.name} (${item.size}, ${item.color})`,
          quantity: item.quantity,
          unit_price: item.promoPrice ?? item.price,
          currency_id: 'BRL',
        })),
        payer: { email: user.email },
        back_urls: {
          success: `${siteUrl}/checkout/sucesso?pedido=${order.order_number}`,
          failure: `${siteUrl}/checkout?erro=pagamento`,
          pending: `${siteUrl}/checkout/sucesso?pedido=${order.order_number}&status=pending`,
        },
        auto_return: 'approved',
        external_reference: order.id,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        payment_methods:
          body.paymentMethod === 'pix'
            ? { excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }] }
            : { excluded_payment_types: [{ id: 'ticket' }] },
      },
    });

    await supabase
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      checkoutUrl: preference.init_point,
    });
  } catch (err) {
    // Pedido já está salvo — apenas o pagamento não pôde ser iniciado.
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao criar preferência de pagamento.';
    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.order_number,
        checkoutUrl: null,
        warning: `Pedido registrado, mas o pagamento online não pôde ser iniciado: ${message}`,
      },
      { status: 200 }
    );
  }
}
