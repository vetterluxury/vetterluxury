import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, message: 'Informe um código de cupom.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ valid: false, message: 'Cupom não encontrado ou inativo.' }, { status: 404 });
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return NextResponse.json({ valid: false, message: 'Este cupom ainda não está disponível.' }, { status: 400 });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return NextResponse.json({ valid: false, message: 'Este cupom expirou.' }, { status: 400 });
  }
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return NextResponse.json(
      { valid: false, message: `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)} para usar este cupom.` },
      { status: 400 }
    );
  }
  if (coupon.usage_limit) {
    const { count } = await supabase
      .from('coupon_usages')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id);
    if ((count ?? 0) >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, message: 'Este cupom atingiu o limite de usos.' }, { status: 400 });
    }
  }

  const discount =
    coupon.discount_type === 'percentage' ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value;

  return NextResponse.json({
    valid: true,
    coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discount_type, discountValue: coupon.discount_value },
    discount: Math.min(discount, subtotal),
  });
}
