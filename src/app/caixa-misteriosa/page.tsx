'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { whatsappLink } from '@/lib/utils';

const TAMANHOS_PADRAO = ['P', 'M', 'G', 'GG'];

type Variant = { id: string; size: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  promo_price: number | null;
  main_image_url: string | null;
};

export default function CaixaMisteriosaPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    async function load() {
      const { data: prod } = await supabase
        .from('products')
        .select('id, name, slug, price, promo_price, main_image_url')
        .eq('slug', 'caixa-misteriosa')
        .eq('status', 'active')
        .single();

      if (prod) {
        setProduct(prod);
        const { data: vs } = await supabase.from('product_variants').select('id, size').eq('product_id', prod.id);
        setVariants(vs ?? []);
      }
      setLoadingProduct(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tamanhosDisponiveis =
    variants.length > 0 ? TAMANHOS_PADRAO.filter((t) => variants.some((v) => v.size === t)) : [];

  function handleContinuar() {
    if (!product || !tamanho) return;

    const variant = variants.find((v) => v.size === tamanho);

    addItem({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      promoPrice: product.promo_price,
      image: product.main_image_url,
      size: tamanho,
      color: cor.trim() || 'Sem preferência',
      quantity: 1,
    });

    if (observacoes.trim()) {
      sessionStorage.setItem('checkoutNotes', observacoes.trim());
    }

    const resumo = `Novo pedido de Caixa Misteriosa\n\nTamanho: ${tamanho}\nCor de preferência: ${
      cor.trim() || 'Sem preferência'
    }\nObservações: ${observacoes.trim() || 'Nenhuma'}\n\n(Pedido sendo finalizado agora pelo site)`;
    window.open(whatsappLink(resumo), '_blank');

    router.push('/checkout');
  }

  return (
    <div className="bg-champagne">
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
          <div className="relative">
            <div className="aspect-[4/5] rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(78,22,38,0.18)]">
              <Image
                src="/caixa-misteriosa-hero.jpg"
                alt="Caixa Misteriosa Vetter Luxury"
                width={1122}
                height={1402}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            <div className="hidden md:block absolute inset-[18px_-18px_-18px_18px] border border-gold -z-10 rounded-sm" />

            <div className="text-center md:text-left mt-10">
              <p className="eyebrow">Caixa Misteriosa Vetter Luxury</p>
              <h1 className="font-heading text-3xl md:text-[2.2rem] text-marsala-dark leading-tight mt-3">
                Você escolhe viver a experiência.
                <br />
                Nós cuidamos da surpresa.
              </h1>
              <p className="text-[#4a4340] text-[0.98rem] max-w-md mx-auto md:mx-0 mt-6 leading-relaxed">
                Cada Caixa Misteriosa é cuidadosamente preparada para proporcionar uma experiência única, elegante e
                inesperada.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow-sm p-7 md:p-9">
            {loadingProduct ? (
              <p className="text-ink/50 text-center py-10">Carregando...</p>
            ) : !product ? (
              <div className="text-center py-10">
                <p className="font-heading text-xl text-marsala-dark mb-2">Em breve</p>
                <p className="text-sm text-ink/60">A Caixa Misteriosa ainda está sendo preparada. Volte em breve!</p>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-xl text-marsala-dark mb-1">
                  {product.name} — R$ {Number(product.promo_price ?? product.price).toFixed(2)}
                </h2>
                <p className="text-xs text-ink/50 mb-6">
                  Escolha o tamanho e conte suas preferências — o conteúdo continua sendo surpresa.
                </p>

                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wide text-ink/50 block mb-1.5">Tamanho</label>
                  <div className="flex gap-2 flex-wrap">
                    {tamanhosDisponiveis.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTamanho(t)}
                        className={`w-12 h-12 rounded-sm border text-sm font-medium transition-colors ${
                          tamanho === t
                            ? 'bg-marsala-dark text-white border-marsala-dark'
                            : 'border-marsala-dark/30 text-marsala-dark hover:border-marsala-dark'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wide text-ink/50 block mb-1.5">
                    Cor de preferência (opcional)
                  </label>
                  <input
                    className="input-field w-full"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    placeholder="Ex: vermelho, preto, tons claros..."
                  />
                </div>

                <div className="mb-7">
                  <label className="text-xs uppercase tracking-wide text-ink/50 block mb-1.5">
                    Observações sobre a peça (opcional)
                  </label>
                  <textarea
                    className="input-field w-full min-h-[90px]"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Alguma preferência de modelo, ocasião especial, alergia..."
                  />
                </div>

                <button onClick={handleContinuar} disabled={!tamanho} className="btn-primary w-full disabled:opacity-50">
                  Adicionar e continuar para pagamento
                </button>
                <p className="text-[0.7rem] text-ink/40 text-center mt-3">
                  O pagamento é feito com segurança pelo site (Pix ou Cartão) na próxima etapa.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
