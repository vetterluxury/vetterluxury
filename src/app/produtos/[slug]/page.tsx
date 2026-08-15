import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductGallery from '@/components/ProductGallery';
import ProductDetailForm from '@/components/ProductDetailForm';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types/database';

export const revalidate = 60;

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select(
      '*, category:categories(*), collection:collections(*), images:product_images(*), variants:product_variants(*, inventory(quantity, low_stock_threshold))'
    )
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Product | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produto não encontrado' };

  return {
    title: product.name,
    description: product.description ?? `${product.name} — Vetter Luxury, lingerie exclusiva de luxo.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.main_image_url ? [product.main_image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: related } = await supabase
    .from('products')
    .select('*, category:categories(*), collection:collections(*)')
    .eq('status', 'active')
    .eq('collection_id', product.collection_id ?? '')
    .neq('id', product.id)
    .limit(3);

  const images = [
    product.main_image_url,
    ...(product.images ?? []).sort((a, b) => a.display_order - b.display_order).map((i) => i.image_url),
  ].filter((v): v is string => Boolean(v));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: images,
    sku: product.sku ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.promo_price ?? product.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid md:grid-cols-2 gap-14">
        <ProductGallery images={images} productName={product.name} />
        <ProductDetailForm product={product} />
      </div>

      {related && related.length > 0 && (
        <section className="mt-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="eyebrow">Você também vai gostar</p>
            <h2 className="font-heading text-2xl md:text-3xl text-marsala-dark mt-3">Produtos Relacionados</h2>
            <div className="gold-rule" />
          </div>
          <ProductGrid products={related as Product[]} />
        </section>
      )}
    </div>
  );
}
