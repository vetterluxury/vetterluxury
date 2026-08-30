import Image from 'next/image';

/**
 * Fotos reais do Instagram @vetterluxury.
 *
 * Como adicionar uma foto:
 *  1. Salve a imagem em public/instagram/ (ex: public/instagram/foto1.jpg)
 *  2. Adicione o caminho na lista abaixo (ex: '/instagram/foto1.jpg')
 *
 * Enquanto a lista estiver vazia, esta seção fica escondida no site
 * automaticamente (não aparecem quadrados vazios).
 */
const INSTAGRAM_PHOTOS: string[] = [
  // '/instagram/foto1.jpg',
  // '/instagram/foto2.jpg',
];

export default function InstagramFeed() {
  if (INSTAGRAM_PHOTOS.length === 0) return null;

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="eyebrow">Instagram</p>
        <h2 className="font-heading text-3xl text-marsala-dark mt-3">@vetterluxury</h2>
        <div className="gold-rule" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3.5 mt-10">
          {INSTAGRAM_PHOTOS.slice(0, 6).map((src, i) => (
            <a
              key={src}
              href="https://instagram.com/vetterluxury"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square block overflow-hidden group"
            >
              <Image
                src={src}
                alt={`Vetter Luxury no Instagram ${i + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
        <a
          href="https://instagram.com/vetterluxury"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline border-marsala-dark text-marsala-dark inline-block mt-9"
        >
          Seguir no Instagram
        </a>
      </div>
    </section>
  );
}
