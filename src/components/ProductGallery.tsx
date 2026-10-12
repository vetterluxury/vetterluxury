'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

/**
 * Galeria do produto:
 *  - passando o mouse sobre a foto principal, ela amplia dentro da moldura (só com mouse)
 *  - clicando (ou Enter), abre a visualização grande, com fundo escuro
 *  - na visualização grande: botão fechar, tecla Esc, setas do teclado, miniaturas
 */
export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const list = images.filter(Boolean);
  const count = list.length;

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [open, setOpen] = useState(false);

  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const trigger = mainButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowRight' && count > 1) next();
      else if (e.key === 'ArrowLeft' && count > 1) prev();
      else if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>('button');
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, count, next, prev]);

  function handleMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  const initials = productName.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <div>
      {count > 0 ? (
        <button
          ref={mainButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setZoom(true)}
          onPointerLeave={() => setZoom(false)}
          onPointerMove={handleMove}
          aria-label={`Ampliar foto de ${productName}`}
          className="group relative block w-full aspect-[4/5] bg-champagne-soft rounded-sm overflow-hidden cursor-zoom-in"
        >
          <Image
            src={list[active]}
            alt={`${productName}, foto ${active + 1} de ${count}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-500 ease-out"
            style={zoom ? { transform: 'scale(1.7)', transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
          <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 text-[#4A1222] flex items-center justify-center shadow">
            <ZoomIn size={18} />
          </span>
        </button>
      ) : (
        <div className="relative aspect-[4/5] bg-champagne-soft rounded-sm flex items-center justify-center">
          <span className="font-display text-6xl text-marsala/25">{initials}</span>
        </div>
      )}

      {count > 1 && (
        <div className="flex gap-3 mt-4 flex-wrap">
          {list.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1} de ${count}`}
              aria-current={active === i}
              className={`relative w-16 h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                active === i ? 'border-gold' : 'border-transparent hover:border-gold/60'
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && count > 0 && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${productName}`}
          className="fixed inset-0 z-[80] flex flex-col bg-[#2b0a14]/95 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar visualização ampliada"
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X size={22} />
          </button>

          <div className="relative flex-1 min-h-0 mx-4 md:mx-20 mt-16 mb-3" onClick={(e) => e.stopPropagation()}>
            <Image
              src={list[active]}
              alt={`${productName}, foto ${active + 1} de ${count}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Foto anterior"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Próxima foto"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <div className="flex gap-2 justify-center pb-5 px-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                {list.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Ver foto ${i + 1} de ${count}`}
                    aria-current={active === i}
                    className={`relative shrink-0 w-14 h-[70px] rounded-sm overflow-hidden border-2 ${
                      active === i ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
