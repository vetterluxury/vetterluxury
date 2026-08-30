import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'É necessário estar logado.' }, { status: 401 });
  }

  const { code, subtotal } = await request.json();

  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', String(code).toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (!coupon) {
    return NextResponse.json({ error: 'Cupom inválido ou inativo.' }, { status: 404 });
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return NextResponse.json({ error: 'Este cupom ainda não está disponível.' }, { status: 400 });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return NextResponse.json({ error: 'Este cupom expirou.' }, { status: 400 });
  }
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return NextResponse.json(
      { error: `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)} para usar este cupom.` },
      { status: 400 }
    );
  }
  if (coupon.usage_limit) {
    const { count } = await supabase
      .from('coupon_usages')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id);
    if ((count ?? 0) >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Este cupom atingiu o limite de usos.' }, { status: 400 });
    }
  }

  let discount = coupon.discount_type === 'percentage' ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value;
  discount = Math.min(discount, subtotal);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
  });
}
