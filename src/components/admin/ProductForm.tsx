'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import ImageUploader from './ImageUploader';
import type { Category, Collection, Product, ProductStatus } from '@/types/database';

interface VariantRow {
  size: string;
  color: string;
  quantity: number;
}

interface ProductFormProps {
  categories: Category[];
  collections: Collection[];
  initialProduct?: Product;
}

export default function ProductForm({ categories, collections, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [additionalInfo, setAdditionalInfo] = useState(initialProduct?.additional_info ?? '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? '');
  const [promoPrice, setPromoPrice] = useState(initialProduct?.promo_price?.toString() ?? '');
  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id ?? '');
  const [collectionId, setCollectionId] = useState(initialProduct?.collection_id ?? '');
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status ?? 'draft');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isNew, setIsNew] = useState(initialProduct?.is_new ?? false);
  const [isOnSale, setIsOnSale] = useState(initialProduct?.is_on_sale ?? false);
  const [mainImage, setMainImage] = useState<string[]>(initialProduct?.main_image_url ? [initialProduct.main_image_url] : []);
  const [gallery, setGallery] = useState<string[]>((initialProduct?.images ?? []).map((i) => i.image_url));

  const [sizesInput, setSizesInput] = useState(initialProduct?.sizes?.join(', ') ?? '');
  const [colorsInput, setColorsInput] = useState(initialProduct?.colors?.join(', ') ?? '');
  const [variants, setVariants] = useState<VariantRow[]>(
    (initialProduct?.variants ?? []).map((v) => ({
      size: v.size,
      color: v.color,
      quantity: v.inventory?.quantity ?? 0,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sizes = sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
  const colors = colorsInput.split(',').map((c) => c.trim()).filter(Boolean);

  function generateVariantGrid() {
    const rows: VariantRow[] = [];
    sizes.forEach((s) => {
      colors.forEach((c) => {
        const existing = variants.find((v) => v.size === s && v.color === c);
        rows.push({ size: s, color: c, quantity: existing?.quantity ?? 0 });
      });
    });
    setVariants(rows);
  }

  function updateVariantQty(size: string, color: string, quantity: number) {
    setVariants((prev) => prev.map((v) => (v.size === size && v.color === color ? { ...v, quantity } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const productPayload = {
        name,
        slug: slugify(name),
        description: description || null,
        additional_info: additionalInfo || null,
        price: parseFloat(price) || 0,
        promo_price: promoPrice ? parseFloat(promoPrice) : null,
        sku: sku || null,
        category_id: categoryId || null,
        collection_id: collectionId || null,
        sizes,
        colors,
        main_image_url: mainImage[0] ?? null,
        status,
        is_featured: isFeatured,
        is_new: isNew,
        is_on_sale: isOnSale,
      };

      let productId = initialProduct?.id;

      if (isEditing && productId) {
        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', productId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from('products').insert(productPayload).select().single();
        if (insertError) throw insertError;
        productId = data.id;
      }

      // ---------- Galeria de imagens: substitui completamente ----------
      await supabase.from('product_images').delete().eq('product_id', productId);
      if (gallery.length > 0) {
        await supabase.from('product_images').insert(
          gallery.map((url, i) => ({ product_id: productId, image_url: url, display_order: i }))
        );
      }

      // ---------- Variantes + estoque ----------
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id, size, color')
        .eq('product_id', productId);

      for (const row of variants) {
        const existing = existingVariants?.find((v) => v.size === row.size && v.color === row.color);

        let variantId = existing?.id;
        if (!variantId) {
          const { data: newVariant } = await supabase
            .from('product_variants')
            .insert({ product_id: productId, size: row.size, color: row.color })
            .select()
            .single();
          variantId = newVariant?.id;
        }

        if (variantId) {
          await supabase
            .from('inventory')
            .upsert({ variant_id: variantId, quantity: row.quantity }, { onConflict: 'variant_id' });
        }
      }

      router.push('/admin/produtos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialProduct || !confirm('Excluir este produto permanentemente?')) return;
    await supabase.from('products').delete().eq('id', initialProduct.id);
    router.push('/admin/produtos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-6">
        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Informações Básicas</h2>
          <div className="space-y-4">
            <label className="label-field">
              Nome do produto
              <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="label-field">
              Descrição
              <textarea rows={4} className="input-field resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label className="label-field">
              Informações adicionais (composição, cuidados, etc.)
              <textarea rows={3} className="input-field resize-y" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Preço & SKU</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="label-field">
              Preço (R$)
              <input type="number" step="0.01" min="0" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Deixe em branco para editar depois" />
            </label>
            <label className="label-field">
              Preço promocional (R$)
              <input type="number" step="0.01" min="0" className="input-field" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} />
            </label>
            <label className="label-field">
              SKU
              <input className="input-field" value={sku} onChange={(e) => setSku(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Tamanhos, Cores & Estoque</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <label className="label-field">
              Tamanhos (separados por vírgula)
              <input className="input-field" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="P, M, G" />
            </label>
            <label className="label-field">
              Cores (separadas por vírgula)
              <input className="input-field" value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="Preto, Marsala" />
            </label>
          </div>
          <button type="button" onClick={generateVariantGrid} className="btn-outline border-marsala-dark text-marsala-dark text-xs mb-4">
            Gerar Combinações de Estoque
          </button>

          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={`${v.size}-${v.color}`} className="flex items-center gap-4 text-sm">
                  <span className="w-32">{v.size} / {v.color}</span>
                  <input
                    type="number"
                    min="0"
                    className="input-field !w-24"
                    value={v.quantity}
                    onChange={(e) => updateVariantQty(v.size, v.color, parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs text-ink/40">unidades em estoque</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Imagens</h2>
          <p className="label-field mb-2">Imagem principal</p>
          <ImageUploader bucket="products" value={mainImage} onChange={setMainImage} multiple={false} />
          <p className="label-field mb-2 mt-6">Galeria adicional</p>
          <ImageUploader bucket="products" value={gallery} onChange={setGallery} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-5">Organização</h2>
          <div className="space-y-4">
            <label className="label-field">
              Categoria
              <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sem categoria</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="label-field">
              Coleção
              <select className="input-field" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                <option value="">Sem coleção</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="label-field">
              Status
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white p-7 rounded-sm shadow-sm">
          <h2 className="font-heading text-lg text-marsala-dark mb-4">Marcadores</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Produto em destaque
            </label>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> Novidade
            </label>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} /> Em promoção
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-marsala bg-white p-4 rounded-sm">{error}</p>}

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleDelete} className="text-xs text-marsala underline">
              Excluir produto
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
