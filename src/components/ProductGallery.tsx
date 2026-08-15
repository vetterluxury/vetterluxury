'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const list = images.length > 0 ? images : [''];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <div>
      <div
        className="relative aspect-[4/5] bg-champagne-soft rounded-sm overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {list[active] ? (
          <Image
            src={list[active]}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-300"
            style={
              zoom
                ? { transform: 'scale(1.9)', transformOrigin: `${pos.x}% ${pos.y}%` }
                : undefined
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-6xl text-marsala/25">
              {productName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-20 rounded-sm overflow-hidden border ${
                active === i ? 'border-gold' : 'border-transparent'
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
