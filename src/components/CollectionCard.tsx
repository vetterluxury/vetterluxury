import Link from 'next/link';
import Image from 'next/image';
import type { Collection } from '@/types/database';

export default function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/colecoes/${collection.slug}`}
      className="relative block aspect-[3/4] overflow-hidden rounded-sm group"
    >
      {collection.banner_url ? (
        <Image
          src={collection.banner_url}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-champagne-soft to-[#e6d8c0]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-marsala-dark/70 via-marsala-dark/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <h3 className="font-heading text-2xl text-white">{collection.name}</h3>
        <span className="text-gold text-[0.7rem] tracking-[0.14em] uppercase mt-1 inline-block">Ver coleção</span>
      </div>
    </Link>
  );
}
