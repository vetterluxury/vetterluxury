import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const supabase = await createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/contato`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/termos`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/trocas`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active');

  const { data: collections } = await supabase.from('collections').select('slug').eq('is_active', true);

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/produtos/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${siteUrl}/colecoes/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
